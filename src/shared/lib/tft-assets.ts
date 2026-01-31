/**
 * TFT 유닛 이미지 URL
 * - Primary: Community Dragon (TFT unit square/shop icon)
 * - Fallback: Data Dragon img/champion (LoL-origin units only)
 * - 모든 외부 URL은 /api/image 프록시를 통해 사용 (403/핫링크 회피)
 */

export const FALLBACK_DDRAGON_VERSION = '16.2.1'

const CDRAGON_BASE =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default'

/**
 * 외부 이미지 URL을 프록시 URL로 변환
 */
export function proxyImageUrl(rawUrl: string): string {
  return `/api/image?url=${encodeURIComponent(rawUrl)}`
}

/**
 * TFT character_id → CDragon 키 (소문자)
 * 예: TFT16_Kobuko → tft16_kobuko
 */
function toCdragonKey(characterId: string): string {
  return characterId.toLowerCase()
}

/**
 * character_id에서 Set 번호 추출 (미전달 시 사용)
 * 예: TFT16_Kobuko → 16
 */
function getSetFromCharacterId(characterId: string): number {
  const match = characterId.match(/^TFT(\d+)_/i)
  return match ? parseInt(match[1], 10) : 16
}

/**
 * Community Dragon TFT 유닛 스퀘어/샵 아이콘 URL (primary)
 * 실제 경로: assets/characters/{key}/hud/{key}_square.tft_set{N}.png
 */
function getCdragonUnitImageUrl(characterId: string, tftSet?: number): string {
  const key = toCdragonKey(characterId)
  const set = tftSet ?? getSetFromCharacterId(characterId)
  return `${CDRAGON_BASE}/assets/characters/${key}/hud/${key}_square.tft_set${set}.png`
}

/**
 * Data Dragon LoL 챔피언 이미지 URL (fallback only)
 */
const CHARACTER_ID_TO_DDRAGON: Record<string, string> = {
  TFT9_Khazix: 'Khazix',
  TFT10_Khazix: 'Khazix',
  TFT16_Khazix: 'Khazix',
  TFT9_KhaZix: 'Khazix',
  TFT10_KhaZix: 'Khazix',
  TFT16_KhaZix: 'Khazix',
  KhaZix: 'Khazix',
  Khazix: 'Khazix',
}

function toDdragonChampionId(characterId: string): string {
  const mapped = CHARACTER_ID_TO_DDRAGON[characterId]
  if (mapped) return mapped
  const withoutPrefix = characterId.replace(/^TFT\d+_/, '')
  return withoutPrefix || characterId
}

function getDdragonChampionImageUrl(characterId: string, version: string): string {
  const championId = toDdragonChampionId(characterId)
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`
}

/**
 * TFT 유닛 이미지 URL (프록시 경유)
 * - Primary: CDragon unit square icon (hud/{key}_square.tft_set{N}.png)
 * - 항상 /api/image?url=... 형태 반환
 */
export function getUnitImageUrl(characterId: string, tftSet?: number): string {
  const cdragonUrl = getCdragonUnitImageUrl(characterId, tftSet)
  return proxyImageUrl(cdragonUrl)
}

/**
 * LoL 챔피언 이미지 URL (fallback, 프록시 경유)
 * ChampionIcon에서 CDragon 404 시에만 사용
 */
export function getUnitImageUrlFallback(
  characterId: string,
  version: string = FALLBACK_DDRAGON_VERSION
): string {
  const ddragonUrl = getDdragonChampionImageUrl(characterId, version)
  return proxyImageUrl(ddragonUrl)
}
