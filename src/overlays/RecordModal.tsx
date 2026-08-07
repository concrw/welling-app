import { useState, useRef, useEffect } from 'react'
import { useAppStore, type PostCategory, type PostVisibility } from '../store/appStore'
import { looksUnrelatedToCategory } from '../lib/contentGuideline'
import { uploadPostImage } from '../lib/supabaseClient'
import { useMessages } from '../i18n'

interface QuickBtn { id: string; num: number; label: string; isCustom: boolean }

const TIMER_PRESETS = [1, 3, 5, 10]

const CATEGORY_KEYS: PostCategory[] = ['habit', 'diet', 'reflection', 'routine']

const VISIBILITY_KEYS: PostVisibility[] = ['public', 'followers', 'private']

export default function RecordModal() {
  const M = useMessages()
  const showRecordModal = useAppStore((s) => s.showRecordModal)
  const closeRecordModal = useAppStore((s) => s.closeRecordModal)
  const addPost = useAppStore((s) => s.addPost)
  const routineGroups = useAppStore((s) => s.routineGroups)
  const customQuickButtons = useAppStore((s) => s.customQuickButtons)
  const addCustomQuickButton = useAppStore((s) => s.addCustomQuickButton)
  const updateCustomQuickButton = useAppStore((s) => s.updateCustomQuickButton)
  const removeCustomQuickButton = useAppStore((s) => s.removeCustomQuickButton)
  const communities = useAppStore((s) => s.communities)
  const defaultVisibility = useAppStore((s) => s.defaultVisibility)

  const routineButtons: QuickBtn[] = routineGroups.flatMap((g) => g.items).map((item) => ({
    id: `routine-${item.id}`, num: 0, label: item.name, isCustom: false,
  }))
  const customButtons: QuickBtn[] = customQuickButtons.map((b) => ({
    id: b.id, num: 0, label: b.label, isCustom: true,
  }))
  const buttons: QuickBtn[] = [...routineButtons, ...customButtons].map((b, i) => ({ ...b, num: i + 1 }))

  const isDemo = useAppStore((s) => s.isDemo)
  const userId = useAppStore((s) => s.userId)

  const [toast, setToast] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [recordText, setRecordText] = useState('')
  const [recordCategory, setRecordCategory] = useState<PostCategory>('habit')
  const [recordVisibility, setRecordVisibility] = useState<PostVisibility>(defaultVisibility)
  const [recordCommunityId, setRecordCommunityId] = useState<string>('')
  const [recordInstaUrl, setRecordInstaUrl] = useState('')
  const [showGuidelineWarning, setShowGuidelineWarning] = useState(false)
  const [longPressTarget, setLongPressTarget] = useState<QuickBtn | null>(null)
  const [editingBtn, setEditingBtn] = useState<QuickBtn | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [addingBtn, setAddingBtn] = useState(false)
  const [newBtnLabel, setNewBtnLabel] = useState('')
  const [timerTarget, setTimerTarget] = useState<QuickBtn | null>(null)
  const [activeTimer, setActiveTimer] = useState<{ btn: QuickBtn; endsAt: number; totalMs: number } | null>(null)
  const [timerRemainingMs, setTimerRemainingMs] = useState(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!activeTimer) return
    const tick = () => {
      const remaining = activeTimer.endsAt - Date.now()
      if (remaining <= 0) {
        addPost(activeTimer.btn.label, undefined, 'habit', defaultVisibility, null)
        showToast(M.overlays.recordDoneWithLabel(activeTimer.btn.label))
        setActiveTimer(null)
        setTimerRemainingMs(0)
      } else {
        setTimerRemainingMs(remaining)
      }
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimer])

  if (!showRecordModal) return null

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleTap = (btn: QuickBtn) => {
    addPost(btn.label, undefined, 'habit', defaultVisibility, null)
    showToast(M.overlays.recordDoneWithLabel(btn.label))
    setTimeout(() => closeRecordModal(), 400)
  }

  const handlePressStart = (btn: QuickBtn) => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      if (btn.isCustom) setLongPressTarget(btn)
    }, 500)
  }

  const handlePressEnd = (btn: QuickBtn) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    if (!didLongPress.current) {
      handleTap(btn)
    }
  }

  const handleDeleteBtn = (id: string) => {
    removeCustomQuickButton(id)
    setLongPressTarget(null)
  }

  const handleEditBtn = (btn: QuickBtn) => {
    setEditingBtn(btn)
    setEditLabel(btn.label)
    setLongPressTarget(null)
  }

  const handleSaveEdit = () => {
    if (!editingBtn || !editLabel.trim()) return
    updateCustomQuickButton(editingBtn.id, editLabel.trim())
    setEditingBtn(null)
    setEditLabel('')
  }

  const handleAddBtn = () => { setAddingBtn(true); setNewBtnLabel('') }

  const handleConfirmAdd = () => {
    if (newBtnLabel.trim()) addCustomQuickButton(newBtnLabel.trim())
    setAddingBtn(false)
    setNewBtnLabel('')
  }

  const handleStartTimer = (minutes: number) => {
    if (!timerTarget) return
    const totalMs = minutes * 60 * 1000
    setActiveTimer({ btn: timerTarget, endsAt: Date.now() + totalMs, totalMs })
    setTimerTarget(null)
  }

  const submitTextRecord = async () => {
    const trimmedInsta = recordInstaUrl.trim()
    const validInsta = trimmedInsta.startsWith('https://') ? trimmedInsta : undefined
    // 데모 모드는 세션 로컬 blob 미리보기 그대로, 실계정은 Storage에 올려 영구 URL로 저장
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
    if (looksUnrelatedToCategory(recordText, recordCategory)) {
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

  const formatRemaining = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
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

      <div onClick={closeRecordModal} style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px', flexShrink: 0 }}>
          <div style={{ width: 28, height: 3, borderRadius: 2, background: '#EBEBEB' }} />
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 20px 40px', minHeight: 0 }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase' }}>{M.overlays.quickRecordHint}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {buttons.map((btn) => {
              const isTiming = activeTimer?.btn.id === btn.id
              return (
                <div key={btn.id} style={{ position: 'relative' }}>
                  {editingBtn?.id === btn.id ? (
                    <div style={{ padding: 10, borderRadius: 10, background: '#FAFAFA', border: '1.5px solid #111111', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        autoFocus
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit() }}
                        style={{ padding: '7px 10px', borderRadius: 7, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#fff', fontWeight: 600 }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={handleSaveEdit} style={{ flex: 1, padding: '6px 0', borderRadius: 7, background: '#111111', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{M.common.save}</button>
                        <button onClick={() => setEditingBtn(null)} style={{ flex: 1, padding: '6px 0', borderRadius: 7, background: 'transparent', color: '#AAAAAA', fontSize: 11, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.cancel}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onMouseDown={() => handlePressStart(btn)}
                        onMouseUp={() => handlePressEnd(btn)}
                        onMouseLeave={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null } }}
                        onTouchStart={() => handlePressStart(btn)}
                        onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(btn) }}
                        disabled={isTiming}
                        style={{ padding: '14px 40px 14px 12px', borderRadius: 10, background: isTiming ? '#111111' : '#FAFAFA', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 10, cursor: isTiming ? 'default' : 'pointer', width: '100%', textAlign: 'left', userSelect: 'none', transition: 'all .15s', boxSizing: 'border-box' }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: isTiming ? '#666666' : '#CCCCCC', fontVariantNumeric: 'tabular-nums', minWidth: 20 }}>{String(btn.num).padStart(2, '0')}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isTiming ? '#FFFFFF' : '#111111', lineHeight: 1.3, flex: 1 }}>
                          {isTiming ? formatRemaining(timerRemainingMs) : btn.label}
                        </span>
                      </button>
                      {!isTiming && (
                        <button
                          onClick={() => setTimerTarget(btn)}
                          style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="9" r="6" stroke="#AAAAAA" strokeWidth="1.4"/>
                            <path d="M8 6v3l2 1.5" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 1.5h4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                      {longPressTarget?.id === btn.id && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2 }}>
                          <button onClick={() => handleEditBtn(btn)} style={{ padding: '7px 14px', borderRadius: 8, background: '#FFFFFF', color: '#111111', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{M.common.edit}</button>
                          <button onClick={() => handleDeleteBtn(btn.id)} style={{ padding: '7px 14px', borderRadius: 8, background: '#CC3333', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{M.common.delete}</button>
                          <button onClick={() => setLongPressTarget(null)} style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <line x1="3" y1="3" x2="11" y2="11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                              <line x1="11" y1="3" x2="3" y2="11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {timerTarget && (
            <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#111111' }}>{M.overlays.pickTimerDuration(timerTarget.label)}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {TIMER_PRESETS.map((min) => (
                  <button key={min} onClick={() => handleStartTimer(min)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{M.overlays.minutes(min)}</button>
                ))}
                <button onClick={() => setTimerTarget(null)} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 12, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.cancel}</button>
              </div>
            </div>
          )}

          <div onClick={handleAddBtn} style={{ marginTop: 10, padding: '11px 14px', borderRadius: 10, border: '1px dashed #DDDDDD', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 16, color: '#AAAAAA', fontWeight: 200, lineHeight: 1 }}>+</span>
            <span style={{ fontSize: 12, color: '#AAAAAA', letterSpacing: '.02em' }}>{M.overlays.addButton}</span>
          </div>

          {addingBtn && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                autoFocus
                value={newBtnLabel}
                onChange={(e) => setNewBtnLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAdd(); if (e.key === 'Escape') { setAddingBtn(false); setNewBtnLabel('') } }}
                placeholder={M.overlays.buttonNamePlaceholder}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#FAFAFA' }}
              />
              <button onClick={handleConfirmAdd} style={{ padding: '9px 14px', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{M.overlays.add}</button>
              <button onClick={() => { setAddingBtn(false); setNewBtnLabel('') }} style={{ padding: '9px 10px', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 12, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.cancel}</button>
            </div>
          )}

          <div style={{ marginTop: 16, borderTop: '1px solid #F0F0F0', paddingTop: 14 }}>
            {imagePreview && (
              <div style={{ position: 'relative', marginBottom: 10, borderRadius: 10, overflow: 'hidden' }}>
                <img src={imagePreview} alt={M.overlays.attachedImageAlt} style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  style={{ position: 'absolute', top: 7, right: 7, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em' }}>{M.overlays.recordType}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {CATEGORY_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setRecordCategory(key)}
                  style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${recordCategory === key ? '#111111' : '#EBEBEB'}`, background: recordCategory === key ? '#111111' : '#FAFAFA', color: recordCategory === key ? '#fff' : '#111111', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {M.overlays.categoryLabels[key]}
                </button>
              ))}
            </div>

            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em' }}>{M.overlays.visibilityScope}</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {VISIBILITY_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setRecordVisibility(key)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${recordVisibility === key ? '#111111' : '#EBEBEB'}`, background: recordVisibility === key ? '#111111' : '#FAFAFA', color: recordVisibility === key ? '#fff' : '#111111', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {M.overlays.visibilityLabels[key]}
                </button>
              ))}
            </div>

            {communities.some((c) => c.joined) && (
              <select
                value={recordCommunityId}
                onChange={(e) => setRecordCommunityId(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 12, background: '#FAFAFA', color: '#111111', marginBottom: 12, outline: 'none' }}
              >
                <option value="">{M.overlays.noCommunitySelected}</option>
                {communities.filter((c) => c.joined).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            <input
              value={recordInstaUrl}
              onChange={(e) => setRecordInstaUrl(e.target.value)}
              placeholder={M.overlays.instaLinkPlaceholder}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 12, background: '#FAFAFA', color: '#111111', marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
            />

            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
            <textarea
              value={recordText}
              onChange={(e) => setRecordText(e.target.value)}
              placeholder={M.overlays.recordPlaceholder}
              rows={3}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 14, background: '#FAFAFA', color: '#111111', resize: 'none', lineHeight: 1.7, marginBottom: 10, outline: 'none', fontWeight: 300, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", boxSizing: 'border-box', wordBreak: 'keep-all' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => fileRef.current?.click()} style={{ padding: '11px 13px', borderRadius: 10, background: '#F5F5F5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="10" rx="2" stroke="#555" strokeWidth="1.4"/><circle cx="5.2" cy="6.5" r="1.4" stroke="#555" strokeWidth="1.2"/><path d="M1.5 11.5l3.5-3.5 2.5 2.5 2-2 4 3.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button
                onClick={handleTextRecord}
                disabled={uploading}
                style={{ flex: 1, padding: 13, borderRadius: 10, background: uploading ? '#CCCCCC' : '#111111', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: uploading ? 'default' : 'pointer', letterSpacing: '.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >
                {uploading ? M.overlays.imageUploading : M.overlays.record}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
