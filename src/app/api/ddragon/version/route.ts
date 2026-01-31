import { NextResponse } from 'next/server'

const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'

/**
 * Data Dragon 최신 버전 조회
 * 클라이언트/챔피언 이미지 URL에 사용
 */
export async function GET() {
  try {
    const response = await fetch(VERSIONS_URL, {
      next: { revalidate: 86400 }, // 24시간 캐시
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch DDragon versions' },
        { status: response.status }
      )
    }

    const versions: string[] = await response.json()
    const latest = versions[0]

    if (!latest) {
      return NextResponse.json(
        { error: 'No version in DDragon response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ version: latest })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch DDragon version' },
      { status: 500 }
    )
  }
}
