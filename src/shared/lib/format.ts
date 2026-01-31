/**
 * 게임 날짜와 시간을 예쁘게 포맷
 * - 오늘: "오늘 15:23"
 * - 어제: "어제 15:23"
 * - 이번 주: "월요일 15:23"
 * - 그 외: "1월 15일 15:23"
 */
export function formatGameDateTime(timestamp: number): string {
  const gameDate = new Date(timestamp)
  const now = new Date()
  
  const gameYear = gameDate.getFullYear()
  const gameMonth = gameDate.getMonth()
  const gameDay = gameDate.getDate()
  const gameHours = gameDate.getHours()
  const gameMinutes = gameDate.getMinutes()
  
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth()
  const nowDay = now.getDate()
  
  const timeStr = `${gameHours.toString().padStart(2, '0')}:${gameMinutes.toString().padStart(2, '0')}`
  
  // 오늘
  if (gameYear === nowYear && gameMonth === nowMonth && gameDay === nowDay) {
    return `오늘 ${timeStr}`
  }
  
  // 어제
  const yesterday = new Date(now)
  yesterday.setDate(nowDay - 1)
  if (gameYear === yesterday.getFullYear() && 
      gameMonth === yesterday.getMonth() && 
      gameDay === yesterday.getDate()) {
    return `어제 ${timeStr}`
  }
  
  // 이번 주 (7일 이내)
  const daysDiff = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) {
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    const dayName = dayNames[gameDate.getDay()]
    return `${dayName} ${timeStr}`
  }
  
  // 그 외: "1월 15일 15:23"
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  return `${monthNames[gameMonth]} ${gameDay}일 ${timeStr}`
}

/**
 * 날짜를 시간으로 포맷 (예: "15:23")
 * @deprecated formatGameDateTime 사용 권장
 */
export function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * 게임 시간을 분:초 형태로 포맷 (예: "37:24")
 */
export function formatGameDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 배치 순위를 한글로 변환
 */
export function formatPlacement(placement: number): string {
  return `${placement}위`
}
