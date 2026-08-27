import { useMessages } from '../../i18n'

type AuthMode = 'signup' | 'login' | 'forgot'

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
  authNotice: string
  authLoading: boolean
  submitNickname: () => void
  submitLogin: () => void
  requestPasswordReset: () => void
  signInWithProvider: (provider: 'google' | 'kakao') => void
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
  authNotice,
  authLoading,
  submitNickname,
  submitLogin,
  requestPasswordReset,
  signInWithProvider,
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
      {authMode !== 'forgot' && (
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
      )}
      {authError && (
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#C23030', width: '100%' }}>{authError}</p>
      )}
      {authNotice && (
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#16A34A', width: '100%' }}>{authNotice}</p>
      )}
      <button
        onClick={() => (authMode === 'signup' ? submitNickname() : authMode === 'login' ? submitLogin() : requestPasswordReset())}
        disabled={authLoading || (authMode === 'signup' ? nicknameInput.trim().length < 2 : false) || emailInput.trim().length < 3 || (authMode !== 'forgot' && passwordInput.length < 6)}
        style={{ width: '100%', padding: 15, borderRadius: 10, background: authLoading ? '#CCCCCC' : '#111111', color: '#FFFFFF', fontSize: 15, fontWeight: 700, border: 'none', cursor: authLoading ? 'default' : 'pointer', letterSpacing: '.02em' }}
      >
        {authLoading ? M.onboarding.pleaseWait : authMode === 'signup' ? M.onboarding.getStarted : authMode === 'login' ? M.onboarding.logIn : M.onboarding.sendResetLink}
      </button>
      {authMode === 'login' && (
        <button onClick={() => setAuthMode('forgot')} style={{ marginTop: 14, background: 'none', border: 'none', fontSize: 12, color: '#AAAAAA', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          {M.onboarding.forgotPassword}
        </button>
      )}
      {authMode === 'forgot' && (
        <button onClick={() => setAuthMode('login')} style={{ marginTop: 14, background: 'none', border: 'none', fontSize: 12, color: '#AAAAAA', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          {M.onboarding.backToLogin}
        </button>
      )}
      {authMode !== 'forgot' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', margin: '18px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: '#EBEBEB' }} />
            <span style={{ fontSize: 11, color: '#CCCCCC', letterSpacing: '.06em', textTransform: 'uppercase' }}>{M.onboarding.orDivider}</span>
            <div style={{ flex: 1, height: 1, background: '#EBEBEB' }} />
          </div>
          <button
            onClick={() => signInWithProvider('google')}
            style={{ width: '100%', padding: 13, borderRadius: 10, background: '#FFFFFF', color: '#111111', fontSize: 14, fontWeight: 600, border: '1px solid #DDDDDD', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}
          >
            <svg width="17" height="17" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {M.onboarding.continueWithGoogle}
          </button>
          <button
            onClick={() => signInWithProvider('kakao')}
            style={{ width: '100%', padding: 13, borderRadius: 10, background: '#FEE500', color: '#191919', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#191919" d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.85 5.18 4.62 6.55l-1.18 4.33c-.1.38.33.68.66.46l5.18-3.43c.24.02.48.03.72.03 5.52 0 10-3.48 10-7.77S17.52 3 12 3z"/>
            </svg>
            {M.onboarding.continueWithKakao}
          </button>
        </>
      )}
      <p style={{ marginTop: 20, fontSize: 11, color: '#CCCCCC', textAlign: 'center', lineHeight: 1.7, fontWeight: 300 }}>
        {M.onboarding.termsNoticePrefix}
        <a href="/terms.html" target="_blank" rel="noopener" style={{ color: '#AAAAAA' }}>{M.onboarding.termsLinkLabel}</a>
        {M.onboarding.termsNoticeAnd}
        <a href="/privacy.html" target="_blank" rel="noopener" style={{ color: '#AAAAAA' }}>{M.onboarding.privacyLinkLabel}</a>
        {M.onboarding.termsNoticeSuffix}
      </p>
      <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #EBEBEB', width: '100%', textAlign: 'center' }}>
        <button onClick={goFeedDemo} style={{ background: 'none', border: 'none', fontSize: 11, color: '#CCCCCC', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {M.onboarding.skipToDemo}
        </button>
      </div>
    </div>
  )
}
