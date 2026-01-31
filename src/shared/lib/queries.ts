import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
  fetchSummonerByRiotId,
  fetchSummonerByPuuid,
  fetchMatchIdsByPuuid,
  fetchMatchById,
  fetchDdragonVersion,
} from './api-client'

/**
 * TanStack Query hooks
 * 계층적 쿼리 키 구조 사용
 */

export function useSummoner(gameName: string, tagLine: string) {
  return useQuery({
    queryKey: ['tft', 'summoner', gameName, tagLine],
    queryFn: () => fetchSummonerByRiotId(gameName, tagLine),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export function useSummonerByPuuid(puuid: string) {
  return useQuery({
    queryKey: ['tft', 'summoner', 'by-puuid', puuid],
    queryFn: () => fetchSummonerByPuuid(puuid),
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!puuid,
  })
}

export function useMatchIds(puuid: string, count: number = 10) {
  return useQuery({
    queryKey: ['tft', 'matches', puuid, count],
    queryFn: () => fetchMatchIdsByPuuid(puuid, count),
    staleTime: 60 * 1000, // 1분
    enabled: !!puuid,
  })
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['tft', 'match', matchId],
    queryFn: () => fetchMatchById(matchId),
    staleTime: 10 * 60 * 1000, // 10분 (매치 데이터는 불변)
    enabled: !!matchId,
  })
}

export function useMatchSuspense(matchId: string) {
  return useSuspenseQuery({
    queryKey: ['tft', 'match', matchId],
    queryFn: () => fetchMatchById(matchId),
    staleTime: 10 * 60 * 1000,
  })
}

export function useDdragonVersion() {
  return useQuery({
    queryKey: ['ddragon', 'version'],
    queryFn: () => fetchDdragonVersion(),
    staleTime: 86400 * 1000, // 24시간
    gcTime: 86400 * 1000,
  })
}
