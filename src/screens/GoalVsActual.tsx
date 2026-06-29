import { useAppStore } from '../store/appStore'

const today = new Date()
const TODAY_LABEL = `Today, ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

const TIME_GROUPS = [
  {
    time: '6:00 AM',
    items: [
      { statusLabel: 'Done', statusColor: '#16A34A', statusLabelBg: '#DCFCE7', statusBg: '#F0FDF4', statusBorder: '#BBF7D0', name: 'Morning Walk', actual: '32 min', hasActual: true },
      { statusLabel: 'Done', statusColor: '#16A34A', statusLabelBg: '#DCFCE7', statusBg: '#F0FDF4', statusBorder: '#BBF7D0', name: 'Cold Shower', actual: '5 min', hasActual: true },
      { statusLabel: 'Done', statusColor: '#16A34A', statusLabelBg: '#DCFCE7', statusBg: '#F0FDF4', statusBorder: '#BBF7D0', name: 'Meditation', actual: '10 min', hasActual: true },
    ],
  },
  {
    time: '12:00 PM',
    items: [
      { statusLabel: 'Alt', statusColor: '#B45309', statusLabelBg: '#FEF3C7', statusBg: '#FFFBEB', statusBorder: '#FDE68A', name: 'Running', actual: '4.2 km (goal 5km)', hasActual: true },
      { statusLabel: 'Alt', statusColor: '#B45309', statusLabelBg: '#FEF3C7', statusBg: '#FFFBEB', statusBorder: '#FDE68A', name: 'Hydration', actual: '1800 ml (goal 2L)', hasActual: true },
    ],
  },
  {
    time: '9:00 PM',
    items: [
      { statusLabel: 'Missed', statusColor: '#DC2626', statusLabelBg: '#FEE2E2', statusBg: '#FFF5F5', statusBorder: '#FECACA', name: 'Journaling', actual: '', hasActual: false },
    ],
  },
]

export default function GoalVsActual() {
  const goBack = useAppStore((s) => s.goBack)

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>Goal vs. Actual</span>
      </div>

      <div style={{ padding: 20 }}>
        <p style={{ margin: '0 0 16px', fontSize: 11, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em' }}>{TODAY_LABEL}</p>

        {TIME_GROUPS.map((tg, gi) => (
          <div key={gi} style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{tg.time}</p>
            {tg.items.map((ti, ii) => (
              <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderRadius: 8, background: ti.statusBg, marginBottom: 5, border: `1px solid ${ti.statusBorder}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: ti.statusColor, background: ti.statusLabelBg, padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 1, letterSpacing: '.04em' }}>{ti.statusLabel}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#111111' }}>{ti.name}</p>
                  {ti.hasActual && <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>→ {ti.actual}</p>}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 16, padding: '10px 14px', borderRadius: 8, background: '#FAFAFA' }}>
          <span style={{ fontSize: 11, color: '#AAAAAA' }}>Done · green</span>
          <span style={{ fontSize: 11, color: '#AAAAAA' }}>Alt · amber</span>
          <span style={{ fontSize: 11, color: '#AAAAAA' }}>Missed · red</span>
        </div>
      </div>
    </div>
  )
}
