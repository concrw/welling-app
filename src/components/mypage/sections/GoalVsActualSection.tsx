import { SectionHeader } from '../../ui/SectionHeader'
import { useMessages } from '../../../i18n'
import { GoalVsActualTimeGroups } from '../../goal-vs-actual/GoalVsActualTimeGroups'
import { useGoalVsActual } from '../../goal-vs-actual/useGoalVsActual'

export function GoalVsActualSection({ open, onToggle, onExpand }: { open: boolean; onToggle: () => void; onExpand: () => void }) {
  const M = useMessages()
  const { timeGroups, getStatus } = useGoalVsActual()
  return (
    <div style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: open ? 12 : 0 }}>
      <SectionHeader label={M.myPage.sectionGoalVsActual} open={open} onToggle={onToggle} onExpand={onExpand} />
      {open && (
        <div>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em' }}>{M.goalVsActual.todayLabel(new Date())}</p>
          <GoalVsActualTimeGroups timeGroups={timeGroups} getStatus={getStatus} />
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
