import { useMessages } from '../../i18n'

export interface CommunityInsight {
  condition: string
  routine: string
  lowRate: number
  avgRate: number
}

interface RoutineInsightsListProps {
  dashboardPeriod: string
  insights: CommunityInsight[]
}

export function RoutineInsightsList({ dashboardPeriod, insights }: RoutineInsightsListProps) {
  const M = useMessages()
  return (
    <>
      <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        {M.myPage.periods[dashboardPeriod] ?? dashboardPeriod}
      </p>
      <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.insights.routineInsightsTitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ padding: '13px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{ins.condition}</p>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase' }}>{ins.routine}</p>
                <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: '#DC2626', letterSpacing: '-.5px' }}>{ins.lowRate}%</p>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#CCCCCC' }}>{M.insights.vsAvg}</p>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase' }}>{M.insights.avgLabel}</p>
                <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{ins.avgRate}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
