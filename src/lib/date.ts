/**
 * 날짜/시간 유틸리티 (Asia/Seoul 기준)
 * 
 * UTC 기반 toISOString().slice(0, 10)은 KST 오전 9시 전 기록이 전날로 저장되는 버그 발생
 * 사용자 디바이스 시간대를 사용하여 로컬 날짜를 올바르게 계산
 */

/**
 * 현재 로컬 날짜를 YYYY-MM-DD 형식으로 반환
 * @param timezone 시간대 (기본값: 'Asia/Seoul')
 * @returns YYYY-MM-DD 문자열
 */
export function getLocalDate(timezone: string = 'Asia/Seoul'): string {
  const now = new Date()
  return getLocalDateFromTimestamp(now.getTime(), timezone)
}

/**
 * Unix timestamp를 로컬 날짜 YYYY-MM-DD로 변환
 * @param timestamp Unix timestamp (milliseconds)
 * @param timezone 시간대 (기본값: 'Asia/Seoul')
 * @returns YYYY-MM-DD 문자열
 */
export function getLocalDateFromTimestamp(timestamp: number, timezone: string = 'Asia/Seoul'): string {
  const date = new Date(timestamp)
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const year = parts.find((p) => p.type === 'year')?.value || ''
  const month = parts.find((p) => p.type === 'month')?.value || ''
  const day = parts.find((p) => p.type === 'day')?.value || ''
  
  return `${year}-${month}-${day}`
}

/**
 * 현재 시각에 따른 한국어 시간대 레이블 반환
 * @returns '아침' | '점심' | '저녁' | '간식'
 */
export function getTimeOfDayLabel(): string {
  const now = new Date()
  const hour = now.getHours()
  
  if (hour >= 5 && hour < 11) {
    return '아침'
  } else if (hour >= 11 && hour < 14) {
    return '점심'
  } else if (hour >= 17 && hour < 21) {
    return '저녁'
  } else {
    return '간식'
  }
}

/**
 * 시간대 레이블에 맞는 동사 반환
 * @param category 'diet' | 'exercise'
 * @returns 예: '아침 먹었어', '운동했어'
 */
export function getActivityLabel(category: 'diet' | 'exercise'): string {
  if (category === 'exercise') {
    return '운동했어'
  }
  
  const timeLabel = getTimeOfDayLabel()
  if (timeLabel === '간식') {
    return '간식 먹었어'
  }
  return `${timeLabel} 먹었어`
}
