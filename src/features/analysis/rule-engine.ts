import type { 
  ExtractedFeatures, 
  AnalysisRule, 
  RuleCause 
} from '@/shared/types/analysis'

/**
 * MVP 분석 규칙 (15개)
 * 
 * 규칙 문서 v0 기준
 */
export const ANALYSIS_RULES: AnalysisRule[] = [
  // R01: 아이템 완성도
  {
    code: 'R01_LOW_ITEM_COMPLETION',
    category: 'ITEM',
    condition: (f) => f.completedItemCount <= 2,
    score: 3,
    evidence: (f) => ({ completedItemCount: f.completedItemCount }),
    messageTemplate: '완성 아이템이 {{completedItemCount}}개로 부족해 중반 전투력이 떨어졌습니다.',
    actionCode: 'FINISH_3_ITEMS_EARLY',
  },

  // R02: 캐리 부재
  {
    code: 'R02_NO_PRIMARY_CARRY',
    category: 'CARRY',
    condition: (f) => f.carryUnitCount === 0,
    score: 3,
    evidence: (f) => ({ carryUnitCount: f.carryUnitCount }),
    messageTemplate: '아이템이 집중된 캐리 유닛이 없어 딜/전투 주도권이 약했습니다.',
    actionCode: 'FOCUS_ITEMS_ON_ONE_CARRY',
  },

  // R03: 낮은 성급
  {
    code: 'R03_LOW_MAX_STAR',
    category: 'CARRY',
    condition: (f) => f.maxUnitStar <= 1,
    score: 2,
    evidence: (f) => ({ maxUnitStar: f.maxUnitStar }),
    messageTemplate: '유닛 성급(최대 {{maxUnitStar}}성)이 낮아 보드 파워가 부족했습니다.',
    actionCode: 'STABILIZE_WITH_2STAR',
  },

  // R04: 시너지 부족
  {
    code: 'R04_TOO_FEW_ACTIVE_TRAITS',
    category: 'SYNERGY',
    condition: (f) => f.activeTraitsCount <= 2,
    score: 2,
    evidence: (f) => ({ activeTraitsCount: f.activeTraitsCount }),
    messageTemplate: '활성화된 시너지가 {{activeTraitsCount}}개로 적어 조합 완성도가 낮았습니다.',
    actionCode: 'PRIORITIZE_CORE_TRAITS',
  },

  // R05: 시너지 티어 부족
  {
    code: 'R05_TRAIT_TIER_TOO_LOW',
    category: 'SYNERGY',
    condition: (f) => f.maxTraitTier <= 1,
    score: 2,
    evidence: (f) => ({ maxTraitTier: f.maxTraitTier }),
    messageTemplate: '핵심 시너지 단계가 낮아(최고 {{maxTraitTier}}단계) 성능을 충분히 못 냈습니다.',
    actionCode: 'PUSH_ONE_TRAIT_TIER',
  },

  // R06: 하위권에서 낮은 레벨
  {
    code: 'R06_LOW_FINAL_LEVEL_IN_LOSS',
    category: 'LEVEL',
    condition: (f) => f.placement >= 5 && f.level <= 7,
    score: 2,
    evidence: (f) => ({ placement: f.placement, level: f.level }),
    messageTemplate: '{{placement}}등인데 최종 레벨이 {{level}}로 낮아 후반 전환이 부족했습니다.',
    actionCode: 'LEVEL_UP_BEFORE_LATE_GAME',
  },

  // R07: 하위권에서 높은 잔여 골드
  {
    code: 'R07_HIGH_GOLD_LEFT_ON_ELIMINATION',
    category: 'ECON',
    condition: (f) => f.placement >= 5 && f.goldLeft >= 20,
    score: 2,
    evidence: (f) => ({ placement: f.placement, goldLeft: f.goldLeft }),
    messageTemplate: '탈락/하위권인데 골드를 {{goldLeft}} 남겨 전투력으로 전환하지 못했습니다.',
    actionCode: 'SPEND_TO_STABILIZE',
  },

  // R08: 낮은 피해량 (간단한 임계값)
  {
    code: 'R08_LOW_DAMAGE_OUTPUT',
    category: 'CARRY',
    condition: (f) => f.totalDamage < 5000 && f.placement >= 5,
    score: 2,
    evidence: (f) => ({ totalDamage: f.totalDamage }),
    messageTemplate: '플레이어 피해량이 낮아({{totalDamage}}) 교전 주도권이 약했습니다.',
    actionCode: 'IMPROVE_DAMAGE_SOURCE',
  },

  // R09: 탱커 아이템 부재
  {
    code: 'R09_NO_TANK_ITEMIZATION',
    category: 'ITEM',
    condition: (f) => f.tankItemCount === 0 && f.placement >= 5,
    score: 1,
    evidence: (f) => ({ tankItemCount: f.tankItemCount }),
    messageTemplate: '탱커 아이템이 없어 전열이 빨리 무너졌을 가능성이 큽니다.',
    actionCode: 'BUILD_ONE_TANK_ITEM',
  },

  // R10: 아이템 분산
  {
    code: 'R10_SPREAD_ITEMS_TOO_MUCH',
    category: 'ITEM',
    condition: (f) => f.completedItemCount >= 3 && f.maxItemsOnSingleUnit <= 1,
    score: 1,
    evidence: (f) => ({ completedItemCount: f.completedItemCount, maxItemsOnSingleUnit: f.maxItemsOnSingleUnit }),
    messageTemplate: '아이템이 여러 유닛에 분산되어 캐리 파워가 약해졌습니다.',
    actionCode: 'STACK_ITEMS_ON_CARRY',
  },

  // R11: 경제 증강 불일치
  {
    code: 'R11_AUGMENT_STRATEGY_MISMATCH_ECON',
    category: 'AUGMENT',
    condition: (f) => f.hasEconAugment && f.goldLeft === 0 && f.placement >= 5,
    score: 1,
    evidence: (f) => ({ hasEconAugment: f.hasEconAugment, goldLeft: f.goldLeft }),
    messageTemplate: '경제형 증강체를 선택했지만 자원 운영이 결과로 이어지지 못했습니다.',
    actionCode: 'CONVERT_ECON_TO_POWER',
  },

  // R12: 전투 증강 불일치
  {
    code: 'R12_AUGMENT_STRATEGY_MISMATCH_COMBAT',
    category: 'AUGMENT',
    condition: (f) => f.hasCombatAugment && f.totalDamage < 5000 && f.placement >= 5,
    score: 1,
    evidence: (f) => ({ hasCombatAugment: f.hasCombatAugment, totalDamage: f.totalDamage }),
    messageTemplate: '전투형 증강체를 선택했지만 실제 교전 성과가 낮았습니다.',
    actionCode: 'ALIGN_AUGMENT_WITH_BOARD',
  },

  // R13: 고레벨에서 고코스트 부재
  {
    code: 'R13_NO_FOUR_COST_PLUS_AT_HIGH_LEVEL',
    category: 'CARRY',
    condition: (f) => f.level >= 8 && f.fourCostPlusUnitCount === 0,
    score: 1,
    evidence: (f) => ({ level: f.level, fourCostPlusUnitCount: f.fourCostPlusUnitCount }),
    messageTemplate: '레벨 {{level}}인데 고코스트 핵심 유닛이 없어 후반 파워가 부족했습니다.',
    actionCode: 'ROLL_FOR_4CARRY',
  },

  // R14: 후반에 많은 1성 유닛
  {
    code: 'R14_TOO_MANY_ONE_STAR_UNITS_LATE',
    category: 'CARRY',
    condition: (f) => f.level >= 8 && f.oneStarUnitCount >= 4,
    score: 2,
    evidence: (f) => ({ level: f.level, oneStarUnitCount: f.oneStarUnitCount }),
    messageTemplate: '후반(레벨 {{level}})에도 1성 유닛이 {{oneStarUnitCount}}개로 많아 보드가 안정화되지 않았습니다.',
    actionCode: 'STABILIZE_BEFORE_GREED',
  },

  // R15: 낮은 조합 일관성
  {
    code: 'R15_LOW_TRAIT_COHERENCE',
    category: 'SYNERGY',
    condition: (f) => f.traitCoherenceScore <= 5 && f.activeTraitsCount >= 3,
    score: 1,
    evidence: (f) => ({ traitCoherenceScore: f.traitCoherenceScore, activeTraitsCount: f.activeTraitsCount }),
    messageTemplate: '보드가 한 방향으로 모이지 않아(조합 일관성 부족) 파워가 분산됐습니다.',
    actionCode: 'COMMIT_TO_ONE_PLAN',
  },
]

/**
 * 액션 메시지 템플릿
 */
export const ACTION_MESSAGES: Record<string, string> = {
  FINISH_3_ITEMS_EARLY: '4스테이지 진입 전까지 완성 아이템 3개를 목표로 하십시오.',
  FOCUS_ITEMS_ON_ONE_CARRY: '아이템을 한 캐리 유닛(아이템 3개)에 집중시키는 운영을 우선하십시오.',
  STABILIZE_WITH_2STAR: '중반에 2성 유닛을 먼저 확보해 보드 안정화를 우선하십시오.',
  PRIORITIZE_CORE_TRAITS: '특성을 여러 개 얕게 가져가기보다 핵심 특성 1~2개를 먼저 완성하십시오.',
  PUSH_ONE_TRAIT_TIER: '핵심 특성 단계를 2단계 이상으로 끌어올리는 것을 목표로 하십시오.',
  LEVEL_UP_BEFORE_LATE_GAME: '연패/피가 불안할 때는 레벨업 타이밍을 당겨 후반 전환을 준비하십시오.',
  SPEND_TO_STABILIZE: '하위권일수록 골드를 남기지 말고 리롤/레벨업으로 보드를 안정화하십시오.',
  IMPROVE_DAMAGE_SOURCE: '딜을 담당할 유닛 1명을 확정하고 아이템/시너지 방향을 맞추십시오.',
  BUILD_ONE_TANK_ITEM: '전열 탱커에게 최소 1개의 탱 아이템을 먼저 완성하십시오.',
  STACK_ITEMS_ON_CARRY: '완성 아이템을 분산하지 말고, 캐리 1명에게 몰아주십시오.',
  CONVERT_ECON_TO_POWER: '경제형 증강체는 레벨/리롤 타이밍으로 전투력 전환이 핵심입니다.',
  ALIGN_AUGMENT_WITH_BOARD: '증강체 효과가 실제 보드 방향과 맞는지 먼저 확인하고 선택하십시오.',
  ROLL_FOR_4CARRY: '레벨 8 이상에서는 4코 이상 캐리를 확보할 때까지 탐색을 우선하십시오.',
  STABILIZE_BEFORE_GREED: '욕심내기 전에 보드 안정화(2성/핵심 유닛)부터 확보하십시오.',
  COMMIT_TO_ONE_PLAN: '중반 이후에는 한 플랜으로 커밋하여 시너지/아이템을 일관되게 맞추십시오.',
}

/**
 * 규칙 적용 및 TOP3 + 액션 1개 반환
 */
export function applyRules(features: ExtractedFeatures): RuleCause[] {
  const causes: RuleCause[] = []

  for (const rule of ANALYSIS_RULES) {
    if (rule.condition(features)) {
      const evidence = rule.evidence(features)
      const message = interpolateTemplate(rule.messageTemplate, evidence)

      causes.push({
        code: rule.code,
        category: rule.category,
        score: rule.score,
        message,
        evidence,
        actionCode: rule.actionCode,
      })
    }
  }

  // 점수 높은 순으로 정렬
  causes.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    // 같은 점수면 코드 순
    return a.code.localeCompare(b.code)
  })

  // TOP3 반환 (다양성을 위해 같은 카테고리 제한 가능하지만 MVP는 단순화)
  return causes.slice(0, 3)
}

/**
 * 가장 높은 점수의 액션 1개 반환
 */
export function getTopAction(causes: RuleCause[]): { code: string; message: string } | null {
  if (causes.length === 0) return null
  
  const topCause = causes[0]
  const actionCode = topCause.actionCode
  
  if (!actionCode) return null
  
  return {
    code: actionCode,
    message: ACTION_MESSAGES[actionCode] || '개선 방향을 참고하세요.',
  }
}

/**
 * 템플릿 문자열에 증거 데이터를 삽입
 */
function interpolateTemplate(template: string, evidence: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return String(evidence[key] ?? '')
  })
}
