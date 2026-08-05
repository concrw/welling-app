import type { ScheduleKeyword } from '../../lib/calendarInsights'
import { useMessages } from '../../i18n'

export interface CalendarKeywordInsight {
  keyword: ScheduleKeyword
  dayCount: number
  avgOnDays: number
}

interface CalendarKeywordInsightsListProps {
  calendarKeywordInsights: CalendarKeywordInsight[]
  overallRate: number
  minSnapshotDaysForKeyword: number
}

export function CalendarKeywordInsightsList({ calendarKeywordInsights, overallRate, minSnapshotDaysForKeyword }: CalendarKeywordInsightsListProps) {
  const M = useMessages()
  return (
    <>
      <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.insights.calendarKeywordTitle}</p>
      {calendarKeywordInsights.length === 0 ? (
        <div style={{ padding: '13px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB', marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300, lineHeight: 1.6 }}>
            {M.insights.notEnoughData}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {calendarKeywordInsights.map((ins) => (
            <div key={ins.keyword} style={{ padding: '13px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#111111' }}>
                {M.insights.keywordDays(ins.keyword, ins.dayCount)}
              </p>
              {ins.dayCount < minSnapshotDaysForKeyword ? (
                <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>{M.insights.needMoreData}</p>
              ) : (
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase' }}>{M.insights.onTheseDays}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: ins.avgOnDays < overallRate ? '#DC2626' : '#111111', letterSpacing: '-.5px' }}>{ins.avgOnDays}%</p>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#CCCCCC' }}>{M.insights.vsAvg}</p>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase' }}>{M.insights.overallAvg}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{overallRate}%</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
