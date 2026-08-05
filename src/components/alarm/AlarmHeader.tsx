import { useMessages } from '../../i18n'

export function AlarmHeader({ onBack }: { onBack: () => void }) {
  const M = useMessages()
  return (
    <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.alarm.title}</span>
    </div>
  )
}
