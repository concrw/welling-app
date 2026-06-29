import { useAppStore } from '../store/appStore'

export default function Explore() {
  const communities = useAppStore((s) => s.communities)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const followedUsers = useAppStore((s) => s.followedUsers)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const toggleJoinCommunity = useAppStore((s) => s.toggleJoinCommunity)
  const toggleFollowUser = useAppStore((s) => s.toggleFollowUser)
  const selectCommunity = useAppStore((s) => s.selectCommunity)
  const selectUser = useAppStore((s) => s.selectUser)
  const navigate = useAppStore((s) => s.navigate)
  const openAdModal = useAppStore((s) => s.openAdModal)
  const setAdPageData = useAppStore((s) => s.setAdPageData)
  const adSlots = useAppStore((s) => s.adSlots)
  const exploreAd = adSlots.explore

  const handleAdClick = () => {
    if (exploreAd.clickAction === 'link') {
      window.open(exploreAd.url, '_blank')
    } else if (exploreAd.clickAction === 'modal') {
      openAdModal({ brand: exploreAd.brand, desc: exploreAd.desc, modalTitle: exploreAd.modalTitle, modalBody: exploreAd.modalBody })
    } else {
      setAdPageData({ brand: exploreAd.brand, desc: exploreAd.desc, slotKey: 'explore' })
      navigate('ad-page')
    }
  }

  const q = searchQuery.toLowerCase()
  const filteredCommunities = q
    ? communities.filter((c) => c.name.toLowerCase().includes(q) || c.focus.toLowerCase().includes(q))
    : communities
  const filteredPeople = q
    ? suggestedUsers.filter((u) => u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q))
    : suggestedUsers
  const noResults = q && filteredCommunities.length === 0 && filteredPeople.length === 0

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: 'calc(16px + env(safe-area-inset-top)) 20px 12px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#AAAAAA" strokeWidth="1.5" />
            <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="커뮤니티, 사람 검색"
            style={{ flex: 1, background: 'none', border: 'none', fontSize: 13, color: '#111111', outline: 'none' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" fill="#CCCCCC" />
                <line x1="5" y1="5" x2="10" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="5" x2="5" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {noResults ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111111' }}>검색 결과 없음</p>
            <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>"{searchQuery}"에 해당하는 결과가 없어요.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>Communities</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {filteredCommunities.map((c) => (
                <div key={c.id} onClick={() => selectCommunity(c)} style={{ padding: '12px 14px', borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{c.initial}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#111111' }}>{c.name}</p>
                    <p style={{ margin: '0 0 2px', fontSize: 11, color: '#AAAAAA' }}>{c.members.toLocaleString()} members</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#CCCCCC', letterSpacing: '.04em', textTransform: 'uppercase' }}>{c.focus}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleJoinCommunity(c.id) }}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: c.joined ? '#F5F5F5' : '#111111',
                      color: c.joined ? '#111111' : '#fff',
                      border: c.joined ? '1px solid #EBEBEB' : 'none',
                      cursor: 'pointer', flexShrink: 0
                    }}
                  >
                    {c.joined ? '탈퇴' : '가입하기'}
                  </button>
                </div>
              ))}
            </div>

            {/* Ad banner */}
            <div onClick={handleAdClick} style={{ marginBottom: 24, padding: '12px 14px', borderRadius: 10, background: '#F8F8F8', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: '#E8F0FE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="6.5" stroke="#4285F4" strokeWidth="1.5"/>
                  <path d="M7 10l2 2 4-4" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{exploreAd.brand}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exploreAd.desc}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: '#CCCCCC', letterSpacing: '.06em', textTransform: 'uppercase' }}>광고</span>
                <button onClick={(e) => e.stopPropagation()} style={{ padding: '5px 11px', borderRadius: 6, background: '#111111', color: '#fff', fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}>보기</button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>People</p>
              <span style={{ fontSize: 12, color: '#111111', cursor: 'pointer', fontWeight: 500 }}>See all</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
              {filteredPeople.map((su) => {
                const isFollowed = followedUsers.has(su.id)
                return (
                  <div key={su.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #F5F5F5' }}>
                    <div onClick={() => selectUser(su)} style={{ width: 38, height: 38, borderRadius: '50%', background: su.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{su.initials}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#111111' }}>{su.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{su.bio}</p>
                    </div>
                    <button
                      onClick={() => toggleFollowUser(su.id)}
                      style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: isFollowed ? '#111111' : 'transparent',
                        color: isFollowed ? '#fff' : '#111111',
                        border: '1.5px solid #111111',
                        cursor: 'pointer', flexShrink: 0
                      }}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )
              })}
            </div>

            <div onClick={() => navigate('new-community')} style={{ padding: 14, borderRadius: 12, border: '1px dashed #DDDDDD', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18, color: '#111111', fontWeight: 200, lineHeight: 1 }}>+</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: '#111111' }}>New community</p>
                <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>Open to anyone</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
