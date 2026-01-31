'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import { fetchSummonerByRiotId, fetchMatchIdsByPuuid, fetchMatchById } from '@/shared/lib'
import { MatchListItem, ProfileHeader } from '@/shared/ui'
import type { MatchSummary } from '@/shared/types/analysis'

function MatchesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const gameName = searchParams.get('gameName')
  const tagLine = searchParams.get('tagLine')

  // 1단계: 소환사 정보 조회
  const summonerQuery = useQuery({
    queryKey: ['tft', 'summoner', gameName, tagLine],
    queryFn: () => fetchSummonerByRiotId(gameName!, tagLine!),
    enabled: !!gameName && !!tagLine,
    staleTime: 5 * 60 * 1000,
  })

  // 2단계: 매치 ID 목록 조회
  const matchIdsQuery = useQuery({
    queryKey: ['tft', 'matches', summonerQuery.data?.puuid, 10],
    queryFn: () => fetchMatchIdsByPuuid(summonerQuery.data!.puuid, 10),
    enabled: !!summonerQuery.data?.puuid,
    staleTime: 60 * 1000,
  })

  // 3단계: 각 매치를 개별적으로 쿼리 (TanStack Query 캐싱 활용)
  const matchQueries = useQueries({
    queries: (matchIdsQuery.data || []).map((matchId, index) => ({
      queryKey: ['tft', 'match', matchId],
      queryFn: async () => {
        // Rate Limit 회피를 위한 딜레이 (첫 번째 제외)
        if (index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 150))
        }
        return fetchMatchById(matchId)
      },
      staleTime: 10 * 60 * 1000, // 10분 캐싱
      gcTime: 30 * 60 * 1000, // 30분 가비지 컬렉션
      enabled: !!matchIdsQuery.data,
    })),
  })

  // 매치 요약 정보 생성
  const matches: MatchSummary[] = matchQueries
    .filter((query) => query.data)
    .map((query) => {
      const matchData = query.data!
      const participant = matchData.info.participants.find(
        (p) => p.puuid === summonerQuery.data?.puuid
      )

      if (!participant) return null

      return {
        matchId: matchData.metadata.match_id,
        placement: participant.placement,
        gameDateTime: matchData.info.game_datetime,
        gameLength: matchData.info.game_length,
        tftSet: matchData.info.tft_set_number,
        level: participant.level,
        totalDamage: participant.total_damage_to_players,
      }
    })
    .filter((match): match is MatchSummary => match !== null)

  if (!gameName || !tagLine) {
    router.push('/')
    return null
  }

  const isLoading = 
    summonerQuery.isLoading || 
    matchIdsQuery.isLoading || 
    (matchIdsQuery.data && matchQueries.some((q) => q.isLoading))
  
  const error = summonerQuery.error || matchIdsQuery.error

  const loadedCount = matchQueries.filter((q) => q.data).length
  const totalCount = matchIdsQuery.data?.length || 0

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push('/')}
          className="text-blue-400 hover:text-blue-300 mb-4"
        >
          ← 돌아가기
        </button>

        {/* 프로필 헤더 */}
        {summonerQuery.data && (
          <ProfileHeader
            puuid={summonerQuery.data.puuid}
            gameName={gameName}
            tagLine={tagLine}
            onRefresh={() => {
              summonerQuery.refetch()
              matchIdsQuery.refetch()
              // 모든 매치 쿼리 무효화하여 재로딩
              matchIdsQuery.data?.forEach((matchId) => {
                queryClient.invalidateQueries({ queryKey: ['tft', 'match', matchId] })
              })
            }}
            isRefreshing={summonerQuery.isFetching || matchIdsQuery.isFetching}
          />
        )}

        {/* 매치 목록 헤더 */}
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">매치 히스토리</h2>
        </div>

        {isLoading && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300 mb-2">매치 정보를 불러오는 중...</p>
            {totalCount > 0 && (
              <p className="text-sm text-gray-400">
                {loadedCount} / {totalCount} 로딩 완료
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
            <p className="text-red-200">
              {error instanceof Error ? error.message : '매치 정보를 불러오는데 실패했습니다.'}
            </p>
          </div>
        )}

        {!isLoading && matches.length === 0 && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-400">매치 기록이 없습니다.</p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchListItem
                key={match.matchId}
                match={match}
                puuid={summonerQuery.data!.puuid}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function MatchesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen p-4 sm:p-8 bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">로딩 중...</p>
            </div>
          </div>
        </main>
      }
    >
      <MatchesContent />
    </Suspense>
  )
}
