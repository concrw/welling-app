import { useState } from 'react'
import { useAppStore } from '../store/appStore'

type ClickAction = 'link' | 'modal' | 'page'

interface AdSlot {
  id: string
  slotName: string
  brand: string
  desc: string
  clickAction: ClickAction
  url: string
  modalTitle: string
  modalBody: string
  pageId: string
}

const INITIAL_SLOTS: AdSlot[] = [
  { id: 'explore', slotName: 'Explore 배너', brand: '나이키 러닝 클럽', desc: '함께 달리면 더 멀리.', clickAction: 'link', url: 'https://nike.com/kr', modalTitle: '', modalBody: '', pageId: '' },
  { id: 'ranking', slotName: 'Ranking 배너', brand: '마이프로틴 Korea', desc: '루틴의 완성. 100% 유청 단백질.', clickAction: 'modal', url: '', modalTitle: '마이프로틴 특별 할인', modalBody: '루틴 챌린지 달성자 한정 20% 할인쿠폰을 드려요.\n프로모션 코드: WELLING20', pageId: '' },
  { id: 'mypage', slotName: 'MyPage 배너', brand: 'Calm · 마음 루틴', desc: '수면의 질이 루틴을 결정해요.', clickAction: 'page', url: '', modalTitle: '', modalBody: '', pageId: 'calm-detail' },
]

const TYPE_LABEL: Record<ClickAction, string> = { link: '링크', modal: '모달', page: '페이지' }


export default function AdminAds() {
  const goBack = useAppStore((s) => s.goBack)
  const [slots, setSlots] = useState<AdSlot[]>(INITIAL_SLOTS)
  const [drafts, setDrafts] = useState<Record<string, AdSlot>>({})
  const [editing, setEditing] = useState<string | null>(null)

  const update = (id: string, patch: Partial<AdSlot>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? slots.find((s) => s.id === id)!), ...patch } }))

  const startEdit = (id: string) => {
    const slot = slots.find((s) => s.id === id)!
    setDrafts((prev) => ({ ...prev, [id]: { ...slot } }))
    setEditing(id)
  }

  const cancelEdit = (id: string) => {
    setDrafts((prev) => { const next = { ...prev }; delete next[id]; return next })
    setEditing(null)
  }

  const save = (id: string) => {
    const draft = drafts[id]
    if (draft) setSlots((prev) => prev.map((s) => s.id === id ? { ...draft } : s))
    cancelEdit(id)
  }

  const getSlot = (id: string) => (editing === id && drafts[id]) ? drafts[id] : slots.find((s) => s.id === id)!

  const actionBtnStyle = (active: boolean) => ({
    padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
    background: active ? '#111111' : 'transparent', color: active ? '#fff' : '#111111', border: `1px solid ${active ? '#111111' : '#EBEBEB'}`
  } as React.CSSProperties)

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>광고 관리</span>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {slots.map((origSlot) => {
          const isOpen = editing === origSlot.id
          const slot = getSlot(origSlot.id)
          return (
            <div key={origSlot.id} style={{ borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EBEBEB' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{origSlot.slotName}</span>
                {isOpen ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => cancelEdit(origSlot.id)} style={{ padding: '5px 11px', borderRadius: 6, background: 'transparent', color: '#AAAAAA', fontSize: 11, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}>취소</button>
                    <button onClick={() => save(origSlot.id)} style={{ padding: '5px 11px', borderRadius: 6, background: '#111111', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}>저장</button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(origSlot.id)} style={{ padding: '5px 11px', borderRadius: 6, background: 'transparent', color: '#111111', fontSize: 11, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}>수정</button>
                )}
              </div>

              {!isOpen && (
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{slot.brand || '—'}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.desc || '—'}</p>
                  </div>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#F0F0F0', color: '#666666', fontWeight: 600, flexShrink: 0, letterSpacing: '.04em' }}>{TYPE_LABEL[slot.clickAction]}</span>
                </div>
              )}

              {isOpen && (
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>브랜드명</p>
                    <input value={slot.brand} onChange={(e) => update(origSlot.id, { brand: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>설명</p>
                    <input value={slot.desc} onChange={(e) => update(origSlot.id, { desc: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>클릭 액션</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => update(origSlot.id, { clickAction: 'link' })} style={actionBtnStyle(slot.clickAction === 'link')}>링크 이동</button>
                      <button onClick={() => update(origSlot.id, { clickAction: 'modal' })} style={actionBtnStyle(slot.clickAction === 'modal')}>모달</button>
                      <button onClick={() => update(origSlot.id, { clickAction: 'page' })} style={actionBtnStyle(slot.clickAction === 'page')}>페이지</button>
                    </div>
                  </div>
                  {slot.clickAction === 'link' && (
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>URL</p>
                      <input value={slot.url} onChange={(e) => update(origSlot.id, { url: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                  {slot.clickAction === 'modal' && (
                    <>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>모달 제목</p>
                        <input value={slot.modalTitle} onChange={(e) => update(origSlot.id, { modalTitle: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>모달 내용</p>
                        <textarea value={slot.modalBody} onChange={(e) => update(origSlot.id, { modalBody: e.target.value })} rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit' }} />
                      </div>
                    </>
                  )}
                  {slot.clickAction === 'page' && (
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>연결 페이지 ID</p>
                      <input value={slot.pageId} onChange={(e) => update(origSlot.id, { pageId: e.target.value })} placeholder="예: calm-detail" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', color: '#111111', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
