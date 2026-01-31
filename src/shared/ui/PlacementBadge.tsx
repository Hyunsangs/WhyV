interface PlacementBadgeProps {
  placement: number
}

function getPlacementStyle(placement: number): string {
  if (placement === 1) {
    // 1등 - 금색
    return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-lg shadow-yellow-500/50'
  }
  if (placement === 2) {
    // 2등 - 은색
    return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 shadow-lg shadow-gray-400/50'
  }
  if (placement === 3) {
    // 3등 - 동색
    return 'bg-gradient-to-br from-orange-400 to-amber-600 text-amber-950 shadow-lg shadow-orange-500/50'
  }
  if (placement === 4) {
    // 4등 - 승리 (연한 초록)
    return 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-emerald-950 shadow-md'
  }
  // 5~8등 - 패배 (어두운 회색)
  return 'bg-gradient-to-br from-gray-700 to-gray-900 text-gray-300 shadow-md'
}

export function PlacementBadge({ placement }: PlacementBadgeProps) {
  const styleClass = getPlacementStyle(placement)
  
  return (
    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${styleClass}`}>
      {placement}
    </div>
  )
}
