import { useSummonerByPuuid } from '@/shared/lib/queries'

interface ProfileHeaderProps {
  puuid: string
  gameName: string
  tagLine: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function ProfileHeader({ puuid, gameName, tagLine, onRefresh, isRefreshing }: ProfileHeaderProps) {
  const { data: summonerData, isLoading: isSummonerLoading } = useSummonerByPuuid(puuid)

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* 프로필 이미지 */}
        <div className="relative flex-shrink-0">
          {isSummonerLoading ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-700 animate-pulse" />
          ) : (
            <>
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/16.2.1/img/profileicon/${summonerData?.profileIconId || 0}.png`}
                alt="프로필 아이콘"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-700"
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                {summonerData?.summonerLevel || 0}
              </div>
            </>
          )}
        </div>

        {/* 프로필 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              {gameName} <span className="text-gray-400">#{tagLine}</span>
            </h1>
          </div>
          
          {/* 랭킹 정보 - TFT API 제약으로 현재 미지원 */}
          <div className="text-sm text-gray-400">
            레벨 {summonerData?.summonerLevel || 0}
          </div>
        </div>

        {/* 전적 갱신 버튼 */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <span>🔄</span>
          <span>{isRefreshing ? '갱신 중...' : '전적 갱신'}</span>
        </button>
      </div>
    </div>
  )
}
