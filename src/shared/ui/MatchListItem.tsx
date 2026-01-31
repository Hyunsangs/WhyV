import Link from 'next/link'
import type { MatchSummary } from '@/shared/types/analysis'
import { PlacementBadge } from './PlacementBadge'
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
      className="block bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-750 transition p-4 border-l-4"
      style={{ borderLeftColor: isWin ? '#10b981' : '#ef4444' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <PlacementBadge placement={match.placement} />
          
          <div className="flex-1">
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
        
        <div className="text-blue-400 hover:text-blue-300 text-sm sm:text-base self-end sm:self-center">
          분석 보기 →
        </div>
      </div>
    </Link>
  )
}
