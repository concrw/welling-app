import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function SocialNickname() {
  const M = useMessages()
  const nicknameInput = useAppStore((s) => s.nicknameInput)
  const setNicknameInput = useAppStore((s) => s.setNicknameInput)
  const authError = useAppStore((s) => s.authError)
  const authLoading = useAppStore((s) => s.authLoading)
  const submitSocialNickname = useAppStore((s) => s.submitSocialNickname)

  const valid = nicknameInput.trim().length >= 2

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'calc(40px + env(safe-area-inset-top)) 32px 40px', background: '#FFFFFF', minHeight: '100dvh' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{M.onboarding.socialNicknameTitle}</h1>
      <p style={{ margin: '0 0 36px', fontSize: 13, color: '#AAAAAA', textAlign: 'center', lineHeight: 1.8, fontWeight: 300 }}>{M.onboarding.socialNicknameDesc}</p>
      <div style={{ width: '100%', marginBottom: 14 }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{M.onboarding.usernameLabel}</p>
        <input
          value={nicknameInput}
          onChange={(e) => setNicknameInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && valid) submitSocialNickname() }}
          placeholder={M.onboarding.usernamePlaceholder}
          maxLength={20}
          style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 16, background: '#FAFAFA', color: '#111111', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      {authError && <p style={{ margin: '0 0 14px', fontSize: 12, color: '#C23030', width: '100%' }}>{authError}</p>}
      <button
        onClick={submitSocialNickname}
        disabled={authLoading || !valid}
        style={{ width: '100%', padding: 15, borderRadius: 10, background: authLoading || !valid ? '#CCCCCC' : '#111111', color: '#FFFFFF', fontSize: 15, fontWeight: 700, border: 'none', cursor: authLoading || !valid ? 'default' : 'pointer', letterSpacing: '.02em' }}
      >
        {authLoading ? M.onboarding.pleaseWait : M.onboarding.getStarted}
      </button>
    </div>
  )
}
