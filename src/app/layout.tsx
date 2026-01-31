import type { Metadata } from 'next'
import { QueryProvider } from '@/shared/lib/query-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Why TFT - 전략적 팀 전투 분석',
  description: 'TFT 포스트게임 분석 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
