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
      setError('닉네임이 일치하지 않습니다')
      return
    }

    setDeleting(true)
    setError('')

    try {
      const { error: rpcError } = await supabase.rpc('delete_account')
      if (rpcError) {
        setError(rpcError.message || '삭제 중 오류가 발생했습니다')
        setDeleting(false)
        return
      }

      // Sign out after successful deletion
      await supabase.auth.signOut()
      signOut()
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다')
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
        <span style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>계정 삭제</span>
      </div>

      <div style={{ flex: 1, padding: '20px 20px calc(20px + env(safe-area-inset-bottom))' }}>
        <div style={{ marginBottom: 24, padding: 20, background: '#FFF3CD', borderRadius: 12, border: '1px solid #FFE69C' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#856404', lineHeight: 1.6 }}>
            <strong>⚠️ 주의:</strong> 계정 삭제는 되돌릴 수 없습니다. 모든 게시물, 댓글, 루틴 데이터가 영구적으로 삭제됩니다.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#111111' }}>삭제될 데이터:</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#666666', lineHeight: 2 }}>
            <li>프로필 정보 및 닉네임</li>
            <li>모든 게시물 및 댓글</li>
            <li>루틴 및 캘린더 데이터</li>
            <li>알림 설정 및 기록</li>
            <li>소유한 커뮤니티 (소유권이 다른 멤버에게 이전됩니다)</li>
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
            계정 삭제 진행
          </button>
        ) : (
          <div style={{ border: '2px solid #DC3545', borderRadius: 12, padding: 20, background: '#FFF5F5' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#111111', lineHeight: 1.6 }}>
              계정 삭제를 확인하려면 닉네임 <strong>{nickname}</strong>을(를) 입력하세요:
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
                취소
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
                {deleting ? '삭제 중...' : '영구 삭제'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
