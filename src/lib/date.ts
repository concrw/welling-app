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

export function formatClockTime(time: string, lang: 'ko' | 'en'): string {
  const [hour, minute] = time.split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time
  return new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(Date.UTC(2000, 0, 1, hour, minute)))
}

/**
 * Asia/Seoul 시간대 기준 현재 시각에 따른 시간대 레이블 키 반환
 * @returns 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'snack'
 */
export function getTimeOfDayKey(): 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'snack' {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    hourCycle: 'h23',
  })
  const parts = formatter.formatToParts(new Date())
  const hourPart = parts.find((p) => p.type === 'hour')
  const hour = hourPart ? parseInt(hourPart.value, 10) : 0
  
  if (hour >= 5 && hour < 11) {
    return 'morning'
  } else if (hour >= 11 && hour < 14) {
    return 'lunch'
  } else if (hour >= 14 && hour < 17) {
    return 'afternoon'
  } else if (hour >= 17 && hour < 21) {
    return 'dinner'
  } else {
    return 'snack'
  }
}

type Messages = {
  lib: {
    timeOfDay: {
      morning: string
      lunch: string
      afternoon: string
      dinner: string
      snack: string
    }
    activityLabels: {
      exercise: string
      snackMeal: string
      mealWithTime: (time: string) => string
    }
  }
}

/**
 * 시간대 레이블에 맞는 활동 레이블 반환
 * @param category 'diet' | 'exercise'
 * @param M Messages object from useMessages()
 * @returns 예: '아침 먹었어', '운동했어'
 */
export function getActivityLabel(category: 'diet' | 'exercise', M: Messages): string {
  if (category === 'exercise') {
    return M.lib.activityLabels.exercise
  }
  
  const timeKey = getTimeOfDayKey()
  if (timeKey === 'snack') {
    return M.lib.activityLabels.snackMeal
  }
  return M.lib.activityLabels.mealWithTime(M.lib.timeOfDay[timeKey])
}
