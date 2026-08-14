import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { CustomerConsultation, ConsultationStatus, PropertyType, TransactionType } from '../../types';
import {
  Search,
  Filter,
  Plus,
  GitCompare,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { CONSULTATION_STATUS_MAP, formatPhone } from '../../utils/formatters';

interface ConsultationListProps {
  onOpenNewCustomerModal: () => void;
  onEditCustomer: (customer: CustomerConsultation) => void;
  onViewCustomerDetail: (customer: CustomerConsultation) => void;
}

export const ConsultationList: React.FC<ConsultationListProps> = ({
  onOpenNewCustomerModal,
  onEditCustomer,
  onViewCustomerDetail,
}) => {
  const { customers, deleteCustomer, startComparisonWithCustomer } = useRealEstate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [transFilter, setTransFilter] = useState<string>('all');

  const filteredCustomers = customers.filter((cust) => {
    // Search match
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = cust.name.toLowerCase().includes(q);
      const matchPhone = cust.phone.includes(q);
      const matchArea = cust.targetArea.toLowerCase().includes(q);
      const matchMemo = cust.memo.toLowerCase().includes(q);
      const matchBudget = cust.budget.toLowerCase().includes(q);
      const matchReqs = cust.requirements.some((r) => r.toLowerCase().includes(q));
      if (!matchName && !matchPhone && !matchArea && !matchMemo && !matchBudget && !matchReqs) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && cust.status !== statusFilter) {
      return false;
    }

    // Property Type filter
    if (typeFilter !== 'all' && cust.propertyType !== typeFilter) {
      return false;
    }

    // Transaction Type filter
    if (transFilter !== 'all' && cust.transactionType !== transFilter) {
      return false;
    }

    return true;
  });

  const handleDelete = (cust: CustomerConsultation) => {
    if (confirm(`'${cust.name}' 고객의 상담 정보를 정말 삭제하시겠습니까?`)) {
      deleteCustomer(cust.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#ffffff] p-5 rounded-xl border border-[#e8e4d9] shadow-[0_2px_8px_rgba(74,70,54,0.04)]">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#363326] flex items-center space-x-2">
            <span>고객 상담 관리</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#edf0e6] text-[#555d40] font-semibold border border-[#d8decb]">
              총 {customers.length}명
            </span>
          </h2>
          <p className="text-xs text-[#7c7764] mt-1">
            고객명, 연락처, 상담일, 희망 조건 및 상담 메모를 체계적으로 기록하고 관리합니다.
          </p>
        </div>

        <button
          onClick={onOpenNewCustomerModal}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#3d3929] hover:bg-[#2e2a1d] text-[#fdfbf7] rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#8c9474]" />
          <span>신규 상담 등록</span>
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
              placeholder="고객명, 연락처, 희망지역, 메모, 조건 키워드 검색..."
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
              <option value="all">전체 상담 상태</option>
              <option value="신규상담">신규상담</option>
              <option value="매물탐색중">매물탐색중</option>
              <option value="현장방문예정">현장방문예정</option>
              <option value="가계약진행">가계약진행</option>
              <option value="계약완료">계약완료</option>
              <option value="보류/종료">보류/종료</option>
            </select>

            {/* Property Type Filter */}
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

            {/* Transaction Type Filter */}
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

      {/* Customer Consultation Table - Explicit Guideline Compliant:
          고객명 / 연락처 / 상담일 / 희망 지역 / 희망 가격 / 매물 종류 / 원하는 조건 / 상담 상태 */}
      <div className="bg-[#ffffff] rounded-xl border border-[#e8e4d9] shadow-[0_2px_8px_rgba(74,70,54,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f7f4ed] border-b border-[#e8e4d9] text-[#7c7764] font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">고객명</th>
                <th className="py-3 px-3">연락처</th>
                <th className="py-3 px-3">상담일</th>
                <th className="py-3 px-4">희망 지역</th>
                <th className="py-3 px-4">희망 가격</th>
                <th className="py-3 px-3">매물 종류</th>
                <th className="py-3 px-4">원하는 조건</th>
                <th className="py-3 px-3">상담 상태</th>
                <th className="py-3 px-4 text-center">업무 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece1] text-xs sm:text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#9c9682] font-serif">
                    {searchTerm || statusFilter !== 'all'
                      ? '검색 또는 필터 조건에 일치하는 고객 상담 기록이 없습니다.'
                      : '등록된 고객 상담이 없습니다. 상단의 [신규 상담 등록] 버튼을 눌러보세요.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const statusStyle = CONSULTATION_STATUS_MAP[cust.status];
                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-[#fcfaf6] transition-colors group"
                    >
                      {/* 1. 고객명 */}
                      <td className="py-3 px-4 font-bold text-[#363326] whitespace-nowrap">
                        <button
                          onClick={() => onViewCustomerDetail(cust)}
                          className="hover:text-[#7a6439] hover:underline text-left font-bold cursor-pointer"
                        >
                          {cust.name}
                        </button>
                      </td>

                      {/* 2. 연락처 */}
                      <td className="py-3 px-3 font-mono text-[#7c7764] whitespace-nowrap">
                        {formatPhone(cust.phone)}
                      </td>

                      {/* 3. 상담일 */}
                      <td className="py-3 px-3 text-[#7c7764] whitespace-nowrap font-mono text-xs">
                        {cust.consultationDate}
                      </td>

                      {/* 4. 희망 지역 */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#4a4636] max-w-[180px] truncate" title={cust.targetArea}>
                          {cust.targetArea}
                        </div>
                      </td>

                      {/* 5. 희망 가격 */}
                      <td className="py-3 px-4 font-bold text-[#363326] whitespace-nowrap">
                        <span className="text-[#7a6439]">{cust.budget}</span>
                      </td>

                      {/* 6. 매물 종류 */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-[#f0ebe1] text-[#4a4636] rounded font-medium text-xs border border-[#ded9cb]">
                          {cust.propertyType}
                        </span>
                        <span className="ml-1 text-xs text-[#7c7764] font-medium">
                          ({cust.transactionType})
                        </span>
                      </td>

                      {/* 7. 원하는 조건 */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {cust.requirements && cust.requirements.length > 0 ? (
                            cust.requirements.slice(0, 3).map((req, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-[#f0ebe1] text-[#55503e] rounded text-[11px] font-medium border border-[#ded9cb]"
                              >
                                #{req}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#9c9682] text-xs">기본 조건</span>
                          )}
                          {cust.requirements && cust.requirements.length > 3 && (
                            <span className="text-[11px] text-[#9c9682] font-medium">
                              +{cust.requirements.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8. 상담 상태 */}
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
                          {/* 매물 매칭 비교 바로가기 */}
                          <button
                            onClick={() => startComparisonWithCustomer(cust.id)}
                            className="p-1.5 text-[#7c7764] hover:text-[#fdfbf7] hover:bg-[#3d3929] rounded-lg transition-colors cursor-pointer"
                            title="이 고객의 조건으로 매물 매칭 비교"
                          >
                            <GitCompare className="w-4 h-4" />
                          </button>

                          {/* 상세 조회 */}
                          <button
                            onClick={() => onViewCustomerDetail(cust)}
                            className="p-1.5 text-[#7c7764] hover:text-[#363326] hover:bg-[#f0ece1] rounded-lg transition-colors cursor-pointer"
                            title="상담 상세 내역 보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 수정 */}
                          <button
                            onClick={() => onEditCustomer(cust)}
                            className="p-1.5 text-[#7c7764] hover:text-[#363326] hover:bg-[#f0ece1] rounded-lg transition-colors cursor-pointer"
                            title="상담 정보 수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* 삭제 */}
                          <button
                            onClick={() => handleDelete(cust)}
                            className="p-1.5 text-[#9c9682] hover:text-[#945634] hover:bg-[#faefe8] rounded-lg transition-colors cursor-pointer"
                            title="상담 정보 삭제"
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
