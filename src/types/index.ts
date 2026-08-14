export type PropertyType =
  | '아파트'
  | '오피스텔'
  | '빌라·다세대'
  | '원룸·투룸'
  | '상가·사무실'
  | '토지·단독주택';

export type TransactionType = '매매' | '전세' | '월세';

export type ConsultationStatus =
  | '신규상담'
  | '매물탐색중'
  | '현장방문예정'
  | '가계약진행'
  | '계약완료'
  | '보류/종료';

export type PropertyStatus =
  | '거래가능'
  | '계약진행중'
  | '거래완료'
  | '보류';

export interface CustomerConsultation {
  id: string;
  name: string;
  phone: string;
  consultationDate: string; // YYYY-MM-DD
  propertyType: PropertyType;
  transactionType: TransactionType;
  targetArea: string; // 예: 서울시 강남구 대치동 / 역삼역 도보 10분 이내
  budget: string; // 표시용 예: "매매 15억 ~ 18억" or "전세 4억 5,000만원"
  minPriceNum?: number; // 단위: 만원 (검색/비교 계산용)
  maxPriceNum?: number; // 단위: 만원
  depositNum?: number; // 월세 보증금 (만원)
  monthlyRentNum?: number; // 월세액 (만원)
  preferredArea?: string; // 예: "전용 84㎡ (34평형) 내외"
  minAreaM2?: number; // 전용 ㎡
  requirements: string[]; // 원하는 조건 태그 (예: 남향, 지하주차장, 역세권, 초품아, 올수리, 즉시입주)
  memo: string; // 상담 상세 메모
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  name: string; // 매물명 (예: 래미안 대치팰리스 104동 12층)
  propertyType: PropertyType;
  transactionType: TransactionType;
  address: string; // 기본 주소 (예: 서울시 강남구 대치동 670)
  detailAddress?: string; // 상세 동/호수
  price: string; // 표시용 예: "16억 5,000만원", "보증금 5,000만 / 월 120만"
  priceNum: number; // 단위: 만원 (매매가/전세가 또는 월세보증금)
  monthlyRentNum?: number; // 월세액 (만원)
  exclusiveArea: number; // 전용면적 (㎡)
  supplyArea?: number; // 공급면적 (㎡)
  floor: number; // 해당 층
  totalFloors: number; // 총 층수
  rooms?: number;
  bathrooms?: number;
  maintenanceFee?: string; // 관리비 (예: 약 25만원)
  moveInDate?: string; // 입주가능일 (예: 2026-10-01 / 즉시입주)
  features: string[]; // 주요 조건 (예: 남향, 풀옵션, 올수리, 주차가능, 역세권, 엘리베이터, 로얄층)
  registrationDate: string; // YYYY-MM-DD
  status: PropertyStatus;
  memo: string; // 매물 상세 메모
  createdAt: string;
  updatedAt: string;
}

export type MatchItemStatus = 'match' | 'partial' | 'mismatch';

export interface ComparisonCriterion {
  label: string; // 비교 항목명 (매물종류, 거래유형, 지역, 가격, 면적, 주요조건)
  customerRequirement: string;
  propertyValue: string;
  status: MatchItemStatus;
  details?: string;
}

export interface MatchEvaluation {
  property: Property;
  customer: CustomerConsultation;
  score: number; // 0 ~ 100
  level: '최적추천' | '적합매물' | '조건조율필요' | '조건불일치';
  criteria: ComparisonCriterion[];
  matchedCount: number;
  partialCount: number;
  mismatchCount: number;
  matchedItems: string[];
  partialItems: string[];
  unmatchedItems: string[];
  summaryMessage: string;
}

export type TabType = 'dashboard' | 'consultations' | 'properties' | 'comparison' | 'guide';
