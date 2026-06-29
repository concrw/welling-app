import { useAppStore } from '../store/appStore'

const today = new Date()
const CALENDAR_DATE_LABEL = `Synced ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

const INSIGHTS = [
  { condition: 'On team meeting days', routine: 'Lunch', lowRate: 38, avgRate: 85 },
  { condition: 'On external appointment days', routine: 'Evening', lowRate: 22, avgRate: 78 },
  { condition: 'On work-from-home days', routine: 'Morning', lowRate: 91, avgRate: 72 },
]

export default function Insights() {
  const goBack = useAppStore((s) => s.goBack)

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>Insights</span>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F5F5F5', border: '1px solid #EBEBEB', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#111111', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111' }}>Google Calendar connected</p>
            <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>{CALENDAR_DATE_LABEL}</p>
          </div>
          <span style={{ fontSize: 11, color: '#111111', fontWeight: 600, cursor: 'pointer', letterSpacing: '.04em' }}>Edit</span>
        </div>

        <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>Routine Insights</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {INSIGHTS.map((ins, i) => (
            <div key={i} style={{ padding: '13px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{ins.condition}</p>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase' }}>{ins.routine}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: '#DC2626', letterSpacing: '-.5px' }}>{ins.lowRate}%</p>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: '#CCCCCC' }}>vs avg</p>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase' }}>Avg</p>
                  <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{ins.avgRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 14, borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#111111' }}>Suggested routine for team meeting days</p>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>75 people with similar schedules do this</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#111111' }}>Morning · Stretching 5m after wake-up</p>
            <p style={{ margin: 0, fontSize: 12, color: '#111111' }}>Lunch · Stairs + water</p>
            <p style={{ margin: 0, fontSize: 12, color: '#111111' }}>Evening · 10m walk after meeting</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '9px', borderRadius: 8, background: '#F5F5F5', color: '#111111', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}>Today only</button>
            <button style={{ flex: 1, padding: '9px', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}>Save as routine</button>
          </div>
        </div>
      </div>
    </div>
  )
}
