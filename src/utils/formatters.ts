import { ConsultationStatus, PropertyStatus } from '../types';

/**
 * 만원 단위 숫자를 'X억 Y만원' 형태로 변환
 * @param amountInManWon 단위: 만원 (예: 165000 -> 16억 5,000만원)
 */
export function formatKoreanMoney(amountInManWon?: number): string {
  if (amountInManWon === undefined || amountInManWon === null || isNaN(amountInManWon)) {
    return '-';
  }
  if (amountInManWon === 0) return '0원';

  const uk = Math.floor(amountInManWon / 10000);
  const man = Math.floor(amountInManWon % 10000);

  let result = '';
  if (uk > 0) {
    result += `${uk.toLocaleString()}억`;
  }
  if (man > 0) {
    if (uk > 0) result += ' ';
    result += `${man.toLocaleString()}만원`;
  } else if (uk > 0) {
    result += '원';
  }

  return result || '0원';
}

/**
 * 거래 형태와 금액을 깔끔하게 단일 텍스트로 표기
 */
export function formatDisplayPrice(
  transactionType: '매매' | '전세' | '월세',
  priceNum: number,
  monthlyRentNum?: number
): string {
  if (transactionType === '월세') {
    const depositStr = formatKoreanMoney(priceNum);
    const rentStr = monthlyRentNum ? `${monthlyRentNum.toLocaleString()}만원` : '0원';
    return `보증금 ${depositStr} / 월 ${rentStr}`;
  }
  return `${transactionType} ${formatKoreanMoney(priceNum)}`;
}

/**
 * ㎡ 면적을 평수로 변환하여 텍스트 반환 (예: "84.9㎡ (약 25.7평)")
 */
export function formatArea(m2?: number): string {
  if (!m2 || isNaN(m2)) return '-';
  const pyeong = (m2 / 3.305785).toFixed(1);
  return `${m2.toFixed(1)}㎡ (약 ${pyeong}평)`;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 보정
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * 전화번호 하이픈 포맷팅 (01012345678 -> 010-1234-5678)
 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

/**
 * 상담 상태별 배지 스타일 및 안내
 */
export const CONSULTATION_STATUS_MAP: Record<
  ConsultationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  신규상담: {
    label: '신규상담',
    bg: 'bg-[#edf0e6] text-[#555d40] border-[#d8decb]',
    text: 'text-[#555d40]',
    border: 'border-[#d8decb]',
  },
  매물탐색중: {
    label: '매물탐색중',
    bg: 'bg-[#f7f2e7] text-[#7a6439] border-[#e7dcbf]',
    text: 'text-[#7a6439]',
    border: 'border-[#e7dcbf]',
  },
  현장방문예정: {
    label: '현장방문예정',
    bg: 'bg-[#ebf1f3] text-[#3d5a64] border-[#d2dfe3]',
    text: 'text-[#3d5a64]',
    border: 'border-[#d2dfe3]',
  },
  가계약진행: {
    label: '가계약진행',
    bg: 'bg-[#faefe8] text-[#945634] border-[#f0dacd]',
    text: 'text-[#945634]',
    border: 'border-[#f0dacd]',
  },
  계약완료: {
    label: '계약완료',
    bg: 'bg-[#edf2e8] text-[#415939] border-[#d0dec6]',
    text: 'text-[#415939]',
    border: 'border-[#d0dec6]',
  },
  '보류/종료': {
    label: '보류/종료',
    bg: 'bg-[#f0ece5] text-[#787265] border-[#dfd9cf]',
    text: 'text-[#787265]',
    border: 'border-[#dfd9cf]',
  },
};

/**
 * 매물 상태별 배지 스타일
 */
export const PROPERTY_STATUS_MAP: Record<
  PropertyStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  거래가능: {
    label: '거래가능',
    bg: 'bg-[#edf2e8] text-[#415939] border-[#d0dec6]',
    text: 'text-[#415939]',
    border: 'border-[#d0dec6]',
  },
  계약진행중: {
    label: '계약진행중',
    bg: 'bg-[#f7f2e7] text-[#7a6439] border-[#e7dcbf]',
    text: 'text-[#7a6439]',
    border: 'border-[#e7dcbf]',
  },
  거래완료: {
    label: '거래완료',
    bg: 'bg-[#f0ece5] text-[#787265] border-[#dfd9cf] line-through decoration-[#9c9682]',
    text: 'text-[#787265]',
    border: 'border-[#dfd9cf]',
  },
  보류: {
    label: '보류',
    bg: 'bg-[#faefe8] text-[#945634] border-[#f0dacd]',
    text: 'text-[#945634]',
    border: 'border-[#f0dacd]',
  },
};
