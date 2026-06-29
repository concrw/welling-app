import { useState } from 'react'
import { useAppStore } from '../store/appStore'

interface RoutineItem {
  id: string
  name: string
  time: string
  desc: string
  imgUrl?: string
  isEditingItem: boolean
  isConfirmingDelete: boolean
  isPicking: boolean
  editDraftName: string
  editDraftTime: string
  editDraftDesc: string
}

interface RoutineGroup {
  id: string
  name: string
  items: RoutineItem[]
  isAdding: boolean
  newItemText: string
}

const INIT_GROUPS: RoutineGroup[] = [
  {
    id: 'g1', name: 'Morning', isAdding: false, newItemText: '',
    items: [
      { id: 'i1', name: 'Morning Walk', time: '06:00', desc: '30분 가볍게', imgUrl: undefined, isEditingItem: false, isConfirmingDelete: false, isPicking: false, editDraftName: 'Morning Walk', editDraftTime: '06:00', editDraftDesc: '30분 가볍게' },
      { id: 'i2', name: 'Cold Shower', time: '06:30', desc: '', imgUrl: undefined, isEditingItem: false, isConfirmingDelete: false, isPicking: false, editDraftName: 'Cold Shower', editDraftTime: '06:30', editDraftDesc: '' },
    ],
  },
  {
    id: 'g2', name: 'Running', isAdding: false, newItemText: '',
    items: [
      { id: 'i3', name: 'Running 5km', time: '08:00', desc: '한강 코스', imgUrl: undefined, isEditingItem: false, isConfirmingDelete: false, isPicking: false, editDraftName: 'Running 5km', editDraftTime: '08:00', editDraftDesc: '한강 코스' },
    ],
  },
]

const AVAIL_IMGS = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&q=80',
]

export default function RoutineEdit() {
  const goBack = useAppStore((s) => s.goBack)
  const [groups, setGroups] = useState(INIT_GROUPS)

  const updateItem = (gid: string, iid: string, patch: Partial<RoutineItem>) =>
    setGroups((prev) => prev.map((g) => g.id !== gid ? g : { ...g, items: g.items.map((item) => item.id !== iid ? item : { ...item, ...patch }) }))

  const updateGroup = (gid: string, patch: Partial<RoutineGroup>) =>
    setGroups((prev) => prev.map((g) => g.id !== gid ? g : { ...g, ...patch }))

  const deleteItem = (gid: string, iid: string) =>
    setGroups((prev) => prev.map((g) => g.id !== gid ? g : { ...g, items: g.items.filter((i) => i.id !== iid) }))

  const confirmAdd = (gid: string) => {
    const group = groups.find((g) => g.id === gid)!
    if (!group.newItemText.trim()) return
    const newItem: RoutineItem = { id: `i${Date.now()}`, name: group.newItemText.trim(), time: '', desc: '', isEditingItem: false, isConfirmingDelete: false, isPicking: false, editDraftName: group.newItemText.trim(), editDraftTime: '', editDraftDesc: '' }
    setGroups((prev) => prev.map((g) => g.id !== gid ? g : { ...g, items: [...g.items, newItem], isAdding: false, newItemText: '' }))
  }

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>루틴 편집</span>
        <button onClick={goBack} style={{ padding: '7px 16px', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}>저장</button>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groups.map((group) => (
          <div key={group.id} style={{ borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: '.08em' }}>{group.name}</span>
              <button onClick={() => updateGroup(group.id, { isAdding: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#111111', padding: 0, fontWeight: 600 }}>+ 추가</button>
            </div>

            {group.items.map((item) => (
              <div key={item.id} style={{ padding: '10px 16px', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div onClick={() => updateItem(group.id, item.id, { isPicking: !item.isPicking })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed #C8973A', position: 'relative' }}>
                      {item.imgUrl ? (
                        <div style={{ width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${item.imgUrl})` }} />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="#C8973A" strokeWidth="1.4"/><circle cx="6" cy="6.5" r="1" fill="#C8973A"/><path d="M2 10l3-3 2.5 2.5L10 7l4 4" stroke="#C8973A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <span style={{ fontSize: 9, color: '#C8973A', fontWeight: 600, letterSpacing: '.04em' }}>이미지</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#333333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      <span style={{ fontSize: 11, color: '#BBBBBB', flexShrink: 0 }}>{item.time}</span>
                    </div>
                    {item.desc && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#AAAAAA', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</p>}
                  </div>
                  <button onClick={() => updateItem(group.id, item.id, { isEditingItem: true, editDraftName: item.name, editDraftTime: item.time, editDraftDesc: item.desc })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button onClick={() => updateItem(group.id, item.id, { isConfirmingDelete: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="3" y1="3" x2="11" y2="11" stroke="#CCCCCC" strokeWidth="1.6" strokeLinecap="round"/><line x1="11" y1="3" x2="3" y2="11" stroke="#CCCCCC" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  </button>
                </div>

                {item.isConfirmingDelete && (
                  <div style={{ marginTop: 8, padding: '10px 12px', background: '#FFF5F5', borderRadius: 10, border: '1px solid #FFDDDD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#CC3333', fontWeight: 600 }}>삭제하시겠습니까?</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => deleteItem(group.id, item.id)} style={{ padding: '5px 12px', borderRadius: 7, background: '#CC3333', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>삭제</button>
                      <button onClick={() => updateItem(group.id, item.id, { isConfirmingDelete: false })} style={{ padding: '5px 10px', borderRadius: 7, background: 'transparent', color: '#AAAAAA', fontSize: 11, border: '1px solid #EBEBEB', cursor: 'pointer' }}>취소</button>
                    </div>
                  </div>
                )}

                {item.isEditingItem && (
                  <div style={{ marginTop: 10, padding: 12, background: '#FFFFFF', borderRadius: 10, border: '1px solid #E8E0D0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={item.editDraftName} onChange={(e) => updateItem(group.id, item.id, { editDraftName: e.target.value })} placeholder="루틴 이름" style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#FAFAFA' }} />
                      <input value={item.editDraftTime} onChange={(e) => updateItem(group.id, item.id, { editDraftTime: e.target.value })} placeholder="HH:MM" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#FAFAFA' }} />
                    </div>
                    <textarea value={item.editDraftDesc} onChange={(e) => updateItem(group.id, item.id, { editDraftDesc: e.target.value })} placeholder="설명 입력" style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#FAFAFA', resize: 'none', height: 72, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", lineHeight: 1.6 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => updateItem(group.id, item.id, { name: item.editDraftName, time: item.editDraftTime, desc: item.editDraftDesc, isEditingItem: false })} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>저장</button>
                      <button onClick={() => updateItem(group.id, item.id, { isEditingItem: false })} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 12, border: '1px solid #EBEBEB', cursor: 'pointer' }}>취소</button>
                    </div>
                  </div>
                )}

                {item.isPicking && (
                  <div style={{ marginTop: 10, padding: 10, background: '#FAFAFA', borderRadius: 10, border: '1px solid #EBEBEB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.06em', textTransform: 'uppercase' }}>이미지 선택</span>
                      <button onClick={() => updateItem(group.id, item.id, { isPicking: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#AAAAAA', padding: 0 }}>닫기</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                      {AVAIL_IMGS.map((url) => (
                        <div key={url} onClick={() => updateItem(group.id, item.id, { imgUrl: url, isPicking: false })} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${url})`, border: '1.5px solid #EBEBEB' }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {group.isAdding && (
              <div style={{ padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={group.newItemText} onChange={(e) => updateGroup(group.id, { newItemText: e.target.value })} placeholder="항목 이름 입력" style={{ flex: 1, padding: '8px 10px', borderRadius: 7, border: '1px solid #EBEBEB', fontSize: 13, outline: 'none', background: '#fff' }} />
                <button onClick={() => confirmAdd(group.id)} style={{ padding: '7px 12px', borderRadius: 7, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>확인</button>
                <button onClick={() => updateGroup(group.id, { isAdding: false, newItemText: '' })} style={{ padding: '7px 10px', borderRadius: 7, background: 'transparent', color: '#AAAAAA', fontSize: 12, border: '1px solid #EBEBEB', cursor: 'pointer' }}>취소</button>
              </div>
            )}
          </div>
        ))}

        <div onClick={() => setGroups(INIT_GROUPS)} style={{ marginTop: 4, padding: 14, borderRadius: 10, border: '1px dashed #CCCCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#AAAAAA' }}>새 루틴으로 초기화</span>
        </div>
      </div>
    </div>
  )
}
