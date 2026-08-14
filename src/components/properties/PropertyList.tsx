import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { Property, PropertyStatus, PropertyType, TransactionType } from '../../types';
import {
  Search,
  Plus,
  GitCompare,
  Edit2,
  Trash2,
  Eye,
  Building,
  MapPin,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { PROPERTY_STATUS_MAP, formatArea, formatKoreanMoney } from '../../utils/formatters';

interface PropertyListProps {
  onOpenNewPropertyModal: () => void;
  onEditProperty: (property: Property) => void;
  onViewPropertyDetail: (property: Property) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  onOpenNewPropertyModal,
  onEditProperty,
  onViewPropertyDetail,
}) => {
  const { properties, deleteProperty, startComparisonWithProperty } = useRealEstate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [transFilter, setTransFilter] = useState<string>('all');

  const filteredProperties = properties.filter((prop) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = prop.name.toLowerCase().includes(q);
      const matchAddress = prop.address.toLowerCase().includes(q);
      const matchDetail = (prop.detailAddress || '').toLowerCase().includes(q);
      const matchPrice = prop.price.toLowerCase().includes(q);
      const matchMemo = prop.memo.toLowerCase().includes(q);
      const matchFeats = prop.features.some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchAddress && !matchDetail && !matchPrice && !matchMemo && !matchFeats) {
        return false;
      }
    }

    if (statusFilter !== 'all' && prop.status !== statusFilter) {
      return false;
    }

    if (typeFilter !== 'all' && prop.propertyType !== typeFilter) {
      return false;
    }

    if (transFilter !== 'all' && prop.transactionType !== transFilter) {
      return false;
    }

    return true;
  });

  const handleDelete = (prop: Property) => {
    if (confirm(`'${prop.name}' 매물을 정말 삭제하시겠습니까?`)) {
      deleteProperty(prop.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#ffffff] p-5 rounded-xl border border-[#e8e4d9] shadow-[0_2px_8px_rgba(74,70,54,0.04)]">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#363326] flex items-center space-x-2">
            <span>매물 관리</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#edf2e8] text-[#415939] font-semibold border border-[#d0dec6]">
              총 {properties.length}건
            </span>
          </h2>
          <p className="text-xs text-[#7c7764] mt-1">
            매물명, 주소, 가격, 면적, 층수, 주요 옵션 및 매물 상태를 일목요연하게 관리합니다.
          </p>
        </div>

        <button
          onClick={onOpenNewPropertyModal}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#737c5d] hover:bg-[#626a4c] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>신규 매물 등록</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e8e4d9] shadow-[0_2px_8px_rgba(74,70,54,0.04)] space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9c9682] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="매물명, 주소(동/도로명), 특징 키워드, 매물 메모 검색..."
              className="w-full pl-9 pr-4 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-sm text-[#4a4636] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9c9682] hover:text-[#4a4636] font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#4a4636] focus:outline-none focus:ring-1 focus:ring-[#8c9474] cursor-pointer"
            >
              <option value="all">전체 매물 상태</option>
              <option value="거래가능">거래가능</option>
              <option value="계약진행중">계약진행중</option>
              <option value="거래완료">거래완료</option>
              <option value="보류">보류</option>
            </select>

            {/* Property Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#4a4636] focus:outline-none focus:ring-1 focus:ring-[#8c9474] cursor-pointer"
            >
              <option value="all">전체 매물종류</option>
              <option value="아파트">아파트</option>
              <option value="오피스텔">오피스텔</option>
              <option value="빌라·다세대">빌라·다세대</option>
              <option value="원룸·투룸">원룸·투룸</option>
              <option value="상가·사무실">상가·사무실</option>
              <option value="토지·단독주택">토지·단독주택</option>
            </select>

            {/* Transaction Type */}
            <select
              value={transFilter}
              onChange={(e) => setTransFilter(e.target.value)}
              className="px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#4a4636] focus:outline-none focus:ring-1 focus:ring-[#8c9474] cursor-pointer"
            >
              <option value="all">전체 거래유형</option>
              <option value="매매">매매</option>
              <option value="전세">전세</option>
              <option value="월세">월세</option>
            </select>

            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || transFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setTransFilter('all');
                }}
                className="px-3 py-2 text-[#7c7764] hover:text-[#363326] hover:bg-[#f0ece1] rounded-lg transition-colors font-medium cursor-pointer"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Property Table - Explicit Guideline Compliant:
          매물명 / 매물 종류 / 주소 / 가격 / 면적 / 주요 조건 / 등록일 / 매물 상태 */}
      <div className="bg-[#ffffff] rounded-xl border border-[#e8e4d9] shadow-[0_2px_8px_rgba(74,70,54,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f7f4ed] border-b border-[#e8e4d9] text-[#7c7764] font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">매물명</th>
                <th className="py-3 px-3">매물 종류</th>
                <th className="py-3 px-4">주소</th>
                <th className="py-3 px-4">가격</th>
                <th className="py-3 px-3">면적 (전용/공급)</th>
                <th className="py-3 px-4">주요 조건</th>
                <th className="py-3 px-3">등록일</th>
                <th className="py-3 px-3">매물 상태</th>
                <th className="py-3 px-4 text-center">업무 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece1] text-xs sm:text-sm">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#9c9682] font-serif">
                    {searchTerm || statusFilter !== 'all'
                      ? '검색 또는 필터 조건에 일치하는 매물이 없습니다.'
                      : '등록된 매물이 없습니다. 상단의 [신규 매물 등록] 버튼을 눌러 매물을 추가하세요.'}
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop) => {
                  const statusStyle = PROPERTY_STATUS_MAP[prop.status];
                  return (
                    <tr
                      key={prop.id}
                      className="hover:bg-[#fcfaf6] transition-colors group"
                    >
                      {/* 1. 매물명 */}
                      <td className="py-3 px-4 font-bold text-[#363326] whitespace-nowrap">
                        <button
                          onClick={() => onViewPropertyDetail(prop)}
                          className="hover:text-[#415939] hover:underline text-left font-bold cursor-pointer"
                        >
                          {prop.name}
                        </button>
                        {prop.floor && (
                          <span className="ml-1.5 text-[11px] font-normal text-[#7c7764]">
                            ({prop.floor}층/{prop.totalFloors}층)
                          </span>
                        )}
                      </td>

                      {/* 2. 매물 종류 */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-[#f0ebe1] text-[#4a4636] rounded font-medium text-xs border border-[#ded9cb]">
                          {prop.propertyType}
                        </span>
                        <span className="ml-1 text-xs text-[#7c7764] font-medium">
                          ({prop.transactionType})
                        </span>
                      </td>

                      {/* 3. 주소 */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#4a4636] max-w-[180px] truncate" title={prop.address}>
                          {prop.address}
                        </div>
                        {prop.detailAddress && (
                          <div className="text-[11px] text-[#9c9682] truncate max-w-[180px]">
                            {prop.detailAddress}
                          </div>
                        )}
                      </td>

                      {/* 4. 가격 */}
                      <td className="py-3 px-4 font-bold text-[#415939] whitespace-nowrap">
                        {prop.price}
                      </td>

                      {/* 5. 면적 */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-xs text-[#4a4636]">
                        <div>
                          <strong>{prop.exclusiveArea}㎡</strong>
                          <span className="text-[11px] text-[#9c9682] ml-1">
                            ({(prop.exclusiveArea / 3.305785).toFixed(1)}평)
                          </span>
                        </div>
                        {prop.supplyArea && (
                          <div className="text-[11px] text-[#9c9682]">
                            공급 {prop.supplyArea}㎡
                          </div>
                        )}
                      </td>

                      {/* 6. 주요 조건 */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {prop.features && prop.features.length > 0 ? (
                            prop.features.slice(0, 3).map((feat, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-[#edf2e8] text-[#415939] border border-[#d0dec6] rounded text-[11px] font-medium"
                              >
                                {feat}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#9c9682] text-xs">기본 사양</span>
                          )}
                          {prop.features && prop.features.length > 3 && (
                            <span className="text-[11px] text-[#9c9682] font-medium">
                              +{prop.features.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. 등록일 */}
                      <td className="py-3 px-3 text-[#7c7764] whitespace-nowrap font-mono text-xs">
                        {prop.registrationDate}
                      </td>

                      {/* 8. 매물 상태 */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.bg}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>

                      {/* 9. 업무 액션 */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5">
                          {/* 매물 추천 고객 매칭 */}
                          <button
                            onClick={() => startComparisonWithProperty(prop.id)}
                            className="p-1.5 text-[#7c7764] hover:text-[#fdfbf7] hover:bg-[#3d3929] rounded-lg transition-colors cursor-pointer"
                            title="이 매물에 맞는 고객 매칭 비교"
                          >
                            <GitCompare className="w-4 h-4" />
                          </button>

                          {/* 상세 조회 */}
                          <button
                            onClick={() => onViewPropertyDetail(prop)}
                            className="p-1.5 text-[#7c7764] hover:text-[#363326] hover:bg-[#f0ece1] rounded-lg transition-colors cursor-pointer"
                            title="매물 상세 내역 보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 수정 */}
                          <button
                            onClick={() => onEditProperty(prop)}
                            className="p-1.5 text-[#7c7764] hover:text-[#363326] hover:bg-[#f0ece1] rounded-lg transition-colors cursor-pointer"
                            title="매물 정보 수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* 삭제 */}
                          <button
                            onClick={() => handleDelete(prop)}
                            className="p-1.5 text-[#9c9682] hover:text-[#945634] hover:bg-[#faefe8] rounded-lg transition-colors cursor-pointer"
                            title="매물 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
