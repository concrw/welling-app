import { AdSlotCard } from './AdSlotCard'
import type { AdSlot } from './types'

interface AdSlotListProps {
  slots: AdSlot[]
  editing: string | null
  getSlot: (id: string) => AdSlot
  update: (id: string, patch: Partial<AdSlot>) => void
  startEdit: (id: string) => void
  cancelEdit: (id: string) => void
  save: (id: string) => void
}

export function AdSlotList({ slots, editing, getSlot, update, startEdit, cancelEdit, save }: AdSlotListProps) {
  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {slots.map((origSlot) => (
        <AdSlotCard
          key={origSlot.id}
          origSlot={origSlot}
          slot={getSlot(origSlot.id)}
          isOpen={editing === origSlot.id}
          update={update}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          save={save}
        />
      ))}
    </div>
  )
}
