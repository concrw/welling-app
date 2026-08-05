import type { RoutineGroup, RoutineItem } from './types'
import { RoutineItemRow } from './RoutineItemRow'
import { useMessages } from '../../i18n'

export function RoutineGroupCard({
  group,
  onUpdateGroup,
  onUpdateItem,
  onDeleteItem,
  onConfirmAdd,
}: {
  group: RoutineGroup
  onUpdateGroup: (patch: Partial<RoutineGroup>) => void
  onUpdateItem: (iid: string, patch: Partial<RoutineItem>) => void
  onDeleteItem: (iid: string) => void
  onConfirmAdd: () => void
}) {
  const M = useMessages()
  return (
    <div style={{ borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
      <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: '.08em' }}>{group.name}</span>
        <button onClick={() => onUpdateGroup({ isAdding: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#111111', padding: 0, fontWeight: 600 }}>{M.routineEdit.addItem}</button>
      </div>

      {group.items.map((item) => (
        <RoutineItemRow
          key={item.id}
          item={item}
          onUpdate={(patch) => onUpdateItem(item.id, patch)}
          onDelete={() => onDeleteItem(item.id)}
        />
      ))}

      {group.isAdding && (
        <div style={{ padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={group.newItemText} onChange={(e) => onUpdateGroup({ newItemText: e.target.value })} placeholder={M.routineEdit.itemNamePlaceholder} style={{ flex: 1, padding: '8px 10px', borderRadius: 7, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#fff' }} />
          <button onClick={onConfirmAdd} style={{ padding: '7px 12px', borderRadius: 7, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{M.common.confirm}</button>
          <button onClick={() => onUpdateGroup({ isAdding: false, newItemText: '' })} style={{ padding: '7px 10px', borderRadius: 7, background: 'transparent', color: '#AAAAAA', fontSize: 12, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.cancel}</button>
        </div>
      )}
    </div>
  )
}
