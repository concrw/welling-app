import { SectionHeader } from '../../ui/SectionHeader'
import { useMessages } from '../../../i18n'

// TODO: store(routineGroups/routineHistory)에서 goal-vs-actual 실데이터를 파생하도록 교체 필요 — 현재 목업 고정값
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

export function GoalVsActualSection({ open, onToggle, onExpand }: { open: boolean; onToggle: () => void; onExpand: () => void }) {
  const M = useMessages()
  return (
    <div style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: open ? 12 : 0 }}>
      <SectionHeader label={M.myPage.sectionGoalVsActual} open={open} onToggle={onToggle} onExpand={onExpand} />
      {open && (
        <div>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em' }}>{M.goalVsActual.todayLabel(new Date())}</p>
          {TIME_GROUPS.map((tg, gi) => (
            <div key={gi} style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{tg.time}</p>
              {tg.items.map((ti, ii) => (
                <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 8, background: ti.statusBg, marginBottom: 4, border: `1px solid ${ti.statusBorder}` }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: ti.statusColor, background: ti.statusLabelBg, padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 1, letterSpacing: '.04em' }}>{ti.statusLabel}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#111111' }}>{ti.name}</p>
                    {ti.hasActual && <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>→ {ti.actual}</p>}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, padding: '8px 12px', borderRadius: 8, background: '#FAFAFA', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#AAAAAA' }}>{M.goalVsActual.legendDone}</span>
            <span style={{ fontSize: 11, color: '#AAAAAA' }}>{M.goalVsActual.legendAlt}</span>
            <span style={{ fontSize: 11, color: '#AAAAAA' }}>{M.goalVsActual.legendMissed}</span>
          </div>
        </div>
      )}
    </div>
  )
}
