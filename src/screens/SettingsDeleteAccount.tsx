import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function SettingsDeleteAccount() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const deleteAccount = useAppStore((s) => s.deleteAccount)

  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmText.trim() !== M.settings.deleteAccountConfirmWord) {
      setError(M.settings.deleteAccountConfirmPrompt)
      return
    }

    setIsDeleting(true)
    setError('')

    const success = await deleteAccount()
    
    if (!success) {
      setIsDeleting(false)
      setError(M.settings.deleteAccountError)
    }
  }

  const isConfirmValid = confirmText.trim() === M.settings.deleteAccountConfirmWord

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.settings.deleteAccountTitle}</span>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ marginBottom: 24, padding: 16, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FEE2E2' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#991B1B', marginBottom: 8 }}>
            {M.settings.deleteAccountWarning}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#7F1D1D' }}>
            {M.settings.deleteAccountDetails}
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#666666', lineHeight: 1.6 }}>
            <li>{M.settings.deleteAccountItem1}</li>
            <li>{M.settings.deleteAccountItem2}</li>
            <li>{M.settings.deleteAccountItem3}</li>
            <li>{M.settings.deleteAccountItem4}</li>
            <li>{M.settings.deleteAccountItem5}</li>
            <li>{M.settings.deleteAccountItem6}</li>
          </ul>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#111111' }}>
            {M.settings.deleteAccountConfirmPrompt}
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={M.settings.deleteAccountPlaceholder}
            disabled={isDeleting}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
              border: '1px solid #DDDDDD',
              borderRadius: 8,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: 12, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FEE2E2' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#991B1B' }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={!isConfirmValid || isDeleting}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: 15,
            fontWeight: 600,
            color: '#FFFFFF',
            background: isConfirmValid && !isDeleting ? '#DC2626' : '#CCCCCC',
            border: 'none',
            borderRadius: 8,
            cursor: isConfirmValid && !isDeleting ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
        >
          {isDeleting ? M.settings.deleteAccountCanceling : M.settings.deleteAccountButton}
        </button>
      </div>
    </div>
  )
}
