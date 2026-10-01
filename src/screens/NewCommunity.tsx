import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { supabase } from '../lib/supabaseClient'

export default function NewCommunity() {
  const goBack = useAppStore((s) => s.goBack)
  const navigate = useAppStore((s) => s.navigate)
  
  const [groupName, setGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [showShareScreen, setShowShareScreen] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    const trimmed = groupName.trim()
    if (trimmed.length < 1) return
    
    setCreating(true)
    setError('')
    
    try {
      const { data, error: rpcError } = await supabase.rpc('create_group', {
        p_name: trimmed,
        p_desc: '',
        p_visibility: 'private',
      })
      
      if (rpcError || !data) {
        setError(rpcError?.message || '그룹 생성에 실패했습니다')
        setCreating(false)
        return
      }
      
      const result = typeof data === 'string' ? JSON.parse(data) : data
      if (result.status === 'success') {
        const code = result.invite_code
        const url = `${window.location.origin}/?invite=${code}`
        setInviteUrl(url)
        setShowShareScreen(true)
        setCreating(false)
      } else {
        setError('그룹 생성에 실패했습니다')
        setCreating(false)
      }
    } catch (err) {
      setError('그룹 생성에 실패했습니다')
      setCreating(false)
    }
  }

  const handleShare = async () => {
    const shareText = `${groupName} 그룹에 초대합니다!\n\n함께 건강한 습관을 만들어요 💪\n\n${inviteUrl}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${groupName} 그룹 초대`,
          text: shareText,
          url: inviteUrl,
        })
      } catch (err) {
        // User cancelled or error - fallback to copy
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  const handleCopy = async () => {
    const shareText = `${groupName} 그룹에 초대합니다!\n\n함께 건강한 습관을 만들어요 💪\n\n${inviteUrl}`
    
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDone = () => {
    // Reload feed to show new group
    navigate('feed')
    window.location.reload()
  }

  if (showShareScreen) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, fontSize: 18, fontWeight: 800, color: '#111111' }}>그룹 생성 완료!</span>
        </div>

        <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#111111', textAlign: 'center' }}>
            {groupName}
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: 14, color: '#666666', textAlign: 'center' }}>
            그룹이 생성되었습니다!<br />친구들을 초대해보세요
          </p>

          <div style={{ width: '100%', maxWidth: 400, padding: 20, background: '#F8F9FA', borderRadius: 16, marginBottom: 24 }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#666666', textAlign: 'center' }}>
              초대 링크
            </p>
            <div style={{ padding: '12px 16px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E0E0E0', marginBottom: 16, wordBreak: 'break-all', fontSize: 13, color: '#111111', textAlign: 'center' }}>
              {inviteUrl}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCopy}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  borderRadius: 10,
                  background: copied ? '#22C55E' : 'transparent',
                  color: copied ? '#FFFFFF' : '#666666',
                  fontSize: 14,
                  fontWeight: 600,
                  border: `1px solid ${copied ? '#22C55E' : '#E0E0E0'}`,
                  cursor: 'pointer',
                }}
              >
                {copied ? '✓ 복사 완료' : '📋 복사'}
              </button>
              <button
                onClick={handleShare}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  borderRadius: 10,
                  background: '#111111',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🔗 링크 보내기
              </button>
            </div>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#999999', textAlign: 'center', maxWidth: 320 }}>
            💡 KakaoTalk이나 문자로 링크를 공유하면<br />친구가 클릭만으로 그룹에 가입할 수 있어요
          </p>

          <button
            onClick={handleDone}
            style={{
              width: '100%',
              maxWidth: 400,
              padding: '14px 0',
              borderRadius: 10,
              background: '#0984E3',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            완료
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ flex: 1, fontSize: 18, fontWeight: 800, color: '#111111' }}>새 그룹 만들기</span>
      </div>

      <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#111111' }}>
            그룹 이름을 정해주세요
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#666666' }}>
            함께할 사람들과 공유할 이름이에요
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="우리 셋 식단운동"
            maxLength={30}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && groupName.trim().length >= 1 && !creating) {
                handleCreate()
              }
            }}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              border: '2px solid #E0E0E0',
              fontSize: 16,
              color: '#111111',
              background: '#FAFAFA',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#999999' }}>
            예: 우리 셋 식단운동, 헬스 메이트, 다이어트 챌린지
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#DC2626' }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={groupName.trim().length < 1 || creating}
          style={{
            width: '100%',
            padding: '16px 0',
            borderRadius: 12,
            background: groupName.trim().length >= 1 && !creating ? '#111111' : '#CCCCCC',
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: groupName.trim().length >= 1 && !creating ? 'pointer' : 'not-allowed',
          }}
        >
          {creating ? '생성 중...' : '그룹 만들기'}
        </button>

        <div style={{ marginTop: 'auto', paddingTop: 32 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#999999', textAlign: 'center' }}>
            그룹은 비공개로 생성됩니다<br />
            초대받은 사람만 참여할 수 있어요
          </p>
        </div>
      </div>
    </div>
  )
}
