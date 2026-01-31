'use client'

import { useState } from 'react'
import {
  getUnitImageUrl,
  getUnitImageUrlFallback,
  FALLBACK_DDRAGON_VERSION,
} from '@/shared/lib/tft-assets'
import { useDdragonVersion } from '@/shared/lib/queries'

interface ChampionIconProps {
  /** TFT character_id (예: TFT16_Kobuko) */
  characterId: string
  /** 챔피언 이름 (alt, 로딩 실패 시 대체 텍스트) */
  name?: string
  /** 크기 (px). 기본 48 */
  size?: number
  /** 별 개수 (1~3). 표시용 */
  star?: number
  /** TFT Set 번호 (getUnitImageUrl 시그니처 호환) */
  tftSet?: number
  className?: string
}

export function ChampionIcon({
  characterId,
  name = '',
  size = 48,
  star,
  tftSet,
  className = '',
}: ChampionIconProps) {
  const [error, setError] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)
  const { data: versionData } = useDdragonVersion()
  const version = versionData?.version ?? FALLBACK_DDRAGON_VERSION

  const primarySrc = getUnitImageUrl(characterId, tftSet)
  const fallbackSrc = getUnitImageUrlFallback(characterId, version)
  const src = !triedFallback ? primarySrc : fallbackSrc
  const alt = name || characterId

  const handleError = () => {
    if (!triedFallback) {
      setTriedFallback(true)
    } else {
      setError(true)
    }
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg bg-gray-700 text-gray-400 ${className}`}
        style={{ width: size, height: size }}
        title={alt}
      >
        <span className="text-xs truncate px-1">{alt || '?'}</span>
      </div>
    )
  }

  return (
    <div
      className={`relative inline-block flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full rounded-lg object-cover border border-gray-600 aspect-square"
        referrerPolicy="no-referrer"
        onError={handleError}
      />
      {star !== undefined && star >= 1 && (
        <span className="absolute bottom-0 left-0 right-0 text-center text-xs font-bold text-amber-400 bg-black/70 rounded-b-lg">
          {'★'.repeat(Math.min(3, Math.max(1, star)))}
        </span>
      )}
    </div>
  )
}
