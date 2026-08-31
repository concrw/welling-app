import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function ResetPassword() {
  const M = useMessages()
  const authError = useAppStore((s) => s.authError)
  const authLoading = useAppStore((s) => s.authLoading)
  const updatePassword = useAppStore((s) => s.updatePassword)

  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [mismatch, setMismatch] = useState(false)

  const handleSubmit = () => {
    if (newPw !== confirmPw) {
      setMismatch(true)
      return
    }
    setMismatch(false)
    updatePassword(newPw)
  }

  const inputStyle = { width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 16, background: '#FAFAFA', color: '#111111', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' as const }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'calc(40px + env(safe-area-inset-top)) 32px 40px', background: '#FFFFFF', minHeight: '100dvh' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{M.onboarding.resetTitle}</h1>
      <p style={{ margin: '0 0 36px', fontSize: 13, color: '#AAAAAA', textAlign: 'center', lineHeight: 1.8, fontWeight: 300 }}>{M.onboarding.resetDesc}</p>
      <div style={{ width: '100%', marginBottom: 14 }}>
        <p style={labelStyle}>{M.onboarding.newPasswordLabel}</p>
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={M.onboarding.passwordPlaceholder} style={inputStyle} />
      </div>
      <div style={{ width: '100%', marginBottom: 14 }}>
        <p style={labelStyle}>{M.onboarding.confirmPasswordLabel}</p>
        <input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          placeholder={M.onboarding.passwordPlaceholder}
          style={inputStyle}
        />
      </div>
      {mismatch && <p style={{ margin: '0 0 14px', fontSize: 12, color: '#C23030', width: '100%' }}>{M.onboarding.resetMismatch}</p>}
      {authError && <p style={{ margin: '0 0 14px', fontSize: 12, color: '#C23030', width: '100%' }}>{authError}</p>}
      <button
        onClick={handleSubmit}
        disabled={authLoading || newPw.length < 6 || confirmPw.length < 6}
        style={{ width: '100%', padding: 15, borderRadius: 10, background: authLoading || newPw.length < 6 || confirmPw.length < 6 ? '#CCCCCC' : '#111111', color: '#FFFFFF', fontSize: 15, fontWeight: 700, border: 'none', cursor: authLoading ? 'default' : 'pointer', letterSpacing: '.02em' }}
      >
        {authLoading ? M.onboarding.pleaseWait : M.onboarding.resetSubmit}
      </button>
    </div>
  )
}
