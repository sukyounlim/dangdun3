import { CustomerConsultation, Property, MatchEvaluation, ComparisonCriterion, MatchItemStatus } from '../types';
import { formatArea, formatKoreanMoney } from './formatters';

export function evaluateCustomerPropertyMatch(
  customer: CustomerConsultation,
  property: Property
): MatchEvaluation {
  const criteria: ComparisonCriterion[] = [];
  const matchedItems: string[] = [];
  const partialItems: string[] = [];
  const unmatchedItems: string[] = [];

  let totalScore = 0;

  // 1. 매물 종류 (가중치 20점)
  const propTypeMatch = customer.propertyType === property.propertyType;
  if (propTypeMatch) {
    totalScore += 20;
    matchedItems.push(`매물 종류 일치 (${property.propertyType})`);
    criteria.push({
      label: '매물 종류',
      customerRequirement: customer.propertyType,
      propertyValue: property.propertyType,
      status: 'match',
      details: '고객 희망 종목과 정확히 일치합니다.',
    });
  } else {
    unmatchedItems.push(`매물 종류 상이 (희망: ${customer.propertyType} / 매물: ${property.propertyType})`);
    criteria.push({
      label: '매물 종류',
      customerRequirement: customer.propertyType,
      propertyValue: property.propertyType,
      status: 'mismatch',
      details: `희망 형태(${customer.propertyType})와 다른 종류(${property.propertyType})입니다.`,
    });
  }

  // 2. 거래 유형 (가중치 20점)
  const transTypeMatch = customer.transactionType === property.transactionType;
  if (transTypeMatch) {
    totalScore += 20;
    matchedItems.push(`거래 유형 일치 (${property.transactionType})`);
    criteria.push({
      label: '거래 유형',
      customerRequirement: customer.transactionType,
      propertyValue: property.transactionType,
      status: 'match',
      details: `${property.transactionType} 조건이 일치합니다.`,
    });
  } else {
    unmatchedItems.push(`거래 유형 불일치 (희망: ${customer.transactionType} / 매물: ${property.transactionType})`);
    criteria.push({
      label: '거래 유형',
      customerRequirement: customer.transactionType,
      propertyValue: property.transactionType,
      status: 'mismatch',
      details: `고객은 ${customer.transactionType}을 원하나, 매물은 ${property.transactionType}입니다.`,
    });
  }

  // 3. 지역/위치 (가중치 20점)
  const targetAreaClean = (customer.targetArea || '').replace(/\s+/g, ' ').trim();
  const addressClean = (property.address || '').trim();
  const targetKeywords = targetAreaClean
    .split(/[\s,/]+/)
    .filter((k) => k.length >= 2 && !['희망', '인근', '역세권', '도보', '이내', '부근'].includes(k));

  let regionStatus: MatchItemStatus = 'mismatch';
  let regionDetails = '희망 지역과 주소가 일치하지 않습니다.';
  let matchedKeyword = '';

  if (targetKeywords.length > 0) {
    for (const kw of targetKeywords) {
      if (addressClean.includes(kw)) {
        regionStatus = 'match';
        matchedKeyword = kw;
        break;
      }
    }
  }

  if (regionStatus === 'match') {
    totalScore += 20;
    matchedItems.push(`희망 지역 부합 ('${matchedKeyword}' 소재)`);
    regionDetails = `고객 희망 지역('${matchedKeyword}')에 위치합니다.`;
  } else {
    // 부분 일치 체크: 시/도 단위 일치 여부
    const customerCity = targetAreaClean.slice(0, 4);
    if (customerCity && addressClean.includes(customerCity)) {
      regionStatus = 'partial';
      totalScore += 10;
      partialItems.push(`인접 권역 위치 (${property.address.slice(0, 15)}...)`);
      regionDetails = `동일 광역권역(${customerCity})이나 세부 동 단위 확인이 필요합니다.`;
    } else {
      unmatchedItems.push(`지역 불일치 (희망: ${customer.targetArea} / 매물: ${property.address})`);
    }
  }

  criteria.push({
    label: '지역 / 위치',
    customerRequirement: customer.targetArea,
    propertyValue: `${property.address} ${property.detailAddress || ''}`,
    status: regionStatus,
    details: regionDetails,
  });

  // 4. 가격 / 예산 (가중치 20점)
  let priceStatus: MatchItemStatus = 'mismatch';
  let priceDetails = '';

  if (customer.transactionType === '월세' && property.transactionType === '월세') {
    const depositOk = !customer.maxPriceNum || property.priceNum <= customer.maxPriceNum;
    const rentOk = !customer.monthlyRentNum || (property.monthlyRentNum || 0) <= customer.monthlyRentNum;

    if (depositOk && rentOk) {
      priceStatus = 'match';
      totalScore += 20;
      matchedItems.push(`예산 조건 충족 (${property.price})`);
      priceDetails = '보증금 및 월세 모두 고객 희망 예산 내입니다.';
    } else if (depositOk || rentOk) {
      priceStatus = 'partial';
      totalScore += 10;
      partialItems.push(`가격 부분 부합 (${property.price})`);
      priceDetails = '보증금 또는 월세 중 한 항목의 조율이 필요합니다.';
    } else {
      priceStatus = 'mismatch';
      unmatchedItems.push(`예산 초과 (희망: ${customer.budget} / 매물: ${property.price})`);
      priceDetails = '보증금과 월세 모두 고객 예산을 초과합니다.';
    }
  } else {
    const maxBudget = customer.maxPriceNum || customer.minPriceNum || 0;
    const propPrice = property.priceNum;

    if (maxBudget > 0) {
      if (propPrice <= maxBudget) {
        priceStatus = 'match';
        totalScore += 20;
        const diff = maxBudget - propPrice;
        matchedItems.push(`예산 내 적합 (${formatKoreanMoney(propPrice)}${diff > 0 ? `, ${formatKoreanMoney(diff)} 여유` : ''})`);
        priceDetails = diff > 0
          ? `고객 상한 예산 대비 ${formatKoreanMoney(diff)} 절감 가능한 가격대입니다.`
          : '고객 희망 예산에 정확히 부합합니다.';
      } else if (propPrice <= maxBudget * 1.1) {
        priceStatus = 'partial';
        totalScore += 10;
        const diff = propPrice - maxBudget;
        partialItems.push(`예산 약간 초과 (+${formatKoreanMoney(diff)}, 가격 협의 가능)`);
        priceDetails = `예산 상한보다 약 ${formatKoreanMoney(diff)} 높으나 가격 조정 협의가 유망합니다.`;
      } else {
        priceStatus = 'mismatch';
        const diff = propPrice - maxBudget;
        unmatchedItems.push(`예산 초과 (+${formatKoreanMoney(diff)})`);
        priceDetails = `고객 예산 대비 ${formatKoreanMoney(diff)} 초과하여 자금 계획 확인이 필요합니다.`;
      }
    } else {
      // 예산 숫자가 없는 경우
      priceStatus = 'match';
      totalScore += 15;
      matchedItems.push(`가격대: ${property.price}`);
      priceDetails = `매물 가격: ${property.price}`;
    }
  }

  criteria.push({
    label: '가격 / 예산',
    customerRequirement: customer.budget,
    propertyValue: property.price,
    status: priceStatus,
    details: priceDetails,
  });

  // 5. 면적 조건 (가중치 10점)
  let areaStatus: MatchItemStatus = 'match';
  let areaDetails = `전용 ${formatArea(property.exclusiveArea)}`;

  if (customer.minAreaM2 && customer.minAreaM2 > 0) {
    if (property.exclusiveArea >= customer.minAreaM2) {
      totalScore += 10;
      matchedItems.push(`면적 충족 (전용 ${property.exclusiveArea}㎡)`);
      areaDetails = `희망 면적(${customer.minAreaM2}㎡ 이상)을 만족합니다 (전용 ${property.exclusiveArea}㎡).`;
      areaStatus = 'match';
    } else if (property.exclusiveArea >= customer.minAreaM2 * 0.85) {
      totalScore += 5;
      partialItems.push(`면적 약간 부족 (전용 ${property.exclusiveArea}㎡)`);
      areaDetails = `희망(${customer.minAreaM2}㎡)보다 다소 작으나 실구조가 양호합니다.`;
      areaStatus = 'partial';
    } else {
      unmatchedItems.push(`면적 미달 (희망: ${customer.preferredArea || `${customer.minAreaM2}㎡ 이상`} / 실제: ${property.exclusiveArea}㎡)`);
      areaDetails = `희망 면적에 미달합니다.`;
      areaStatus = 'mismatch';
    }
  } else {
    totalScore += 10;
    matchedItems.push(`전용 ${property.exclusiveArea}㎡`);
  }

  criteria.push({
    label: '면적 조건',
    customerRequirement: customer.preferredArea || '면적 무관 / 별도 지정 없음',
    propertyValue: `전용 ${property.exclusiveArea}㎡ (공급 ${property.supplyArea || '-'}㎡)`,
    status: areaStatus,
    details: areaDetails,
  });

  // 6. 주요 조건 및 특징 대조 (가중치 10점)
  const reqs = customer.requirements || [];
  const feats = property.features || [];

  const matchedFeatList: string[] = [];
  const missingFeatList: string[] = [];

  reqs.forEach((req) => {
    const isPresent = feats.some(
      (f) => f.includes(req) || req.includes(f) || (req === '역세권' && f.includes('역')) || (req === '주차' && f.includes('주차'))
    );
    if (isPresent) {
      matchedFeatList.push(req);
    } else {
      missingFeatList.push(req);
    }
  });

  let featStatus: MatchItemStatus = 'match';
  let featDetails = '';

  if (reqs.length === 0) {
    totalScore += 10;
    featStatus = 'match';
    featDetails = `매물 특징: ${feats.join(', ') || '기본 시설 완비'}`;
  } else {
    const matchRatio = matchedFeatList.length / reqs.length;
    if (matchRatio >= 0.75) {
      totalScore += 10;
      featStatus = 'match';
      matchedItems.push(`선호 옵션 다수 충족 (${matchedFeatList.join(', ')})`);
      featDetails = `고객 요구 조건 [${matchedFeatList.join(', ')}] 모두 충족`;
    } else if (matchRatio > 0) {
      totalScore += 5;
      featStatus = 'partial';
      partialItems.push(`조건 부분 충족 (${matchedFeatList.join(', ')} 일치 / ${missingFeatList.join(', ')} 미확인)`);
      featDetails = `일치: [${matchedFeatList.join(', ')}], 미포함: [${missingFeatList.join(', ')}]`;
    } else {
      featStatus = 'mismatch';
      unmatchedItems.push(`선호 조건 불일치 (${missingFeatList.join(', ')})`);
      featDetails = `고객 희망 조건 [${reqs.join(', ')}] 미반영`;
    }
  }

  criteria.push({
    label: '선호 조건 / 특징',
    customerRequirement: reqs.length > 0 ? reqs.join(', ') : '기본 조건',
    propertyValue: feats.length > 0 ? feats.join(', ') : '기본 사양',
    status: featStatus,
    details: featDetails,
  });

  // 점수 캡
  totalScore = Math.min(100, Math.max(0, totalScore));

  let level: MatchEvaluation['level'] = '조건불일치';
  let summaryMessage = '';

  if (totalScore >= 85) {
    level = '최적추천';
    summaryMessage = '핵심 조건(종류, 거래형태, 지역, 예산)이 매우 우수하게 일치하여 적극 추천하는 매물입니다.';
  } else if (totalScore >= 70) {
    level = '적합매물';
    summaryMessage = '대부분의 주요 조건이 부합하며, 일부 사소한 조건만 조율하면 계약 성사 가능성이 높습니다.';
  } else if (totalScore >= 50) {
    level = '조건조율필요';
    summaryMessage = '가격 또는 세부 조건의 조율이 필요하나, 대안 매물로 제안해볼 수 있습니다.';
  } else {
    level = '조건불일치';
    summaryMessage = '지역, 거래유형 또는 가격 등 주요 조건의 차이가 커서 우선 추천 대상이 아닙니다.';
  }

  const matchedCount = criteria.filter((c) => c.status === 'match').length;
  const partialCount = criteria.filter((c) => c.status === 'partial').length;
  const mismatchCount = criteria.filter((c) => c.status === 'mismatch').length;

  return {
    property,
    customer,
    score: totalScore,
    level,
    criteria,
    matchedCount,
    partialCount,
    mismatchCount,
    matchedItems,
    partialItems,
    unmatchedItems,
    summaryMessage,
  };
}
