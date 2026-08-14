import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import {
  Users,
  Home,
  CheckCircle2,
  GitCompare,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  FileText,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { CONSULTATION_STATUS_MAP, PROPERTY_STATUS_MAP, formatPhone, formatDisplayPrice } from '../../utils/formatters';
import { evaluateCustomerPropertyMatch } from '../../utils/matchingEngine';

interface DashboardViewProps {
  onOpenNewCustomerModal: () => void;
  onOpenNewPropertyModal: () => void;
  onSelectCustomerDetail: (id: string) => void;
  onSelectPropertyDetail: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewCustomerModal,
  onOpenNewPropertyModal,
  onSelectCustomerDetail,
  onSelectPropertyDetail,
}) => {
  const {
    customers,
    properties,
    setActiveTab,
    startComparisonWithCustomer,
    setSelectedCustomerId,
    setSelectedPropertyId,
  } = useRealEstate();

  // Representative daily scratchpad
  const [brokerMemo, setBrokerMemo] = useState(() => {
    return localStorage.getItem('broker_daily_memo') || '• 오전 11시 대치동 래미안 105동 현장 답사 동행\n• 오후 2시 이지은 고객 강남역 오피스텔 전세 매물 2건 추천 브리핑\n• 분당 정자동 파크뷰 임대인 만기 전세금 반환 일정 재확인';
  });

  const handleSaveMemo = (text: string) => {
    setBrokerMemo(text);
    localStorage.setItem('broker_daily_memo', text);
  };

  // Metrics
  const totalCustomers = customers.length;
  const activeConsultations = customers.filter(
    (c) => c.status === '신규상담' || c.status === '매물탐색중' || c.status === '현장방문예정'
  ).length;

  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.status === '거래가능').length;

  // High match calculation (80점 이상)
  const topMatches: {
    customer: typeof customers[0];
    property: typeof properties[0];
    score: number;
    level: string;
    keyMatch: string;
  }[] = [];

  customers.forEach((cust) => {
    properties
      .filter((p) => p.status === '거래가능')
      .forEach((prop) => {
        const evalResult = evaluateCustomerPropertyMatch(cust, prop);
        if (evalResult.score >= 75) {
          topMatches.push({
            customer: cust,
            property: prop,
            score: evalResult.score,
            level: evalResult.level,
            keyMatch: evalResult.matchedItems[0] || '주요 조건 일치',
          });
        }
      });
  });

  topMatches.sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 총 상담 고객 */}
        <div className="bg-[#ffffff] rounded-xl border border-[#e8e4d9] p-5 shadow-[0_2px_8px_rgba(74,70,54,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider">
              총 관리 고객
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ebf1f3] text-[#3d5a64] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-serif text-[#363326]">{totalCustomers}</span>
              <span className="text-xs text-[#7c7764]">명</span>
            </div>
            <p className="text-xs text-[#555d40] font-medium mt-1">
              진행 중 상담: <strong className="font-semibold">{activeConsultations}건</strong>
            </p>
          </div>
          <button
            onClick={() => setActiveTab('consultations')}
            className="mt-3 text-xs text-[#7c7764] hover:text-[#363326] flex items-center space-x-1 font-medium pt-2 border-t border-[#f0ece1] cursor-pointer"
          >
            <span>고객 목록 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: 등록 매물 */}
        <div className="bg-[#ffffff] rounded-xl border border-[#e8e4d9] p-5 shadow-[0_2px_8px_rgba(74,70,54,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider">
              등록 매물
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#edf2e8] text-[#415939] flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-serif text-[#363326]">{totalProperties}</span>
              <span className="text-xs text-[#7c7764]">개</span>
            </div>
            <p className="text-xs text-[#415939] font-medium mt-1">
              거래 가능: <strong className="font-semibold">{availableProperties}개</strong> ({Math.round((availableProperties / (totalProperties || 1)) * 100)}%)
            </p>
          </div>
          <button
            onClick={() => setActiveTab('properties')}
            className="mt-3 text-xs text-[#7c7764] hover:text-[#363326] flex items-center space-x-1 font-medium pt-2 border-t border-[#f0ece1] cursor-pointer"
          >
            <span>매물 목록 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: 추천 매칭 페어 */}
        <div className="bg-[#ffffff] rounded-xl border border-[#e8e4d9] p-5 shadow-[0_2px_8px_rgba(74,70,54,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider">
              고객-매물 적합 매칭
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#f7f2e7] text-[#7a6439] flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-serif text-[#363326]">{topMatches.length}</span>
              <span className="text-xs text-[#7c7764]">건 부합</span>
            </div>
            <p className="text-xs text-[#7a6439] font-medium mt-1">
              85점 이상 최적: <strong className="font-semibold">{topMatches.filter((m) => m.score >= 85).length}건</strong>
            </p>
          </div>
          <button
            onClick={() => setActiveTab('comparison')}
            className="mt-3 text-xs text-[#7c7764] hover:text-[#363326] flex items-center space-x-1 font-medium pt-2 border-t border-[#f0ece1] cursor-pointer"
          >
            <span>매칭 대조 화면으로 이동</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: 신속 상담 및 매물 등록 */}
        <div className="bg-[#3d3929] rounded-xl p-5 text-[#fdfbf7] shadow-[0_2px_8px_rgba(61,57,41,0.12)] border border-[#524d3a] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-[#8c9474] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#8c9474]" />
              <span>신속 업무 등록</span>
            </div>
            <h3 className="text-sm font-semibold font-serif text-[#fdfbf7] mt-1">
              상담 및 매물 즉시 입력
            </h3>
            <p className="text-xs text-[#ded9cb] mt-0.5">
              조건 입력 즉시 실시간 대조 가능
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={onOpenNewCustomerModal}
              className="flex-1 py-1.5 px-2 bg-[#524d3a] hover:bg-[#625c46] rounded-lg text-xs font-medium text-center text-[#fdfbf7] transition-colors cursor-pointer"
            >
              + 고객 등록
            </button>
            <button
              onClick={onOpenNewPropertyModal}
              className="flex-1 py-1.5 px-2 bg-[#737c5d] hover:bg-[#626a4c] rounded-lg text-xs font-medium text-center text-white transition-colors cursor-pointer"
            >
              + 매물 등록
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Top Matches & Daily Memo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time High Match Recommendations */}
        <div className="lg:col-span-2 bg-[#ffffff] rounded-xl border border-[#e8e4d9] p-5 shadow-[0_2px_8px_rgba(74,70,54,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0ece1] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#363326] font-serif flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#8c9474]" />
                <span>실시간 고객-매물 맞춤 추천 조합 (일치도 높은 순)</span>
              </h2>
              <p className="text-xs text-[#7c7764] mt-0.5">
                등록된 고객의 희망 조건(지역, 예산, 종목, 특징)과 거래가능 매물을 알고리즘으로 자동 대조한 결과입니다.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('comparison')}
              className="text-xs text-[#555d40] hover:text-[#363326] font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>전체 비교</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topMatches.length === 0 ? (
            <div className="text-center py-8 text-[#9c9682] text-sm font-serif">
              조건에 부합하는 매칭 조합이 없습니다. 고객 상담 또는 매물을 새로 등록해보세요.
            </div>
          ) : (
            <div className="space-y-3">
              {topMatches.slice(0, 4).map((match, idx) => (
                <div
                  key={`${match.customer.id}-${match.property.id}-${idx}`}
                  className="border border-[#e8e4d9] rounded-xl p-3.5 hover:border-[#c8c2b0] transition-colors bg-[#fcfaf6] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-sm font-bold text-[#363326]">
                        {match.customer.name} 고객
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-[#f0ebe1] text-[#4a4636] rounded-md font-medium border border-[#ded9cb]">
                        희망: {match.customer.targetArea} ({match.customer.budget})
                      </span>
                      <span className="text-[#9c9682] text-xs">↔</span>
                      <span className="text-sm font-semibold text-[#415939] truncate">
                        {match.property.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-[#7c7764] flex-wrap">
                      <span>매물가: {match.property.price}</span>
                      <span>•</span>
                      <span>전용 {match.property.exclusiveArea}㎡</span>
                      <span>•</span>
                      <span className="text-[#555d40] font-medium">{match.keyMatch}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold font-serif text-[#7a6439]">
                        {match.score}% 일치
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          match.score >= 85
                            ? 'bg-[#edf2e8] text-[#415939] border-[#d0dec6]'
                            : 'bg-[#f7f2e7] text-[#7a6439] border-[#e7dcbf]'
                        }`}
                      >
                        {match.level}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCustomerId(match.customer.id);
                        setSelectedPropertyId(match.property.id);
                        setActiveTab('comparison');
                      }}
                      className="px-3 py-2 bg-[#3d3929] hover:bg-[#2e2a1d] text-[#fdfbf7] rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      조건 대조표 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Broker Daily Memo / Scratchpad */}
        <div className="bg-[#ffffff] rounded-xl border border-[#e8e4d9] p-5 shadow-[0_2px_8px_rgba(74,70,54,0.04)] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-[#f0ece1] pb-2.5">
              <h2 className="text-sm font-bold text-[#363326] font-serif flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#7c7764]" />
                <span>대표 금일 업무 메모</span>
              </h2>
              <span className="text-xs text-[#9c9682] font-mono">
                {new Date().toISOString().slice(0, 10)}
              </span>
            </div>
            <p className="text-xs text-[#7c7764] mt-1">
              오늘 방문 상담 일정, 잔금 확인 사항, 긴급 매물 연락처 등을 메모하세요 (자동 저장).
            </p>
          </div>

          <textarea
            value={brokerMemo}
            onChange={(e) => handleSaveMemo(e.target.value)}
            rows={8}
            className="w-full text-xs sm:text-sm text-[#4a4636] bg-[#fcfaf6] border border-[#ded9cb] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-sans leading-relaxed resize-none"
            placeholder="오늘의 업무 메모를 자유롭게 입력하세요..."
          />

          <div className="text-[11px] text-[#9c9682] text-right">
            브라우저 로컬 저장소에 안전하게 유지됩니다.
          </div>
        </div>
      </div>

      {/* Two Column Table Overview: Recent Consultations & Recent Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consultations Table Preview */}
        <div className="bg-[#ffffff] rounded-xl border border-[#e8e4d9] p-5 shadow-[0_2px_8px_rgba(74,70,54,0.04)] space-y-3">
          <div className="flex items-center justify-between border-b border-[#f0ece1] pb-3">
            <h2 className="text-sm font-bold text-[#363326] font-serif flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#555d40]" />
              <span>최근 고객 상담 기록</span>
            </h2>
            <button
              onClick={() => setActiveTab('consultations')}
              className="text-xs text-[#7c7764] hover:text-[#363326] font-medium flex items-center cursor-pointer"
            >
              <span>고객 관리로 이동</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8e4d9] text-[#7c7764] font-semibold bg-[#f7f4ed]">
                  <th className="py-2.5 px-2.5">고객명</th>
                  <th className="py-2.5 px-2.5">상담일</th>
                  <th className="py-2.5 px-2.5">종류/거래</th>
                  <th className="py-2.5 px-2.5">희망지역/가격</th>
                  <th className="py-2.5 px-2.5">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {customers.slice(0, 5).map((cust) => {
                  const statusStyle = CONSULTATION_STATUS_MAP[cust.status];
                  return (
                    <tr
                      key={cust.id}
                      onClick={() => onSelectCustomerDetail(cust.id)}
                      className="hover:bg-[#fcfaf6] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-2.5 font-bold text-[#363326]">
                        {cust.name}
                      </td>
                      <td className="py-2.5 px-2.5 text-[#7c7764]">{cust.consultationDate}</td>
                      <td className="py-2.5 px-2.5">
                        <span className="font-medium text-[#4a4636]">{cust.propertyType}</span>
                        <span className="ml-1 text-[11px] text-[#7c7764]">({cust.transactionType})</span>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="truncate max-w-[130px] font-medium text-[#4a4636]">
                          {cust.targetArea}
                        </div>
                        <div className="text-[11px] text-[#7c7764]">{cust.budget}</div>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.bg}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Properties Table Preview */}
        <div className="bg-[#ffffff] rounded-xl border border-[#e8e4d9] p-5 shadow-[0_2px_8px_rgba(74,70,54,0.04)] space-y-3">
          <div className="flex items-center justify-between border-b border-[#f0ece1] pb-3">
            <h2 className="text-sm font-bold text-[#363326] font-serif flex items-center space-x-2">
              <Home className="w-4 h-4 text-[#415939]" />
              <span>최근 등록 매물</span>
            </h2>
            <button
              onClick={() => setActiveTab('properties')}
              className="text-xs text-[#7c7764] hover:text-[#363326] font-medium flex items-center cursor-pointer"
            >
              <span>매물 관리로 이동</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8e4d9] text-[#7c7764] font-semibold bg-[#f7f4ed]">
                  <th className="py-2.5 px-2.5">매물명</th>
                  <th className="py-2.5 px-2.5">종류/거래</th>
                  <th className="py-2.5 px-2.5">가격</th>
                  <th className="py-2.5 px-2.5">면적/층</th>
                  <th className="py-2.5 px-2.5">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece1]">
                {properties.slice(0, 5).map((prop) => {
                  const statusStyle = PROPERTY_STATUS_MAP[prop.status];
                  return (
                    <tr
                      key={prop.id}
                      onClick={() => onSelectPropertyDetail(prop.id)}
                      className="hover:bg-[#fcfaf6] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-2.5">
                        <div className="font-bold text-[#363326] truncate max-w-[140px]">
                          {prop.name}
                        </div>
                        <div className="text-[11px] text-[#9c9682] truncate max-w-[140px]">
                          {prop.address}
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className="font-medium text-[#4a4636]">{prop.propertyType}</span>
                        <span className="ml-1 text-[11px] text-[#7c7764]">({prop.transactionType})</span>
                      </td>
                      <td className="py-2.5 px-2.5 font-bold text-[#415939]">{prop.price}</td>
                      <td className="py-2.5 px-2.5 text-[#7c7764]">
                        {prop.exclusiveArea}㎡ / {prop.floor}층
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.bg}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
