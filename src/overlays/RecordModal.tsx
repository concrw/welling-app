import { useState, useRef, useEffect } from 'react'
import { useAppStore, type PostCategory, type PostVisibility } from '../store/appStore'
import { looksUnrelatedToCategory } from '../lib/contentGuideline'
import { uploadPostImage } from '../lib/supabaseClient'
import { useMessages } from '../i18n'

export default function RecordModal() {
  const M = useMessages()
  const showRecordModal = useAppStore((s) => s.showRecordModal)
  const closeRecordModal = useAppStore((s) => s.closeRecordModal)
  const addPost = useAppStore((s) => s.addPost)
  const communities = useAppStore((s) => s.communities)
  const defaultVisibility = useAppStore((s) => s.defaultVisibility)
  const activeCommunityTab = useAppStore((s) => s.activeCommunityTab)
  const pendingRecordCommunityId = useAppStore((s) => s.pendingRecordCommunityId)
  const setPendingRecordCommunityId = useAppStore((s) => s.setPendingRecordCommunityId)
  const isDemo = useAppStore((s) => s.isDemo)
  const userId = useAppStore((s) => s.userId)

  const [toast, setToast] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [recordText, setRecordText] = useState('')
  const [recordCommunityId, setRecordCommunityId] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [recordCategory, setRecordCategory] = useState<PostCategory>('habit')
  const [recordVisibility, setRecordVisibility] = useState<PostVisibility>(defaultVisibility)
  const [recordInstaUrl, setRecordInstaUrl] = useState('')
  const [showGuidelineWarning, setShowGuidelineWarning] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Auto-select target group
  useEffect(() => {
    if (!showRecordModal) return
    if (pendingRecordCommunityId) {
      setRecordCommunityId(pendingRecordCommunityId)
      setPendingRecordCommunityId(null)
    } else if (!recordCommunityId) {
      const joinedCommunities = communities.filter((c) => c.joined)
      if (activeCommunityTab && activeCommunityTab !== 'all') {
        setRecordCommunityId(activeCommunityTab)
      } else if (joinedCommunities.length > 0) {
        setRecordCommunityId(joinedCommunities[0].id)
      }
    }
  }, [showRecordModal, pendingRecordCommunityId, setPendingRecordCommunityId, recordCommunityId, activeCommunityTab, communities])

  if (!showRecordModal) return null

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleQuickPost = async (category: 'diet' | 'exercise') => {
    const label = category === 'diet' ? '먹었어' : '운동했어'
    const vis = defaultVisibility === 'public' ? 'group' : defaultVisibility
    const communityId = recordCommunityId || (communities.filter((c) => c.joined)[0]?.id ?? null)
    addPost(label, undefined, category, vis, communityId)
    showToast(M.overlays.recordDoneWithLabel(label))
    setTimeout(() => closeRecordModal(), 400)
  }

  const submitTextRecord = async () => {
    const trimmedInsta = recordInstaUrl.trim()
    const validInsta = trimmedInsta.startsWith('https://') ? trimmedInsta : undefined
    let finalImgUrl: string | undefined = isDemo ? (imagePreview ?? undefined) : undefined
    if (!isDemo && imageFile && userId) {
      setUploading(true)
      finalImgUrl = (await uploadPostImage(imageFile, userId)) ?? undefined
      setUploading(false)
      if (!finalImgUrl) {
        showToast(M.overlays.imageUploadFailed)
        return
      }
    }
    addPost(recordText.trim(), finalImgUrl, recordCategory, recordVisibility, recordCommunityId || null, validInsta)
    showToast(M.overlays.recordDone)
    setRecordText('')
    setImagePreview(null)
    setImageFile(null)
    setRecordInstaUrl('')
    setShowGuidelineWarning(false)
    setTimeout(() => closeRecordModal(), 400)
  }

  const handleTextRecord = () => {
    if (!recordText.trim()) return
    if (recordVisibility === 'public' && looksUnrelatedToCategory(recordText, recordCategory)) {
      setShowGuidelineWarning(true)
      return
    }
    submitTextRecord()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const joinedCommunities = communities.filter((c) => c.joined)
  const selectedComm = joinedCommunities.find((c) => c.id === recordCommunityId)

  return (
    <div data-testid="record-modal" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {showGuidelineWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, maxWidth: 320, width: '100%' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#111111', lineHeight: 1.6, wordBreak: 'keep-all' }}>
              {M.overlays.guidelineWarning}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowGuidelineWarning(false)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 13, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}
              >
                {M.common.cancel}
              </button>
              <button
                onClick={submitTextRecord}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                {M.overlays.continuePosting}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#111111', color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, zIndex: 999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <div onClick={() => closeRecordModal()} style={{ flex: 1, cursor: 'pointer', background: 'rgba(0,0,0,.5)' }} />
      <div style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', paddingTop: 20, paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>{M.overlays.recordTitle}</span>
          <button onClick={() => closeRecordModal()} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="24" height="24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* L1 Mode: Big [먹었어]/[운동했어] buttons */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleQuickPost('diet')}
            style={{
              flex: 1,
              padding: '20px 0',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
            }}
          >
            🍽️ 먹었어
          </button>
          <button
            onClick={() => handleQuickPost('exercise')}
            style={{
              flex: 1,
              padding: '20px 0',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)',
            }}
          >
            💪 운동했어
          </button>
        </div>

        {/* Target group display */}
        {selectedComm && (
          <div style={{ padding: '0 20px 8px', fontSize: 13, color: '#666666' }}>
            {selectedComm.name}에 기록
          </div>
        )}

        {/* Optional photo & text */}
        <div style={{ padding: '0 20px 16px' }}>
          <textarea
            placeholder={M.overlays.recordPlaceholder}
            value={recordText}
            onChange={(e) => setRecordText(e.target.value)}
            style={{
              width: '100%',
              minHeight: 60,
              padding: 12,
              fontSize: 14,
              border: '1px solid #EBEBEB',
              borderRadius: 8,
              resize: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          {imagePreview && (
            <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
              <button
                onClick={() => { setImagePreview(null); setImageFile(null) }}
                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#111111', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#666666', background: 'transparent', border: '1px solid #EBEBEB', borderRadius: 8, cursor: 'pointer' }}
            >
              📷 사진
            </button>
            {recordText.trim() && (
              <button
                onClick={handleTextRecord}
                disabled={uploading}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#FFFFFF', background: '#111111', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                {uploading ? '업로드 중...' : '기록'}
              </button>
            )}
          </div>
        </div>

        {/* '더보기' toggle for advanced options */}
        {!showAdvanced && (
          <div style={{ padding: '0 20px 8px' }}>
            <button
              onClick={() => setShowAdvanced(true)}
              style={{ width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 600, color: '#666666', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              ▼ 더보기 (카테고리, 공개범위, 인스타그램 등)
            </button>
          </div>
        )}

        {showAdvanced && (
          <div style={{ padding: '0 20px 16px', borderTop: '1px solid #EBEBEB', paddingTop: 16 }}>
            <button
              onClick={() => setShowAdvanced(false)}
              style={{ width: '100%', padding: '8px 0', fontSize: 13, fontWeight: 600, color: '#666666', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: 12 }}
            >
              ▲ 간단히
            </button>

            {/* Category selection */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#AAAAAA' }}>카테고리</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['habit', 'diet', 'exercise', 'reflection', 'routine'] as PostCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRecordCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: recordCategory === cat ? 700 : 400,
                      background: recordCategory === cat ? '#111111' : 'transparent',
                      color: recordCategory === cat ? '#fff' : '#666666',
                      border: `1px solid ${recordCategory === cat ? '#111111' : '#E0E0E0'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {M.overlays[`category_${cat}` as keyof typeof M.overlays]}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility selection */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#AAAAAA' }}>공개 범위</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['group', 'public', 'followers', 'private'] as PostVisibility[]).map((vis) => (
                  <button
                    key={vis}
                    onClick={() => setRecordVisibility(vis)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: recordVisibility === vis ? 700 : 400,
                      background: recordVisibility === vis ? '#111111' : 'transparent',
                      color: recordVisibility === vis ? '#fff' : '#666666',
                      border: `1px solid ${recordVisibility === vis ? '#111111' : '#E0E0E0'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {M.overlays[`visibility_${vis}` as keyof typeof M.overlays]}
                  </button>
                ))}
              </div>
            </div>

            {/* Target group selection */}
            {joinedCommunities.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#AAAAAA' }}>그룹 선택</p>
                <select
                  value={recordCommunityId}
                  onChange={(e) => setRecordCommunityId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #EBEBEB',
                    fontSize: 13,
                    background: '#FAFAFA',
                  }}
                >
                  <option value="">그룹 없음</option>
                  {joinedCommunities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Instagram URL */}
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#AAAAAA' }}>Instagram 링크 (선택)</p>
              <input
                type="url"
                value={recordInstaUrl}
                onChange={(e) => setRecordInstaUrl(e.target.value)}
                placeholder="https://instagram.com/p/..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #EBEBEB',
                  fontSize: 13,
                  background: '#FAFAFA',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}
