export const SCHEDULE_KEYWORDS = ['미팅', '약속', '회의', '출장', '재택'] as const
export type ScheduleKeyword = (typeof SCHEDULE_KEYWORDS)[number]
