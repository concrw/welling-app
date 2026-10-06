import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'
import { getNotificationText } from '../lib/notificationText'

const PALETTE = ['#374151', '#0984E3', '#00B894', '#6C5CE7', '#B45309', '#047857', '#0369A1', '#7C3AED']

function getColor(name: string) {
  return PALETTE[name.charCodeAt(0) % PALETTE.length]
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Notifications() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const notifications = useAppStore((s) => s.notifications)
  const markAllRead = useAppStore((s) => s.markAllRead)
  const markSingleRead = useAppStore((s) => s.markSingleRead)
  const loadNotifications = useAppStore((s) => s.loadNotifications)
  const isDemo = useAppStore((s) => s.isDemo)
  const loading = useAppStore((s) => s.notificationsLoading)
  const hasError = useAppStore((s) => s.notificationsError)

  useEffect(() => {
    if (isDemo) return
    const refresh = () => { if (document.visibilityState === 'visible') void loadNotifications() }
    refresh()
    let intervalId: ReturnType<typeof setInterval> | null = setInterval(refresh, 60_000)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh()
        if (!intervalId) intervalId = setInterval(refresh, 60_000)
      } else if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (intervalId) clearInterval(intervalId)
    }
  }, [isDemo, loadNotifications])

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.notifications.title}</span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <div style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#E53535', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', boxSizing: 'border-box' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{notifications.filter((n) => !n.read).length > 99 ? '99+' : notifications.filter((n) => !n.read).length}</span>
            </div>
          )}
        </div>
        <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#AAAAAA', padding: 0, letterSpacing: '.02em' }}>{M.notifications.markAllRead}</button>
      </div>

      <div>
        {loading && notifications.length === 0 && <div style={{ padding: '60px 20px', textAlign: 'center', color: '#777777' }}>{M.notifications.loading}</div>}
        {hasError && (
          <div role="alert" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>{M.notifications.errorTitle}</p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#777777' }}>{M.notifications.errorDesc}</p>
            <button onClick={() => void loadNotifications()} style={{ padding: '10px 16px', border: 0, borderRadius: 9, background: '#111111', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>{M.notifications.retry}</button>
          </div>
        )}
        {!hasError && notifications.map((n) => (
          <div key={n.id} onClick={() => markSingleRead(n.id)} style={{ padding: '13px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', background: n.read ? '#FFFFFF' : (n.bgColor ?? '#FFFDF5'), borderBottom: '1px solid #F5F5F5', cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: getColor(n.user), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{getInitials(n.user)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 3px', fontSize: 13, color: '#111111', lineHeight: 1.45, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                <span style={{ fontWeight: 700 }}>{n.user}</span>{getNotificationText(n, M)}
              </p>
              {n.preview && <p style={{ margin: '0 0 3px', fontSize: 12, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.preview}</p>}
              <p style={{ margin: 0, fontSize: 11, color: '#CCCCCC', fontWeight: 300 }}>{n.time}</p>
            </div>
            {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E53535', flexShrink: 0, marginTop: 5 }} />}
          </div>
        ))}

        {!loading && !hasError && notifications.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111111' }}>{M.notifications.emptyTitle}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.notifications.emptyDesc}</p>
          </div>
        )}
      </div>
    </div>
  )
}
