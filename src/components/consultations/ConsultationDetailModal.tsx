import React from 'react';
import { CustomerConsultation } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import {
  X,
  Phone,
  Calendar,
  MapPin,
  Tag,
  GitCompare,
  Edit2,
  Trash2,
  Sparkles,
  Building,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { CONSULTATION_STATUS_MAP, formatPhone } from '../../utils/formatters';

interface ConsultationDetailModalProps {
  customer: CustomerConsultation | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: CustomerConsultation) => void;
}

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { startComparisonWithCustomer, getMatchesForCustomer, deleteCustomer } = useRealEstate();

  if (!isOpen || !customer) return null;

  const statusStyle = CONSULTATION_STATUS_MAP[customer.status];
  const matchedList = getMatchesForCustomer(customer.id);
  const bestMatches = matchedList.slice(0, 3);

  const handleDelete = () => {
    if (confirm(`'${customer.name}' 고객의 상담 정보를 정말 삭제하시겠습니까?`)) {
      deleteCustomer(customer.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3d3929]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-[#e8e4d9] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8e4d9] flex items-center justify-between bg-[#fcfaf6]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#737c5d] text-[#fdfbf7] flex items-center justify-center font-bold text-base font-serif">
              {customer.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold font-serif text-[#363326]">{customer.name} 고객님</h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.bg}`}>
                  {statusStyle.label}
                </span>
              </div>
              <p className="text-xs text-[#7c7764] font-mono">
                {formatPhone(customer.phone)} • 상담일: {customer.consultationDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9c9682] hover:text-[#363326] hover:bg-[#f0ece1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 text-sm">
          {/* Key Requirement Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#fcfaf6] p-3 rounded-xl border border-[#e8e4d9]">
              <span className="text-xs text-[#7c7764] font-medium block">희망 거래/종목</span>
              <span className="text-sm font-bold text-[#363326] mt-0.5 block font-serif">
                {customer.propertyType} <span className="text-[#8c5836]">({customer.transactionType})</span>
              </span>
            </div>

            <div className="bg-[#fcfaf6] p-3 rounded-xl border border-[#e8e4d9]">
              <span className="text-xs text-[#7c7764] font-medium block">희망 예산</span>
              <span className="text-sm font-bold text-[#415939] mt-0.5 block font-serif">
                {customer.budget}
              </span>
            </div>

            <div className="bg-[#fcfaf6] p-3 rounded-xl border border-[#e8e4d9] col-span-2 sm:col-span-1">
              <span className="text-xs text-[#7c7764] font-medium block">희망 면적</span>
              <span className="text-sm font-bold text-[#363326] mt-0.5 block font-serif">
                {customer.preferredArea || '지정 없음'}
              </span>
            </div>
          </div>

          {/* Target Area */}
          <div>
            <h4 className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider mb-1.5 flex items-center space-x-1 font-serif">
              <MapPin className="w-3.5 h-3.5 text-[#8c9474]" />
              <span>희망 지역</span>
            </h4>
            <div className="p-3 bg-[#fcfaf6] rounded-xl border border-[#e8e4d9] font-medium text-[#363326]">
              {customer.targetArea}
            </div>
          </div>

          {/* Desired Conditions Tags */}
          <div>
            <h4 className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider mb-1.5 flex items-center space-x-1 font-serif">
              <Tag className="w-3.5 h-3.5 text-[#8c9474]" />
              <span>원하는 상세 조건</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {customer.requirements && customer.requirements.length > 0 ? (
                customer.requirements.map((req, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#f0ebe1] text-[#4a4636] rounded-lg text-xs font-medium border border-[#ded9cb]"
                  >
                    #{req}
                  </span>
                ))
              ) : (
                <span className="text-[#9c9682] text-xs">기본 조건</span>
              )}
            </div>
          </div>

          {/* Consultation Memo */}
          <div>
            <h4 className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider mb-1.5 font-serif">
              상담 상세 메모
            </h4>
            <div className="p-3.5 bg-[#fcfaf6] rounded-xl border border-[#ded9cb] text-[#4a4636] text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
              {customer.memo || '기록된 메모가 없습니다.'}
            </div>
          </div>

          {/* Matched Properties Preview */}
          <div className="border-t border-[#e8e4d9] pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#363326] flex items-center space-x-1.5 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-[#737c5d]" />
                <span>추천 적합 매물 ({bestMatches.length}건)</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  startComparisonWithCustomer(customer.id);
                }}
                className="text-xs text-[#526343] hover:underline font-semibold cursor-pointer"
              >
                전체 대조표 보기 →
              </button>
            </div>

            <div className="space-y-2">
              {bestMatches.map((m) => (
                <div
                  key={m.property.id}
                  className="p-2.5 bg-[#fcfaf6] rounded-xl border border-[#e8e4d9] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#363326]">{m.property.name}</div>
                    <div className="text-[#7c7764] text-[11px]">
                      {m.property.price} • {m.property.address}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-[#415939]">{m.score}%</span>
                    <span className="ml-1 text-[11px] text-[#7c7764] font-medium">({m.level})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-[#e8e4d9] bg-[#fcfaf6] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-[#945634] hover:bg-[#faeee8] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer border border-transparent hover:border-[#f1cbbe]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>상담 삭제</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(customer);
              }}
              className="px-3 py-1.5 bg-[#ffffff] border border-[#ded9cb] hover:bg-[#f0ebe1] text-[#4a4636] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>상담 수정</span>
            </button>
            <button
              onClick={() => {
                onClose();
                startComparisonWithCustomer(customer.id);
              }}
              className="px-4 py-1.5 bg-[#737c5d] hover:bg-[#626a4c] text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 shadow-xs cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#e5edd8]" />
              <span>매물 조건 비교하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
