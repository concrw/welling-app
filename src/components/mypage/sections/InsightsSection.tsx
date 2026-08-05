import { SectionHeader } from '../../ui/SectionHeader'
import { useMessages } from '../../../i18n'
import { useAppStore } from '../../../store/appStore'
import { isConnected } from '../../../lib/googleCalendar'
import { CalendarStatusCard } from '../../insights/CalendarStatusCard'
import { RoutineInsightsList } from '../../insights/RoutineInsightsList'
import { useRoutineInsights } from '../../insights/useRoutineInsights'

export function InsightsSection({ open, onToggle, onExpand }: { open: boolean; onToggle: () => void; onExpand: () => void }) {
  const M = useMessages()
  const dashboardPeriod = useAppStore((s) => s.dashboardPeriod)
  const { insights } = useRoutineInsights()
  return (
    <div style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: open ? 12 : 0 }}>
      <SectionHeader label={M.myPage.sectionInsights} open={open} onToggle={onToggle} onExpand={onExpand} />
      {open && (
        <div>
          <CalendarStatusCard calendarConnected={isConnected()} calendarDateLabel={M.insights.syncedLabel(new Date())} />
          <RoutineInsightsList dashboardPeriod={dashboardPeriod} insights={insights} />
        </div>
      )}
    </div>
  )
}
