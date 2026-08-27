import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'
import type { RoutineGroupData } from '../store/appStore'
import { isConnected, syncRoutinesToCalendar } from '../lib/googleCalendar'
import type { RoutineEvent } from '../lib/googleCalendar'
import type { RoutineGroup, RoutineItem } from '../components/routine-edit/types'
import { RoutineEditHeader } from '../components/routine-edit/RoutineEditHeader'
import { RoutineGroupCard } from '../components/routine-edit/RoutineGroupCard'
import { SyncToast } from '../components/routine-edit/SyncToast'
import { PeriodChoiceSheet } from '../components/routine-edit/PeriodChoiceSheet'

function toEditGroups(stored: RoutineGroupData[]): RoutineGroup[] {
  return stored.map((g) => ({
    id: g.id,
    name: g.name,
    isAdding: false,
    newItemText: '',
    items: g.items.map((item) => ({
      ...item,
      imgUrl: item.imgUrl,
      isEditingItem: false,
      isConfirmingDelete: false,
      isPicking: false,
      editDraftName: item.name,
      editDraftTime: item.time,
      editDraftDesc: item.desc,
    })),
  }))
}

function toStoredGroups(groups: RoutineGroup[]): RoutineGroupData[] {
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    items: g.items.map((item) => ({
      id: item.id,
      name: item.name,
      time: item.time,
      desc: item.desc,
      imgUrl: item.imgUrl,
    })),
  }))
}

export default function RoutineEdit() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const navigate = useAppStore((s) => s.navigate)
  const storedGroups = useAppStore((s) => s.routineGroups)
  const saveRoutineGroups = useAppStore((s) => s.saveRoutineGroups)
  const startNewRoutinePeriod = useAppStore((s) => s.startNewRoutinePeriod)
  const [groups, setGroups] = useState(() => toEditGroups(storedGroups))
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [syncMsg, setSyncMsg] = useState('')
  const [showPeriodChoice, setShowPeriodChoice] = useState(false)

  const handleSave = () => {
    const nextGroups = toStoredGroups(groups)
    const hasChanged = JSON.stringify(nextGroups) !== JSON.stringify(storedGroups)
    if (!hasChanged) {
      goBack()
      return
    }
    setShowPeriodChoice(true)
  }

  const confirmOverwrite = () => {
    saveRoutineGroups(toStoredGroups(groups))
    setShowPeriodChoice(false)
    goBack()
  }

  const confirmNewPeriod = () => {
    startNewRoutinePeriod(toStoredGroups(groups))
    setShowPeriodChoice(false)
    goBack()
  }

  const handleCalendarSync = async () => {
    if (!isConnected()) {
      navigate('settings-google-calendar')
      return
    }
    setSyncState('loading')
    setSyncMsg('')
    const events: RoutineEvent[] = groups.flatMap((g) =>
      g.items.map((item) => ({ name: item.name, time: item.time, desc: item.desc, groupName: g.name }))
    )
    try {
      const { success, failed } = await syncRoutinesToCalendar(events)
      setSyncState('done')
      setSyncMsg(failed > 0 ? M.routineEdit.syncPartial(success, failed) : M.routineEdit.syncSuccess(success))
    } catch (e) {
      const msg = (e as Error).message
      if (msg === 'AUTH_EXPIRED') {
        setSyncMsg(M.routineEdit.authExpired)
      } else {
        setSyncMsg(msg)
      }
      setSyncState('error')
    }
  }

  const updateItem = (gid: string, iid: string, patch: Partial<RoutineItem>) =>
    setGroups((prev) => prev.map((g) => g.id !== gid ? g : { ...g, items: g.items.map((item) => item.id !== iid ? item : { ...item, ...patch }) }))

  const updateGroup = (gid: string, patch: Partial<RoutineGroup>) =>
    setGroups((prev) => prev.map((g) => g.id !== gid ? g : { ...g, ...patch }))

  const deleteItem = (gid: string, iid: string) =>
    setGroups((prev) => prev.map((g) => g.id !== gid ? g : { ...g, items: g.items.filter((i) => i.id !== iid) }))

  const confirmAdd = (gid: string) => {
    const group = groups.find((g) => g.id === gid)!
    if (!group.newItemText.trim()) return
    const newItem: RoutineItem = { id: `i${Date.now()}`, name: group.newItemText.trim(), time: '', desc: '', isEditingItem: false, isConfirmingDelete: false, isPicking: false, editDraftName: group.newItemText.trim(), editDraftTime: '', editDraftDesc: '' }
    setGroups((prev) => prev.map((g) => g.id !== gid ? g : { ...g, items: [...g.items, newItem], isAdding: false, newItemText: '' }))
  }

  return (
    <div data-testid="routine-edit-screen">
      <RoutineEditHeader onBack={goBack} onCalendarSync={handleCalendarSync} onSave={handleSave} syncState={syncState} />

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groups.map((group) => (
          <RoutineGroupCard
            key={group.id}
            group={group}
            onUpdateGroup={(patch) => updateGroup(group.id, patch)}
            onUpdateItem={(iid, patch) => updateItem(group.id, iid, patch)}
            onDeleteItem={(iid) => deleteItem(group.id, iid)}
            onConfirmAdd={() => confirmAdd(group.id)}
          />
        ))}

        <div onClick={() => setGroups(toEditGroups(storedGroups))} style={{ marginTop: 4, padding: 14, borderRadius: 10, border: '1px dashed #CCCCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#AAAAAA' }}>{M.routineEdit.resetToNew}</span>
        </div>
      </div>

      {syncMsg && <SyncToast message={syncMsg} isError={syncState === 'error'} />}

      {showPeriodChoice && (
        <PeriodChoiceSheet onConfirmNewPeriod={confirmNewPeriod} onConfirmOverwrite={confirmOverwrite} />
      )}
    </div>
  )
}
