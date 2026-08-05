import { Toggle } from '../ui/Toggle'
import { useMessages } from '../../i18n'

export interface SyncedAlarmItem {
  id: string
  userName: string
  time: string
  items: string
  on: boolean
}

export function SyncedAlarmSection({ synced, onToggle }: { synced: SyncedAlarmItem[]; onToggle: (id: string) => void }) {
  const M = useMessages()
  return (
    <>
      <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid #EBEBEB' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{M.alarm.syncedSection}</p>
      </div>

      {synced.length === 0 ? (
        <div style={{ padding: '28px 20px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.alarm.emptySyncedTitle}</p>
          <p style={{ margin: 0, fontSize: 11, color: '#CCCCCC', fontWeight: 300 }}>{M.alarm.emptySyncedDesc}</p>
        </div>
      ) : (
        synced.map((item) => (
          <div key={item.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F5F5F5' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#111111' }}>{item.userName}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>{item.time} · {item.items}</p>
            </div>
            <Toggle on={item.on} onToggle={() => onToggle(item.id)} />
          </div>
        ))
      )}
    </>
  )
}
