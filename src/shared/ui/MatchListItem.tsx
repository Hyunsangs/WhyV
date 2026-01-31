import Link from 'next/link'
import type { MatchSummary } from '@/shared/types/analysis'
import { PlacementBadge } from './PlacementBadge'
import { ChampionIcon } from './ChampionIcon'
import { formatGameDateTime, formatGameDuration } from '@/shared/lib/format'

interface MatchListItemProps {
  match: MatchSummary
  puuid: string
}

export function MatchListItem({ match, puuid }: MatchListItemProps) {
  const isWin = match.placement <= 4

  return (
    <Link 
      href={`/matches/${match.matchId}?puuid=${puuid}`}
      className="group flex bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-750 transition overflow-hidden border-l-4"
      style={{ borderLeftColor: isWin ? '#10b981' : '#ef4444' }}
    >
      {/* 왼쪽: 전적 + 챔피언 (모바일 세로 / 데스크톱 가로) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0 p-4 order-1">
        <div className="flex items-center gap-4 min-w-0 sm:flex-1">
          <PlacementBadge placement={match.placement} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {isWin ? '승리' : '패배'}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-400">
                {formatGameDateTime(match.gameDateTime)}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 flex-wrap">
              <span>레벨 {match.level}</span>
              <span className="text-gray-600">•</span>
              <span>피해량 {match.totalDamage.toLocaleString()}</span>
              <span className="text-gray-600">•</span>
              <span>{formatGameDuration(match.gameLength)}</span>
            </div>
          </div>
        </div>
        {match.units.length > 0 && (
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 min-w-0 overflow-hidden order-3 sm:order-none">
            {match.units.map((unit, index) => (
              <ChampionIcon
                key={`${unit.character_id}-${index}`}
                characterId={unit.character_id}
                name={unit.name}
                size={32}
                star={unit.tier}
                tftSet={match.tftSet}
                className="rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽: 분석 박스 (전체 높이, 너비 약 10%) */}
      <div
        className="w-[10%] min-w-[72px] sm:min-w-[80px] flex-shrink-0 flex flex-col items-center justify-center gap-0 py-4 px-2 border-l border-gray-600 bg-gray-700/50 group-hover:bg-gray-700 transition rounded-r-lg min-h-[44px]"
        aria-hidden
      >
        <span className="text-gray-300 group-hover:text-amber-400 text-xs sm:text-sm font-semibold text-center tracking-tight transition-colors">
          분석 하기
        </span>
      </div>
    </Link>
  )
}
