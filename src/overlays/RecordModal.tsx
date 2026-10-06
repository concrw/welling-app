import { useState, useRef, useEffect } from 'react'
import { useAppStore, type PostCategory, type PostVisibility } from '../store/appStore'
import { looksUnrelatedToCategory } from '../lib/contentGuideline'
import { uploadPostImage } from '../lib/supabaseClient'
import { useMessages } from '../i18n'
import { getActivityLabel } from '../lib/date'

interface QuickBtn { id: string; num: number; label: string; isCustom: boolean }

const TIMER_PRESETS = [1, 3, 5, 10]

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
  const customQuickButtons = useAppStore((s) => s.customQuickButtons)
  const addCustomQuickButton = useAppStore((s) => s.addCustomQuickButton)
  const updateCustomQuickButton = useAppStore((s) => s.updateCustomQuickButton)
  const removeCustomQuickButton = useAppStore((s) => s.removeCustomQuickButton)
  const routineGroups = useAppStore((s) => s.routineGroups)

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

  // Build quick button list: routine items + custom buttons
  const routineButtons: QuickBtn[] = routineGroups.flatMap((g) => g.items).map((item) => ({
    id: `routine-${item.id}`,
    num: 0,
    label: item.name,
    isCustom: false,
  }))
  const customButtons: QuickBtn[] = customQuickButtons.map((b, i) => ({
    id: b.id,
    num: i + 1,
    label: b.label,
    isCustom: true,
  }))
  const allQuickButtons: QuickBtn[] = [...routineButtons, ...customButtons].map((b, i) => ({ ...b, num: i + 1 }))

  // Timer interval
  useEffect(() => {
    if (!activeTimer) return
    const tick = async () => {
      const remaining = activeTimer.endsAt - Date.now()
      if (remaining <= 0) {
        const communityId = recordCommunityId || (communities.filter((c) => c.joined)[0]?.id ?? null)
        // When posting to a group, map 'public' -> 'group' (legacy default from main)
        let vis = defaultVisibility
        if (communityId) {
          vis = defaultVisibility === 'public' ? 'group' : defaultVisibility
        } else if (defaultVisibility === 'group') {
          vis = 'private'
        }
        const success = await addPost(activeTimer.btn.label, undefined, 'habit', vis, communityId)
        if (success) {
          showToast(M.overlays.recordDoneWithLabel(activeTimer.btn.label))
        } else {
          showToast(M.overlays.recordFailed)
        }
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
    // Get Asia/Seoul time for HH:MM
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    const parts = formatter.formatToParts(now)
    const hour = parts.find((p) => p.type === 'hour')?.value || '00'
    const minute = parts.find((p) => p.type === 'minute')?.value || '00'
    const timeLabel = `${hour}:${minute}`
    
    const activityLabel = getActivityLabel(category, M)
    const content = `${activityLabel} · ${timeLabel}`
    const communityId = recordCommunityId || (communities.filter((c) => c.joined)[0]?.id ?? null)
    
    // When posting to a group, map 'public' -> 'group' (legacy default from main)
    let vis = defaultVisibility
    if (communityId) {
      vis = defaultVisibility === 'public' ? 'group' : defaultVisibility
    } else if (defaultVisibility === 'group') {
      vis = 'private'
    }
    
    const success = await addPost(content, undefined, category, vis, communityId)
    if (!success) {
      showToast(M.overlays.recordFailed)
      return
    }
    
    showToast(content)
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
    
    const communityId = recordCommunityId || null
    // When posting to a group, map 'public' -> 'group' (legacy default from main)
    let finalVisibility = recordVisibility
    if (communityId) {
      finalVisibility = recordVisibility === 'public' ? 'group' : recordVisibility
    } else if (recordVisibility === 'group') {
      finalVisibility = 'private'
    }
    
    const success = await addPost(recordText.trim(), finalImgUrl, recordCategory, finalVisibility, communityId, validInsta)
    if (!success) {
      showToast(M.overlays.recordFailed)
      return
    }
    
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

  // Custom button handlers
  const handleCustomTap = async (btn: QuickBtn) => {
    const communityId = recordCommunityId || (communities.filter((c) => c.joined)[0]?.id ?? null)
    // When posting to a group, map 'public' -> 'group' (legacy default from main)
    let vis = defaultVisibility
    if (communityId) {
      vis = defaultVisibility === 'public' ? 'group' : defaultVisibility
    } else if (defaultVisibility === 'group') {
      vis = 'private'
    }
    const success = await addPost(btn.label, undefined, 'habit', vis, communityId)
    if (success) {
      showToast(M.overlays.recordDoneWithLabel(btn.label))
      setTimeout(() => closeRecordModal(), 400)
    } else {
      showToast(M.overlays.recordFailed)
    }
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
      handleCustomTap(btn)
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

  const handleAddBtn = () => {
    setAddingBtn(true)
    setNewBtnLabel('')
  }

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
    // Don't collapse the More section when timer starts
  }

  const formatTimerRemaining = (ms: number): string => {
    const totalSec = Math.ceil(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
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
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>{M.overlays.record}</span>
          <button onClick={() => closeRecordModal()} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="24" height="24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* L1 Mode: Big [먹었어]/[운동했어] buttons */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
          <button
            onClick={() => handleQuickPost('diet')}
            data-testid="record-quick-button"
            style={{
              flex: 1,
              padding: '20px 16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0E9F6E 0%, #00D9A3 100%)',
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 32 }}>🍽️</span>
            {M.overlays.ate}
          </button>
          <button
            onClick={() => handleQuickPost('exercise')}
            data-testid="record-quick-button"
            style={{
              flex: 1,
              padding: '20px 16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0984E3 0%, #00BCFF 100%)',
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 32 }}>💪</span>
            {M.overlays.exercised}
          </button>
        </div>


        {/* Target group display */}
        {selectedComm && (
          <div style={{ padding: '0 20px 8px', fontSize: 13, color: '#666666' }}>
            {M.overlays.recordingTo(selectedComm.name)}
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
              {M.overlays.photo}
            </button>
            {recordText.trim() && (
              <button
                onClick={handleTextRecord}
                disabled={uploading}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#FFFFFF', background: '#111111', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                {uploading ? M.overlays.uploading : M.overlays.recordSubmit}
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
              {M.overlays.showAdvanced}
            </button>
          </div>
        )}

        {showAdvanced && (
          <div style={{ padding: '0 20px 16px', borderTop: '1px solid #EBEBEB', paddingTop: 16 }}>
            <button
              onClick={() => setShowAdvanced(false)}
              style={{ width: '100%', padding: '8px 0', fontSize: 13, fontWeight: 600, color: '#666666', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: 12 }}
            >
              {M.overlays.hideAdvanced}
            </button>

            {/* Active timer display */}
            {activeTimer && (
              <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: '#F0F8FF', border: '1px solid #BBDEFB' }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#111111' }}>
                  {M.overlays.timerRunning(activeTimer.btn.label)}
                </p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1976D2' }}>
                  {M.overlays.timerRemaining(formatTimerRemaining(timerRemainingMs))}
                </p>
              </div>
            )}

            {/* Custom quick buttons */}
            {allQuickButtons.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {allQuickButtons.map((btn) => {
                  const isTiming = activeTimer?.btn.id === btn.id
                  return (
                    <div key={btn.id} style={{ position: 'relative' }}>
                      <button
                        onMouseDown={() => handlePressStart(btn)}
                        onMouseUp={() => handlePressEnd(btn)}
                        onMouseLeave={() => {
                          if (longPressTimer.current) clearTimeout(longPressTimer.current)
                          longPressTimer.current = null
                        }}
                        onTouchStart={() => handlePressStart(btn)}
                        onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(btn) }}
                        disabled={isTiming}
                        style={{ 
                          padding: '10px 32px 10px 16px', 
                          borderRadius: 8, 
                          background: isTiming ? '#111111' : '#F8F8F8', 
                          fontSize: 13, 
                          fontWeight: 600, 
                          color: isTiming ? '#FFFFFF' : '#111111', 
                          border: 'none', 
                          cursor: isTiming ? 'default' : 'pointer',
                          position: 'relative'
                        }}
                      >
                        {isTiming ? formatTimerRemaining(timerRemainingMs) : btn.label}
                      </button>
                      {!isTiming && (
                        <button
                          onClick={() => setTimerTarget(btn)}
                          style={{ 
                            position: 'absolute', 
                            top: '50%', 
                            right: 8, 
                            transform: 'translateY(-50%)', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            padding: 4, 
                            display: 'flex', 
                            alignItems: 'center' 
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="9" r="6" stroke="#AAAAAA" strokeWidth="1.4"/>
                            <path d="M8 6v3l2 1.5" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 1.5h4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Long press menu */}
            {longPressTarget && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)' }}>
                <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16, minWidth: 200 }}>
                  <button
                    onClick={() => handleEditBtn(longPressTarget)}
                    style={{ width: '100%', padding: '12px 0', borderRadius: 8, background: 'transparent', color: '#111111', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: 16 }}
                  >
                    {M.overlays.editButton}
                  </button>
                  <button
                    onClick={() => { setLongPressTarget(null); setTimerTarget(longPressTarget) }}
                    style={{ width: '100%', padding: '12px 0', borderRadius: 8, background: 'transparent', color: '#111111', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: 16 }}
                  >
                    {M.overlays.startTimer}
                  </button>
                  <button
                    onClick={() => handleDeleteBtn(longPressTarget.id)}
                    style={{ width: '100%', padding: '12px 0', borderRadius: 8, background: 'transparent', color: '#FF3B30', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: 16 }}
                  >
                    {M.overlays.deleteButton}
                  </button>
                  <button
                    onClick={() => setLongPressTarget(null)}
                    style={{ width: '100%', padding: '12px 0', marginTop: 8, borderRadius: 8, background: '#F0F0F0', color: '#555555', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                  >
                    {M.common.cancel}
                  </button>
                </div>
              </div>
            )}

            {/* Edit button dialog */}
            {editingBtn && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 24 }}>
                <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, maxWidth: 320, width: '100%' }}>
                  <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#111111' }}>
                    {M.overlays.editButton}
                  </p>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder={M.overlays.buttonNamePlaceholder}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 14, marginBottom: 16 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setEditingBtn(null); setEditLabel('') }}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 13, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}
                    >
                      {M.common.cancel}
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                      {M.common.save}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Timer picker */}
            {timerTarget && (
              <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: '#FFF9E6', border: '1px solid #FFD54F' }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#111111' }}>
                  {M.overlays.pickTimerDuration(timerTarget.label)}
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {TIMER_PRESETS.map((min) => (
                    <button
                      key={min}
                      onClick={() => handleStartTimer(min)}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      {M.overlays.minutes(min)}
                    </button>
                  ))}
                  <button
                    onClick={() => setTimerTarget(null)}
                    style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 12, border: '1px solid #EBEBEB', cursor: 'pointer' }}
                  >
                    {M.common.cancel}
                  </button>
                </div>
              </div>
            )}

            {/* Add button */}
            {addingBtn ? (
              <div style={{ padding: 12, borderRadius: 10, background: '#F8F8F8', marginBottom: 12 }}>
                <input
                  type="text"
                  value={newBtnLabel}
                  onChange={(e) => setNewBtnLabel(e.target.value)}
                  placeholder={M.overlays.buttonNamePlaceholder}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 14, marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setAddingBtn(false); setNewBtnLabel('') }}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 12, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}
                  >
                    {M.common.cancel}
                  </button>
                  <button
                    onClick={handleConfirmAdd}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                  >
                    {M.overlays.add}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleAddBtn}
                style={{ marginBottom: 12, padding: '11px 14px', borderRadius: 10, border: '1px dashed #DDDDDD', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 16, color: '#AAAAAA', fontWeight: 200, lineHeight: 1 }}>+</span>
                <span style={{ fontSize: 12, color: '#AAAAAA', letterSpacing: '.02em' }}>{M.overlays.addButton}</span>
              </div>
            )}

            {/* Category selection */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#AAAAAA' }}>{M.overlays.category}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['habit', 'diet', 'exercise', 'reflection', 'routine'] as PostCategory[]).map((cat) => {
                  const key = `category_${cat}` as keyof typeof M.overlays
                  const label = typeof M.overlays[key] === 'string' ? M.overlays[key] as string : cat
                  return (
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
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Visibility selection */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#AAAAAA' }}>{M.overlays.visibilityLabel}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['group', 'public', 'followers', 'private'] as PostVisibility[]).map((vis) => {
                  // Hide 'public' when a group is selected (it will be mapped to 'group' anyway)
                  if (vis === 'public' && recordCommunityId) return null
                  
                  const key = `visibility_${vis}` as keyof typeof M.overlays
                  const label = typeof M.overlays[key] === 'string' ? M.overlays[key] as string : vis
                  return (
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
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Target group selection */}
            {joinedCommunities.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#AAAAAA' }}>{M.overlays.selectGroup}</p>
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
                  <option value="">{M.overlays.noGroup}</option>
                  {joinedCommunities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Instagram URL */}
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#AAAAAA' }}>{M.overlays.instagramLink}</p>
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
