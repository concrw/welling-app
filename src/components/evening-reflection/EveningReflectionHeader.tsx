import { useMessages } from '../../i18n'

export function EveningReflectionHeader({ onBack }: { onBack: () => void }) {
  const M = useMessages()
  return (
    <div style={{ padding: 'calc(16px + env(safe-area-inset-top)) 20px 14px', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', display: 'flex', alignItems: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111111', letterSpacing: '-.3px' }}>{M.eveningReflection.title}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>
          {M.eveningReflection.dateLabel(new Date())}
        </p>
      </div>
    </div>
  )
}
