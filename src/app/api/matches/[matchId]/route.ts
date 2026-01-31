import { NextResponse } from 'next/server'

/**
 * 매치 상세 정보 조회 (Server-side with long caching)
 */
export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  const apiKey = process.env.RIOT_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RIOT_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://asia.api.riotgames.com/tft/match/v1/matches/${params.matchId}`,
      {
        headers: {
          'X-Riot-Token': apiKey,
        },
        next: {
          revalidate: 600, // 10분 캐싱 (매치 데이터는 불변)
          tags: [`match-${params.matchId}`],
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `Riot API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch match detail' },
      { status: 500 }
    )
  }
}
