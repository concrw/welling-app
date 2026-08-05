import { SectionHeader } from '../../ui/SectionHeader'
import { useMessages } from '../../../i18n'
import { useRoutineHistorySummary } from '../useRoutineHistorySummary'

export function RoutineHistorySection({ open, onToggle, onExpand, onNewRoutine }: { open: boolean; onToggle: () => void; onExpand: () => void; onNewRoutine: () => void }) {
  const M = useMessages()
  const { currentPeriodLabel, currentCompletion, itemSummary, priorPeriods, hasRoutine } = useRoutineHistorySummary()
  return (
    <div style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: open ? 12 : 0 }}>
      <SectionHeader label={M.myPage.sectionRoutineHistory} open={open} onToggle={onToggle} onExpand={onExpand} />
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hasRoutine && (
            <div style={{ padding: 14, borderRadius: 12, background: '#111111', color: '#fff' }}>
              <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 600, opacity: 0.6, letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.routineHistory.currentBadge}</p>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 800 }}>{currentPeriodLabel}</p>
              <p style={{ margin: '0 0 8px', fontSize: 11, opacity: 0.6 }}>{M.routineHistory.completionSummary(currentCompletion, itemSummary)}</p>
              <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
                <div style={{ width: `${currentCompletion}%`, height: 3, background: '#fff', borderRadius: 3 }} />
              </div>
            </div>
          )}
          {priorPeriods.length === 0 && (
            <p style={{ margin: '4px 0', fontSize: 12, color: '#AAAAAA', fontWeight: 300, textAlign: 'center', padding: '4px 0' }}>{M.routineHistory.empty}</p>
          )}
          {priorPeriods.map((p) => (
            <div key={p.id} style={{ padding: '12px 14px', borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111111' }}>{p.period}</p>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#111111' }}>{p.achievement}%</span>
              </div>
              <div style={{ height: 3, borderRadius: 3, background: '#EBEBEB', overflow: 'hidden' }}>
                <div style={{ width: `${p.achievement}%`, height: 3, background: '#111111', borderRadius: 3 }} />
              </div>
            </div>
          ))}
          <div onClick={onNewRoutine} style={{ padding: 12, borderRadius: 10, border: '1px dashed #CCCCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{M.routineHistory.newRoutine}</span>
          </div>
        </div>
      )}
    </div>
  )
}
