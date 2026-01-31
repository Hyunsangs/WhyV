import { NextResponse } from 'next/server'

/**
 * PUUID로 소환사 상세 정보 조회 (Server-side with caching)
 */
export async function GET(
  request: Request,
  { params }: { params: { puuid: string } }
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
      `https://kr.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${params.puuid}`,
      {
        headers: {
          'X-Riot-Token': apiKey,
        },
        next: {
          revalidate: 300, // 5분 캐싱
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
      { error: 'Failed to fetch summoner' },
      { status: 500 }
    )
  }
}
