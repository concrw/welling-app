import { useAppStore } from '../../store/appStore'
import { useMessages } from '../../i18n'
import { computeAchievementForRange } from '../../lib/achievement'

export function useRoutineHistorySummary() {
  const M = useMessages()
  const routineGroups = useAppStore((s) => s.routineGroups)
  const routineHistory = useAppStore((s) => s.routineHistory)
  const currentRoutineStartDate = useAppStore((s) => s.currentRoutineStartDate)
  const posts = useAppStore((s) => s.posts)
  const nickname = useAppStore((s) => s.nickname)
  const userName = nickname || 'Min'

  const itemNames = routineGroups.flatMap((g) => g.items).map((i) => i.name)

  const now = Date.now()
  const currentCompletion = computeAchievementForRange(routineGroups, posts, userName, currentRoutineStartDate, now).overall
  const currentPeriodLabel = `${M.routineHistory.periodRange(currentRoutineStartDate, now)}`

  const displayNames = itemNames.slice(0, 2).join(', ')
  const extraCount = itemNames.length > 2 ? itemNames.length - 2 : 0
  const itemSummary = M.routineHistory.itemSummary(displayNames, extraCount)

  const priorPeriods = routineHistory.map((entry) => ({
    id: entry.id,
    period: M.routineHistory.periodRange(entry.startDate, entry.endDate),
    achievement: computeAchievementForRange(entry.groups, posts, userName, entry.startDate, entry.endDate).overall,
  }))

  return { currentPeriodLabel, currentCompletion, itemSummary, priorPeriods, hasRoutine: itemNames.length > 0 }
}
