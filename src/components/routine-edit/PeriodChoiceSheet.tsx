import { useMessages } from '../../i18n'

export function PeriodChoiceSheet({
  onConfirmNewPeriod,
  onConfirmOverwrite,
}: {
  onConfirmNewPeriod: () => void
  onConfirmOverwrite: () => void
}) {
  const M = useMessages()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: '24px 20px calc(24px + env(safe-area-inset-bottom))' }}>
        <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.routineEdit.periodTitle}</p>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#AAAAAA', lineHeight: 1.5 }}>{M.routineEdit.periodDesc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onConfirmNewPeriod} style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: '#111111', color: '#FFFFFF', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{M.routineEdit.startNew}</button>
          <button onClick={onConfirmOverwrite} style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: '#F5F5F5', color: '#111111', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{M.routineEdit.overwrite}</button>
        </div>
      </div>
    </div>
  )
}
