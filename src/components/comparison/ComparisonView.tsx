import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Users,
  Home,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { evaluateCustomerPropertyMatch } from '../../utils/matchingEngine';
import { MatchEvaluation, MatchItemStatus } from '../../types';
import { CONSULTATION_STATUS_MAP, PROPERTY_STATUS_MAP, formatPhone, formatArea } from '../../utils/formatters';

export const ComparisonView: React.FC = () => {
  const {
    customers,
    properties,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedPropertyId,
    setSelectedPropertyId,
    showToast,
  } = useRealEstate();

  // Active customer & property
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;

  // Sorted property matches for this customer
  const propertyMatches: MatchEvaluation[] = activeCustomer
    ? properties
        .map((prop) => evaluateCustomerPropertyMatch(activeCustomer, prop))
        .sort((a, b) => b.score - a.score)
    : [];

  const activeMatch =
    propertyMatches.find((m) => m.property.id === selectedPropertyId) ||
    propertyMatches[0] ||
    null;

  // AI Briefing State
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  // Reset briefing when selection changes
  useEffect(() => {
    setAiBriefing(null);
  }, [selectedCustomerId, selectedPropertyId]);

  const handleGenerateAiBriefing = async () => {
    if (!activeCustomer || !activeMatch) return;

    try {
      setIsLoadingAi(true);
      const res = await fetch('/api/ai/analyze-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: activeCustomer,
          property: activeMatch.property,
          matchDetails: activeMatch,
        }),
      });

      const data = await res.json();
      if (data.briefing) {
        setAiBriefing(data.briefing);
      } else {
        showToast('AI 분석 결과를 불러오지 못했습니다.');
      }
    } catch (e: any) {
      console.error('AI Briefing Error:', e);
      showToast('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyBriefing = () => {
    if (aiBriefing) {
      navigator.clipboard.writeText(aiBriefing);
      setCopiedBriefing(true);
      showToast('상담 브리핑 멘트가 클립보드에 복사되었습니다.');
      setTimeout(() => setCopiedBriefing(false), 2000);
    }
  };

  if (customers.length === 0 || properties.length === 0) {
    return (
      <div className="bg-[#ffffff] rounded-2xl border border-[#e8e4d9] p-12 text-center shadow-[0_2px_8px_rgba(74,70,54,0.04)] space-y-3">
        <GitCompare className="w-12 h-12 text-[#b0a997] mx-auto" />
        <h3 className="text-base font-bold font-serif text-[#363326]">
          비교할 고객 상담 또는 매물 정보가 부족합니다.
        </h3>
        <p className="text-xs text-[#7c7764] max-w-md mx-auto">
          고객 상담 메뉴와 매물 관리 메뉴에서 최소 1건 이상의 고객 및 매물을 등록해주세요.
        </p>
      </div>
    );
  }

  const renderStatusBadge = (status: MatchItemStatus) => {
    switch (status) {
      case 'match':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#edf2e8] text-[#415939] border border-[#d0dec6]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#415939]" />
            <span>조건 일치</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fdf5e6] text-[#7a581e] border border-[#fae2b8]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#7a581e]" />
            <span>부분 일치 / 조율</span>
          </span>
        );
      case 'mismatch':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#faefe8] text-[#945634] border border-[#f2d5c6]">
            <XCircle className="w-3.5 h-3.5 text-[#945634]" />
            <span>조건 상이</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Customer Selector */}
      <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#e8e4d9] shadow-[0_2px_8px_rgba(74,70,54,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0ece1] pb-3">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#363326] flex items-center space-x-2">
              <GitCompare className="w-5 h-5 text-[#737c5d]" />
              <span>고객 조건 - 매물 상세 대조 및 비교 분석</span>
            </h2>
            <p className="text-xs text-[#7c7764] mt-0.5">
              선택된 고객의 희망 조건(지역, 예산, 종목, 면적, 옵션)과 등록된 매물들의 실제 조건을 1:1로 정밀 대조합니다.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#7c7764]">상담 고객 선택:</span>
            <select
              value={activeCustomer?.id || ''}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const firstMatch = propertyMatches[0];
                if (firstMatch) setSelectedPropertyId(firstMatch.property.id);
              }}
              className="px-3 py-1.5 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-xs sm:text-sm font-bold text-[#363326] focus:outline-none focus:ring-1 focus:ring-[#8c9474] cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.propertyType} {c.transactionType} / {c.targetArea.slice(0, 14)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Customer Summary Banner */}
        {activeCustomer && (
          <div className="bg-[#fcfaf6] rounded-xl p-4 border border-[#e8e4d9] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-base font-extrabold font-serif text-[#363326]">
                  {activeCustomer.name} 고객님
                </span>
                <span className="text-xs text-[#7c7764] font-mono">
                  ({formatPhone(activeCustomer.phone)})
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#f0ebe1] text-[#4a4636] border border-[#ded9cb]">
                  상담일: {activeCustomer.consultationDate}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                    CONSULTATION_STATUS_MAP[activeCustomer.status].bg
                  }`}
                >
                  {CONSULTATION_STATUS_MAP[activeCustomer.status].label}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-[#4a4636] flex-wrap gap-y-1">
                <span>
                  <strong>희망 종목:</strong> {activeCustomer.propertyType} ({activeCustomer.transactionType})
                </span>
                <span>•</span>
                <span>
                  <strong>희망 지역:</strong> {activeCustomer.targetArea}
                </span>
                <span>•</span>
                <span>
                  <strong>예산:</strong> <span className="text-[#415939] font-bold">{activeCustomer.budget}</span>
                </span>
                {activeCustomer.preferredArea && (
                  <>
                    <span>•</span>
                    <span>
                      <strong>면적:</strong> {activeCustomer.preferredArea}
                    </span>
                  </>
                )}
              </div>

              {activeCustomer.requirements && activeCustomer.requirements.length > 0 && (
                <div className="flex items-center space-x-1.5 pt-1 flex-wrap">
                  <span className="text-[11px] text-[#7c7764] font-medium">선호 조건:</span>
                  {activeCustomer.requirements.map((req, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#ffffff] text-[#4a4636] rounded text-[11px] font-medium border border-[#ded9cb]"
                    >
                      #{req}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-[#7c7764] block">전체 등록 매물 중</span>
              <span className="text-sm font-bold text-[#363326]">
                총 <strong className="text-[#8c9474] font-serif">{properties.length}건</strong> 대조 완료
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Comparison Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 Cols): Matched Properties Ranking Carousel/List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[#363326] flex items-center space-x-1.5">
              <Home className="w-4 h-4 text-[#737c5d]" />
              <span>추천 매물 랭킹 ({propertyMatches.length}건)</span>
            </h3>
            <span className="text-xs text-[#9c9682]">일치도 높은 순</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {propertyMatches.map((m) => {
              const isSelected = activeMatch?.property.id === m.property.id;
              const prop = m.property;

              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedPropertyId(prop.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#f7f4ed] border-[#737c5d] ring-1 ring-[#737c5d] shadow-sm'
                      : 'bg-[#ffffff] border-[#e8e4d9] hover:border-[#8c9474] shadow-[0_1px_4px_rgba(74,70,54,0.03)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[#363326] text-sm truncate">
                          {prop.name}
                        </span>
                      </div>
                      <p className="text-xs text-[#7c7764] truncate mt-0.5">
                        {prop.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold font-serif text-[#415939] block">
                        {m.score}%
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          m.score >= 85
                            ? 'bg-[#edf2e8] text-[#415939]'
                            : m.score >= 70
                            ? 'bg-[#fdf5e6] text-[#7a581e]'
                            : 'bg-[#f0ebe1] text-[#4a4636]'
                        }`}
                      >
                        {m.level}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#f0ece1] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#415939]">{prop.price}</span>
                    <span className="text-[#7c7764] text-[11px]">
                      전용 {prop.exclusiveArea}㎡ • {prop.floor}층
                    </span>
                  </div>

                  {/* Itemized Match Counts */}
                  <div className="mt-2 flex items-center space-x-2 text-[11px]">
                    <span className="text-[#415939] font-semibold flex items-center space-x-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>일치 {m.matchedCount}</span>
                    </span>
                    {m.partialCount > 0 && (
                      <span className="text-[#7a581e] font-semibold flex items-center space-x-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>유사 {m.partialCount}</span>
                      </span>
                    )}
                    {m.mismatchCount > 0 && (
                      <span className="text-[#9c9682] font-semibold flex items-center space-x-0.5">
                        <XCircle className="w-3 h-3" />
                        <span>불일치 {m.mismatchCount}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 Cols): 1:1 Side-by-side Matrix Comparison & AI Consultant Briefing */}
        <div className="lg:col-span-8 space-y-6">
          {activeMatch ? (
            <>
              {/* 1:1 Comparison Matrix Card */}
              <div className="bg-[#ffffff] rounded-2xl border border-[#e8e4d9] shadow-[0_2px_8px_rgba(74,70,54,0.04)] overflow-hidden">
                {/* Header of Comparison Matrix */}
                <div className="p-5 border-b border-[#e8e4d9] bg-[#fcfaf6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#3d3929] text-[#fdfbf7]">
                        1:1 조건 정밀 대조표
                      </span>
                      <h3 className="text-base font-bold font-serif text-[#363326]">
                        {activeCustomer?.name} 고객 ↔ {activeMatch.property.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[#7c7764] mt-1">
                      {activeMatch.summaryMessage}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 bg-[#ffffff] px-3 py-1.5 rounded-xl border border-[#e8e4d9] self-start sm:self-auto shadow-2xs">
                    <div className="text-right">
                      <span className="text-[11px] text-[#7c7764] block font-medium">종합 적합도</span>
                      <span className="text-lg font-black font-serif text-[#415939]">
                        {activeMatch.score}점
                      </span>
                    </div>
                    <div className="w-px h-7 bg-[#ded9cb]" />
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        activeMatch.score >= 85
                          ? 'bg-[#edf2e8] text-[#415939]'
                          : activeMatch.score >= 70
                          ? 'bg-[#fdf5e6] text-[#7a581e]'
                          : 'bg-[#f0ebe1] text-[#4a4636]'
                      }`}
                    >
                      {activeMatch.level}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#f7f4ed] border-b border-[#e8e4d9] text-[#7c7764] font-semibold text-xs uppercase tracking-wider">
                        <th className="py-3 px-4 w-28">대조 항목</th>
                        <th className="py-3 px-4 w-1/3">고객 희망 조건</th>
                        <th className="py-3 px-4 w-1/3">매물 실제 조건</th>
                        <th className="py-3 px-4 text-center w-36">대조 결과</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0ece1]">
                      {activeMatch.criteria.map((crit, idx) => {
                        return (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              crit.status === 'match'
                                ? 'hover:bg-[#edf2e8]/30'
                                : crit.status === 'partial'
                                ? 'hover:bg-[#fdf5e6]/30'
                                : 'hover:bg-[#faefe8]/30'
                            }`}
                          >
                            {/* 항목명 */}
                            <td className="py-3.5 px-4 font-bold text-[#4a4636] whitespace-nowrap bg-[#fcfaf6]">
                              {crit.label}
                            </td>

                            {/* 고객 희망 조건 */}
                            <td className="py-3.5 px-4 font-medium text-[#363326]">
                              <div>{crit.customerRequirement}</div>
                            </td>

                            {/* 매물 실제 조건 */}
                            <td className="py-3.5 px-4 text-[#4a4636]">
                              <div className="font-semibold text-[#363326]">
                                {crit.propertyValue}
                              </div>
                              {crit.details && (
                                <div className="text-xs text-[#7c7764] mt-0.5">
                                  {crit.details}
                                </div>
                              )}
                            </td>

                            {/* 대조 상태 뱃지 */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {renderStatusBadge(crit.status)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Highlight Summary Boxes */}
                <div className="p-4 bg-[#fcfaf6] border-t border-[#e8e4d9] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* 일치 강점 리스트 */}
                  <div className="p-3 bg-[#edf2e8] rounded-xl border border-[#d0dec6] space-y-1">
                    <span className="font-bold text-[#415939] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#415939]" />
                      <span>일치하는 핵심 강점 ({activeMatch.matchedItems.length}건)</span>
                    </span>
                    <ul className="list-disc list-inside text-[#415939] space-y-0.5 font-medium">
                      {activeMatch.matchedItems.length > 0 ? (
                        activeMatch.matchedItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))
                      ) : (
                        <li className="text-[#9c9682] list-none">완전 일치 항목 없음</li>
                      )}
                    </ul>
                  </div>

                  {/* 차이점 및 조율 리스트 */}
                  <div className="p-3 bg-[#fdf5e6] rounded-xl border border-[#fae2b8] space-y-1">
                    <span className="font-bold text-[#7a581e] flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#7a581e]" />
                      <span>확인 및 조율 필요 사항 ({activeMatch.partialItems.length + activeMatch.unmatchedItems.length}건)</span>
                    </span>
                    <ul className="list-disc list-inside text-[#7a581e] space-y-0.5 font-medium">
                      {[...activeMatch.partialItems, ...activeMatch.unmatchedItems].length > 0 ? (
                        [...activeMatch.partialItems, ...activeMatch.unmatchedItems].map((item, i) => (
                          <li key={i}>{item}</li>
                        ))
                      ) : (
                        <li className="text-[#415939] list-none">특별한 차이점 없음 (완벽 일치)</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI Real Estate Consultant Briefing Section */}
              <div className="bg-[#3d3929] rounded-2xl p-5 text-[#fdfbf7] shadow-md space-y-4 border border-[#524d38]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#524d38] pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8c9474]/20 border border-[#8c9474]/40 flex items-center justify-center text-[#c2ccaa]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-serif text-[#fdfbf7]">
                        AI 공인중개사 고객 제안 브리핑 생성기
                      </h4>
                      <p className="text-xs text-[#c9c4b1]">
                        조건 대조 결과를 토대로 고객과의 전화 상담/방문 미팅 시 바로 활용할 수 있는 전문적인 제안 스크립트를 작성합니다.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAiBriefing}
                    disabled={isLoadingAi}
                    className="px-3.5 py-2 bg-[#8c9474] hover:bg-[#9da584] text-[#1e1c14] font-bold rounded-lg text-xs transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>{isLoadingAi ? 'AI 브리핑 생성 중...' : '맞춤 상담 브리핑 생성'}</span>
                  </button>
                </div>

                {aiBriefing ? (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-4 bg-[#2b281c] rounded-xl border border-[#524d38] text-[#e8e4d9] text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {aiBriefing}
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={handleCopyBriefing}
                        className="px-3 py-1.5 bg-[#4a4636] hover:bg-[#585340] text-[#fdfbf7] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        {copiedBriefing ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#a4c794]" />
                            <span className="text-[#a4c794] font-semibold">복사 완료</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>스크립트 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#a8a391] text-xs bg-[#2b281c]/60 rounded-xl border border-[#524d38]/60 font-serif italic">
                    [맞춤 상담 브리핑 생성] 버튼을 누르면 고객의 요구사항과 매물 특징을 매끄럽게 연결한 중개사 전용 상담 멘트를 생성합니다.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-[#ffffff] rounded-2xl border border-[#e8e4d9] p-12 text-center text-[#9c9682]">
              좌측 목록에서 대조할 매물을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
