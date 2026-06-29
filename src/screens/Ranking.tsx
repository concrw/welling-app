import { useAppStore } from '../store/appStore'

const TOP3 = [
  { rank: 1, user: '박소연', initials: '소', color: '#10B981', completion: 94, streak: 300 },
  { rank: 2, user: '최민석', initials: '민', color: '#6366F1', completion: 91, streak: 100 },
  { rank: 3, user: '정도윤', initials: '정', color: '#10B981', completion: 89, streak: 67 },
]

const REST = [
  { rank: 4, user: '한지민', initials: '지', color: '#F59E0B', completion: 87, streak: 45 },
  { rank: 5, user: '이수현', initials: '수', color: '#0EA5E9', completion: 85, streak: 38 },
  { rank: 6, user: '조민혁', initials: '조', color: '#EC4899', completion: 82, streak: 32 },
  { rank: 7, user: '김태현', initials: '태', color: '#EF4444', completion: 79, streak: 28 },
  { rank: 8, user: '정유진', initials: '유', color: '#047857', completion: 76, streak: 24 },
  { rank: 9, user: '윤서아', initials: '윤', color: '#14B8A6', completion: 74, streak: 21 },
  { rank: 10, user: '이준호', initials: '준', color: '#111111', completion: 71, streak: 18 },
]

export default function Ranking() {
  const rankingTab = useAppStore((s) => s.rankingTab)
  const setRankingTab = useAppStore((s) => s.setRankingTab)
  const selectUser = useAppStore((s) => s.selectUser)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const communities = useAppStore((s) => s.communities)

  const RANKING_TABS = ['All', ...communities.map((c) => c.name)]

  const navigate = useAppStore((s) => s.navigate)
  const openAdModal = useAppStore((s) => s.openAdModal)
  const setAdPageData = useAppStore((s) => s.setAdPageData)
  const adSlots = useAppStore((s) => s.adSlots)
  const rankingAd = adSlots.ranking

  const handleRankingAdClick = () => {
    if (rankingAd.clickAction === 'link') {
      window.open(rankingAd.url, '_blank')
    } else if (rankingAd.clickAction === 'modal') {
      openAdModal({ brand: rankingAd.brand, desc: rankingAd.desc, modalTitle: rankingAd.modalTitle, modalBody: rankingAd.modalBody })
    } else {
      setAdPageData({ brand: rankingAd.brand, desc: rankingAd.desc, slotKey: 'ranking' })
      navigate('ad-page')
    }
  }

  const handleTapProfile = (userName: string) => {
    const user = suggestedUsers.find((u) => u.name === userName)
    if (user) selectUser(user)
  }

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ display: 'flex', gap: 6, padding: 'calc(14px + env(safe-area-inset-top)) 20px 12px', overflowX: 'auto' }}>
          {RANKING_TABS.map((rt) => {
            const active = rankingTab === rt
            return (
              <button key={rt} onClick={() => setRankingTab(rt)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 400, background: active ? '#111111' : 'transparent', color: active ? '#fff' : '#666666', border: `1px solid ${active ? '#111111' : '#E0E0E0'}`, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0 }}>
                {rt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Podium */}
      <div style={{ padding: '24px 16px 0', background: '#FAFAFA', borderBottom: '1px solid #EBEBEB' }}>
        <p style={{ margin: '0 0 20px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center' }}>Habit Champions</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
          {/* 2nd */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="26" height="20" viewBox="0 0 48 36" fill="none"><path d="M5 29h38M5 29V20l9 6 10-17 10 17 9-6v9" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="20" r="2.5" fill="#9CA3AF"/><circle cx="24" cy="12" r="2.5" fill="#9CA3AF"/><circle cx="43" cy="20" r="2.5" fill="#9CA3AF"/></svg>
            <div onClick={() => handleTapProfile(TOP3[1].user)} style={{ width: 44, height: 44, borderRadius: '50%', background: TOP3[1].color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{TOP3[1].initials}</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#111111', textAlign: 'center' }}>{TOP3[1].user}</p>
            <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA' }}>{TOP3[1].completion}%</p>
            <div style={{ width: '100%', height: 60, background: '#9CA3AF', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>2</span>
            </div>
          </div>

          {/* 1st */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="30" height="22" viewBox="0 0 48 36" fill="none"><path d="M5 29h38M5 29V20l9 6 10-17 10 17 9-6v9" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="20" r="2.5" fill="#F59E0B"/><circle cx="24" cy="12" r="2.5" fill="#F59E0B"/><circle cx="43" cy="20" r="2.5" fill="#F59E0B"/></svg>
            <div onClick={() => handleTapProfile(TOP3[0].user)} style={{ width: 54, height: 54, borderRadius: '50%', background: TOP3[0].color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{TOP3[0].initials}</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111111', textAlign: 'center' }}>{TOP3[0].user}</p>
            <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA' }}>{TOP3[0].completion}%</p>
            <div style={{ width: '100%', height: 88, background: '#F59E0B', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>1</span>
            </div>
          </div>

          {/* 3rd */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="26" height="20" viewBox="0 0 48 36" fill="none"><path d="M5 29h38M5 29V20l9 6 10-17 10 17 9-6v9" stroke="#CD7C41" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="20" r="2.5" fill="#CD7C41"/><circle cx="24" cy="12" r="2.5" fill="#CD7C41"/><circle cx="43" cy="20" r="2.5" fill="#CD7C41"/></svg>
            <div onClick={() => handleTapProfile(TOP3[2].user)} style={{ width: 44, height: 44, borderRadius: '50%', background: TOP3[2].color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{TOP3[2].initials}</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#111111', textAlign: 'center' }}>{TOP3[2].user}</p>
            <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA' }}>{TOP3[2].completion}%</p>
            <div style={{ width: '100%', height: 44, background: '#CD7C41', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ad banner */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F8F8F8', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 40, height: 40, borderRadius: 9, background: '#FEF3C7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="12" width="3" height="6" rx="1" fill="#D97706"/>
              <rect x="8.5" y="8" width="3" height="10" rx="1" fill="#D97706"/>
              <rect x="14" y="4" width="3" height="14" rx="1" fill="#D97706"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{rankingAd.brand}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rankingAd.desc}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: '#CCCCCC', letterSpacing: '.06em', textTransform: 'uppercase' }}>광고</span>
            <button onClick={handleRankingAdClick} style={{ padding: '5px 11px', borderRadius: 6, background: '#111111', color: '#fff', fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}>보기</button>
          </div>
        </div>
      </div>

      {/* Rank 4+ list */}
      <div style={{ padding: '0 20px' }}>
        {REST.map((r) => (
          <div key={r.rank} onClick={() => handleTapProfile(r.user)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#AAAAAA', width: 22, textAlign: 'right', flexShrink: 0 }}>{r.rank}</span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{r.initials}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: '#111111' }}>{r.user}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA' }}>{r.streak}-day streak</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111111' }}>{r.completion}%</span>
          </div>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </div>
  )
}
