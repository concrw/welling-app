import { useAppStore } from '../../store/appStore'
import { useMessages } from '../../i18n'
import { matchesItem } from '../../lib/achievement'
import type { GoalVsActualTimeGroup, GoalVsActualStatus } from './GoalVsActualTimeGroups'

// Map 24h time string (HH:MM) to a display label bucketed by part of day
function timeToGroupLabel(time: string): string {
  const [h] = time.split(':').map(Number)
  if (h < 12) return `${h === 0 ? 12 : h}:${time.split(':')[1]} AM`
  if (h === 12) return `12:${time.split(':')[1]} PM`
  return `${h - 12}:${time.split(':')[1]} PM`
}

export function useGoalVsActual(): {
  timeGroups: GoalVsActualTimeGroup[]
  getStatus: (itemName: string) => GoalVsActualStatus
} {
  const M = useMessages()
  const routineGroups = useAppStore((s) => s.routineGroups)
  const posts = useAppStore((s) => s.posts)
  const nickname = useAppStore((s) => s.nickname)

  const allItems = routineGroups.flatMap((g) =>
    g.items.map((item) => ({ groupName: g.name, ...item }))
  )

  const myPosts = posts.filter((p) => p.user === nickname || p.user === 'Min')

  const groupMap = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const label = item.time ? timeToGroupLabel(item.time) : M.goalVsActual.anytime
    if (!groupMap.has(label)) groupMap.set(label, [])
    groupMap.get(label)!.push(item)
  }

  const timeGroups = Array.from(groupMap.entries())
    .sort(([a], [b]) => {
      const toMinutes = (label: string) => {
        const isPM = label.includes('PM')
        const [timePart] = label.split(' ')
        const [h, m] = timePart.split(':').map(Number)
        return (isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h) * 60 + m
      }
      if (a === M.goalVsActual.anytime) return 1
      if (b === M.goalVsActual.anytime) return -1
      return toMinutes(a) - toMinutes(b)
    })
    .map(([time, items]) => ({ time, items }))

  function getStatus(itemName: string): GoalVsActualStatus {
    const matched = myPosts.some((p) => matchesItem(p.content, itemName))
    if (matched) return { statusLabel: M.goalVsActual.statusDone, statusColor: '#16A34A', statusLabelBg: '#DCFCE7', statusBg: '#F0FDF4', statusBorder: '#BBF7D0' }
    return { statusLabel: M.goalVsActual.statusMissed, statusColor: '#DC2626', statusLabelBg: '#FEE2E2', statusBg: '#FFF5F5', statusBorder: '#FECACA' }
  }

  return { timeGroups, getStatus }
}
