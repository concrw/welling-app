import { useAppStore } from '../store/appStore'

const PALETTE = ['#374151', '#0984E3', '#00B894', '#6C5CE7', '#B45309', '#047857', '#0369A1', '#7C3AED']

function getColor(name: string) {
  return PALETTE[name.charCodeAt(0) % PALETTE.length]
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Notifications() {
  const goBack = useAppStore((s) => s.goBack)
  const notifications = useAppStore((s) => s.notifications)
  const markAllRead = useAppStore((s) => s.markAllRead)
  const markSingleRead = useAppStore((s) => s.markSingleRead)

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>알림</span>
        <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#AAAAAA', padding: 0, letterSpacing: '.02em' }}>모두 읽음</button>
      </div>

      <div>
        {notifications.map((n) => (
          <div key={n.id} onClick={() => markSingleRead(n.id)} style={{ padding: '13px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', background: n.read ? '#FFFFFF' : (n.bgColor ?? '#FFFDF5'), borderBottom: '1px solid #F5F5F5', cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: getColor(n.user), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{getInitials(n.user)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 3px', fontSize: 13, color: '#111111', lineHeight: 1.45, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                <span style={{ fontWeight: 700 }}>{n.user}</span>{n.text}
              </p>
              {n.preview && <p style={{ margin: '0 0 3px', fontSize: 12, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.preview}</p>}
              <p style={{ margin: 0, fontSize: 11, color: '#CCCCCC', fontWeight: 300 }}>{n.time}</p>
            </div>
            {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E53535', flexShrink: 0, marginTop: 5 }} />}
          </div>
        ))}

        {notifications.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111111' }}>알림 없음</p>
            <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>누군가 나에게 반응하면 여기서 확인할 수 있어요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
