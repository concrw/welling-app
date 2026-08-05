import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function SettingsChangeUsername() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const nickname = useAppStore((s) => s.nickname)
  const nicknameEditInput = useAppStore((s) => s.nicknameEditInput)
  const setNicknameEditInput = useAppStore((s) => s.setNicknameEditInput)
  const submitNicknameEdit = useAppStore((s) => s.submitNicknameEdit)

  const handleSave = () => {
    submitNicknameEdit()
    goBack()
  }

  const value = nicknameEditInput !== '' ? nicknameEditInput : ''
  const placeholder = nickname

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.settings.changeUsername}</span>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{M.settings.currentUsername}</p>
        <p style={{ margin: '0 0 24px', fontSize: 15, fontWeight: 700, color: '#111111' }}>@{nickname.toLowerCase()}</p>

        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{M.settings.newUsername}</p>
        <input
          value={value}
          onChange={(e) => setNicknameEditInput(e.target.value)}
          placeholder={placeholder}
          maxLength={20}
          style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid #EBEBEB', fontSize: 14, fontWeight: 600, color: '#111111', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA', fontFamily: 'inherit' }}
          onFocus={(e) => { e.target.style.border = '1.5px solid #111111'; e.target.style.background = '#FFFFFF' }}
          onBlur={(e) => { e.target.style.border = '1.5px solid #EBEBEB'; e.target.style.background = '#FAFAFA' }}
        />
        <p style={{ margin: '8px 0 32px', fontSize: 11, color: '#CCCCCC', fontWeight: 300 }}>{M.settings.usernameHint}</p>

        <button
          onClick={handleSave}
          disabled={!nicknameEditInput.trim() || nicknameEditInput.trim() === nickname}
          style={{ width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 14, fontWeight: 700, border: 'none', cursor: nicknameEditInput.trim() && nicknameEditInput.trim() !== nickname ? 'pointer' : 'default', background: nicknameEditInput.trim() && nicknameEditInput.trim() !== nickname ? '#111111' : '#F0F0F0', color: nicknameEditInput.trim() && nicknameEditInput.trim() !== nickname ? '#FFFFFF' : '#BBBBBB' }}
        >
          {M.common.save}
        </button>
      </div>
    </div>
  )
}
