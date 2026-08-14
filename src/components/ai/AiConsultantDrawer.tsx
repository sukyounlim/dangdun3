import React, { useState, useRef, useEffect } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { X, Sparkles, Send, Bot, User, Trash2, ArrowRight } from 'lucide-react';

interface AiConsultantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '대치동 매물에 가장 잘 맞는 고객 추천해줘',
  '전세 4억 이하 희망하는 고객 현황 알려줘',
  '현재 진행 중인 상담 중 가장 성사 가능성 높은 건은?',
  '월세 고객 상담 시 체크해야 할 핵심 포인트는?',
];

export const AiConsultantDrawer: React.FC<AiConsultantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { customers, properties } = useRealEstate();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `안녕하세요, 대표님! 부동산 전용 AI 업무 비서입니다.\n현재 등록된 고객 ${customers.length}명과 매물 ${properties.length}건을 실시간 분석할 수 있습니다.\n\n"특정 매물에 맞는 고객 추천", "예산별 고객 검색", "상담 브리핑 아이디어" 등 무엇이든 물어보세요!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
          contextData: {
            customersCount: customers.length,
            propertiesCount: properties.length,
            customers: customers.map((c) => ({
              name: c.name,
              phone: c.phone,
              propertyType: c.propertyType,
              transactionType: c.transactionType,
              targetArea: c.targetArea,
              budget: c.budget,
              requirements: c.requirements,
              memo: c.memo,
              status: c.status,
            })),
            properties: properties.map((p) => ({
              name: p.name,
              propertyType: p.propertyType,
              transactionType: p.transactionType,
              address: p.address,
              price: p.price,
              exclusiveArea: p.exclusiveArea,
              floor: p.floor,
              features: p.features,
              status: p.status,
              memo: p.memo,
            })),
          },
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        role: 'assistant',
        text: data.reply || '답변을 생성하지 못했습니다.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      console.error('AI Chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '죄송합니다. AI 응답 처리 중 일시적인 오류가 발생했습니다.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        text: '대화 내용이 초기화되었습니다. 새로운 질문을 입력해주세요.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#3d3929]/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#fdfbf7] h-full shadow-2xl flex flex-col border-l border-[#e8e4d9] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e8e4d9] bg-[#3d3929] text-[#fdfbf7] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8c9474]/30 border border-[#8c9474]/50 flex items-center justify-center text-[#c2ccaa]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-[#fdfbf7] flex items-center space-x-1.5">
                <span>AI 부동산 중개 비서</span>
                <span className="text-[10px] bg-[#8c9474]/30 text-[#c2ccaa] px-1.5 py-0.2 rounded font-mono border border-[#8c9474]/40">
                  Gemini 3.7
                </span>
              </h3>
              <p className="text-[11px] text-[#c4bfae]">
                고객 및 매물 실시간 데이터 기반 어드바이저
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-[#c4bfae] hover:text-white rounded-lg transition-colors cursor-pointer"
              title="대화 내역 비우기"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#c4bfae] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#fcfaf6] border-b border-[#e8e4d9] overflow-x-auto flex space-x-1.5">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#ffffff] text-[#4a4636] hover:bg-[#f0ece1] text-xs font-medium border border-[#ded9cb] transition-colors shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f7f5ed]/40 text-xs sm:text-sm">
          {messages.map((msg, index) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  isBot ? '' : 'flex-row-reverse space-x-reverse'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isBot ? 'bg-[#737c5d] text-[#fdfbf7]' : 'bg-[#8c5836] text-[#fdfbf7]'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`max-w-[82%] space-y-1`}>
                  <div
                    className={`p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      isBot
                        ? 'bg-[#ffffff] text-[#363326] border border-[#e8e4d9] shadow-2xs rounded-tl-xs'
                        : 'bg-[#3d3929] text-[#fdfbf7] rounded-tr-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`text-[10px] text-[#9c9682] font-mono px-1 ${
                      isBot ? 'text-left' : 'text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#737c5d] text-[#fdfbf7] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-[#ffffff] border border-[#e8e4d9] rounded-2xl rounded-tl-xs shadow-2xs text-xs text-[#7c7764] flex items-center space-x-1.5 font-serif italic">
                <Sparkles className="w-3.5 h-3.5 text-[#737c5d] animate-spin" />
                <span>고객 및 매물 데이터를 분석하고 있습니다...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-[#ffffff] border-t border-[#e8e4d9]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="AI 중개 비서에게 질문하기 (예: 추천 고객 찾아줘)..."
              className="flex-1 px-3.5 py-2.5 bg-[#fcfaf6] border border-[#ded9cb] rounded-xl text-xs sm:text-sm text-[#363326] placeholder-[#9c9682] focus:outline-none focus:ring-1 focus:ring-[#8c9474] focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 bg-[#737c5d] hover:bg-[#626a4c] disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
