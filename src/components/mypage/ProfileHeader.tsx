import type { Screen } from '../../store/appStore'
import { useMessages } from '../../i18n'

export function ProfileHeader({
  nickname,
  followersCount,
  followingCount,
  hasUnread,
  unreadCount,
  latestNotifText,
  mypageTab,
  onNavigate,
  onDashToggle,
}: {
  nickname: string
  followersCount: number
  followingCount: number
  hasUnread: boolean
  unreadCount: number
  latestNotifText?: string
  mypageTab: 'dashboard' | 'routine'
  onNavigate: (screen: Screen) => void
  onDashToggle: () => void
}) {
  const M = useMessages()
  const dashBtnLabel = mypageTab === 'routine' ? M.myPage.tabDashboard : M.myPage.tabRoutine

  return (
    <div style={{ background: '#FFFFFF', padding: 'calc(24px + env(safe-area-inset-top)) 20px 20px', borderBottom: '1px solid #EBEBEB' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{nickname[0]?.toUpperCase() ?? '?'}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 20, fontWeight: 700, color: '#111111', letterSpacing: '-.3px', lineHeight: 1 }}>{nickname.toUpperCase()}</p>
          <p style={{ margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#AAAAAA', fontWeight: 400 }}>{M.myPage.handleLine(nickname.toLowerCase())}</p>
          <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#333333', fontWeight: 400 }}>
            <span style={{ fontWeight: 700 }}>{followersCount}</span> {M.myPage.followersLabel} &nbsp;<span style={{ fontWeight: 700 }}>{followingCount}</span> {M.myPage.followingLabel}
          </p>
        </div>
      </div>

      {hasUnread && (
        <div onClick={() => onNavigate('notifications')} style={{ marginBottom: 12, padding: '9px 12px', background: '#F8F8F8', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E53535', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 11, color: '#333333', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{latestNotifText}</p>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#E53535', flexShrink: 0 }}>{unreadCount}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onNavigate('routine-edit')} style={{ flex: 1, padding: '7px 0', borderRadius: 24, background: '#0984E3', color: '#fff', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{M.myPage.editRoutine}</button>
        <button onClick={() => { if (navigator.share) { navigator.share({ title: 'WELLING', text: M.myPage.shareText(nickname), url: window.location.href }) } }} style={{ flex: 1, padding: '7px 0', borderRadius: 24, background: 'transparent', color: '#111111', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 600, border: '1.5px solid #DDDDDD', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{M.myPage.share}</button>
        <button onClick={onDashToggle} style={{ flex: 1, padding: '7px 0', borderRadius: 24, background: 'transparent', color: '#AAAAAA', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 600, border: '1.5px solid #EBEBEB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{dashBtnLabel}</button>
        <button onClick={() => onNavigate('messages')} style={{ flex: 1, padding: '7px 0', borderRadius: 24, background: 'transparent', color: '#111111', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 600, border: '1.5px solid #DDDDDD', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{M.myPage.messages}</button>
      </div>
    </div>
  )
}
