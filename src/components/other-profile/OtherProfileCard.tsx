import type { User } from '../../store/appStore'
import { useMessages } from '../../i18n'

interface OtherProfileCardProps {
  user: User
  isFollowed: boolean
  isSynced: boolean
  onToggleFollow: () => void
  onOpenSync: () => void
}

export function OtherProfileCard({ user, isFollowed, isSynced, onToggleFollow, onOpenSync }: OtherProfileCardProps) {
  const M = useMessages()
  return (
    <div data-testid="other-profile-card" style={{ background: '#FFFFFF', padding: '16px 20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', flexShrink: 0, background: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{user.initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 20, fontWeight: 700, color: '#111111', letterSpacing: '-.3px', lineHeight: 1 }}>{user.name}</p>
          <p style={{ margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#AAAAAA', fontWeight: 400 }}>{M.otherProfile.handleLine(user.handle)}</p>
          <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#333333', fontWeight: 400 }}>
            <span style={{ fontWeight: 700 }}>{user.followers.toLocaleString()}</span> {M.otherProfile.followersLabel} &nbsp;
            <span style={{ fontWeight: 700 }}>{user.following.toLocaleString()}</span> {M.otherProfile.followingLabel}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          data-testid="other-profile-follow"
          aria-pressed={isFollowed}
          onClick={onToggleFollow}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 24,
            background: isFollowed ? '#111111' : 'transparent',
            color: isFollowed ? '#fff' : '#111111',
            border: '1.5px solid #111111',
            fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
          }}
        >
          {isFollowed ? M.otherProfile.following : M.otherProfile.follow}
        </button>
        <button
          data-testid="other-profile-sync"
          aria-pressed={isSynced}
          onClick={onOpenSync}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 24,
            background: isSynced ? '#111111' : '#0984E3',
            color: '#fff',
            border: 'none',
            fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
          }}
        >
          {isSynced ? M.otherProfile.synced : M.otherProfile.syncRoutine}
        </button>
      </div>
    </div>
  )
}
