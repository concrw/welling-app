import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { supabase } from '../lib/supabaseClient'

export default function SettingsDeleteAccount() {
  const goBack = useAppStore((s) => s.goBack)
  const nickname = useAppStore((s) => s.nickname)
  const signOut = useAppStore((s) => s.signOut)
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmText !== nickname) {
      setError(M.deleteAccount.errorMismatch)
      return
    }

    setDeleting(true)
    setError('')

    try {
      const { error: rpcError } = await supabase.rpc('delete_account')
      if (rpcError) {
        setError(rpcError.message || M.deleteAccount.errorGeneric)
        setDeleting(false)
        return
      }

      // Sign out after successful deletion
      await supabase.auth.signOut()
      signOut()
    } catch (err) {
      setError(M.deleteAccount.errorGeneric)
      setDeleting(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>{M.deleteAccount.title}</span>
      </div>

      <div style={{ flex: 1, padding: '20px 20px calc(20px + env(safe-area-inset-bottom))' }}>
        <div style={{ marginBottom: 24, padding: 20, background: '#FFF3CD', borderRadius: 12, border: '1px solid #FFE69C' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#856404', lineHeight: 1.6 }}>
            <strong>{M.deleteAccount.warning}</strong> {M.deleteAccount.warningText}
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.deleteAccount.deleteTitle}</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#666666', lineHeight: 2 }}>
            <li>{M.deleteAccount.dataProfile}</li>
            <li>{M.deleteAccount.dataPosts}</li>
            <li>{M.deleteAccount.dataRoutine}</li>
            <li>{M.deleteAccount.dataNotifs}</li>
            <li>{M.deleteAccount.dataCommunities}</li>
          </ul>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 10,
              background: '#DC3545',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {M.deleteAccount.btnProceed}
          </button>
        ) : (
          <div style={{ border: '2px solid #DC3545', borderRadius: 12, padding: 20, background: '#FFF5F5' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#111111', lineHeight: 1.6 }}>
              {M.deleteAccount.confirmPrompt(nickname || '')}
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={nickname}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                border: '1px solid #EBEBEB',
                borderRadius: 8,
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#DC3545' }}>{error}</p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowConfirm(false); setConfirmText(''); setError('') }}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 8,
                  background: 'transparent',
                  color: '#666666',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '1px solid #EBEBEB',
                  cursor: 'pointer',
                }}
              >
                {M.deleteAccount.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== nickname}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 8,
                  background: confirmText === nickname && !deleting ? '#DC3545' : '#CCCCCC',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: confirmText === nickname && !deleting ? 'pointer' : 'not-allowed',
                }}
              >
                {deleting ? M.deleteAccount.btnDeleting : M.deleteAccount.btnDelete}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
