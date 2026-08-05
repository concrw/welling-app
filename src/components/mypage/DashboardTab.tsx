import type { Screen, RoutinePrivacyGroup } from '../../store/appStore'
import type { AchievementResult } from '../../lib/achievement'
import { AdminPanel } from './AdminPanel'
import { WeeklyRecapCard } from './WeeklyRecapCard'
import { PeriodSelector } from './PeriodSelector'
import { RoutineAchievementCard } from './RoutineAchievementCard'
import { PastRoutinesList } from './PastRoutinesList'
import { GoalVsActualSection } from './sections/GoalVsActualSection'
import { EveningReflectionSection } from './sections/EveningReflectionSection'
import { RoutineHistorySection } from './sections/RoutineHistorySection'
import { RoutinePrivacySection } from './sections/RoutinePrivacySection'
import { InsightsSection } from './sections/InsightsSection'
import { SettingsSection } from './sections/SettingsSection'

interface PastRoutine {
  id: string
  period: string
  achievement: number
}

export type AccordionState = {
  goalVsActual: boolean
  eveningReflection: boolean
  routineHistory: boolean
  routinePrivacy: boolean
  insights: boolean
  settings: boolean
}

export function DashboardTab({
  isAdmin,
  thisWeek,
  weeklyDelta,
  dashboardPeriod,
  onPeriodChange,
  achievement,
  pastRoutines,
  expandedPrev,
  onToggleExpandPrev,
  open,
  onToggleSection,
  routinePrivacy,
  onTogglePrivacyGroup,
  onTogglePrivacyItem,
  onNavigate,
  onSignOutRequest,
}: {
  isAdmin: boolean
  thisWeek: AchievementResult
  weeklyDelta: number
  dashboardPeriod: string
  onPeriodChange: (period: string) => void
  achievement: AchievementResult
  pastRoutines: PastRoutine[]
  expandedPrev: boolean
  onToggleExpandPrev: () => void
  open: AccordionState
  onToggleSection: (key: keyof AccordionState) => void
  routinePrivacy: RoutinePrivacyGroup[]
  onTogglePrivacyGroup: (gi: number) => void
  onTogglePrivacyItem: (gi: number, ii: number) => void
  onNavigate: (screen: Screen) => void
  onSignOutRequest: () => void
}) {
  return (
    <div style={{ padding: '18px 20px', background: '#FFFFFF' }}>
      {isAdmin && <AdminPanel onNavigate={onNavigate} />}

      <WeeklyRecapCard overall={thisWeek.overall} delta={weeklyDelta} streak={thisWeek.streak} />

      <PeriodSelector active={dashboardPeriod} onChange={onPeriodChange} />

      <RoutineAchievementCard achievement={achievement} period={dashboardPeriod} />

      <PastRoutinesList items={pastRoutines} expanded={expandedPrev} onToggle={onToggleExpandPrev} />

      <div style={{ borderTop: '1px solid #EBEBEB', marginTop: 16 }}>
        <GoalVsActualSection
          open={open.goalVsActual}
          onToggle={() => onToggleSection('goalVsActual')}
          onExpand={() => onNavigate('goal-vs-actual')}
        />
        <EveningReflectionSection
          open={open.eveningReflection}
          onToggle={() => onToggleSection('eveningReflection')}
          onNavigate={() => onNavigate('evening-reflection')}
        />
        <RoutineHistorySection
          open={open.routineHistory}
          onToggle={() => onToggleSection('routineHistory')}
          onExpand={() => onNavigate('routine-history')}
          onNewRoutine={() => onNavigate('routine-edit')}
        />
        <RoutinePrivacySection
          open={open.routinePrivacy}
          onToggle={() => onToggleSection('routinePrivacy')}
          onExpand={() => onNavigate('routine-privacy')}
          routinePrivacy={routinePrivacy}
          onToggleGroup={onTogglePrivacyGroup}
          onToggleItem={onTogglePrivacyItem}
        />
        <InsightsSection
          open={open.insights}
          onToggle={() => onToggleSection('insights')}
          onExpand={() => onNavigate('insights')}
        />
        <SettingsSection
          open={open.settings}
          onToggle={() => onToggleSection('settings')}
          onNavigate={onNavigate}
          onSignOutRequest={onSignOutRequest}
        />
      </div>
      <div style={{ height: 32 }} />
    </div>
  )
}
