import { NextResponse } from 'next/server'

/**
 * 매치 ID 목록 조회 (Server-side with short caching)
 */
export async function GET(
  request: Request,
  { params }: { params: { puuid: string } }
) {
  const { searchParams } = new URL(request.url)
  const count = searchParams.get('count') || '10'
  
  const apiKey = process.env.RIOT_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RIOT_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://asia.api.riotgames.com/tft/match/v1/matches/by-puuid/${params.puuid}/ids?count=${count}`,
      {
        headers: {
          'X-Riot-Token': apiKey,
        },
        next: {
          revalidate: 60, // 1분 캐싱 (새 게임이 자주 추가됨)
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
      { error: 'Failed to fetch match IDs' },
      { status: 500 }
    )
  }
}
