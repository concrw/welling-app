import { useMessages } from '../../i18n'

interface SuggestedUser {
  id: string
  name: string
  bio: string
  color: string
  initials: string
}

interface FollowScreenProps {
  suggestedUsers: SuggestedUser[]
  onboardingFollowed: Set<string>
  toggleFollowOnboard: (id: string) => void
  onContinue: () => void
  onSkip: () => void
}

export function FollowScreen({ suggestedUsers, onboardingFollowed, toggleFollowOnboard, onContinue, onSkip }: FollowScreenProps) {
  const M = useMessages()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', minHeight: '100svh' }}>
      <div style={{ padding: 'calc(22px + env(safe-area-inset-top)) 20px 14px', flexShrink: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '.06em' }}>{M.onboarding.followStep}</p>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{M.onboarding.followTitle}</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.onboarding.followSubtitle}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
        {suggestedUsers.slice(0, 5).map((su) => {
          const isFollowed = onboardingFollowed.has(su.id)
          return (
            <div key={su.id} style={{ marginBottom: 10, padding: '14px 16px', borderRadius: 12, background: '#FAFAFA', border: isFollowed ? '1.5px solid #111111' : '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: su.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{su.initials}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#111111' }}>{su.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{su.bio}</p>
              </div>
              <button
                onClick={() => toggleFollowOnboard(su.id)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: isFollowed ? '#111111' : 'transparent',
                  color: isFollowed ? '#fff' : '#111111',
                  border: isFollowed ? '1.5px solid #111111' : '1.5px solid #111111',
                  cursor: 'pointer', flexShrink: 0
                }}
              >
                {isFollowed ? M.onboarding.following : M.onboarding.follow}
              </button>
            </div>
          )
        })}
      </div>
      <div style={{ padding: '16px 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onContinue} style={{ width: '100%', padding: 14, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {M.onboarding.continue}
        </button>
        <button onClick={onSkip} style={{ width: '100%', padding: 11, borderRadius: 10, background: 'transparent', color: '#AAAAAA', fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: 300 }}>
          {M.onboarding.skip}
        </button>
      </div>
    </div>
  )
}
