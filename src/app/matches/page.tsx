'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import { fetchSummonerByRiotId, fetchMatchIdsByPuuid, fetchMatchById } from '@/shared/lib'
import { MatchListItem, ProfileHeader } from '@/shared/ui'
import type { MatchSummary } from '@/shared/types/analysis'

function MatchesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const gameName = searchParams.get('gameName')
  const tagLine = searchParams.get('tagLine')

  // 클라이언트 네비게이션 직후 searchParams가 한 틱 늦게 올 수 있으므로, 리다이렉트는 한 프레임 지연
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const g = searchParams.get('gameName')
      const t = searchParams.get('tagLine')
      if (!g && !t) {
        setShouldRedirect(true)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [searchParams])

  useEffect(() => {
    if (!shouldRedirect) return
    router.replace('/')
  }, [shouldRedirect, router])

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
        units: participant.units.map((u) => ({
          character_id: u.character_id,
          name: u.name,
          tier: u.tier,
        })),
      }
    })
    .filter((match): match is MatchSummary => match !== null)

  // 파라미터 없음: 한 프레임 후에도 없으면 리다이렉트(useEffect에서 처리). 그 전에는 로딩 표시
  if (!gameName || !tagLine) {
    if (shouldRedirect) {
      return (
        <main className="min-h-screen p-4 sm:p-8 bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </main>
      )
    }
    return (
      <main className="min-h-screen p-4 sm:p-8 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">로딩 중...</p>
        </div>
      </main>
    )
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
        {/* 뒤로가기 버튼 (터치 타겟 44px 이상) */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="min-h-[44px] min-w-[44px] py-2 px-3 -ml-2 text-blue-400 hover:text-blue-300 active:text-blue-200 mb-4 inline-flex items-center justify-center"
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
          <div className="space-y-3" aria-busy="true" aria-label="매치 목록 로딩 중">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-gray-600 animate-pulse"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-700 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-700 rounded w-2/3" />
                  </div>
                  <div className="flex gap-1 sm:gap-2 shrink-0">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-gray-700" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {totalCount > 0 && (
              <p className="text-sm text-gray-400 text-center py-2">
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
        <main className="min-h-screen p-4 sm:p-8 bg-gray-900" aria-busy="true">
          <div className="max-w-6xl mx-auto">
            <div className="min-h-[44px] mb-6 h-10 w-28 rounded bg-gray-800 animate-pulse" />
            <div className="h-20 sm:h-24 rounded-full bg-gray-800 animate-pulse w-20 sm:w-24 mb-6" />
            <div className="h-6 bg-gray-800 rounded w-48 mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse border-l-4 border-gray-700">
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-full bg-gray-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-1/3" />
                      <div className="h-3 bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      }
    >
      <MatchesContent />
    </Suspense>
  )
}
