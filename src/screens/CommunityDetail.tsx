import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function CommunityDetail() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const selectedCommunity = useAppStore((s) => s.selectedCommunity)
  const toggleJoinCommunity = useAppStore((s) => s.toggleJoinCommunity)
  const posts = useAppStore((s) => s.posts)
  const toggleLikePost = useAppStore((s) => s.toggleLikePost)
  const openPostDetail = useAppStore((s) => s.openPostDetail)
  const selectUser = useAppStore((s) => s.selectUser)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)

  if (!selectedCommunity) {
    return (
      <div>
        <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.communityDetail.notFound}</p>
        </div>
      </div>
    )
  }

  const c = selectedCommunity
  const communityPosts = posts.filter((p) => p.community === c.id)

  const joinBtnStyle: React.CSSProperties = c.joined
    ? { padding: '7px 16px', borderRadius: 8, background: '#F5F5F5', color: '#111111', border: '1px solid #EBEBEB', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '.02em' }
    : { padding: '7px 16px', borderRadius: 8, background: '#111111', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '.02em' }

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>{c.name}</span>
        <button onClick={() => toggleJoinCommunity(c.id)} style={joinBtnStyle}>
          {c.joined ? M.communityDetail.joined : M.communityDetail.join}
        </button>
      </div>

      <div style={{ padding: '16px 20px', borderBottom: '1px solid #EBEBEB', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 50, height: 50, borderRadius: 13, background: c.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{c.initial}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 800, color: '#111111' }}>{c.name}</p>
          <p style={{ margin: '0 0 6px', fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{M.communityDetail.memberAndFocus(c.members, c.focus)}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#666666', lineHeight: 1.65, fontWeight: 300, wordBreak: 'keep-all', overflowWrap: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.desc}</p>
        </div>
      </div>

      <div style={{ padding: '12px 20px', borderBottom: '1px solid #F0F0F0' }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.communityDetail.recentPosts}</p>
      </div>

      {communityPosts.length === 0 ? (
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.communityDetail.emptyTitle}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#CCCCCC', fontWeight: 300 }}>{M.communityDetail.emptyBody}</p>
        </div>
      ) : (
        communityPosts.map((post) => (
          <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: '1px solid #F5F5F5' }}>
            <div onClick={() => { const u = suggestedUsers.find((u) => u.name === post.user); if (u) selectUser(u) }} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, cursor: 'pointer' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{post.initials}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>{post.user}</span>
            </div>
            <div onClick={() => openPostDetail(post)} style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
              <span style={{ fontSize: 13, color: '#555555' }}>{post.content}</span>
            </div>
            <button
              onClick={() => toggleLikePost(post.id)}
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 13, margin: '-9px -9px -9px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill={post.liked ? '#E53535' : 'none'}>
                <path d="M9 15S2 10.5 2 6A4 4 0 019 3.2 4 4 0 0116 6C16 10.5 9 15 9 15z" stroke={post.liked ? '#E53535' : '#CCCCCC'} strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))
      )}
      <div style={{ height: 32 }} />
    </div>
  )
}
