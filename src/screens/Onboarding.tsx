import { useAppStore } from '../store/appStore'

export default function Onboarding() {
  const screen = useAppStore((s) => s.screen)
  const nicknameInput = useAppStore((s) => s.nicknameInput)
  const setNicknameInput = useAppStore((s) => s.setNicknameInput)
  const submitNickname = useAppStore((s) => s.submitNickname)
  const goFeedDemo = useAppStore((s) => s.goFeedDemo)
  const navigate = useAppStore((s) => s.navigate)
  const toggleFollowOnboard = useAppStore((s) => s.toggleFollowOnboard)
  const onboardingFollowed = useAppStore((s) => s.onboardingFollowed)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const goToMain = useAppStore((s) => s.goToMain)
  const goToMainWithRecord = useAppStore((s) => s.goToMainWithRecord)

  const ONBOARDING_POSTS = [
    { id: 'op1', user: 'Sora', initials: 'SR', color: '#6366F1', time: '2m', category: 'MORNING', content: '오늘도 새벽 5시 기상 완료. 스트레칭 10분 후 명상 5분.', reactions: [{ key: 'Good', count: 4 }, { key: 'Strong', count: 2 }] },
    { id: 'op2', user: 'Kevin', initials: 'KV', color: '#0EA5E9', time: '8m', category: 'GYM', content: 'Gym session done. Pull day — 4 sets lat pulldown, 3 sets rows.', reactions: [{ key: 'Good', count: 7 }] },
    { id: 'op3', user: 'Mina', initials: 'MN', color: '#F59E0B', time: '14m', category: 'WALKING', content: '점심 산책 20분. 계단으로만 이동 성공.', reactions: [{ key: 'Good', count: 11 }, { key: 'Cute', count: 3 }] },
    { id: 'op4', user: 'Jay', initials: 'JY', color: '#10B981', time: '22m', category: 'COLD', content: 'Cold shower at 6am. Day 32 streak.', reactions: [{ key: 'Strong', count: 9 }, { key: 'Wow', count: 4 }] },
  ]

  if (screen === 'onboarding-username') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#FFFFFF', minHeight: 844 }}>
        <img src="/uploads/welling-black.png" style={{ height: 58, width: 'auto', marginBottom: 20 }} alt="welling" />
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, color: '#111111', letterSpacing: -1 }}>WELLING</h1>
        <p style={{ margin: '0 0 48px', fontSize: 14, color: '#AAAAAA', textAlign: 'center', lineHeight: 1.8, fontWeight: 300 }}>
          Build your routine in stolen moments.<br />Stay motivated together.
        </p>
        <div style={{ width: '100%', marginBottom: 14 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>Username</p>
          <input
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitNickname() }}
            placeholder="2–10 characters"
            maxLength={10}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 16, background: '#FAFAFA', color: '#111111', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={submitNickname}
          style={{ width: '100%', padding: 15, borderRadius: 10, background: '#111111', color: '#FFFFFF', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}
        >
          Get started
        </button>
        <p style={{ marginTop: 20, fontSize: 11, color: '#CCCCCC', textAlign: 'center', lineHeight: 1.7, fontWeight: 300 }}>
          By signing up, you agree to our Terms &amp; Privacy Policy.
        </p>
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #EBEBEB', width: '100%', textAlign: 'center' }}>
          <button onClick={goFeedDemo} style={{ background: 'none', border: 'none', fontSize: 11, color: '#CCCCCC', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            Skip to demo
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'onboarding-preview') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', minHeight: 844 }}>
        <div style={{ padding: '22px 20px 14px', borderBottom: '1px solid #EBEBEB', flexShrink: 0 }}>
          <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#111111', letterSpacing: '.1em', textTransform: 'uppercase' }}>WELLING</p>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>See what people share</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {ONBOARDING_POSTS.map((op) => (
            <div key={op.id} style={{ padding: '14px 20px', borderBottom: '1px solid #EBEBEB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: op.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{op.initials}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>{op.user}</span>
                <span style={{ fontSize: 11, color: '#AAAAAA', marginLeft: 2 }}>{op.time}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#BBBBBB', letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0 }}>{op.category}</span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{op.content}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {op.reactions.map((r) => (
                  <span key={r.key} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid #EBEBEB', color: '#AAAAAA' }}>{r.key} {r.count}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #EBEBEB', flexShrink: 0 }}>
          <button onClick={() => navigate('onboarding-follow')} style={{ width: '100%', padding: 14, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'onboarding-follow') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', minHeight: 844 }}>
        <div style={{ padding: '22px 20px 14px', flexShrink: 0 }}>
          <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '.06em' }}>2 / 3</p>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>Better together</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>People with similar routines</p>
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
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '16px 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => navigate('onboarding-firstrecord')} style={{ width: '100%', padding: 14, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Continue
          </button>
          <button onClick={() => navigate('onboarding-firstrecord')} style={{ width: '100%', padding: 11, borderRadius: 10, background: 'transparent', color: '#AAAAAA', fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: 300 }}>
            Skip
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'onboarding-firstrecord') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#FFFFFF', minHeight: 844 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid #EBEBEB' }}>
          <span style={{ fontSize: 32, color: '#111111', fontWeight: 200, lineHeight: 1 }}>+</span>
        </div>
        <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 900, letterSpacing: '-.5px', color: '#111111', textAlign: 'center' }}>Share your first routine</h2>
        <p style={{ margin: '0 0 44px', fontSize: 13, color: '#AAAAAA', textAlign: 'center', lineHeight: 1.8, fontWeight: 300 }}>Anything counts. Start small.</p>
        <button onClick={goToMainWithRecord} style={{ width: '100%', padding: 15, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', marginBottom: 12, cursor: 'pointer' }}>
          Record now
        </button>
        <button onClick={goToMain} style={{ width: '100%', padding: 12, borderRadius: 10, background: 'transparent', color: '#AAAAAA', fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: 300 }}>
          Later
        </button>
      </div>
    )
  }

  return null
}
