import type { NormalizedParticipant, ExtractedFeatures } from '@/shared/types/analysis'

/**
 * 정규화된 데이터에서 분석에 필요한 특성 추출
 * 
 * MVP 규칙 문서 기준으로 확장
 */
export function extractFeatures(participant: NormalizedParticipant): ExtractedFeatures {
  return {
    // 아이템
    completedItemCount: calculateCompletedItems(participant),
    avgItemsPerUnit: calculateAvgItemsPerUnit(participant),
    hasCarryItems: checkHasCarryItems(participant),
    tankItemCount: countTankItems(participant),
    maxItemsOnSingleUnit: findMaxItemsOnSingleUnit(participant),
    
    // 캐리
    carryUnitCount: countCarryUnits(participant),
    maxUnitStar: findMaxUnitStar(participant),
    hasPremiumCarry: checkHasPremiumCarry(participant),
    oneStarUnitCount: countOneStarUnits(participant),
    fourCostPlusUnitCount: countFourCostPlusUnits(participant),
    
    // 시너지
    activeTraitsCount: countActiveTraits(participant),
    maxTraitTier: findMaxTraitTier(participant),
    hasGoldTrait: checkHasGoldTrait(participant),
    traitCoherenceScore: calculateTraitCoherence(participant),
    
    // 레벨
    level: participant.level,
    levelVsPlacement: calculateLevelVsPlacement(participant),
    
    // 경제
    goldLeft: participant.goldLeft,
    econEfficiency: calculateEconEfficiency(participant),
    
    // 증강
    augmentSynergyScore: calculateAugmentSynergyScore(participant),
    hasEconAugment: checkHasEconAugment(participant),
    hasCombatAugment: checkHasCombatAugment(participant),
    
    // 전투력
    totalDamage: participant.totalDamage,
    placement: participant.placement,
  }
}

// === 아이템 관련 ===

function calculateCompletedItems(participant: NormalizedParticipant): number {
  return participant.units.reduce((sum, unit) => sum + unit.items.length, 0)
}

function calculateAvgItemsPerUnit(participant: NormalizedParticipant): number {
  if (participant.units.length === 0) return 0
  return calculateCompletedItems(participant) / participant.units.length
}

function checkHasCarryItems(participant: NormalizedParticipant): boolean {
  const carryItemKeywords = ['IE', 'JG', 'GS', 'RB', 'GRB', 'Deathblade', 'Giant', 'Jeweled']
  return participant.units.some(unit => 
    unit.items.some(item => 
      carryItemKeywords.some(keyword => item.includes(keyword))
    )
  )
}

function countTankItems(participant: NormalizedParticipant): number {
  const tankItemKeywords = ['Bramble', 'Sunfire', 'Gargoyle', 'Dragon', 'Warmog']
  let count = 0
  for (const unit of participant.units) {
    for (const item of unit.items) {
      if (tankItemKeywords.some(keyword => item.includes(keyword))) {
        count++
      }
    }
  }
  return count
}

function findMaxItemsOnSingleUnit(participant: NormalizedParticipant): number {
  if (participant.units.length === 0) return 0
  return Math.max(...participant.units.map(unit => unit.items.length))
}

// === 캐리/유닛 관련 ===

function countCarryUnits(participant: NormalizedParticipant): number {
  return participant.units.filter(unit => unit.items.length >= 2).length
}

function findMaxUnitStar(participant: NormalizedParticipant): number {
  if (participant.units.length === 0) return 0
  return Math.max(...participant.units.map(unit => unit.star))
}

function checkHasPremiumCarry(participant: NormalizedParticipant): boolean {
  return participant.units.some(unit => unit.cost >= 4 && unit.star >= 2)
}

function countOneStarUnits(participant: NormalizedParticipant): number {
  return participant.units.filter(unit => unit.star === 1).length
}

function countFourCostPlusUnits(participant: NormalizedParticipant): number {
  return participant.units.filter(unit => unit.cost >= 4).length
}

// === 시너지 관련 ===

function countActiveTraits(participant: NormalizedParticipant): number {
  return participant.traits.filter(trait => trait.isActive).length
}

function findMaxTraitTier(participant: NormalizedParticipant): number {
  if (participant.traits.length === 0) return 0
  return Math.max(...participant.traits.map(trait => trait.tier))
}

function checkHasGoldTrait(participant: NormalizedParticipant): boolean {
  return participant.traits.some(trait => trait.tier >= 3)
}

function calculateTraitCoherence(participant: NormalizedParticipant): number {
  // 조합 일관성: 활성 특성에 기여하는 유닛 비율
  if (participant.units.length === 0) return 0
  
  const activeTraitNames = participant.traits
    .filter(trait => trait.isActive)
    .map(trait => trait.name)
  
  // 간단한 계산: 활성 특성이 많을수록 일관성 점수가 높다고 가정
  return activeTraitNames.length > 0 ? (activeTraitNames.length / Math.max(participant.units.length, 1)) * 10 : 0
}

// === 레벨 관련 ===

function calculateLevelVsPlacement(participant: NormalizedParticipant): number {
  const expectedLevel = 9 - participant.placement
  return participant.level - expectedLevel
}

// === 경제 관련 ===

function calculateEconEfficiency(participant: NormalizedParticipant): number {
  return participant.goldLeft / Math.max(participant.level, 1)
}

// === 증강 관련 ===

function calculateAugmentSynergyScore(participant: NormalizedParticipant): number {
  if (!participant.augments || participant.augments.length === 0) return 0
  return participant.augments.length * 10
}

function checkHasEconAugment(participant: NormalizedParticipant): boolean {
  if (!participant.augments) return false
  const econAugmentKeywords = ['Rich', 'Gold', 'Interest', 'Econ', 'Bank', 'Treasure']
  return participant.augments.some(augment =>
    econAugmentKeywords.some(keyword => augment.includes(keyword))
  )
}

function checkHasCombatAugment(participant: NormalizedParticipant): boolean {
  if (!participant.augments) return false
  const combatAugmentKeywords = ['Combat', 'Damage', 'Attack', 'Power', 'Crit', 'Strike']
  return participant.augments.some(augment =>
    combatAugmentKeywords.some(keyword => augment.includes(keyword))
  )
}
