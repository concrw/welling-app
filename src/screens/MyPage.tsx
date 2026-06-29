import { useAppStore } from '../store/appStore'

const ROUTINE_ITEMS = [
  { time: '06:30', name: 'Wake Up', desc: '매일 아침 6:30에 기상. 주말도 동일하게 유지해요.', bg: '#E0F2FE', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=120&h=120&fit=crop', isPublic: true },
  { time: '06:15', name: 'Morning Stretch', desc: '전신 스트레칭 10분. 어깨, 허리 중점.', bg: '#F0FDF4', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=120&h=120&fit=crop', isPublic: true },
  { time: '07:00', name: 'Meditation', desc: '명상 앱 사용, 호흡 집중 5분.', bg: '#FDF4FF', img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=120&h=120&fit=crop', isPublic: false },
  { time: '12:30', name: 'Lunch Walk', desc: '점심 식사 후 산책 20분.', bg: '#FFFBEB', img: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=120&h=120&fit=crop', isPublic: true },
  { time: '21:00', name: 'Reading', desc: '취침 전 독서 30분. 스크린 없는 시간.', bg: '#FFF1F2', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&h=120&fit=crop', isPublic: false },
]

const ROUTINE_GROUPS = [
  { name: 'Morning', achievement: 82, items: [{ name: 'Cold Shower', rate: 90 }, { name: 'Stretch', rate: 85 }, { name: 'Meditation', rate: 70 }] },
  { name: 'Lunch', achievement: 64, items: [{ name: 'Lunch Walk', rate: 64 }] },
  { name: 'Evening', achievement: 48, items: [{ name: 'Reading', rate: 55 }, { name: 'No screens 9pm', rate: 40 }] },
]

const PREV_ROUTINES = [
  { period: 'May 1 – Jun 1', achievement: 71 },
  { period: 'Apr 1 – May 1', achievement: 58 },
  { period: 'Mar 1 – Apr 1', achievement: 65 },
]

const PERIOD_TABS = ['This week', 'This month', 'All time']

export default function MyPage() {
  const navigate = useAppStore((s) => s.navigate)
  const openRecordModal = useAppStore((s) => s.openRecordModal)
  const mypageTab = useAppStore((s) => s.mypageTab)
  const setMypageTab = useAppStore((s) => s.setMypageTab)
  const nickname = useAppStore((s) => s.nickname)
  const dashboardPeriod = useAppStore((s) => s.dashboardPeriod)
  const setDashboardPeriod = useAppStore((s) => s.setDashboardPeriod)
  const expandedPrev = useAppStore((s) => s.expandedPrev)
  const toggleExpandPrev = useAppStore((s) => s.toggleExpandPrev)
  const notifications = useAppStore((s) => s.notifications)
  const isAdmin = useAppStore((s) => s.isAdmin)

  const followersCount = 47
  const followingCount = 23

  const hasUnread = notifications.some((n) => !n.read)
  const unreadCount = notifications.filter((n) => !n.read).length
  const latestNotif = notifications.find((n) => !n.read)

  const MYPAGE_LINKS = [
    { label: 'Goal vs. Actual', handler: () => navigate('goal-vs-actual') },
    { label: 'Evening reflection', handler: () => openRecordModal() },
    { label: 'Routine history', handler: () => navigate('routine-history') },
    { label: 'Routine privacy', handler: () => navigate('routine-privacy') },
    { label: 'Quick button manager', handler: () => openRecordModal() },
    { label: 'Insights', handler: () => navigate('insights') },
    { label: 'Settings', handler: () => navigate('settings') },
  ]

  return (
    <div>
      {/* Profile header */}
      <div style={{ background: '#FFFFFF', padding: 'calc(24px + env(safe-area-inset-top)) 20px 20px', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: '#222' }}>
            <img src="/uploads/agns_cat_4.png" alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 20, fontWeight: 700, color: '#111111', letterSpacing: '-.3px', lineHeight: 1 }}>{nickname.toUpperCase()}</p>
            <p style={{ margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#AAAAAA', fontWeight: 400 }}>@{nickname.toLowerCase()}.welling · WELLING</p>
            <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#333333', fontWeight: 400 }}>
              <span style={{ fontWeight: 700 }}>{followersCount}</span> followers &nbsp;<span style={{ fontWeight: 700 }}>{followingCount}</span> following
            </p>
          </div>
        </div>

        {hasUnread && (
          <div onClick={() => navigate('notifications')} style={{ marginBottom: 12, padding: '9px 12px', background: '#F8F8F8', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E53535', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 11, color: '#333333', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{latestNotif?.text}</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#E53535', flexShrink: 0 }}>{unreadCount}</span>
          </div>
        )}

        {(() => {
          const dashBtnLabel = mypageTab === 'routine' ? '대시보드' : '루틴'
          const dashBtnAction = () => setMypageTab(mypageTab === 'routine' ? 'dashboard' : 'routine')
          return (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => navigate('routine-edit')} style={{ flex: 1, padding: '7px 0', borderRadius: 24, background: '#C9A84C', color: '#fff', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>루틴편집</button>
              <button style={{ flex: 1, padding: '7px 0', borderRadius: 24, background: 'transparent', color: '#111111', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 600, border: '1.5px solid #DDDDDD', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>공유</button>
              <button onClick={dashBtnAction} style={{ flex: 1, padding: '7px 0', borderRadius: 24, background: 'transparent', color: '#AAAAAA', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 600, border: '1.5px solid #EBEBEB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{dashBtnLabel}</button>
              <button onClick={() => navigate('messages')} style={{ flex: 1, padding: '7px 0', borderRadius: 24, background: 'transparent', color: '#111111', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 600, border: '1.5px solid #DDDDDD', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>메시지</button>
            </div>
          )
        })()}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
        {(['routine', 'dashboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMypageTab(tab)}
            style={{
              flex: 1, padding: '12px 0', fontSize: 13, fontWeight: mypageTab === tab ? 700 : 400,
              color: mypageTab === tab ? '#111111' : '#AAAAAA',
              background: 'none', border: 'none', borderBottom: mypageTab === tab ? '2px solid #111111' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1,
            }}
          >
            {tab === 'routine' ? '루틴' : '대시보드'}
          </button>
        ))}
      </div>

      {/* Routine tab */}
      {mypageTab === 'routine' && (
        <div style={{ background: '#FAF8F4', padding: '24px 16px 32px' }}>
          {ROUTINE_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
              <div style={{ width: 54, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111111', letterSpacing: '-.3px' }}>{item.time}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111111', margin: '6px 0 0', flexShrink: 0 }} />
                {i < ROUTINE_ITEMS.length - 1 && <div style={{ width: 1, flex: 1, background: '#DDDDDD', minHeight: 32 }} />}
              </div>
              <div style={{ flex: 1, marginLeft: 12, marginBottom: 20 }}>
                <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
                  {item.img ? (
                    <div style={{ width: '100%', height: 180, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundImage: `url(${item.img})` }} />
                  ) : (
                    <div style={{ width: '100%', height: 140, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 52, lineHeight: 1 }}>{item.name[0]}</span>
                    </div>
                  )}
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 600, color: '#111111' }}>{item.name}</span>
                      <div onClick={(e) => { e.stopPropagation(); item.isPublic = !item.isPublic }} style={{ padding: '4px 10px', borderRadius: 100, background: item.isPublic ? 'rgba(0,0,0,.05)' : '#111111', cursor: 'pointer', flexShrink: 0, marginLeft: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 700, color: item.isPublic ? '#666666' : '#fff', whiteSpace: 'nowrap', lineHeight: 1 }}>{item.isPublic ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#999999', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p style={{ margin: '8px 0 0 66px', fontSize: 11, color: '#BBBBBB', fontWeight: 300, lineHeight: 1.7 }}>공개 설정된 루틴이 팔로워 피드에 노출됩니다.</p>
        </div>
      )}

      {/* Dashboard tab */}
      {mypageTab === 'dashboard' && (
        <div style={{ padding: '18px 20px', background: '#FFFFFF' }}>
          {isAdmin && (
            <div style={{ margin: '-18px -20px 18px', background: '#111111', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '.12em', textTransform: 'uppercase', background: 'rgba(255,255,255,.15)', padding: '3px 9px', borderRadius: 4 }}>ADMIN</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => navigate('admin-users')} style={{ padding: '6px 13px', borderRadius: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>유저 관리</button>
                  <button onClick={() => navigate('admin-ads')} style={{ padding: '6px 13px', borderRadius: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>광고 관리</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.06em' }}>총 유저</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>1,247</p>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.06em' }}>오늘 게시물</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>34</p>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.06em' }}>광고 노출</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>45,231</p>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.06em' }}>광고 CTR</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>3.2%</p>
                </div>
              </div>
            </div>
          )}

          {/* Period selector */}
          <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 8, padding: 3, marginBottom: 16, gap: 0 }}>
            {PERIOD_TABS.map((pt) => {
              const active = dashboardPeriod === pt
              return (
                <button key={pt} onClick={() => setDashboardPeriod(pt)} style={{ flex: 1, padding: '7px 4px', borderRadius: 6, fontSize: 11, fontWeight: active ? 700 : 400, background: active ? '#FFFFFF' : 'transparent', color: active ? '#111111' : '#AAAAAA', border: 'none', cursor: 'pointer', transition: 'all .2s', letterSpacing: '.02em' }}>
                  {pt}
                </button>
              )
            })}
          </div>

          {/* Routine card */}
          <div style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>Current Routine · Jun 2 –</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>64%</p>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#111111', background: '#EBEBEB', padding: '4px 10px', borderRadius: 20, letterSpacing: '.02em' }}>12-day streak</div>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: '#EBEBEB', marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ width: '64%', height: '100%', background: '#111111', borderRadius: 3 }} />
            </div>
            {ROUTINE_GROUPS.map((group) => (
              <div key={group.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{group.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{group.achievement}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 3, background: '#EBEBEB', marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${group.achievement}%`, height: '100%', background: '#111111', borderRadius: 3 }} />
                </div>
                {group.items.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0 2px 8px' }}>
                    <span style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>· {item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 40, height: 2, borderRadius: 2, background: '#EBEBEB', overflow: 'hidden' }}>
                        <div style={{ width: `${item.rate}%`, height: '100%', background: '#111111' }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#AAAAAA', width: 26, textAlign: 'right' }}>{item.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Past routines */}
          <div style={{ marginBottom: 16 }}>
            <button onClick={toggleExpandPrev} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', padding: '10px 12px', borderRadius: 10, border: '1px solid #EBEBEB', color: '#111111', cursor: 'pointer' }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>Past Routines</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expandedPrev ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                <path d="M2 4l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {expandedPrev && (
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PREV_ROUTINES.map((prev) => (
                  <div key={prev.period} style={{ padding: '10px 12px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{prev.period}</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111111' }}>{prev.achievement}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MYPAGE_LINKS.map((link) => (
              <button key={link.label} onClick={link.handler} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px', background: 'none', color: '#111111', width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', borderBottom: '1px solid #F5F5F5' }}>
                <span style={{ fontSize: 13, fontWeight: 400 }}>{link.label}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

