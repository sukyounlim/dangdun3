import React, { useState, useEffect } from 'react';
import { Property, PropertyType, TransactionType, PropertyStatus } from '../../types';
import { X, Plus, Check, Home, Building } from 'lucide-react';
import { formatKoreanMoney } from '../../utils/formatters';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialProperty?: Property | null;
}

const COMMON_PROPERTY_FEATURES = [
  '역세권',
  '남향',
  '남동향',
  '초품아',
  '지하주차장',
  '올수리',
  '즉시입주',
  '풀옵션',
  '로얄층',
  '한강조망',
  '탄천조망',
  '엘리베이터',
  '반려동물가능',
  '시스템에어컨',
  '보안우수',
  '주차편리',
  '신축급',
];

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProperty,
}) => {
  const isEdit = !!initialProperty;

  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('아파트');
  const [transactionType, setTransactionType] = useState<TransactionType>('매매');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [price, setPrice] = useState('');
  const [priceNum, setPriceNum] = useState<number>(0);
  const [monthlyRentNum, setMonthlyRentNum] = useState<number | undefined>(undefined);
  const [exclusiveArea, setExclusiveArea] = useState<number>(84);
  const [supplyArea, setSupplyArea] = useState<number | undefined>(undefined);
  const [floor, setFloor] = useState<number>(10);
  const [totalFloors, setTotalFloors] = useState<number>(20);
  const [rooms, setRooms] = useState<number | undefined>(3);
  const [bathrooms, setBathrooms] = useState<number | undefined>(2);
  const [maintenanceFee, setMaintenanceFee] = useState('');
  const [moveInDate, setMoveInDate] = useState('즉시입주 가능');
  const [features, setFeatures] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [registrationDate, setRegistrationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<PropertyStatus>('거래가능');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (initialProperty) {
      setName(initialProperty.name);
      setPropertyType(initialProperty.propertyType);
      setTransactionType(initialProperty.transactionType);
      setAddress(initialProperty.address);
      setDetailAddress(initialProperty.detailAddress || '');
      setPrice(initialProperty.price);
      setPriceNum(initialProperty.priceNum);
      setMonthlyRentNum(initialProperty.monthlyRentNum);
      setExclusiveArea(initialProperty.exclusiveArea);
      setSupplyArea(initialProperty.supplyArea);
      setFloor(initialProperty.floor);
      setTotalFloors(initialProperty.totalFloors);
      setRooms(initialProperty.rooms);
      setBathrooms(initialProperty.bathrooms);
      setMaintenanceFee(initialProperty.maintenanceFee || '');
      setMoveInDate(initialProperty.moveInDate || '즉시입주 가능');
      setFeatures(initialProperty.features || []);
      setRegistrationDate(initialProperty.registrationDate || new Date().toISOString().slice(0, 10));
      setStatus(initialProperty.status);
      setMemo(initialProperty.memo || '');
    } else {
      setName('');
      setPropertyType('아파트');
      setTransactionType('매매');
      setAddress('');
      setDetailAddress('');
      setPrice('');
      setPriceNum(0);
      setMonthlyRentNum(undefined);
      setExclusiveArea(84);
      setSupplyArea(undefined);
      setFloor(10);
      setTotalFloors(20);
      setRooms(3);
      setBathrooms(2);
      setMaintenanceFee('');
      setMoveInDate('즉시입주 가능');
      setFeatures([]);
      setRegistrationDate(new Date().toISOString().slice(0, 10));
      setStatus('거래가능');
      setMemo('');
    }
  }, [initialProperty, isOpen]);

  if (!isOpen) return null;

  const toggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures(features.filter((f) => f !== feat));
    } else {
      setFeatures([...features, feat]);
    }
  };

  const handleAddCustomFeature = () => {
    if (newTagInput.trim() && !features.includes(newTagInput.trim())) {
      setFeatures([...features, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      alert('매물명과 주소는 필수 입력 항목입니다.');
      return;
    }

    const calculatedPriceStr =
      price.trim() ||
      (transactionType === '월세'
        ? `보증금 ${formatKoreanMoney(priceNum)} / 월 ${monthlyRentNum || 0}만원`
        : `${transactionType} ${formatKoreanMoney(priceNum)}`);

    onSave({
      name: name.trim(),
      propertyType,
      transactionType,
      address: address.trim(),
      detailAddress: detailAddress.trim(),
      price: calculatedPriceStr,
      priceNum: Number(priceNum) || 0,
      monthlyRentNum: monthlyRentNum ? Number(monthlyRentNum) : undefined,
      exclusiveArea: Number(exclusiveArea) || 0,
      supplyArea: supplyArea ? Number(supplyArea) : undefined,
      floor: Number(floor) || 1,
      totalFloors: Number(totalFloors) || 1,
      rooms: rooms ? Number(rooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      maintenanceFee: maintenanceFee.trim(),
      moveInDate: moveInDate.trim(),
      features,
      registrationDate,
      status,
      memo: memo.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3d3929]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-[#e8e4d9] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8e4d9] flex items-center justify-between bg-[#fcfaf6]">
          <div>
            <h3 className="text-base font-bold font-serif text-[#363326]">
              {isEdit ? '매물 정보 수정' : '신규 매물 등록'}
            </h3>
            <p className="text-xs text-[#7c7764] mt-0.5">
              중개 대상 매물의 상세 제원과 조건을 정확하게 입력합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9c9682] hover:text-[#363326] hover:bg-[#f0ece1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          {/* Row 1: 매물명, 종류, 거래유형 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
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
                매물 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-semibold"
              >
                <option value="거래가능">거래가능</option>
                <option value="계약진행중">계약진행중</option>
                <option value="거래완료">거래완료</option>
                <option value="보류">보류</option>
              </select>
            </div>
          </div>

          {/* Row 2: 매물명 */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4636] mb-1">
              매물명 (단지명/건물명) <span className="text-[#945634]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 래미안 대치팰리스 105동 로얄층"
              className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
            />
          </div>

          {/* Row 3: 주소 & 상세 주소 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                기본 주소 <span className="text-[#945634]">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="예: 서울시 강남구 대치동 670"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                상세 주소 (동/호수)
              </label>
              <input
                type="text"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="예: 105동 1402호"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              />
            </div>
          </div>

          {/* Row 4: 가격 입력 */}
          <div className="bg-[#fcfaf6] p-3.5 rounded-xl border border-[#e8e4d9] space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                  가격 표기 문구
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={
                    transactionType === '월세'
                      ? '예: 보증금 5,000만 / 월 120만'
                      : '예: 매매 18억 5,000만원'
                  }
                  className="w-full px-3 py-2 bg-[#ffffff] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                  {transactionType === '월세' ? '보증금 (만원 단위)' : '매매가 / 전세가 (만원 단위)'} <span className="text-[#945634]">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={priceNum || ''}
                  onChange={(e) => setPriceNum(Number(e.target.value))}
                  placeholder="예: 185000 (18억 5,000만원인 경우)"
                  className="w-full px-3 py-2 bg-[#ffffff] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono font-bold"
                />
                {priceNum > 0 && (
                  <span className="text-[11px] text-[#415939] font-semibold mt-0.5 block font-serif">
                    = {formatKoreanMoney(priceNum)}
                  </span>
                )}
              </div>
            </div>

            {transactionType === '월세' && (
              <div>
                <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                  월세 (만원 단위) <span className="text-[#945634]">*</span>
                </label>
                <input
                  type="number"
                  value={monthlyRentNum || ''}
                  onChange={(e) => setMonthlyRentNum(Number(e.target.value))}
                  placeholder="예: 120 (120만원)"
                  className="w-full px-3 py-2 bg-[#ffffff] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* Row 5: 면적, 층수, 방수 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                전용면적 (㎡) <span className="text-[#945634]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={exclusiveArea || ''}
                onChange={(e) => setExclusiveArea(Number(e.target.value))}
                placeholder="예: 84.9"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono"
              />
              {exclusiveArea > 0 && (
                <span className="text-[11px] text-[#7c7764] mt-0.5 block">
                  약 {(exclusiveArea / 3.305785).toFixed(1)}평
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                공급면적 (㎡)
              </label>
              <input
                type="number"
                step="0.01"
                value={supplyArea || ''}
                onChange={(e) => setSupplyArea(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="예: 114.2"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                해당층 / 총층수
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  placeholder="층"
                  className="w-1/2 px-2 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
                />
                <span className="text-[#9c9682]">/</span>
                <input
                  type="number"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(Number(e.target.value))}
                  placeholder="총층"
                  className="w-1/2 px-2 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                방 / 욕실수
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={rooms || ''}
                  onChange={(e) => setRooms(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="방"
                  className="w-1/2 px-2 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
                />
                <span className="text-[#9c9682]">/</span>
                <input
                  type="number"
                  value={bathrooms || ''}
                  onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="욕실"
                  className="w-1/2 px-2 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
                />
              </div>
            </div>
          </div>

          {/* Row 6: 관리비, 입주가능일, 등록일 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                관리비
              </label>
              <input
                type="text"
                value={maintenanceFee}
                onChange={(e) => setMaintenanceFee(e.target.value)}
                placeholder="예: 약 28만원 / 5만원"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                입주가능일
              </label>
              <input
                type="text"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                placeholder="예: 즉시입주 가능 / 2026-10-15"
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a4636] mb-1">
                등록일자
              </label>
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474] font-mono"
              />
            </div>
          </div>

          {/* Row 7: 주요 조건 태그 */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4636] mb-1.5">
              주요 조건 / 옵션 특징
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_PROPERTY_FEATURES.map((feat) => {
                const isSelected = features.includes(feat);
                return (
                  <button
                    type="button"
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-[#737c5d] text-white'
                        : 'bg-[#f0ebe1] text-[#4a4636] hover:bg-[#e4ded0] border border-[#ded9cb]'
                    }`}
                  >
                    <span>{feat}</span>
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
                    handleAddCustomFeature();
                  }
                }}
                placeholder="기타 특징 직접 입력 후 추가 (예: 펜트하우스, 광폭베란다)"
                className="flex-1 px-3 py-1.5 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-xs text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474]"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="px-3 py-1.5 bg-[#f0ebe1] hover:bg-[#e4ded0] text-[#363326] rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-[#ded9cb]"
              >
                + 추가
              </button>
            </div>
          </div>

          {/* Row 8: 매물 메모 */}
          <div>
            <label className="block text-xs font-semibold text-[#4a4636] mb-1">
              매물 상세 메모
            </label>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="집주인 연락처 성향, 공실 여부, 내부 수리 상태, 융자금 유무 등 중개 시 참고 메모를 작성하세요..."
              className="w-full px-3 py-2 bg-[#fcfaf6] border border-[#ded9cb] rounded-lg text-[#363326] placeholder-[#9c9682] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c9474] resize-none text-xs sm:text-sm"
            />
          </div>

          {/* Modal Footer */}
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
              {isEdit ? '수정 완료' : '매물 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
