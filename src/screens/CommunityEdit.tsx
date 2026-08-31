import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function CommunityEdit() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const selectedCommunity = useAppStore((s) => s.selectedCommunity)
  const updateCommunity = useAppStore((s) => s.updateCommunity)

  const [name, setName] = useState(selectedCommunity?.name ?? '')
  const [desc, setDesc] = useState(selectedCommunity?.desc ?? '')
  const [visibility, setVisibility] = useState<'public' | 'private'>(selectedCommunity?.visibility ?? 'public')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!selectedCommunity) {
    return (
      <div>
        <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.communityEdit.notFound}</p>
        </div>
      </div>
    )
  }

  const trimmed = name.trim()
  const canSave = trimmed.length >= 1 && !saving

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError('')
    const err = await updateCommunity(selectedCommunity.id, { name: trimmed, desc: desc.trim(), visibility })
    setSaving(false)
    if (err) { setError(M.communityEdit.saveFailed); return }
    goBack()
  }

  const visBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    background: active ? '#111111' : '#FAFAFA',
    color: active ? '#fff' : '#555555',
    border: `1px solid ${active ? '#111111' : '#DDDDDD'}`,
  })

  return (
    <div data-testid="community-edit-screen">
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.communityEdit.title}</span>
        <button
          data-testid="community-edit-save"
          onClick={handleSave}
          disabled={!canSave}
          style={{ padding: '7px 16px', borderRadius: 8, background: canSave ? '#111111' : '#CCCCCC', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: canSave ? 'pointer' : 'default', letterSpacing: '.02em' }}
        >
          {M.communityEdit.save}
        </button>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.communityEdit.nameLabel}</p>
          <input
            data-testid="community-edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={M.communityEdit.namePlaceholder}
            maxLength={30}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 14, color: '#111111', background: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.communityEdit.descLabel}</p>
          <textarea
            data-testid="community-edit-desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={M.communityEdit.descPlaceholder}
            rows={3}
            maxLength={200}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 14, color: '#111111', background: '#FAFAFA', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.7, fontFamily: "'Noto Sans KR',sans-serif" }}
          />
        </div>

        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.communityEdit.visibilityLabel}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button data-testid="community-edit-public" onClick={() => setVisibility('public')} style={visBtnStyle(visibility === 'public')}>{M.communityEdit.visPublic}</button>
            <button data-testid="community-edit-private" onClick={() => setVisibility('private')} style={visBtnStyle(visibility === 'private')}>{M.communityEdit.visPrivate}</button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>
            {visibility === 'public' ? M.communityEdit.visPublicHint : M.communityEdit.visPrivateHint}
          </p>
        </div>

        {error && <p style={{ margin: 0, fontSize: 12, color: '#E53535' }}>{error}</p>}
      </div>
    </div>
  )
}
