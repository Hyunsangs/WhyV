'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSearch = async () => {
    setError('')
    
    if (!searchInput.trim()) {
      setError('소환사명을 입력해주세요')
      return
    }

    const parts = searchInput.trim().split('#')
    if (parts.length !== 2) {
      setError('올바른 형식으로 입력해주세요 (예: 소환사명#KR1)')
      return
    }

    const [gameName, tagLine] = parts
    if (!gameName || !tagLine) {
      setError('소환사명과 태그를 모두 입력해주세요')
      return
    }

    setIsSearching(true)
    
    try {
      // 매치 목록 페이지로 이동 (나중에 API 호출 후 이동하도록 개선 가능)
      router.push(`/matches?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`)
    } catch (err) {
      setError('검색 중 오류가 발생했습니다')
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch()
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Why TFT</h1>
        <p className="text-base sm:text-lg text-gray-300 mb-8">
          TFT 포스트게임 분석 서비스
        </p>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">시작하기</h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            소환사명을 입력하고 최근 매치를 분석해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="소환사명#KR1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
              className="flex-1 min-h-[44px] px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-500 bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-600 disabled:cursor-not-allowed font-medium whitespace-nowrap"
            >
              {isSearching ? '검색 중...' : '검색'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold mb-2 text-white">📊 규칙 기반 분석</h3>
            <p className="text-sm text-gray-400">
              명확한 근거와 함께 제공되는 결정론적 분석
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold mb-2 text-white">🎯 포스트게임 전용</h3>
            <p className="text-sm text-gray-400">
              경기 종료 시점 데이터를 기반으로 한 정확한 분석
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold mb-2 text-white">💡 설명 가능한 결과</h3>
            <p className="text-sm text-gray-400">
              모든 분석 결과는 추적 가능하고 이해하기 쉽게 제공
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
