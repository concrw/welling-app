import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'
import { callRpc, getStatusMessage } from '../lib/rpc'

export default function NewCommunity() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const navigate = useAppStore((s) => s.navigate)
  const loadFeedData = useAppStore((s) => s.loadFeedData)
  
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
    
    const result = await callRpc<{ success: boolean; community_id: string; invite_code: string }>(
      'create_group',
      {
        p_name: trimmed,
        p_desc: '',
        p_visibility: 'private',
      }
    )
    
    if (!result.ok) {
      setError(getStatusMessage(result.message, M))
      setCreating(false)
      return
    }
    
    const code = result.data.invite_code
    const url = `${window.location.origin}/?invite=${code}`
    setInviteUrl(url)
    setShowShareScreen(true)
    setCreating(false)
  }

  const handleShare = async () => {
    const shareText = `${M.newCommunity.shareTextTemplate(groupName)}${inviteUrl}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: M.newCommunity.shareTitleTemplate(groupName),
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
    const shareText = `${M.newCommunity.shareTextTemplate(groupName)}${inviteUrl}`
    
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

  const handleDone = async () => {
    await loadFeedData()
    navigate('feed')
  }

  if (showShareScreen) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, fontSize: 18, fontWeight: 800, color: '#111111' }}>{M.newCommunity.titleCreated}</span>
        </div>

        <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#111111', textAlign: 'center' }}>
            {groupName}
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: 14, color: '#666666', textAlign: 'center' }}>
            {M.newCommunity.shareTitle}<br />{M.newCommunity.shareSubtitle}
          </p>

          <div style={{ width: '100%', maxWidth: 400, padding: 20, background: '#F8F9FA', borderRadius: 16, marginBottom: 24 }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#666666', textAlign: 'center' }}>
              {M.newCommunity.shareLinkLabel}
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
                {copied ? M.newCommunity.shareCopied : M.newCommunity.shareCopy}
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
                {M.newCommunity.shareButton}
              </button>
            </div>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#999999', textAlign: 'center', maxWidth: 320 }}>
            {M.newCommunity.shareTip}<br />{M.newCommunity.shareTipDetail}
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
            {M.newCommunity.done}
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
        <span style={{ flex: 1, fontSize: 18, fontWeight: 800, color: '#111111' }}>{M.newCommunity.title}</span>
      </div>

      <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#111111' }}>
            {M.newCommunity.promptName}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#666666' }}>
            {M.newCommunity.promptDesc}
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={M.newCommunity.namePlaceholder}
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
            {M.newCommunity.nameExample}
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
          {creating ? M.newCommunity.btnCreating : M.newCommunity.btnCreate}
        </button>

        <div style={{ marginTop: 'auto', paddingTop: 32 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#999999', textAlign: 'center' }}>
            {M.newCommunity.privacyNote}<br />
            {M.newCommunity.privacyDetail}
          </p>
        </div>
      </div>
    </div>
  )
}
