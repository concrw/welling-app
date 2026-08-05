import { useMessages } from '../../i18n'

interface CalendarStatusCardProps {
  calendarConnected: boolean
  calendarDateLabel: string
}

export function CalendarStatusCard({ calendarConnected, calendarDateLabel }: CalendarStatusCardProps) {
  const M = useMessages()
  return (
    <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F5F5F5', border: '1px solid #EBEBEB', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: calendarConnected ? '#111111' : '#CCCCCC', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111' }}>
          {calendarConnected ? M.insights.calendarConnected : M.insights.calendarNotConnected}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>
          {calendarConnected ? calendarDateLabel : M.insights.connectPrompt}
        </p>
      </div>
      <span style={{ fontSize: 11, color: '#111111', fontWeight: 600, cursor: 'pointer', letterSpacing: '.04em' }}>{M.insights.editLink}</span>
    </div>
  )
}
