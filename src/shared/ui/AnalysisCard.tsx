import type { RuleCause, RuleCategory } from '@/shared/types/analysis'

interface AnalysisCardProps {
  cause: RuleCause
}

const CATEGORY_LABELS: Record<RuleCategory, string> = {
  ITEM: '아이템',
  CARRY: '캐리',
  SYNERGY: '시너지',
  LEVEL: '레벨',
  ECON: '경제',
  AUGMENT: '증강',
}

const CATEGORY_COLORS: Record<RuleCategory, string> = {
  ITEM: 'bg-purple-900/50 text-purple-300 border border-purple-700',
  CARRY: 'bg-red-900/50 text-red-300 border border-red-700',
  SYNERGY: 'bg-blue-900/50 text-blue-300 border border-blue-700',
  LEVEL: 'bg-green-900/50 text-green-300 border border-green-700',
  ECON: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  AUGMENT: 'bg-pink-900/50 text-pink-300 border border-pink-700',
}

const SCORE_INDICATORS: Record<1 | 2 | 3, string> = {
  1: '●',
  2: '●●',
  3: '●●●',
}

const SCORE_COLORS: Record<1 | 2 | 3, string> = {
  1: 'text-yellow-400',
  2: 'text-orange-400',
  3: 'text-red-400',
}

export function AnalysisCard({ cause }: AnalysisCardProps) {
  return (
    <div className="border border-gray-700 bg-gray-800 rounded-lg p-4 hover:shadow-lg hover:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 transition">
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-1 rounded ${CATEGORY_COLORS[cause.category]}`}>
          {CATEGORY_LABELS[cause.category]}
        </span>
        <span className={`font-bold ${SCORE_COLORS[cause.score]}`}>
          {SCORE_INDICATORS[cause.score]}
        </span>
      </div>
      
      <p className="text-gray-200 font-medium mb-2 text-sm sm:text-base">{cause.message}</p>
      
      {Object.keys(cause.evidence).length > 0 && (
        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
          <span className="font-semibold text-gray-300">근거:</span>
          {' '}
          {Object.entries(cause.evidence).map(([key, value]) => (
            <span key={key} className="mr-2">
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}
      
      {cause.actionCode && (
        <div className="mt-2 text-xs text-blue-400">
          💡 개선 방향: {cause.actionCode}
        </div>
      )}
    </div>
  )
}
