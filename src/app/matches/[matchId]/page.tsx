'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMatch } from '@/shared/lib'
import { normalizeMatch } from '@/features/analysis/normalizer'
import { analyzeMatch, getTopAction } from '@/features/analysis'
import { AnalysisCard, ChampionIcon, PlacementBadge } from '@/shared/ui'

interface MatchReportPageProps {
  params: {
    matchId: string
  }
}

// 동적 렌더링 강제 (쿼리 파라미터 의존)
export const dynamic = 'force-dynamic'

function MatchReportContent({ params }: MatchReportPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const puuid = searchParams.get('puuid')

  // TanStack Query로 매치 데이터 가져오기
  const matchQuery = useMatch(params.matchId)

  if (!puuid) {
    return (
      <main className="min-h-screen p-4 sm:p-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="min-h-[44px] min-w-[44px] py-2 px-3 -ml-2 text-blue-400 hover:text-blue-300 active:text-blue-200 mb-4 inline-flex items-center justify-center"
          >
            ← 돌아가기
          </button>
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
            <p className="text-red-200">유효하지 않은 요청입니다.</p>
          </div>
        </div>
      </main>
    )
  }

  if (matchQuery.isLoading) {
    return (
      <main className="min-h-screen p-4 sm:p-8 bg-gray-900" aria-busy="true" aria-label="매치 분석 로딩 중">
        <div className="max-w-4xl mx-auto">
          <div className="min-h-[44px] mb-6 h-10 w-32 rounded bg-gray-800 animate-pulse" />
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-2/3 mb-4" />
            <div className="h-4 bg-gray-700 rounded w-full mb-2" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
          </div>
          <div className="rounded-lg p-4 sm:p-6 mb-6 bg-gray-800 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-700 rounded w-full" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center p-2 rounded-lg bg-gray-800 animate-pulse">
                <div className="w-14 h-14 rounded-lg bg-gray-700" />
                <div className="mt-2 h-3 bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-700 bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (matchQuery.error) {
    return (
      <main className="min-h-screen p-4 sm:p-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="min-h-[44px] min-w-[44px] py-2 px-3 -ml-2 text-blue-400 hover:text-blue-300 active:text-blue-200 mb-4 inline-flex items-center justify-center"
          >
            ← 돌아가기
          </button>
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
            <p className="text-red-200">
              {matchQuery.error instanceof Error
                ? matchQuery.error.message
                : '매치 분석에 실패했습니다.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (!matchQuery.data) {
    return null
  }

  // 분석 수행 (클라이언트 사이드 계산)
  const normalized = normalizeMatch(matchQuery.data)
  const analysisResult = analyzeMatch(normalized, puuid)
  const topAction = getTopAction(analysisResult.causes)
  const isWin = analysisResult.placement <= 4
  const myParticipant = matchQuery.data.info.participants.find((p) => p.puuid === puuid)
  const myUnits = myParticipant?.units ?? []

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] py-2 px-3 -ml-2 text-blue-400 hover:text-blue-300 active:text-blue-200 mb-4 inline-flex items-center justify-center"
        >
          ← 돌아가기
        </button>

        {/* 헤더 */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">매치 분석 리포트</h1>
            <PlacementBadge placement={analysisResult.placement} />
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <p className="break-all">Match ID: {analysisResult.matchId}</p>
            <p>분석 시각: {new Date(analysisResult.analyzedAt).toLocaleString('ko-KR')}</p>
          </div>

          {matchQuery.isFetching && (
            <div className="mt-2 text-sm text-blue-400">
              🔄 백그라운드에서 업데이트 중...
            </div>
          )}
        </div>

        {/* 결과 요약 */}
        <div className={`rounded-lg p-4 sm:p-6 mb-6 ${isWin ? 'bg-green-900/30 border border-green-700' : 'bg-orange-900/30 border border-orange-700'}`}>
          <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isWin ? 'text-green-400' : 'text-orange-400'}`}>
            {isWin ? '🎉 승리 분석' : '📊 패배 원인 분석'}
          </h2>
          <p className={`text-sm sm:text-base ${isWin ? 'text-green-300' : 'text-orange-300'}`}>
            {analysisResult.causes.length > 0 
              ? `${analysisResult.causes.length}개의 주요 원인이 발견되었습니다.`
              : '분석 가능한 특이사항이 없습니다. 전반적으로 안정적인 플레이였습니다.'}
          </p>
        </div>

        {/* 최종 덱 (유닛 목록 + 이미지) */}
        {myUnits.length > 0 && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">최종 덱</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
              {myUnits.map((unit, index) => (
                <div
                  key={`${unit.character_id}-${index}`}
                  className="flex flex-col items-center p-2 rounded-lg bg-gray-700/50 border border-gray-600"
                >
                  <ChampionIcon
                    characterId={unit.character_id}
                    name={unit.name}
                    size={56}
                    star={unit.tier}
                    tftSet={matchQuery.data.info.tft_set_number}
                  />
                  <p className="mt-1 text-xs font-medium text-gray-200 truncate w-full text-center">
                    {unit.name}
                  </p>
                  {unit.itemNames.length > 0 && (
                    <p className="text-[10px] text-gray-500 truncate w-full text-center" title={unit.itemNames.join(', ')}>
                      아이템 {unit.itemNames.length}개
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOP3 원인 */}
        {analysisResult.causes.length > 0 && (
          <>
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">주요 원인 TOP 3</h3>
            </div>

            <div className="space-y-3 mb-6">
              {analysisResult.causes.map((cause, index) => (
                <div key={`${cause.code}_${index}`} className="relative">
                  <div className="absolute -left-2 sm:-left-3 top-3 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <AnalysisCard cause={cause} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* 다음 판 액션 */}
        {topAction && (
          <div className="bg-blue-900/30 border-2 border-blue-700 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>다음 판 개선 포인트</span>
            </h3>
            <div className="bg-gray-800 rounded p-4 border border-blue-800">
              <p className="text-blue-300 font-medium text-sm sm:text-base">{topAction.message}</p>
            </div>
          </div>
        )}

        {/* 분석 방법 설명 (모바일: 접기, 데스크톱: 펼침) */}
        <details className="bg-gray-800 border border-gray-700 rounded-lg group">
          <summary className="list-none cursor-pointer p-4 sm:p-6 min-h-[44px] flex items-center justify-between gap-2 select-none">
            <h3 className="font-semibold text-white text-sm sm:text-base">📋 분석 방법</h3>
            <span className="text-gray-500 text-xs after:content-['▼'] group-open:after:content-['▲']" aria-hidden />
          </summary>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0 border-t border-gray-700 md:border-t-0 md:pt-0">
            <ul className="text-xs sm:text-sm text-gray-400 space-y-2 mt-3 md:mt-0">
              <li>• 모든 분석은 <strong className="text-gray-300">규칙 기반(Heuristic)</strong>으로 수행됩니다</li>
              <li>• 영향도: <span className="text-red-600">●●●</span> 높음 / <span className="text-orange-500">●●</span> 중간 / <span className="text-yellow-500">●</span> 낮음</li>
              <li>• 각 결과는 구체적인 <strong className="text-gray-300">근거(Evidence)</strong>와 함께 제공됩니다</li>
              <li>• TOP 3 원인 + 개선 액션 1개를 제시합니다</li>
            </ul>
          </div>
        </details>
      </div>
    </main>
  )
}

export default function MatchReportPage({ params }: MatchReportPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen p-4 sm:p-8 bg-gray-900" aria-busy="true">
          <div className="max-w-4xl mx-auto">
            <div className="min-h-[44px] mb-6 h-10 w-32 rounded bg-gray-800 animate-pulse" />
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-2/3 mb-4" />
              <div className="h-4 bg-gray-700 rounded w-full" />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-lg p-2 bg-gray-800 animate-pulse">
                  <div className="w-full aspect-square rounded-lg bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </main>
      }
    >
      <MatchReportContent params={params} />
    </Suspense>
  )
}
