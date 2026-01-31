import type { RiotMatchData, SummonerData } from '@/shared/types/analysis'

/**
 * 클라이언트에서 서버 API 호출
 * (서버에서 Riot API 캐싱 처리)
 */

export async function fetchSummonerByRiotId(
  gameName: string,
  tagLine: string
): Promise<{ puuid: string; gameName: string; tagLine: string }> {
  const response = await fetch(`/api/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch summoner')
  }
  
  return response.json()
}

export async function fetchSummonerByPuuid(puuid: string): Promise<SummonerData> {
  const response = await fetch(`/api/summoner-by-puuid/${puuid}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch summoner data')
  }
  
  return response.json()
}

export async function fetchMatchIdsByPuuid(
  puuid: string,
  count: number = 10
): Promise<string[]> {
  const response = await fetch(`/api/matches/by-puuid/${puuid}?count=${count}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch match IDs')
  }
  
  return response.json()
}

export async function fetchMatchById(matchId: string): Promise<RiotMatchData> {
  const response = await fetch(`/api/matches/${matchId}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch match')
  }
  
  return response.json()
}

export async function fetchDdragonVersion(): Promise<{ version: string }> {
  const response = await fetch('/api/ddragon/version')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch DDragon version')
  }

  return response.json()
}
