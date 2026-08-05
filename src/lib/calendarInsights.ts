import { SCHEDULE_KEYWORDS, type ScheduleKeyword } from '../data/scheduleKeywords'

export { SCHEDULE_KEYWORDS }
export type { ScheduleKeyword }

export function matchScheduleKeywords(eventTitles: string[]): ScheduleKeyword[] {
  const matched = new Set<ScheduleKeyword>()
  for (const title of eventTitles) {
    for (const keyword of SCHEDULE_KEYWORDS) {
      if (title.includes(keyword)) matched.add(keyword)
    }
  }
  return [...matched]
}
