import type { NormalizedMatch, AnalysisResult } from '@/shared/types/analysis'
import { extractFeatures } from './feature-extractor'
import { applyRules } from './rule-engine'

/**
 * 매치 분석 메인 함수
 * 
 * MVP 규칙 문서 기준:
 * - TOP3 원인 + 증거
 * - 다음 판 액션 1개
 */
export function analyzeMatch(match: NormalizedMatch, puuid: string): AnalysisResult {
  const participant = match.participants.find(p => p.puuid === puuid)
  
  if (!participant) {
    throw new Error(`Participant not found: ${puuid}`)
  }

  // 2계층: 특성 추출
  const features = extractFeatures(participant)
  
  // 3계층: 규칙 적용 (TOP3)
  const topCauses = applyRules(features)

  return {
    matchId: match.matchId,
    puuid,
    placement: participant.placement,
    causes: topCauses,
    analyzedAt: new Date().toISOString(),
  }
}

// 액션 추출 함수도 export
export { getTopAction } from './rule-engine'
