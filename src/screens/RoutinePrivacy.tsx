import { useState } from 'react'
import { useAppStore } from '../store/appStore'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#111111' : '#DDDDDD', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 20 : 2, boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
    </div>
  )
}

const INIT_GROUPS = [
  {
    name: 'Morning Routine',
    on: true,
    items: [{ name: 'Morning Walk', on: true }, { name: 'Cold Shower', on: true }, { name: 'Meditation', on: false }, { name: 'Journaling', on: false }],
  },
  {
    name: 'Evening Routine',
    on: true,
    items: [{ name: 'Running 5km', on: true }, { name: 'Stretching', on: true }, { name: 'Reading', on: true }],
  },
]

export default function RoutinePrivacy() {
  const goBack = useAppStore((s) => s.goBack)
  const [groups, setGroups] = useState(INIT_GROUPS)

  const toggleGroup = (gi: number) =>
    setGroups((prev) => prev.map((g, i) => i === gi ? { ...g, on: !g.on } : g))

  const toggleItem = (gi: number, ii: number) =>
    setGroups((prev) => prev.map((g, i) => i === gi ? { ...g, items: g.items.map((item, j) => j === ii ? { ...item, on: !item.on } : item) } : g))

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>Routine Privacy</span>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', lineHeight: 1.7, fontWeight: 300 }}>Control visibility per item. Hidden items won't appear on your profile.</p>
        {groups.map((pg, gi) => (
          <div key={pg.name} style={{ borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EBEBEB' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: pg.on ? '#111111' : '#AAAAAA' }}>{pg.name}</span>
              <Toggle on={pg.on} onToggle={() => toggleGroup(gi)} />
            </div>
            {pg.items.map((pgi, ii) => (
              <div key={pgi.name} style={{ padding: '10px 16px 10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F5F5F5' }}>
                <span style={{ fontSize: 12, color: pgi.on ? '#111111' : '#AAAAAA', fontWeight: 300 }}>· {pgi.name}</span>
                <Toggle on={pgi.on} onToggle={() => toggleItem(gi, ii)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
