import { useState } from 'react'
import { useAppStore } from '../store/appStore'

const SYNCED_ITEMS = [
  { id: 's1', userName: '정도윤', time: '06:00 AM', items: 'Stretching 10m · Water · Meditation 5m', on: true },
  { id: 's2', userName: '한다솜', time: '12:00 PM', items: 'Stairs · Salad', on: false },
]

const COMMUNITY_ITEMS = [
  { id: 'c1', initial: 'R', name: 'Morning Runners', color: '#0984E3', on: true },
  { id: 'c2', initial: 'C', name: 'Clean Eaters', color: '#00A389', on: true },
  { id: 'c3', initial: 'B', name: 'Book Club 30m', color: '#7C3AED', on: false },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#111111' : '#DDDDDD', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}
    >
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 20 : 2, boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
    </div>
  )
}

export default function Alarm() {
  const goBack = useAppStore((s) => s.goBack)
  const [synced, setSynced] = useState(SYNCED_ITEMS)
  const [communities, setCommunities] = useState(COMMUNITY_ITEMS)

  const toggleSynced = (id: string) => setSynced((prev) => prev.map((a) => a.id === id ? { ...a, on: !a.on } : a))
  const toggleComm = (id: string) => setCommunities((prev) => prev.map((c) => c.id === id ? { ...c, on: !c.on } : c))

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>알람</span>
      </div>

      <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid #EBEBEB' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>루틴싱크 알람</p>
      </div>

      {synced.length === 0 ? (
        <div style={{ padding: '28px 20px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>싱크된 루틴이 없어요.</p>
          <p style={{ margin: 0, fontSize: 11, color: '#CCCCCC', fontWeight: 300 }}>다른 유저 프로필에서 루틴싱크를 눌러보세요.</p>
        </div>
      ) : (
        synced.map((item) => (
          <div key={item.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F5F5F5' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#111111' }}>{item.userName}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>{item.time} · {item.items}</p>
            </div>
            <Toggle on={item.on} onToggle={() => toggleSynced(item.id)} />
          </div>
        ))
      )}

      <div style={{ padding: '16px 20px 8px', marginTop: 8, borderTop: '1px solid #EBEBEB', borderBottom: '1px solid #EBEBEB' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>커뮤니티 알람</p>
      </div>

      {communities.map((comm) => (
        <div key={comm.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F5F5F5' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: comm.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{comm.initial}</span>
          </div>
          <p style={{ flex: 1, margin: 0, fontSize: 13, fontWeight: 600, color: '#111111' }}>{comm.name}</p>
          <Toggle on={comm.on} onToggle={() => toggleComm(comm.id)} />
        </div>
      ))}

      <div style={{ height: 40 }} />
    </div>
  )
}
