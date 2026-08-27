import { useAppStore } from '../store/appStore'

export default function BottomNav() {
  const navTab = useAppStore((s) => s.navTab)
  const setNavTab = useAppStore((s) => s.setNavTab)
  const openRecordModal = useAppStore((s) => s.openRecordModal)
  const notifications = useAppStore((s) => s.notifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const dot = (tab: string) => navTab === tab ? '#111111' : 'transparent'
  const color = (tab: string) => navTab === tab ? '#111111' : '#AAAAAA'

  return (
    <div data-testid="bottom-nav" style={{ flexShrink: 0, background: '#FFFFFF', borderTop: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', zIndex: 20, paddingTop: 10, paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
      {/* Feed */}
      <button onClick={() => setNavTab('feed')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'none', border: 'none', padding: '8px 0', color: color('feed'), cursor: 'pointer' }}>
        <div style={{ position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="16" height="2.2" rx="1.1" fill="currentColor" />
            <rect x="2" y="8.9" width="11" height="2.2" rx="1.1" fill="currentColor" />
            <rect x="2" y="14.8" width="7" height="2.2" rx="1.1" fill="currentColor" />
          </svg>
          {unreadCount > 0 && (
            <div style={{ position: 'absolute', top: -3, right: -4, minWidth: 14, height: 14, borderRadius: 7, background: '#E53535', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxSizing: 'border-box' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            </div>
          )}
        </div>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: dot('feed'), transition: 'background .2s' }} />
      </button>

      {/* Explore */}
      <button onClick={() => setNavTab('explore')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'none', border: 'none', padding: '8px 0', color: color('explore'), cursor: 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" />
          <line x1="13.2" y1="13.2" x2="17.5" y2="17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: dot('explore'), transition: 'background .2s' }} />
      </button>

      {/* Record (center) */}
      <button onClick={openRecordModal} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'none', border: 'none', padding: '8px 0', color: '#111111', cursor: 'pointer' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" />
          <line x1="11" y1="7" x2="11" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="7" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'transparent' }} />
      </button>

      {/* Ranking */}
      <button onClick={() => setNavTab('ranking')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'none', border: 'none', padding: '8px 0', color: color('ranking'), cursor: 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="13" width="4" height="5" rx="1" fill="currentColor" opacity=".5" />
          <rect x="7" y="9" width="4" height="9" rx="1" fill="currentColor" opacity=".75" />
          <rect x="13" y="5" width="4" height="13" rx="1" fill="currentColor" />
        </svg>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: dot('ranking'), transition: 'background .2s' }} />
      </button>

      {/* MyPage */}
      <button onClick={() => setNavTab('mypage')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'none', border: 'none', padding: '8px 0', color: color('mypage'), cursor: 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 18.5c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: dot('mypage'), transition: 'background .2s' }} />
      </button>
    </div>
  )
}
