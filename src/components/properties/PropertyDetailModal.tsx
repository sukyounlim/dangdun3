import React from 'react';
import { Property } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import {
  X,
  Building,
  MapPin,
  Tag,
  GitCompare,
  Edit2,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  Key,
  DollarSign,
} from 'lucide-react';
import { PROPERTY_STATUS_MAP, formatArea, formatKoreanMoney } from '../../utils/formatters';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { startComparisonWithProperty, getMatchesForProperty, deleteProperty } = useRealEstate();

  if (!isOpen || !property) return null;

  const statusStyle = PROPERTY_STATUS_MAP[property.status];
  const matchedCustomers = getMatchesForProperty(property.id);
  const bestCustomerMatches = matchedCustomers.slice(0, 3);

  const handleDelete = () => {
    if (confirm(`'${property.name}' 매물을 정말 삭제하시겠습니까?`)) {
      deleteProperty(property.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3d3929]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-[#e8e4d9] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8e4d9] flex items-center justify-between bg-[#fcfaf6]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#737c5d] text-[#fdfbf7] flex items-center justify-center font-bold text-base">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold font-serif text-[#363326]">{property.name}</h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.bg}`}>
                  {statusStyle.label}
                </span>
              </div>
              <p className="text-xs text-[#7c7764] font-mono">
                {property.propertyType} • {property.transactionType} • 등록일: {property.registrationDate}
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
          {/* Top Key Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#fcfaf6] p-3 rounded-xl border border-[#ded9cb]">
              <span className="text-xs text-[#7c7764] font-semibold block">매물 가격</span>
              <span className="text-sm font-bold text-[#415939] mt-0.5 block font-serif">
                {property.price}
              </span>
            </div>

            <div className="bg-[#fcfaf6] p-3 rounded-xl border border-[#e8e4d9]">
              <span className="text-xs text-[#7c7764] font-medium block">전용면적</span>
              <span className="text-sm font-bold text-[#363326] mt-0.5 block font-serif">
                {formatArea(property.exclusiveArea)}
              </span>
            </div>

            <div className="bg-[#fcfaf6] p-3 rounded-xl border border-[#e8e4d9]">
              <span className="text-xs text-[#7c7764] font-medium block">해당층 / 총층</span>
              <span className="text-sm font-bold text-[#363326] mt-0.5 block font-serif">
                {property.floor}층 / {property.totalFloors}층
              </span>
            </div>

            <div className="bg-[#fcfaf6] p-3 rounded-xl border border-[#e8e4d9]">
              <span className="text-xs text-[#7c7764] font-medium block">입주 가능일</span>
              <span className="text-sm font-bold text-[#363326] mt-0.5 block truncate font-serif" title={property.moveInDate}>
                {property.moveInDate || '협의'}
              </span>
            </div>
          </div>

          {/* Location / Address */}
          <div>
            <h4 className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider mb-1.5 flex items-center space-x-1 font-serif">
              <MapPin className="w-3.5 h-3.5 text-[#8c9474]" />
              <span>소재지 및 주소</span>
            </h4>
            <div className="p-3 bg-[#fcfaf6] rounded-xl border border-[#e8e4d9] font-medium text-[#363326] flex justify-between items-center">
              <span>{property.address} {property.detailAddress}</span>
              {property.maintenanceFee && (
                <span className="text-xs text-[#7c7764] font-normal">
                  관리비: {property.maintenanceFee}
                </span>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider mb-1.5 flex items-center space-x-1 font-serif">
              <Tag className="w-3.5 h-3.5 text-[#8c9474]" />
              <span>주요 옵션 및 특징</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {property.features && property.features.length > 0 ? (
                property.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#edf2e8] text-[#415939] rounded-lg text-xs font-medium border border-[#d0dec6]"
                  >
                    #{feat}
                  </span>
                ))
              ) : (
                <span className="text-[#9c9682] text-xs">기본 사양</span>
              )}
            </div>
          </div>

          {/* Property Memo */}
          <div>
            <h4 className="text-xs font-semibold text-[#7c7764] uppercase tracking-wider mb-1.5 font-serif">
              매물 중개 메모
            </h4>
            <div className="p-3.5 bg-[#fcfaf6] rounded-xl border border-[#ded9cb] text-[#4a4636] text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
              {property.memo || '기록된 메모가 없습니다.'}
            </div>
          </div>

          {/* Matched Customers Preview */}
          <div className="border-t border-[#e8e4d9] pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#363326] flex items-center space-x-1.5 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-[#737c5d]" />
                <span>이 매물에 부합하는 상담 고객 ({bestCustomerMatches.length}명)</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  startComparisonWithProperty(property.id);
                }}
                className="text-xs text-[#526343] hover:underline font-semibold cursor-pointer"
              >
                전체 대조표 보기 →
              </button>
            </div>

            <div className="space-y-2">
              {bestCustomerMatches.map((m) => (
                <div
                  key={m.customer.id}
                  className="p-2.5 bg-[#fcfaf6] rounded-xl border border-[#e8e4d9] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#363326]">
                      {m.customer.name} 고객 ({m.customer.phone})
                    </div>
                    <div className="text-[#7c7764] text-[11px]">
                      희망: {m.customer.targetArea} • {m.customer.budget}
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
            <span>매물 삭제</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(property);
              }}
              className="px-3 py-1.5 bg-[#ffffff] border border-[#ded9cb] hover:bg-[#f0ebe1] text-[#4a4636] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>매물 수정</span>
            </button>
            <button
              onClick={() => {
                onClose();
                startComparisonWithProperty(property.id);
              }}
              className="px-4 py-1.5 bg-[#737c5d] hover:bg-[#626a4c] text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 shadow-xs cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#e5edd8]" />
              <span>적합 고객 비교하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
