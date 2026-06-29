import { useState } from 'react'
import { useAppStore } from '../store/appStore'


export default function Feed() {
  const [logoError, setLogoError] = useState(false)
  const posts = useAppStore((s) => s.posts)
  const communities = useAppStore((s) => s.communities)
  const activeCommunityTab = useAppStore((s) => s.activeCommunityTab)
  const setActiveCommunityTab = useAppStore((s) => s.setActiveCommunityTab)
  const toggleLikePost = useAppStore((s) => s.toggleLikePost)
  const openPostDetail = useAppStore((s) => s.openPostDetail)
  const selectUser = useAppStore((s) => s.selectUser)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const navigate = useAppStore((s) => s.navigate)
  const notifications = useAppStore((s) => s.notifications)

  const hasUnread = notifications.some((n) => !n.read)

  const [tabs, setTabs] = useState([
    { id: 'all', label: 'All', focusNote: '' },
    ...communities.map((c) => ({ id: c.id, label: c.name, focusNote: c.focus })),
  ])
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const handleDragStart = (i: number) => setDragIdx(i)
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null) }
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIdx(i) }
  const handleDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return
    const next = [...tabs]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(i, 0, moved)
    setTabs(next)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  const activeTab = tabs.find((t) => t.id === activeCommunityTab)
  const focusNote = activeTab?.focusNote || ''

  const myPosts = posts.filter((p) => p.user === 'Min')
  const displayPosts = activeCommunityTab === 'all'
    ? posts
    : [
        ...myPosts,
        ...posts.filter((p) => p.community === activeCommunityTab && p.user !== 'Min'),
      ]

  const handleTapUser = (userName: string) => {
    const user = suggestedUsers.find((u) => u.name === userName)
    if (user) selectUser(user)
  }

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}>
          {logoError
            ? <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5, color: '#111111' }}>WELLING</span>
            : <img src="/uploads/welling-black.png" style={{ height: 21, width: 'auto' }} alt="welling" onError={() => setLogoError(true)} />
          }
          <button onClick={() => navigate('notifications')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 6, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 016 6v2l1.5 3H2.5L4 10V8a6 6 0 016-6z" stroke="#111111" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8.5 16a1.5 1.5 0 003 0" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {hasUnread && (
              <div style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#E53535', border: '1.5px solid #fff' }} />
            )}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '0 20px 12px', overflowX: 'auto', alignItems: 'center' }}>
          {tabs.map((ct, i) => {
            const active = activeCommunityTab === ct.id
            return (
              <div
                key={ct.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onClick={() => setActiveCommunityTab(ct.id)}
                style={{
                  flexShrink: 0, cursor: 'pointer', padding: '5px 14px', borderRadius: 20,
                  fontSize: 12, fontWeight: active ? 700 : 400,
                  background: active ? '#111111' : dragOverIdx === i ? '#F0F0F0' : 'transparent',
                  color: active ? '#fff' : '#666666',
                  border: `1px solid ${active ? '#111111' : '#E0E0E0'}`,
                  whiteSpace: 'nowrap', userSelect: 'none', transition: 'all .15s',
                  opacity: dragIdx === i ? 0.4 : 1,
                }}
              >
                {ct.label}
              </div>
            )
          })}
        </div>
      </div>

      {focusNote && (
        <div style={{ padding: '10px 20px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#111111', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 11, color: '#999999', fontWeight: 400, letterSpacing: '.02em' }}>{focusNote}</p>
        </div>
      )}

      {displayPosts.map((post) => (
        <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: '1px solid #F5F5F5' }}>
          <div onClick={() => handleTapUser(post.user)} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, cursor: 'pointer' }}>
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
      ))}
      <div style={{ height: 24 }} />
    </div>
  )
}
