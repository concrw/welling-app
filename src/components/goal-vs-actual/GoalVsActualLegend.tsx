import { useMessages } from '../../i18n'

export function GoalVsActualLegend() {
  const M = useMessages()
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 14px', borderRadius: 8, background: '#FAFAFA' }}>
      <span style={{ fontSize: 11, color: '#AAAAAA' }}>{M.goalVsActual.legendDone}</span>
      <span style={{ fontSize: 11, color: '#AAAAAA' }}>{M.goalVsActual.legendAlt}</span>
      <span style={{ fontSize: 11, color: '#AAAAAA' }}>{M.goalVsActual.legendMissed}</span>
    </div>
  )
}
