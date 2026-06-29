import { useAppStore } from '../store/appStore'

const PERIODS = [
  { period: 'May 1 – May 31', achievement: 82 },
  { period: 'Apr 1 – Apr 30', achievement: 71 },
  { period: 'Mar 1 – Mar 31', achievement: 58 },
]

export default function RoutineHistory() {
  const goBack = useAppStore((s) => s.goBack)
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>Routine History</span>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: 16, borderRadius: 12, background: '#111111', color: '#fff' }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, opacity: 0.6, letterSpacing: '.08em', textTransform: 'uppercase' }}>Current</p>
          <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800 }}>Jun 2 – now</p>
          <p style={{ margin: '0 0 10px', fontSize: 11, opacity: 0.6 }}>64% · Squat, Stretching + 5 more</p>
          <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
            <div style={{ width: '64%', height: 3, background: '#fff', borderRadius: 3 }} />
          </div>
        </div>

        {PERIODS.map((p) => (
          <div key={p.period} style={{ padding: '14px 16px', borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111111' }}>{p.period}</p>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#111111' }}>{p.achievement}%</span>
            </div>
            <div style={{ height: 3, borderRadius: 3, background: '#EBEBEB', overflow: 'hidden' }}>
              <div style={{ width: `${p.achievement}%`, height: 3, background: '#111111', borderRadius: 3 }} />
            </div>
          </div>
        ))}

        <div onClick={() => navigate('routine-edit')} style={{ padding: 14, borderRadius: 10, border: '1px dashed #CCCCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>새 루틴 시작</span>
        </div>
      </div>
    </div>
  )
}
