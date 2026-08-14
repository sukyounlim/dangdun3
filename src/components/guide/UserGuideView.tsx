import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  CheckCircle2,
  Users,
  Home,
  GitCompare,
  Sparkles,
  LayoutDashboard,
  Database,
  Search,
  SlidersHorizontal,
  FileText,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  PhoneCall,
  KeyRound,
  Calculator,
  MessageSquare
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const UserGuideView: React.FC = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  // PDF 다운로드 기능
  const handleDownloadPdf = async () => {
    if (!printableRef.current || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      setPdfProgress('문서 렌더링 준비 중...');

      const target = printableRef.current;
      
      // html2canvas 옵션: 고품질 렌더링
      const canvas = await html2canvas(target, {
        scale: 2, // 고해상도
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });

      setPdfProgress('PDF 문서 생성 및 페이징 분할 중...');

      const imgWidth = 210; // A4 가로 (mm)
      const pageHeight = 297; // A4 세로 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // 첫 페이지 추가
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 내용이 여러 페이지인 경우 분할 추가
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      setPdfProgress('PDF 다운로드 완료');
      const today = new Date().toISOString().slice(0, 10);
      pdf.save(`부동산_고객상담_매물관리_시스템_사용자매뉴얼_${today}.pdf`);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 문제가 발생했습니다. 브라우저 인쇄(Ctrl+P 또는 인쇄 버튼)를 이용해주세요.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'overview', title: '1. 시스템 개요 및 특장점', icon: BookOpen },
    { id: 'dashboard', title: '2. 대시보드 활용법', icon: LayoutDashboard },
    { id: 'consultation', title: '3. 고객 상담 기록 및 관리', icon: Users },
    { id: 'property', title: '4. 매물 등록 및 상태 관리', icon: Home },
    { id: 'comparison', title: '5. 다중 조건 비교 & 매칭 엔진', icon: GitCompare },
    { id: 'ai', title: '6. AI 중개 비서 활용 가이드', icon: Sparkles },
    { id: 'backup', title: '7. 데이터 백업 및 보안 관리', icon: Database },
    { id: 'faq', title: '8. 자주 묻는 질문 (FAQ)', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-[#fcfaf6] border border-[#e8e4d9] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#8c9474] text-white">
              공식 사용자 매뉴얼
            </span>
            <span className="text-xs text-[#7c7764] font-medium">v2.0 • 공인중개사용</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#363326] font-serif tracking-tight">
            시스템 사용 설명서 & 실무 가이드
          </h2>
          <p className="text-sm text-[#7c7764] max-w-2xl leading-relaxed">
            고객 상담 기록부터 신규 매물 관리, 1:N 맞춤 매칭 비교 및 AI 중개 비서 활용까지 
            시스템의 모든 기능을 완벽히 익힐 수 있는 종합 가이드입니다.
          </p>
        </div>

        {/* Action Buttons: PDF Download & Print */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#3d3929] hover:bg-[#2e2a1d] text-[#fdfbf7] border border-[#5d5641] shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#8c9474]" />
                <span>{pdfProgress || 'PDF 생성 중...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#8c9474]" />
                <span>PDF 설명서 다운로드</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold bg-[#f7f4ed] hover:bg-[#eee8db] text-[#4a4636] border border-[#ded9cb] transition-colors cursor-pointer"
            title="웹 브라우저로 바로 인쇄"
          >
            <Printer className="w-4 h-4 text-[#7c7764]" />
            <span className="hidden sm:inline">바로 인쇄</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Section Navigation & Printable Document */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sticky Sidebar (Web only) */}
        <div className="lg:col-span-1 bg-[#fcfaf6] border border-[#e8e4d9] rounded-2xl p-4 sticky top-24 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-[#7c7764] uppercase tracking-wider">
            목차 바로가기
          </div>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#3d3929] text-white shadow-xs'
                    : 'text-[#4a4636] hover:bg-[#f2eee3]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8c9474]' : 'text-[#7c7764]'}`} />
                <span className="truncate">{sec.title}</span>
              </a>
            );
          })}

          <div className="pt-4 mt-4 border-t border-[#e8e4d9] px-2 text-xs text-[#7c7764] space-y-2">
            <div className="flex items-center space-x-1.5 font-medium text-[#363326]">
              <Lightbulb className="w-3.5 h-3.5 text-[#c98a68]" />
              <span>실무 팁</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              설명서를 PDF로 저장해 공인중개사 사무소 책상에 비치하거나 동료 실장님들과 공유하여 활용해보세요.
            </p>
          </div>
        </div>

        {/* Printable Manual Content Area */}
        <div className="lg:col-span-3">
          <div
            ref={printableRef}
            id="printable-manual"
            className="bg-white border border-[#e8e4d9] rounded-2xl p-6 sm:p-10 text-[#363326] space-y-12 shadow-xs"
          >
            {/* Document Cover Header in Printable Document */}
            <div className="border-b-2 border-[#3d3929] pb-8 space-y-4">
              <div className="flex justify-between items-center text-xs text-[#7c7764]">
                <span className="font-semibold text-[#8c9474]">REAL ESTATE CRM & MATCHING MANUAL</span>
                <span>발행일: 2026년 최신 개정판</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#363326] leading-tight">
                부동산 고객 상담 및 매물 관리 시스템<br />
                <span className="text-[#8c9474] text-2xl sm:text-3xl font-sans font-semibold">공인중개사 실무 가이드 & 매뉴얼</span>
              </h1>
              <p className="text-sm text-[#66604d] leading-relaxed">
                본 문서는 부동산 공인중개사 대표 및 실무 중개사를 위해 제작된 시스템 사용 설명서입니다.
                고객의 상세 요구조건 수집부터 매물 데이터베이스 구축, 조건별 6개 항목 다중 대조, AI 자동 브리핑 생성까지의
                전 과정을 체계적으로 설명합니다.
              </p>
            </div>

            {/* Section 1: Overview */}
            <section id="overview" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d3929] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-bold text-[#363326] font-serif">시스템 개요 및 특장점</h2>
              </div>

              <p className="text-sm text-[#5a5542] leading-relaxed">
                본 시스템은 기존 엑셀이나 수기 장부로 관리되던 고객 상담 기록과 매물 대장을 하나의 지능형 대시보드로 통합하여,
                고객의 요구조건(예산, 거래유형, 면적, 주요 필수조건 등)과 보유 매물의 스펙을 <strong>실시간 다중 대조</strong>하고 최적의 매물을 추천할 수 있도록 지원합니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#fcfaf6] border border-[#e8e4d9] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#edf0e6] text-[#6e7656] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#363326]">체계적인 상담 관리</h3>
                  <p className="text-xs text-[#7c7764] leading-relaxed">
                    상담일자, 진행상태, 예산 범위, 선호 면적 및 상세 태그까지 누락 없이 기록하고 검색합니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#fcfaf6] border border-[#e8e4d9] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#faefe8] text-[#c98a68] flex items-center justify-center">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#363326]">스마트 6단계 매칭</h3>
                  <p className="text-xs text-[#7c7764] leading-relaxed">
                    부동산 유형, 거래 형태, 지역, 가격, 면적, 주요 옵션을 자동 분석해 매칭 점수(0~100점)를 산출합니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#fcfaf6] border border-[#e8e4d9] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#edf0e6] text-[#3d3929] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#363326]">AI 스마트 중개 비서</h3>
                  <p className="text-xs text-[#7c7764] leading-relaxed">
                    매칭 결과 기반 고객 안내 문자 작성, 계약 조율 팁, 매물 브리핑 멘트를 원클릭 생성합니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Dashboard */}
            <section id="dashboard" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d3929] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-xl font-bold text-[#363326] font-serif">대시보드 활용법</h2>
              </div>

              <p className="text-sm text-[#5a5542] leading-relaxed">
                로그인 후 첫 화면인 <strong>대시보드</strong>에서는 중개사무소의 현재 영업 현황을 한눈에 파악할 수 있습니다.
              </p>

              <div className="bg-[#fcfaf6] border border-[#e8e4d9] rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-[#363326] flex items-center space-x-2">
                  <LayoutDashboard className="w-4 h-4 text-[#8c9474]" />
                  <span>대시보드 핵심 지표 안내</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#5a5542]">
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-[#363326] min-w-28">• 총 관리 고객 수:</span>
                    <span>현재 시스템에 등록되어 있는 누적 고객 상담 건수와 최근 등록 추이를 확인합니다.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-[#363326] min-w-28">• 보유 매물 현황:</span>
                    <span>거래가능, 계약진행중, 거래완료 등 상태별 매물 통계를 확인합니다.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-[#363326] min-w-28">• 진행 상태 파이프라인:</span>
                    <span>신규상담 → 매물탐색중 → 현장방문예정 → 가계약진행 → 계약완료 단계별 진행 상황을 모니터링합니다.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold text-[#363326] min-w-28">• 빠른 매칭 추천 카드:</span>
                    <span>최근 상담 고객 중 매칭 점수 80점 이상 매물이 즉시 표시되어 신속한 제안이 가능합니다.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: Consultation */}
            <section id="consultation" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d3929] text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-xl font-bold text-[#363326] font-serif">고객 상담 기록 및 관리 매뉴얼</h2>
              </div>

              <p className="text-sm text-[#5a5542] leading-relaxed">
                전화 또는 방문 고객의 상담 내역을 신속하고 꼼꼼하게 전산화할 수 있습니다.
              </p>

              <div className="space-y-3">
                <div className="border border-[#e8e4d9] rounded-xl p-4 bg-[#ffffff]">
                  <h4 className="text-sm font-bold text-[#363326] mb-2 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#8c9474] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>고객 상담 등록 단계</span>
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-[#5a5542] space-y-1.5 pl-1">
                    <li>상단 헤더의 <strong>[고객 상담 등록]</strong> 또는 상담 탭의 <strong>[+ 신규 고객 상담 등록]</strong>을 클릭합니다.</li>
                    <li>고객명, 연락처, 상담일자, 희망 매물유형(아파트, 오피스텔 등) 및 거래유형(매매, 전세, 월세)을 선택합니다.</li>
                    <li>희망 지역(예: 강남구 대치동, 역삼역 도보 5분 이내)과 예산 금액을 입력합니다. (숫자 입력 시 자동 만원 단위 변환)</li>
                    <li>필수 선호 조건 태그(남향, 주차편리, 초품아, 역세권, 올수리 등)를 클릭하여 선택하거나 직접 추가합니다.</li>
                    <li>가족 구성원, 입주 희망 시기 등 특이사항을 상세 메모에 기재 후 <strong>[상담 저장]</strong>을 클릭합니다.</li>
                  </ol>
                </div>

                <div className="border border-[#e8e4d9] rounded-xl p-4 bg-[#ffffff]">
                  <h4 className="text-sm font-bold text-[#363326] mb-2 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#8c9474] text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>상담 상태 변경 및 필터링</span>
                  </h4>
                  <p className="text-xs text-[#5a5542] leading-relaxed">
                    상담 목록 상단의 검색창(이름, 연락처, 지역 검색)과 필터 바를 활용해 <strong>신규상담, 매물탐색중, 현장방문예정</strong> 등 
                    진행 상태별 고객만을 선별하여 볼 수 있습니다. 고객 카드를 클릭하면 상세 정보와 맞춤 추천 매물 목록이 즉시 열립니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Property */}
            <section id="property" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d3929] text-white flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h2 className="text-xl font-bold text-[#363326] font-serif">매물 등록 및 상태 관리</h2>
              </div>

              <p className="text-sm text-[#5a5542] leading-relaxed">
                접수된 매물의 스펙, 가격, 특징을 표준화된 양식으로 보관하여 조건 매칭의 정확도를 극대화합니다.
              </p>

              <div className="bg-[#fcfaf6] border border-[#e8e4d9] rounded-xl p-4 space-y-2 text-xs text-[#5a5542]">
                <h4 className="font-bold text-sm text-[#363326]">매물 입력 권장 가이드</h4>
                <ul className="list-disc list-inside space-y-1.5">
                  <li><strong>금액 입력:</strong> 매매가/보증금 및 월세액을 정확한 만원 단위로 입력하면 자동 포맷팅(예: 15억 5,000만원)되어 가독성이 높아집니다.</li>
                  <li><strong>면적 정보:</strong> 전용면적(㎡)을 입력하면 3.3㎡당 평형 수가 자동 계산됩니다.</li>
                  <li><strong>특징 태그:</strong> 시스템에 정의된 15개 이상의 핵심 옵션(올수리, 로얄층, 남향, 즉시입주 등)을 선택해두면 고객 조건과 정확히 일치 판정됩니다.</li>
                  <li><strong>상태 업데이트:</strong> 가계약 또는 계약 체결 시 상태를 '계약진행중' 또는 '거래완료'로 변경하여 중복 추천을 방지합니다.</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Comparison & Match Engine */}
            <section id="comparison" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d3929] text-white flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <h2 className="text-xl font-bold text-[#363326] font-serif">다중 조건 비교 & 매칭 엔진 원리</h2>
              </div>

              <p className="text-sm text-[#5a5542] leading-relaxed">
                <strong>고객-매물 비교</strong> 탭에서는 고객 1명과 등록된 모든 매물 간의 일치도를 6개 핵심 축으로 가중치 분석합니다.
              </p>

              {/* Match Criteria Table */}
              <div className="overflow-x-auto border border-[#e8e4d9] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f2eee3] text-[#363326] border-b border-[#e8e4d9]">
                      <th className="p-3 font-bold">비교 평가 항목</th>
                      <th className="p-3 font-bold">배점 가중치</th>
                      <th className="p-3 font-bold">일치 판정 기준</th>
                      <th className="p-3 font-bold">상태 표시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e4d9] text-[#5a5542]">
                    <tr>
                      <td className="p-3 font-semibold text-[#363326]">1. 매물 유형</td>
                      <td className="p-3">20점</td>
                      <td className="p-3">아파트, 오피스텔, 빌라 등 유형 완전 일치</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-[#edf0e6] text-[#555d40] font-bold">일치 / 불일치</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#363326]">2. 거래 유형</td>
                      <td className="p-3">20점</td>
                      <td className="p-3">매매, 전세, 월세 형태 일치</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-[#edf0e6] text-[#555d40] font-bold">일치 / 불일치</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#363326]">3. 지역 / 위치</td>
                      <td className="p-3">20점</td>
                      <td className="p-3">희망 지역구/동 및 지하철역 도보권 매칭</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-[#edf0e6] text-[#555d40] font-bold">일치 / 유사 / 불일치</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#363326]">4. 예산 / 가격</td>
                      <td className="p-3">20점</td>
                      <td className="p-3">고객 예산 범위 내(100%), 10% 초과(부분), 초과(불일치)</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-[#faefe8] text-[#c98a68] font-bold">범위 내 / 조율필요</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#363326]">5. 전용 면적</td>
                      <td className="p-3">10점</td>
                      <td className="p-3">고객 희망 면적 ±15% 이내 충족 여부</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-[#edf0e6] text-[#555d40] font-bold">적합 / 부분일치</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#363326]">6. 주요 옵션·특징</td>
                      <td className="p-3">10점</td>
                      <td className="p-3">고객 필수 태그와 매물 보유 옵션 일치율</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-[#edf0e6] text-[#555d40] font-bold">태그 일치 개수</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#fcfaf6] border border-[#e8e4d9] rounded-xl p-4 space-y-1.5 text-xs text-[#5a5542]">
                <div className="font-bold text-[#363326]">매칭 등급 구분:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-[#edf0e6] text-[#555d40] text-center font-bold">90~100점: 최적추천</div>
                  <div className="p-2 rounded-lg bg-[#f4f7eb] text-[#6d7950] text-center font-bold">75~89점: 적합매물</div>
                  <div className="p-2 rounded-lg bg-[#faefe8] text-[#c98a68] text-center font-bold">60~74점: 조건조율필요</div>
                  <div className="p-2 rounded-lg bg-[#f0ebe1] text-[#7c7764] text-center font-bold">60점 미만: 조건불일치</div>
                </div>
              </div>
            </section>

            {/* Section 6: AI Assistant */}
            <section id="ai" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d3929] text-white flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <h2 className="text-xl font-bold text-[#363326] font-serif">AI 중개 비서 활용 가이드</h2>
              </div>

              <p className="text-sm text-[#5a5542] leading-relaxed">
                화면 우측 하단의 <strong>[AI 중개 비서]</strong> 버튼 또는 헤더의 버튼을 누르면 인공지능 어시스턴트가 열립니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5a5542]">
                <div className="border border-[#e8e4d9] rounded-xl p-4 bg-[#ffffff] space-y-2">
                  <div className="font-bold text-sm text-[#363326] flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-[#8c9474]" />
                    <span>고객 맞춤 안내 문자 / 알림톡 생성</span>
                  </div>
                  <p className="leading-relaxed">
                    특정 고객과 매칭된 매물을 선택하고 "고객 브리핑 문자 작성"을 요청하면 정중하고 매력적인 추천 문구가 원클릭으로 작성되며, 복사하여 바로 전송할 수 있습니다.
                  </p>
                </div>

                <div className="border border-[#e8e4d9] rounded-xl p-4 bg-[#ffffff] space-y-2">
                  <div className="font-bold text-sm text-[#363326] flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#c98a68]" />
                    <span>가격 조율 및 협상 전략 조언</span>
                  </div>
                  <p className="leading-relaxed">
                    예산이 살짝 초과된 매물이나 입주 시기 조율이 필요한 건에 대해, 공인중개사가 임대인/매도인 및 고객과 원활히 협상할 수 있는 현실적인 팁을 제공합니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Backup */}
            <section id="backup" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d3929] text-white flex items-center justify-center font-bold text-sm">
                  7
                </div>
                <h2 className="text-xl font-bold text-[#363326] font-serif">데이터 백업 및 보안 관리</h2>
              </div>

              <div className="bg-[#fcfaf6] border border-[#e8e4d9] rounded-xl p-5 space-y-3 text-xs text-[#5a5542]">
                <p className="leading-relaxed">
                  본 시스템은 브라우저 로컬 저장소(LocalStorage)에 고객 및 매물 데이터를 안전하게 자동 보관합니다.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-[#8c9474] shrink-0 mt-0.5" />
                    <span><strong>데이터 백업 (JSON):</strong> 우측 상단 다운로드 아이콘 메뉴에서 [데이터 백업]을 클릭하면 모든 고객 및 매물 데이터가 암호화되지 않은 JSON 파일로 즉시 다운로드됩니다. 주기적인 주 1회 백업을 권장합니다.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-[#8c9474] shrink-0 mt-0.5" />
                    <span><strong>데이터 복원:</strong> 새 컴퓨터로 업무 환경을 옮기거나 데이터를 복원할 때 [백업 파일 복원]을 통해 백업한 JSON을 업로드하면 즉시 모든 내역이 복원됩니다.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-[#8c9474] shrink-0 mt-0.5" />
                    <span><strong>실무 샘플 복원:</strong> 초기 시연 데이터로 다시 체험해보고 싶으실 때는 [실무 샘플 데이터 복원]을 누르시면 됩니다.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: FAQ */}
            <section id="faq" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d3929] text-white flex items-center justify-center font-bold text-sm">
                  8
                </div>
                <h2 className="text-xl font-bold text-[#363326] font-serif">자주 묻는 질문 (FAQ)</h2>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    q: 'Q. 버셀(Vercel)이나 별도 서비스에 가입해야 볼 수 있나요?',
                    a: '아닙니다! 버셀이나 외부 서비스에 전혀 가입하실 필요가 없습니다. 본 시스템은 클라우드 상에서 이미 완전하게 실행 중이므로, 현재 화면의 미리보기 창이나 우측 상단 [새 탭에서 열기], 혹은 상단 [Share (공유)] 링크를 통해 PC·스마트폰 어디서든 로그인/가입 없이 즉시 사용하실 수 있습니다.'
                  },
                  {
                    q: 'Q. 매칭 점수는 어떤 원리로 계산되나요?',
                    a: '매물종류(20점), 거래유형(20점), 지역일치(20점), 예산범위(20점), 면적적합(10점), 특수조건태그(10점) 총 6개 항목 100점 만점으로 계산됩니다. 75점 이상이면 고객에게 적극 추천할 수 있는 유효 매물입니다.'
                  },
                  {
                    q: 'Q. 다른 컴퓨터나 스마트폰에서도 볼 수 있나요?',
                    a: '네, 반응형 웹으로 제작되어 태블릿 및 스마트폰 브라우저에서도 완벽하게 동작합니다. 다른 기기로 데이터를 옮기실 때는 데이터 백업(JSON) 파일을 다운로드받아 새 기기에서 복원해주시면 됩니다.'
                  },
                  {
                    q: 'Q. 설명서를 종이로 인쇄하거나 PDF로 보관할 수 있나요?',
                    a: '상단 [PDF 설명서 다운로드] 버튼을 누르면 본 매뉴얼 전체가 고해상도 다중 페이지 PDF로 저장됩니다. 또한 [바로 인쇄] 버튼으로 사무소 프린터로 출력하실 수 있습니다.'
                  },
                  {
                    q: 'Q. 고객 개인정보(전화번호 등)는 안전한가요?',
                    a: '고객 정보는 브라우저 내부 로컬 스토리지에 안전하게 저장되며, AI 중개 비서 분석 요청 시에도 비식별화된 조건 요약 정보만을 기반으로 안전하게 처리됩니다.'
                  }
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-[#e8e4d9] rounded-xl overflow-hidden bg-[#ffffff]"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-[#363326] flex items-center justify-between hover:bg-[#fcfaf6] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {expandedFaq === idx ? (
                        <ChevronUp className="w-4 h-4 text-[#7c7764]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#7c7764]" />
                      )}
                    </button>
                    {expandedFaq === idx && (
                      <div className="px-4 pb-4 text-xs text-[#5a5542] leading-relaxed border-t border-[#f0ece1] pt-3 bg-[#fdfbf7]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Manual Footer Sign */}
            <div className="border-t border-[#e8e4d9] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7c7764] gap-2">
              <div>부동산 고객 상담 및 매물 매칭 통합 관리 시스템 • 공인중개사 지원 본부</div>
              <div className="font-semibold text-[#8c9474]">User Operation Manual • Certified 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
