import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://ddragon.leagueoflegends.com',
  'https://raw.communitydragon.org',
]

/**
 * 이미지 프록시: 외부 CDN(DDragon, CDragon) 이미지를 서버에서 가져와 반환.
 * 403/Referer·핫링크 이슈 회피.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get('url')

  if (!rawUrl) {
    return NextResponse.json({ error: 'url query required' }, { status: 400 })
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(decodeURIComponent(rawUrl))
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  const origin = `${targetUrl.protocol}//${targetUrl.host}`
  if (!ALLOWED_ORIGINS.some((o) => origin === o || origin.startsWith(o))) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: { Accept: 'image/*' },
      next: { revalidate: 86400 }, // 24h
    })

    if (!response.ok) {
      return new NextResponse(null, { status: response.status })
    }

    const contentType = response.headers.get('content-type') ?? 'image/png'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
  }
}
