import type { 
  RiotMatchData, 
  NormalizedMatch, 
  NormalizedParticipant,
  NormalizedTrait,
  NormalizedUnit 
} from '@/shared/types/analysis'

/**
 * Riot API 응답을 정규화된 내부 구조로 변환
 * 
 * 규칙:
 * - 분석, 점수, 판단 로직 금지
 * - 순수하게 데이터 구조 변환만 수행
 */
export function normalizeMatch(rawData: RiotMatchData): NormalizedMatch {
  return {
    matchId: rawData.metadata.match_id,
    participants: rawData.info.participants.map(normalizeParticipant),
    gameLength: rawData.info.game_length,
    tftSet: rawData.info.tft_set_number,
  }
}

function normalizeParticipant(raw: RiotMatchData['info']['participants'][0]): NormalizedParticipant {
  return {
    puuid: raw.puuid,
    placement: raw.placement,
    level: raw.level,
    goldLeft: raw.gold_left,
    augments: raw.augments,
    traits: raw.traits.map(normalizeTrait),
    units: raw.units.map(normalizeUnit),
    totalDamage: raw.total_damage_to_players,
  }
}

function normalizeTrait(raw: RiotMatchData['info']['participants'][0]['traits'][0]): NormalizedTrait {
  return {
    name: raw.name,
    unitCount: raw.num_units,
    isActive: raw.style > 0,
    tier: raw.tier_current,
  }
}

function normalizeUnit(raw: RiotMatchData['info']['participants'][0]['units'][0]): NormalizedUnit {
  return {
    id: raw.character_id,
    name: raw.name,
    cost: raw.rarity,
    star: raw.tier,
    items: raw.itemNames,
  }
}
