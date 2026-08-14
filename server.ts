import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Matching Analysis & Client Proposal Briefing Endpoint
  app.post("/api/ai/analyze-matching", async (req, res) => {
    try {
      const { customer, property, matchDetails } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.status(200).json({
          briefing: `[기본 분석 브리핑]\n- ${customer?.name || "고객"}님의 희망 조건과 [${property?.name || "매물"}]의 조건 일치도를 분석하였습니다.\n- 주요 일치 사항: ${matchDetails?.matchedItems?.join(", ") || "지역/가격대 부합"}\n- 주의/차이점: ${matchDetails?.unmatchedItems?.join(", ") || "세부 조건 조율 필요"}\n- 중개 전략: 고객님의 최우선 요구사항을 강조하고 상이한 항목에 대해서는 대체 방안(보증금 조율 등)을 브리핑하는 것을 권장합니다.`,
        });
      }

      const prompt = `
당신은 대한민국 베테랑 공인중개사이자 부동산 대표의 업무 보조 AI 어시스턴트입니다.
다음 고객의 상담 조건과 추천 매물 정보를 검토하고, 부동산 대표가 고객에게 전화 또는 상담 시 바로 전달할 수 있는 '맞춤형 매물 제안 브리핑 및 중개 상담 포인트'를 정중하고 명확한 비즈니스 톤으로 작성해주세요.

[고객 정보]
- 고객명: ${customer?.name} (${customer?.phone})
- 희망 거래유형: ${customer?.transactionType}
- 매물 종류: ${customer?.propertyType}
- 희망 지역: ${customer?.targetArea}
- 희망 가격: ${customer?.budget}
- 희망 면적: ${customer?.preferredArea || "조건 없음"}
- 추가 조건/특징: ${customer?.requirements?.join(", ") || "없음"}
- 상담 메모: ${customer?.memo || "없음"}

[매물 정보]
- 매물명: ${property?.name}
- 매물 종류: ${property?.propertyType}
- 거래 유형: ${property?.transactionType}
- 주소: ${property?.address} ${property?.detailAddress || ""}
- 가격: ${property?.price}
- 면적: 전용 ${property?.exclusiveArea}㎡ (공급 ${property?.supplyArea || "-"}㎡)
- 층수: ${property?.floor}층
- 주요 조건/특징: ${property?.features?.join(", ") || "없음"}
- 매물 메모: ${property?.memo || "없음"}

[조건 대조 결과]
- 일치 항목: ${matchDetails?.matchedItems?.join(", ") || "없음"}
- 상이/주의 항목: ${matchDetails?.unmatchedItems?.join(", ") || "없음"}

[작성 가이드]
1. 고객 맞춤 추천 한 줄 핵심 요약
2. 고객 조건과의 부합점(장점) 2~3가지
3. 조율 또는 안내가 필요한 차이점 및 대응 팁 (예: 관리비, 입주일, 층수 등)
4. 고객 상담 시 실제 사용할 추천 멘트 예시

실제 입력된 정보에 기반해서만 사실 위주로 작성하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      res.json({ briefing: response.text });
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error?.message || "AI 분석 중 오류가 발생했습니다." });
    }
  });

  // AI Consultation Note Structuring & Summarizer Endpoint
  app.post("/api/ai/structure-consultation", async (req, res) => {
    try {
      const { rawText } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          structured: {
            summary: rawText,
            keyRequirements: [],
            recommendedFollowUp: "상세 조건 재확인 필요",
          },
        });
      }

      const prompt = `
당신은 부동산 업무 보조 AI입니다.
공인중개사가 작성한 러프한 상담 메모 또는 통화 요약 텍스트를 분석하여 구조화된 요약과 핵심 요구사항을 JSON으로 반환해주세요.

[입력 메모]
${rawText}

반드시 유효한 JSON 형식으로만 응답하세요:
{
  "summary": "상담 내용의 2~3문장 요약",
  "extractedClient": {
    "propertyType": "아파트/오피스텔/빌라·다세대/원룸·투룸/상가·사무실/토지 중 하나 또는 null",
    "transactionType": "매매/전세/월세 중 하나 또는 null",
    "targetArea": "추출된 희망지역 또는 null",
    "budget": "추출된 희망가격 또는 null",
    "requirements": ["추출된 핵심 조건 리스트"]
  },
  "consultationTips": "이 고객을 상담할 때 중개사가 주의해야 할 포인트 한 문장"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ result: parsed });
    } catch (error: any) {
      console.error("AI Structure Error:", error);
      res.status(500).json({ error: error?.message || "상담 메모 분석 실패" });
    }
  });

  // AI Multi-turn Chat Assistant Endpoint for Broker
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, contextData } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          reply: `[오프라인 응답 모드] 현재 관리 중인 고객 ${contextData?.customersCount || 0}명, 매물 ${contextData?.propertiesCount || 0}건입니다. API 키가 설정되면 실시간 AI 맞춤 상담 분석을 지원합니다.`,
        });
      }

      const systemInstruction = `
당신은 대한민국 베테랑 공인중개사이자 부동산 대표 전용 스마트 AI 비서입니다.
현재 등록된 고객 상담 데이터와 매물 목록을 실시간으로 파악하여 대표님의 질문에 간결하고 명확하며 실무에 도움되는 한국어로 답변합니다.

[현재 등록된 고객 상담 목록 (${contextData?.customers?.length || 0}명)]
${JSON.stringify(contextData?.customers || [], null, 2)}

[현재 등록된 매물 목록 (${contextData?.properties?.length || 0}건)]
${JSON.stringify(contextData?.properties || [], null, 2)}

[답변 원칙]
1. 실제 등록된 고객과 매물 데이터에 기반하여 답변합니다.
2. 특정 매물에 어울리는 고객 추천 요청 시, 가격/지역/매물종류/면적 조건을 면밀히 대조하여 이유와 함께 추천합니다.
3. 고객 상담 팁이나 중개 전략을 물어보면 실무 중심의 친절하고 프로페셔널한 답변을 제공합니다.
4. 문체는 정중하고 신뢰감 있는 비즈니스 어조를 유지합니다.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: message,
        config: {
          systemInstruction,
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error?.message || "AI 상담 응답 중 오류가 발생했습니다." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Real Estate CRM Server running on port ${PORT}`);
  });
}

startServer();
