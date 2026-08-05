import { Toggle } from '../ui/Toggle'
import { useMessages } from '../../i18n'

export interface CommunityAlarmItem {
  id: string
  initial: string
  name: string
  color: string
  on: boolean
}

export function CommunityAlarmSection({ communities, onToggle }: { communities: CommunityAlarmItem[]; onToggle: (id: string) => void }) {
  const M = useMessages()
  return (
    <>
      <div style={{ padding: '16px 20px 8px', marginTop: 8, borderTop: '1px solid #EBEBEB', borderBottom: '1px solid #EBEBEB' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{M.alarm.communitySection}</p>
      </div>

      {communities.map((comm) => (
        <div key={comm.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F5F5F5' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: comm.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{comm.initial}</span>
          </div>
          <p style={{ flex: 1, margin: 0, fontSize: 13, fontWeight: 600, color: '#111111' }}>{comm.name}</p>
          <Toggle on={comm.on} onToggle={() => onToggle(comm.id)} />
        </div>
      ))}
    </>
  )
}
