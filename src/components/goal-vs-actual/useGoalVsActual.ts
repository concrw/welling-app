import { useAppStore } from '../../store/appStore'
import { useLangStore, useMessages } from '../../i18n'
import { matchesItem } from '../../lib/achievement'
import { formatClockTime } from '../../lib/date'
import type { GoalVsActualTimeGroup, GoalVsActualStatus } from './GoalVsActualTimeGroups'

// Map 24h time string (HH:MM) to a display label bucketed by part of day
export function useGoalVsActual(): {
  timeGroups: GoalVsActualTimeGroup[]
  getStatus: (itemName: string) => GoalVsActualStatus
} {
  const M = useMessages()
  const lang = useLangStore((s) => s.lang)
  const routineGroups = useAppStore((s) => s.routineGroups)
  const posts = useAppStore((s) => s.posts)
  const nickname = useAppStore((s) => s.nickname)

  const allItems = routineGroups.flatMap((g) =>
    g.items.map((item) => ({ groupName: g.name, ...item }))
  )

  const todayKey = new Date().toDateString()
  const myPosts = posts.filter((p) => (p.user === nickname || p.user === 'Min') && new Date(p.createdAt).toDateString() === todayKey)

  const groupMap = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const timeKey = item.time || ''
    if (!groupMap.has(timeKey)) groupMap.set(timeKey, [])
    groupMap.get(timeKey)!.push(item)
  }

  const timeGroups = Array.from(groupMap.entries())
    .sort(([a], [b]) => {
      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number)
        return h * 60 + m
      }
      if (!a) return 1
      if (!b) return -1
      return toMinutes(a) - toMinutes(b)
    })
    .map(([time, items]) => ({ time: time ? formatClockTime(time, lang) : M.goalVsActual.anytime, items }))

  function getStatus(itemName: string): GoalVsActualStatus {
    const matched = myPosts.some((p) => matchesItem(p.content, itemName, p.category))
    if (matched) return { statusLabel: M.goalVsActual.statusDone, statusColor: '#16A34A', statusLabelBg: '#DCFCE7', statusBg: '#F0FDF4', statusBorder: '#BBF7D0' }
    return { statusLabel: M.goalVsActual.statusMissed, statusColor: '#DC2626', statusLabelBg: '#FEE2E2', statusBg: '#FFF5F5', statusBorder: '#FECACA' }
  }

  return { timeGroups, getStatus }
}
