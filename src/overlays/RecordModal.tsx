import { useState, useRef } from 'react'
import { useAppStore } from '../store/appStore'

const DEFAULT_BUTTONS = [
  { id: 'b1', num: 1, label: 'Squat 20' },
  { id: 'b2', num: 2, label: 'Water' },
  { id: 'b3', num: 3, label: 'Stretch 10m' },
  { id: 'b4', num: 4, label: 'Meditate 5m' },
  { id: 'b5', num: 5, label: 'Stairs' },
  { id: 'b6', num: 6, label: 'Read 30m' },
  { id: 'b7', num: 7, label: 'Run 20m' },
  { id: 'b8', num: 8, label: 'Plank 1m' },
]

interface QuickBtn { id: string; num: number; label: string }

export default function RecordModal() {
  const showRecordModal = useAppStore((s) => s.showRecordModal)
  const closeRecordModal = useAppStore((s) => s.closeRecordModal)
  const [buttons, setButtons] = useState<QuickBtn[]>(DEFAULT_BUTTONS)
  const [toast, setToast] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [recordText, setRecordText] = useState('')
  const [longPressTarget, setLongPressTarget] = useState<QuickBtn | null>(null)
  const [editingBtn, setEditingBtn] = useState<QuickBtn | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [addingBtn, setAddingBtn] = useState(false)
  const [newBtnLabel, setNewBtnLabel] = useState('')
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!showRecordModal) return null

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleTap = (btn: QuickBtn) => {
    showToast(`${btn.label} 기록 완료`)
    setTimeout(() => closeRecordModal(), 400)
  }

  const handlePressStart = (btn: QuickBtn) => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setLongPressTarget(btn)
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
    setButtons((prev) => prev.filter((b) => b.id !== id))
    setLongPressTarget(null)
  }

  const handleEditBtn = (btn: QuickBtn) => {
    setEditingBtn(btn)
    setEditLabel(btn.label)
    setLongPressTarget(null)
  }

  const handleSaveEdit = () => {
    if (!editingBtn || !editLabel.trim()) return
    setButtons((prev) => prev.map((b) => b.id === editingBtn.id ? { ...b, label: editLabel.trim() } : b))
    setEditingBtn(null)
    setEditLabel('')
  }

  const addQuickButton = (label: string) => setButtons((prev) => [...prev, { id: `b${Date.now()}`, num: prev.length + 1, label }])

  const handleAddBtn = () => { setAddingBtn(true); setNewBtnLabel('') }

  const handleConfirmAdd = () => {
    if (newBtnLabel.trim()) addQuickButton(newBtnLabel.trim())
    setAddingBtn(false)
    setNewBtnLabel('')
  }

  const handleTextRecord = () => {
    if (!recordText.trim()) return
    showToast('기록 완료')
    setRecordText('')
    setTimeout(() => closeRecordModal(), 400)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
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
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#AAAAAA', fontWeight: 300, letterSpacing: '.04em', textTransform: 'uppercase' }}>탭 한 번으로 즉시 기록</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {buttons.map((btn) => (
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
                      <button onClick={handleSaveEdit} style={{ flex: 1, padding: '6px 0', borderRadius: 7, background: '#111111', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>저장</button>
                      <button onClick={() => setEditingBtn(null)} style={{ flex: 1, padding: '6px 0', borderRadius: 7, background: 'transparent', color: '#AAAAAA', fontSize: 11, border: '1px solid #EBEBEB', cursor: 'pointer' }}>취소</button>
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
                      style={{ padding: '14px 12px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', width: '100%', textAlign: 'left', userSelect: 'none', transition: 'all .15s', boxSizing: 'border-box' }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#CCCCCC', fontVariantNumeric: 'tabular-nums', minWidth: 20 }}>{String(btn.num).padStart(2, '0')}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111111', lineHeight: 1.3, flex: 1 }}>{btn.label}</span>
                    </button>
                    {longPressTarget?.id === btn.id && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2 }}>
                        <button onClick={() => handleEditBtn(btn)} style={{ padding: '7px 14px', borderRadius: 8, background: '#FFFFFF', color: '#111111', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>수정</button>
                        <button onClick={() => handleDeleteBtn(btn.id)} style={{ padding: '7px 14px', borderRadius: 8, background: '#CC3333', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>삭제</button>
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
            ))}
          </div>

          <div onClick={handleAddBtn} style={{ marginTop: 10, padding: '11px 14px', borderRadius: 10, border: '1px dashed #DDDDDD', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 16, color: '#AAAAAA', fontWeight: 200, lineHeight: 1 }}>+</span>
            <span style={{ fontSize: 12, color: '#AAAAAA', letterSpacing: '.02em' }}>버튼 추가</span>
          </div>

          {addingBtn && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                autoFocus
                value={newBtnLabel}
                onChange={(e) => setNewBtnLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAdd(); if (e.key === 'Escape') { setAddingBtn(false); setNewBtnLabel('') } }}
                placeholder="버튼 이름 입력"
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#FAFAFA' }}
              />
              <button onClick={handleConfirmAdd} style={{ padding: '9px 14px', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>추가</button>
              <button onClick={() => { setAddingBtn(false); setNewBtnLabel('') }} style={{ padding: '9px 10px', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 12, border: '1px solid #EBEBEB', cursor: 'pointer' }}>취소</button>
            </div>
          )}

          <div style={{ marginTop: 16, borderTop: '1px solid #F0F0F0', paddingTop: 14 }}>
            {imagePreview && (
              <div style={{ position: 'relative', marginBottom: 10, borderRadius: 10, overflow: 'hidden' }}>
                <img src={imagePreview} alt="첨부 이미지" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                <button
                  onClick={() => setImagePreview(null)}
                  style={{ position: 'absolute', top: 7, right: 7, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
            <textarea
              value={recordText}
              onChange={(e) => setRecordText(e.target.value)}
              placeholder="오늘 한 것을 자유롭게 입력하세요."
              rows={3}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 14, background: '#FAFAFA', color: '#111111', resize: 'none', lineHeight: 1.7, marginBottom: 10, outline: 'none', fontWeight: 300, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", boxSizing: 'border-box', wordBreak: 'keep-all' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => fileRef.current?.click()} style={{ padding: '11px 13px', borderRadius: 10, background: '#F5F5F5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="10" rx="2" stroke="#555" strokeWidth="1.4"/><circle cx="5.2" cy="6.5" r="1.4" stroke="#555" strokeWidth="1.2"/><path d="M1.5 11.5l3.5-3.5 2.5 2.5 2-2 4 3.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button
                onClick={handleTextRecord}
                style={{ flex: 1, padding: 13, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >
                기록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
