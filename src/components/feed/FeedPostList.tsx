import type { Post } from '../../store/appStore'

export function FeedPostList({
  posts,
  onTapUser,
  onTapPost,
  onToggleLike,
}: {
  posts: Post[]
  onTapUser: (userName: string, post?: { initials: string; color: string }) => void
  onTapPost: (post: Post) => void
  onToggleLike: (postId: string) => void
}) {
  return (
    <>
      {posts.map((post) => (
        <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: '1px solid #F5F5F5' }}>
          <div onClick={() => onTapUser(post.user, post)} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{post.initials}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>{post.user}</span>
          </div>
          <div onClick={() => onTapPost(post)} style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, color: '#555555' }}>{post.content}</span>
          </div>
          <button
            onClick={() => onToggleLike(post.id)}
            style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 13, margin: '-9px -9px -9px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill={post.liked ? '#E53535' : 'none'}>
              <path d="M9 15S2 10.5 2 6A4 4 0 019 3.2 4 4 0 0116 6C16 10.5 9 15 9 15z" stroke={post.liked ? '#E53535' : '#CCCCCC'} strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ))}
    </>
  )
}
