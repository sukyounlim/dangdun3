import React, { useState, useEffect } from 'react';
import { CustomerConsultation, PropertyType, TransactionType, ConsultationStatus } from '../../types';
import { X, Sparkles, Plus, Tag, Check, AlertCircle } from 'lucide-react';
import { formatKoreanMoney } from '../../utils/formatters';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CustomerConsultation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialCustomer?: CustomerConsultation | null;
}

const COMMON_REQUIREMENTS = [
  '역세권',
  '남향',
  '초품아',
  '지하주차장',
  '올수리',
  '즉시입주',
  '반려동물가능',
  '풀옵션',
  '로얄층',
  '한강조망',
  '탄천조망',
  '주차편리',
  '엘리베이터',
  '보안우수',
  '대출가능',
];

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCustomer,
}) => {
  const isEdit = !!initialCustomer;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consultationDate, setConsultationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [propertyType, setPropertyType] = useState<PropertyType>('아파트');
  const [transactionType, setTransactionType] = useState<TransactionType>('매매');
  const [targetArea, setTargetArea] = useState('');
  const [budget, setBudget] = useState('');
  const [maxPriceNum, setMaxPriceNum] = useState<number | undefined>(undefined);
  const [monthlyRentNum, setMonthlyRentNum] = useState<number | undefined>(undefined);
  const [preferredArea, setPreferredArea] = useState('');
  const [minAreaM2, setMinAreaM2] = useState<number | undefined>(undefined);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState<ConsultationStatus>('신규상담');

  // AI assist state
  const [isAnalyzingMemo, setIsAnalyzingMemo] = useState(false);
  const [aiAnalysisTip, setAiAnalysisTip] = useState<string | null>(null);

  useEffect(() => {
    if (initialCustomer) {
      setName(initialCustomer.name);
      setPhone(initialCustomer.phone);
      setConsultationDate(initialCustomer.consultationDate || new Date().toISOString().slice(0, 10));
      setPropertyType(initialCustomer.propertyType);
      setTransactionType(initialCustomer.transactionType);
      setTargetArea(initialCustomer.targetArea);
      setBudget(initialCustomer.budget);
      setMaxPriceNum(initialCustomer.maxPriceNum);
      setMonthlyRentNum(initialCustomer.monthlyRentNum);
      setPreferredArea(initialCustomer.preferredArea || '');
      setMinAreaM2(initialCustomer.minAreaM2);
      setRequirements(initialCustomer.requirements || []);
      setMemo(initialCustomer.memo || '');
      setStatus(initialCustomer.status);
      setAiAnalysisTip(null);
    } else {
      setName('');
      setPhone('');
      setConsultationDate(new Date().toISOString().slice(0, 10));
      setPropertyType('아파트');
      setTransactionType('매매');
      setTargetArea('');
      setBudget('');
      setMaxPriceNum(undefined);
      setMonthlyRentNum(undefined);
      setPreferredArea('');
      setMinAreaM2(undefined);
      setRequirements([]);
      setMemo('');
      setStatus('신규상담');
      setAiAnalysisTip(null);
    }
  }, [initialCustomer, isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (requirements.includes(tag)) {
      setRequirements(requirements.filter((r) => r !== tag));
    } else {
      setRequirements([...requirements, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (newTagInput.trim() && !requirements.includes(newTagInput.trim())) {
      setRequirements([...requirements, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleAiStructure = async () => {
    if (!memo.trim()) {
      alert('상담 메모란에 상담 내용이나 통화 내용을 먼저 작성해주세요.');
      return;
    }

    try {
      setIsAnalyzingMemo(true);
      const res = await fetch('/api/ai/structure-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: memo }),
      });
      const data = await res.json();
      if (data.result) {
        const { extractedClient, consultationTips, summary } = data.result;
        if (extractedClient?.propertyType) setPropertyType(extractedClient.propertyType);
        if (extractedClient?.transactionType) setTransactionType(extractedClient.transactionType);
        if (extractedClient?.targetArea && !targetArea) setTargetArea(extractedClient.targetArea);
        if (extractedClient?.budget && !budget) setBudget(extractedClient.budget);
        if (Array.isArray(extractedClient?.requirements) && extractedClient.requirements.length > 0) {
          const combined = Array.from(new Set([...requirements, ...extractedClient.requirements]));
          setRequirements(combined);
        }
        if (consultationTips) {
          setAiAnalysisTip(consultationTips);
        }
      }
    } catch (e) {
      console.error('AI Structure failed', e);
    } finally {
      setIsAnalyzingMemo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !targetArea.trim()) {
      alert('고객명, 연락처, 희망 지역은 필수 항목입니다.');
      return;
    }

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      consultationDate,
      propertyType,
      transactionType,
      targetArea: targetArea.trim(),
      budget: budget.trim() || (transactionType === '월세' ? `보증금 ${formatKoreanMoney(maxPriceNum)} / 월 ${monthlyRentNum || 0}만` : formatKoreanMoney(maxPriceNum)),
      maxPriceNum,
      monthlyRentNum,
      preferredArea: preferredArea.trim(),
      minAreaM2,
      requirements,
      memo: memo.trim(),
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3d3929]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-[#e8e4d9] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e8e4d9] flex items-center justify-between bg-[#fcfaf6]">
          <div>
            <h3 className="text-base font-bold font-serif text-[#363326]">
              {isEdit ? '고객 상담 정보 수정' : '신규 고객 상담 등록'}
            </h3>
            <p className="text-xs text-[#7c7764] mt-0.5">
              고객의 희망 매물 조건과 상담 내용을 정확하게 기록합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9c9682] hover:text-[#363326] hover:bg-[#f0ece1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          {/* Row 1: 고객 기본 인적사항 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                고객명 <span className="text-[#945634]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                연락처 <span className="text-[#945634]">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="예: 010-1234-5678"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                상담일자 <span className="text-[#945634]">*</span>
              </label>
              <input
                type="date"
                required
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono"
              />
            </div>
          </div>

          {/* Row 2: 매물 종류, 거래 유형, 진행 상태 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                매물 종류
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              >
                <option value="아파트">아파트</option>
                <option value="오피스텔">오피스텔</option>
                <option value="빌라·다세대">빌라·다세대</option>
                <option value="원룸·투룸">원룸·투룸</option>
                <option value="상가·사무실">상가·사무실</option>
                <option value="토지·단독주택">토지·단독주택</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                거래 유형
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-semibold"
              >
                <option value="매매">매매</option>
                <option value="전세">전세</option>
                <option value="월세">월세</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                상담 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ConsultationStatus)}
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-semibold"
              >
                <option value="신규상담">신규상담</option>
                <option value="매물탐색중">매물탐색중</option>
                <option value="현장방문예정">현장방문예정</option>
                <option value="가계약진행">가계약진행</option>
                <option value="계약완료">계약완료</option>
                <option value="보류/종료">보류/종료</option>
              </select>
            </div>
          </div>

          {/* Row 3: 희망 지역 */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4636] mb-1">
              희망 지역 <span className="text-[#945634]">*</span>
            </label>
            <input
              type="text"
              required
              value={targetArea}
              onChange={(e) => setTargetArea(e.target.value)}
              placeholder="예: 서울시 강남구 대치동 / 도곡동 학원가 인근"
              className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
            />
          </div>

          {/* Row 4: 희망 가격 및 수치 입력 */}
          <div className="bg-[#fcfaf6] p-3.5 rounded-xl border border-[#e8e4d9] space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                  희망 가격 (표시 문구)
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={
                    transactionType === '월세'
                      ? '예: 보증금 3,000만 / 월 120만'
                      : '예: 매매 17억 ~ 19억'
                  }
                  className="w-full px-3 py-2 bg-[#ffffff] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                  {transactionType === '월세' ? '희망 보증금 (만원)' : '최대 희망가 (만원 단위)'}
                </label>
                <input
                  type="number"
                  value={maxPriceNum !== undefined ? maxPriceNum : ''}
                  onChange={(e) => setMaxPriceNum(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="예: 180000 (18억인 경우)"
                  className="w-full px-3 py-2 bg-[#ffffff] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono"
                />
                {maxPriceNum && (
                  <span className="text-[11px] text-[#7c7764] mt-0.5 block font-serif">
                    = {formatKoreanMoney(maxPriceNum)}
                  </span>
                )}
              </div>
            </div>

            {transactionType === '월세' && (
              <div>
                <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                  희망 최대 월세 (만원)
                </label>
                <input
                  type="number"
                  value={monthlyRentNum !== undefined ? monthlyRentNum : ''}
                  onChange={(e) => setMonthlyRentNum(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="예: 120 (120만원)"
                  className="w-full px-3 py-2 bg-[#ffffff] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono"
                />
              </div>
            )}
          </div>

          {/* Row 5: 희망 면적 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                희망 면적 (표시용)
              </label>
              <input
                type="text"
                value={preferredArea}
                onChange={(e) => setPreferredArea(e.target.value)}
                placeholder="예: 전용 84㎡ (34평형) 내외"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                최소 전용면적 (㎡)
              </label>
              <input
                type="number"
                value={minAreaM2 !== undefined ? minAreaM2 : ''}
                onChange={(e) => setMinAreaM2(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="예: 84"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono"
              />
            </div>
          </div>

          {/* Row 6: 원하는 조건 태그 */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4636] mb-1.5">
              원하는 조건 (클릭하여 선택 또는 직접 추가)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_REQUIREMENTS.map((tag) => {
                const isSelected = requirements.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-[#3d3929] text-[#fdfbf7]'
                        : 'bg-[#f0ebe1] text-[#4a4636] hover:bg-[#e4ded0] border border-[#ded9cb]'
                    }`}
                  >
                    <span>{tag}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#c2ccaa]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="기타 조건 직접 입력 후 추가 (예: 테라스, 복층)"
                className="flex-1 px-3 py-1.5 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-xs text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-[#f0ebe1] hover:bg-[#e4ded0] text-[#363326] rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-[#ded9cb]"
              >
                + 추가
              </button>
            </div>
          </div>

          {/* Row 7: 상담 메모 & AI 도우미 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#4a4636]">
                상담 상세 메모
              </label>
              <button
                type="button"
                onClick={handleAiStructure}
                disabled={isAnalyzingMemo}
                className="inline-flex items-center space-x-1 text-xs font-medium text-[#415939] bg-[#edf2e8] hover:bg-[#dfead8] px-2 py-0.5 rounded border border-[#d0dec6] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#737c5d]" />
                <span>{isAnalyzingMemo ? '분석 중...' : 'AI 메모 구조화 도우미'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="고객과의 대화 내용, 이사 사유, 특이 요구사항 등을 자유롭게 기록하세요..."
              className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474] resize-none text-xs sm:text-sm"
            />
            {aiAnalysisTip && (
              <div className="mt-1.5 p-2.5 bg-[#fdf5e6] rounded-lg border border-[#fae2b8] text-xs text-[#7a581e] flex items-start space-x-2 font-serif italic">
                <Sparkles className="w-4 h-4 text-[#7a581e] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold not-italic">AI 중개 상담 팁:</strong> {aiAnalysisTip}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-[#e8e4d9] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f0ebe1] hover:bg-[#e4ded0] text-[#4a4636] rounded-lg font-medium transition-colors cursor-pointer border border-[#ded9cb]"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#737c5d] hover:bg-[#626a4c] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isEdit ? '수정 완료' : '상담 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
