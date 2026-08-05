import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { AlarmHeader } from '../components/alarm/AlarmHeader'
import { SyncedAlarmSection } from '../components/alarm/SyncedAlarmSection'
import { CommunityAlarmSection } from '../components/alarm/CommunityAlarmSection'

const COMMUNITY_DISPLAY = [
  { id: 'c1', initial: 'R', name: 'Morning Runners', color: '#0984E3' },
  { id: 'c2', initial: 'C', name: 'Clean Eaters', color: '#00A389' },
  { id: 'c3', initial: 'B', name: 'Book Club 30m', color: '#7C3AED' },
]

export default function Alarm() {
  const goBack = useAppStore((s) => s.goBack)
  const syncedList = useAppStore((s) => s.syncedList)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const storedSynced = useAppStore((s) => s.alarmSyncedSettings)
  const storedComms = useAppStore((s) => s.alarmCommSettings)
  const saveAlarmSettings = useAppStore((s) => s.saveAlarmSettings)

  // Build synced display entries from the live syncedList + suggestedUsers
  const syncedUserList = suggestedUsers
    .filter((u) => syncedList.has(u.id))
    .map((u) => {
      const firstRoutine = u.routines[0]
      return {
        id: u.id,
        userName: u.name,
        time: '06:00 AM',
        items: firstRoutine ? firstRoutine.items : '',
      }
    })

  const [synced, setSynced] = useState(() =>
    syncedUserList.map((item) => {
      const saved = storedSynced.find((s) => s.id === item.id)
      return { ...item, on: saved ? saved.on : false }
    })
  )

  const [communities, setCommunities] = useState(() =>
    COMMUNITY_DISPLAY.map((item) => {
      const saved = storedComms.find((c) => c.id === item.id)
      return { ...item, on: saved ? saved.on : false }
    })
  )

  // Resync when syncedList changes (user syncs a new person from profile)
  useEffect(() => {
    setSynced(
      syncedUserList.map((item) => {
        const saved = storedSynced.find((s) => s.id === item.id)
        return { ...item, on: saved ? saved.on : false }
      })
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncedList.size])

  const toggleSynced = (id: string) => {
    const next = synced.map((a) => a.id === id ? { ...a, on: !a.on } : a)
    setSynced(next)
    saveAlarmSettings(
      next.map((a) => ({ id: a.id, on: a.on })),
      communities.map((c) => ({ id: c.id, on: c.on }))
    )
  }

  const toggleComm = (id: string) => {
    const next = communities.map((c) => c.id === id ? { ...c, on: !c.on } : c)
    setCommunities(next)
    saveAlarmSettings(
      synced.map((a) => ({ id: a.id, on: a.on })),
      next.map((c) => ({ id: c.id, on: c.on }))
    )
  }

  return (
    <div>
      <AlarmHeader onBack={goBack} />

      <SyncedAlarmSection synced={synced} onToggle={toggleSynced} />

      <CommunityAlarmSection communities={communities} onToggle={toggleComm} />

      <div style={{ height: 40 }} />
    </div>
  )
}
