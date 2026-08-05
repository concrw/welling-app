import { useMessages } from '../../i18n'

export function RoutineEditHeader({
  onBack,
  onCalendarSync,
  onSave,
  syncState,
}: {
  onBack: () => void
  onCalendarSync: () => void
  onSave: () => void
  syncState: 'idle' | 'loading' | 'done' | 'error'
}) {
  const M = useMessages()
  return (
    <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.routineEdit.title}</span>
      <button
        onClick={onCalendarSync}
        disabled={syncState === 'loading'}
        style={{ padding: '7px 12px', borderRadius: 8, background: '#F0F0F0', color: '#444444', fontSize: 12, fontWeight: 600, border: 'none', cursor: syncState === 'loading' ? 'default' : 'pointer', marginRight: 6, display: 'flex', alignItems: 'center', gap: 5, opacity: syncState === 'loading' ? 0.6 : 1 }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.5" y="1.5" width="12" height="11" rx="1.5" stroke="#444444" strokeWidth="1.2"/><path d="M0.5 5h12" stroke="#444444" strokeWidth="1.2"/><path d="M4 0.5v2M9 0.5v2" stroke="#444444" strokeWidth="1.2" strokeLinecap="round"/></svg>
        {syncState === 'loading' ? M.routineEdit.syncing : M.routineEdit.calendarSync}
      </button>
      <button onClick={onSave} style={{ padding: '7px 16px', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}>{M.common.save}</button>
    </div>
  )
}
