import { useMessages } from '../../i18n'

type AuthMode = 'signup' | 'login'

interface UsernameScreenProps {
  nicknameInput: string
  setNicknameInput: (value: string) => void
  emailInput: string
  setEmailInput: (value: string) => void
  passwordInput: string
  setPasswordInput: (value: string) => void
  authMode: AuthMode
  setAuthMode: (mode: AuthMode) => void
  authError: string | null
  authLoading: boolean
  submitNickname: () => void
  submitLogin: () => void
  goFeedDemo: () => void
}

export function UsernameScreen({
  nicknameInput,
  setNicknameInput,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  authMode,
  setAuthMode,
  authError,
  authLoading,
  submitNickname,
  submitLogin,
  goFeedDemo,
}: UsernameScreenProps) {
  const M = useMessages()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'calc(40px + env(safe-area-inset-top)) 32px 40px', background: '#FFFFFF', minHeight: '100svh' }}>
      <img src="/uploads/welling-black.png" style={{ height: 58, width: 'auto', marginBottom: 20 }} alt={M.onboarding.logoAlt} />
      <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, color: '#111111', letterSpacing: -1 }}>WELLING</h1>
      <p style={{ margin: '0 0 48px', fontSize: 14, color: '#AAAAAA', textAlign: 'center', lineHeight: 1.8, fontWeight: 300 }}>
        {M.onboarding.taglineLine1}<br />{M.onboarding.taglineLine2}
      </p>
      <div style={{ display: 'flex', width: '100%', marginBottom: 20, borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB', padding: 3 }}>
        <button
          onClick={() => setAuthMode('signup')}
          style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: authMode === 'signup' ? '#111111' : 'transparent', color: authMode === 'signup' ? '#FFFFFF' : '#AAAAAA' }}
        >
          {M.onboarding.signUp}
        </button>
        <button
          onClick={() => setAuthMode('login')}
          style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: authMode === 'login' ? '#111111' : 'transparent', color: authMode === 'login' ? '#FFFFFF' : '#AAAAAA' }}
        >
          {M.onboarding.logIn}
        </button>
      </div>
      {authMode === 'signup' && (
        <div style={{ width: '100%', marginBottom: 14 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{M.onboarding.usernameLabel}</p>
          <input
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder={M.onboarding.usernamePlaceholder}
            maxLength={10}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 16, background: '#FAFAFA', color: '#111111', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      )}
      <div style={{ width: '100%', marginBottom: 14 }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{M.onboarding.emailLabel}</p>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder={M.onboarding.emailPlaceholder}
          style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 16, background: '#FAFAFA', color: '#111111', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ width: '100%', marginBottom: 14 }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{M.onboarding.passwordLabel}</p>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') (authMode === 'signup' ? submitNickname() : submitLogin()) }}
          placeholder={M.onboarding.passwordPlaceholder}
          style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 16, background: '#FAFAFA', color: '#111111', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      {authError && (
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#C23030', width: '100%' }}>{authError}</p>
      )}
      <button
        onClick={() => (authMode === 'signup' ? submitNickname() : submitLogin())}
        disabled={authLoading || (authMode === 'signup' ? nicknameInput.trim().length < 2 : false) || emailInput.trim().length < 3 || passwordInput.length < 6}
        style={{ width: '100%', padding: 15, borderRadius: 10, background: authLoading ? '#CCCCCC' : '#111111', color: '#FFFFFF', fontSize: 15, fontWeight: 700, border: 'none', cursor: authLoading ? 'default' : 'pointer', letterSpacing: '.02em' }}
      >
        {authLoading ? M.onboarding.pleaseWait : authMode === 'signup' ? M.onboarding.getStarted : M.onboarding.logIn}
      </button>
      <p style={{ marginTop: 20, fontSize: 11, color: '#CCCCCC', textAlign: 'center', lineHeight: 1.7, fontWeight: 300 }}>
        {M.onboarding.termsNotice}
      </p>
      <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #EBEBEB', width: '100%', textAlign: 'center' }}>
        <button onClick={goFeedDemo} style={{ background: 'none', border: 'none', fontSize: 11, color: '#CCCCCC', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {M.onboarding.skipToDemo}
        </button>
      </div>
    </div>
  )
}
