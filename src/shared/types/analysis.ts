/**
 * 분석 규칙 카테고리
 */
export type RuleCategory = 
  | 'ITEM'      // 아이템 관련
  | 'CARRY'     // 캐리 유닛 관련
  | 'SYNERGY'   // 시너지/특성 관련
  | 'LEVEL'     // 레벨 관련
  | 'ECON'      // 경제 관련
  | 'AUGMENT'   // 증강 관련

/**
 * 분석 결과의 심각도/영향도 점수 (1-3)
 */
export type RuleScore = 1 | 2 | 3

/**
 * Riot API의 원시 매치 데이터 (최소한의 타입 정의)
 */
export interface RiotMatchData {
  metadata: {
    match_id: string
    participants: string[]
  }
  info: {
    game_datetime: number
    game_length: number
    queue_id: number
    tft_set_number: number
    participants: RiotParticipant[]
  }
}

export interface RiotParticipant {
  puuid: string
  placement: number
  level: number
  gold_left: number
  last_round: number
  players_eliminated: number
  time_eliminated: number
  total_damage_to_players: number
  augments: string[]
  traits: RiotTrait[]
  units: RiotUnit[]
}

export interface RiotTrait {
  name: string
  num_units: number
  style: number
  tier_current: number
  tier_total: number
}

export interface RiotUnit {
  character_id: string
  itemNames: string[]
  name: string
  rarity: number
  tier: number
}

/**
 * 정규화된 내부 매치 데이터 (Normalizer 출력)
 */
export interface NormalizedMatch {
  matchId: string
  participants: NormalizedParticipant[]
  gameLength: number
  tftSet: number
}

export interface NormalizedParticipant {
  puuid: string
  placement: number
  level: number
  goldLeft: number
  augments: string[]
  traits: NormalizedTrait[]
  units: NormalizedUnit[]
  totalDamage: number
}

export interface NormalizedTrait {
  name: string
  unitCount: number
  isActive: boolean
  tier: number
}

export interface NormalizedUnit {
  id: string
  name: string
  cost: number
  star: number
  items: string[]
}

/**
 * 추출된 분석 특성 (Feature Extractor 출력)
 */
export interface ExtractedFeatures {
  // 아이템
  completedItemCount: number
  avgItemsPerUnit: number
  hasCarryItems: boolean
  tankItemCount: number
  maxItemsOnSingleUnit: number
  
  // 캐리
  carryUnitCount: number
  maxUnitStar: number
  hasPremiumCarry: boolean
  oneStarUnitCount: number
  fourCostPlusUnitCount: number
  
  // 시너지
  activeTraitsCount: number
  maxTraitTier: number
  hasGoldTrait: boolean
  traitCoherenceScore: number
  
  // 레벨
  level: number
  levelVsPlacement: number
  
  // 경제
  goldLeft: number
  econEfficiency: number
  
  // 증강
  augmentSynergyScore: number
  hasEconAugment: boolean
  hasCombatAugment: boolean
  
  // 전투력
  totalDamage: number
  placement: number
}

/**
 * 분석 규칙 정의
 */
export interface AnalysisRule {
  code: string
  category: RuleCategory
  condition: (features: ExtractedFeatures) => boolean
  score: RuleScore
  evidence: (features: ExtractedFeatures) => Record<string, unknown>
  messageTemplate: string
  actionCode?: string
}

/**
 * 규칙 적용 결과 (Rule Engine 출력)
 */
export interface RuleCause {
  code: string
  category: RuleCategory
  score: RuleScore
  message: string
  evidence: Record<string, unknown>
  actionCode?: string
}

/**
 * 최종 분석 결과
 */
export interface AnalysisResult {
  matchId: string
  puuid: string
  placement: number
  causes: RuleCause[]
  analyzedAt: string
}

/**
 * 매치 요약 정보 (목록 표시용)
 */
/** 매치 목록 아이템에서 유닛 표시용 (최종 덱) */
export interface MatchSummaryUnit {
  character_id: string
  name: string
  tier: number
}

export interface MatchSummary {
  matchId: string
  placement: number
  gameDateTime: number
  gameLength: number
  tftSet: number
  level: number
  totalDamage: number
  /** 해당 플레이어 최종 덱 (매치 목록에서 op.gg 스타일 표시용) */
  units: MatchSummaryUnit[]
}

/**
 * 소환사 정보
 */
export interface SummonerData {
  id?: string // TFT API에서 반환되지 않을 수 있음
  puuid: string
  profileIconId: number
  summonerLevel: number
  revisionDate: number
}

/**
 * TFT 리그 정보
 */
export interface LeagueData {
  tier: string // IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER
  rank: string // I, II, III, IV (for DIAMOND and below)
  leaguePoints: number
  wins: number
  losses: number
  summonerId: string
  summonerName: string
}
