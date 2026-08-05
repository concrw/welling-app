import { useMessages } from '../../i18n'

interface FirstRecordScreenProps {
  goToMainWithRecord: () => void
  goToMain: () => void
}

export function FirstRecordScreen({ goToMainWithRecord, goToMain }: FirstRecordScreenProps) {
  const M = useMessages()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'calc(40px + env(safe-area-inset-top)) 32px 40px', background: '#FFFFFF', minHeight: '100svh' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid #EBEBEB' }}>
        <span style={{ fontSize: 32, color: '#111111', fontWeight: 200, lineHeight: 1 }}>+</span>
      </div>
      <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 900, letterSpacing: '-.5px', color: '#111111', textAlign: 'center' }}>{M.onboarding.firstRecordTitle}</h2>
      <p style={{ margin: '0 0 44px', fontSize: 13, color: '#AAAAAA', textAlign: 'center', lineHeight: 1.8, fontWeight: 300 }}>{M.onboarding.firstRecordSubtitle}</p>
      <button onClick={goToMainWithRecord} style={{ width: '100%', padding: 15, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', marginBottom: 12, cursor: 'pointer' }}>
        {M.onboarding.recordNow}
      </button>
      <button onClick={goToMain} style={{ width: '100%', padding: 12, borderRadius: 10, background: 'transparent', color: '#AAAAAA', fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: 300 }}>
        {M.onboarding.later}
      </button>
    </div>
  )
}
