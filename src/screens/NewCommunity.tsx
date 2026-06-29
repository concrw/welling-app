import { useState } from 'react'
import { useAppStore } from '../store/appStore'

export default function NewCommunity() {
  const goBack = useAppStore((s) => s.goBack)
  const newCommName = useAppStore((s) => s.newCommName)
  const setNewCommName = useAppStore((s) => s.setNewCommName)
  const newCommDesc = useAppStore((s) => s.newCommDesc)
  const setNewCommDesc = useAppStore((s) => s.setNewCommDesc)
  const commVisibility = useAppStore((s) => s.commVisibility)
  const setCommVisibility = useAppStore((s) => s.setCommVisibility)

  const [descValue, setDescValue] = useState(newCommDesc)

  const visBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: active ? '#111111' : '#FAFAFA',
    color: active ? '#fff' : '#555555',
    border: `1px solid ${active ? '#111111' : '#DDDDDD'}`,
  })

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>새 커뮤니티</span>
        <button
          onClick={() => { if (newCommName.trim().length >= 1) goBack() }}
          style={{ padding: '7px 16px', borderRadius: 8, background: newCommName.trim().length >= 1 ? '#111111' : '#CCCCCC', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: newCommName.trim().length >= 1 ? 'pointer' : 'default', letterSpacing: '.02em' }}
        >
          만들기
        </button>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>커뮤니티 이름</p>
          <input
            value={newCommName}
            onChange={(e) => setNewCommName(e.target.value)}
            placeholder="예: 새벽 독서 클럽"
            maxLength={30}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 14, color: '#111111', background: '#FAFAFA', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>설명 (선택)</p>
          <textarea
            value={descValue}
            onChange={(e) => { setDescValue(e.target.value); setNewCommDesc(e.target.value) }}
            placeholder="어떤 루틴을 공유하는 커뮤니티인가요?"
            rows={3}
            maxLength={200}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 14, color: '#111111', background: '#FAFAFA', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.7, fontFamily: "'Noto Sans KR',sans-serif" }}
          />
        </div>

        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>공개 범위</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setCommVisibility('public')} style={visBtnStyle(commVisibility === 'public')}>전체 공개</button>
            <button onClick={() => setCommVisibility('private')} style={visBtnStyle(commVisibility === 'private')}>비공개</button>
          </div>
        </div>
      </div>
    </div>
  )
}
