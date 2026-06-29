import { useAppStore } from '../store/appStore'

const PALETTE = ['#374151', '#0984E3', '#00B894', '#6C5CE7', '#B45309', '#047857', '#0369A1', '#7C3AED']
function getColor(name: string) { return PALETTE[name.charCodeAt(0) % PALETTE.length] }
function getInitials(name: string) { return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() }

const THREADS = [
  { id: 't1', name: 'Jay', last: '오늘 루틴 어떻게 됐어?', time: '10:32', unread: true },
  { id: 't2', name: 'Sora', last: 'Running 같이 해요!', time: '어제', unread: false },
  { id: 't3', name: 'Tom', last: '잘 자요 :)', time: '월', unread: false },
  { id: 't4', name: 'Mina', last: 'Morning Sync 참가해요?', time: '일', unread: true },
]

export default function Messages() {
  const goBack = useAppStore((s) => s.goBack)
  const navigate = useAppStore((s) => s.navigate)
  const setChatUser = useAppStore((s) => s.setChatUser)

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>메시지</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3l3 3 3-3h3a1 1 0 001-1V4a1 1 0 00-1-1z" stroke="#111111" strokeWidth="1.5" strokeLinejoin="round"/></svg>
      </div>

      <div>
        {THREADS.map((t) => (
          <div key={t.id} onClick={() => { setChatUser(t.name); navigate('chat-thread') }} style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F5F5F5', cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: getColor(t.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{getInitials(t.name)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111111' }}>{t.name}</span>
                <span style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 300, flexShrink: 0, marginLeft: 8 }}>{t.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.last}</p>
            </div>
            {t.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E53535', flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
