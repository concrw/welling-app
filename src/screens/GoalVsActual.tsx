import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'
import { GoalVsActualHeader } from '../components/goal-vs-actual/GoalVsActualHeader'
import { GoalVsActualLegend } from '../components/goal-vs-actual/GoalVsActualLegend'
import { GoalVsActualTimeGroups } from '../components/goal-vs-actual/GoalVsActualTimeGroups'
import { useGoalVsActual } from '../components/goal-vs-actual/useGoalVsActual'

export default function GoalVsActual() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const { timeGroups, getStatus } = useGoalVsActual()

  return (
    <div>
      <GoalVsActualHeader onBack={goBack} />

      <div style={{ padding: 20 }}>
        <p style={{ margin: '0 0 16px', fontSize: 11, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em' }}>{M.goalVsActual.todayLabel(new Date())}</p>

        <GoalVsActualTimeGroups timeGroups={timeGroups} getStatus={getStatus} />

        <GoalVsActualLegend />
      </div>
    </div>
  )
}
