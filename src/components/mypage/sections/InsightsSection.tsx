import { SectionHeader } from '../../ui/SectionHeader'
import { useMessages } from '../../../i18n'

// TODO: 실제 조건별 달성률 분석 데이터로 교체 필요 — 현재 목업 고정값
const INSIGHTS_DATA = [
  { condition: 'On team meeting days', routine: 'Lunch', lowRate: 38, avgRate: 85 },
  { condition: 'On external appointment days', routine: 'Evening', lowRate: 22, avgRate: 78 },
  { condition: 'On work-from-home days', routine: 'Morning', lowRate: 91, avgRate: 72 },
]

export function InsightsSection({ open, onToggle, onExpand }: { open: boolean; onToggle: () => void; onExpand: () => void }) {
  const M = useMessages()
  return (
    <div style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: open ? 12 : 0 }}>
      <SectionHeader label={M.myPage.sectionInsights} open={open} onToggle={onToggle} onExpand={onExpand} />
      {open && (
        <div>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#F5F5F5', border: '1px solid #EBEBEB', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#111111', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 1px', fontSize: 11, fontWeight: 700, color: '#111111' }}>{M.insights.calendarConnected}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA', fontWeight: 300 }}>{M.insights.syncedLabel(new Date())}</p>
            </div>
            <span style={{ fontSize: 10, color: '#111111', fontWeight: 600, cursor: 'pointer' }}>{M.insights.editLink}</span>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.insights.routineInsightsTitle}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {INSIGHTS_DATA.map((ins, i) => (
              <div key={i} style={{ padding: '11px 12px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#111111' }}>{ins.condition}</p>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 9, color: '#AAAAAA', fontWeight: 300, textTransform: 'uppercase' }}>{ins.routine}</p>
                    <p style={{ margin: '1px 0 0', fontSize: 20, fontWeight: 900, color: '#DC2626', letterSpacing: '-.5px' }}>{ins.lowRate}%</p>
                  </div>
                  <p style={{ margin: '0 0 3px', fontSize: 10, color: '#CCCCCC' }}>{M.insights.vsAvg}</p>
                  <div>
                    <p style={{ margin: 0, fontSize: 9, color: '#AAAAAA', fontWeight: 300, textTransform: 'uppercase' }}>{M.insights.avgLabel}</p>
                    <p style={{ margin: '1px 0 0', fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{ins.avgRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
            <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 700, color: '#111111' }}>{M.myPage.suggestedRoutineTitle}</p>
            <p style={{ margin: '0 0 10px', fontSize: 10, color: '#AAAAAA', fontWeight: 300 }}>{M.myPage.suggestedRoutinePeople}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 11, color: '#111111' }}>Morning · Stretching 5m after wake-up</p>
              <p style={{ margin: 0, fontSize: 11, color: '#111111' }}>Lunch · Stairs + water</p>
              <p style={{ margin: 0, fontSize: 11, color: '#111111' }}>Evening · 10m walk after meeting</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ flex: 1, padding: '8px', borderRadius: 8, background: '#F5F5F5', color: '#111111', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{M.myPage.todayOnly}</button>
              <button style={{ flex: 1, padding: '8px', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{M.myPage.saveAsRoutine}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
