import type { Post } from '../../store/appStore'
import { useMessages } from '../../i18n'

export function FeedPostList({
  posts,
  onTapUser,
  onTapPost,
  onToggleCheer,
}: {
  posts: Post[]
  onTapUser: (userName: string, post?: { initials: string; color: string }) => void
  onTapPost: (post: Post) => void
  onToggleCheer: (postId: string) => void
}) {
  const M = useMessages()
  return (
    <>
      {posts.map((post) => (
        <div key={post.id} data-testid="feed-post" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: '1px solid #F5F5F5' }}>
          <div data-testid="feed-post-user" data-user-name={post.user} onClick={() => onTapUser(post.user, post)} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{post.initials}</span>
            </div>
            {/* 닉네임이 길면 본문을 밀어내 내용이 안 보인다. 최대 너비를 두고 말줄임 처리한다. */}
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111111', maxWidth: 92, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.user}</span>
          </div>
          {post.hasImg && post.imgUrl && (
            <img
              src={post.imgUrl}
              alt=""
              onClick={() => onTapPost(post)}
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
            />
          )}
          <div data-testid="feed-post-content" onClick={() => onTapPost(post)} style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, color: '#555555' }}>{post.content}</span>
          </div>
          <button
            onClick={() => onToggleCheer(post.id)}
            style={{ flexShrink: 0, background: post.myReactions?.has('cheer') ? '#FFF4D6' : 'none', border: '1px solid #EBEBEB', borderRadius: 999, cursor: 'pointer', padding: '6px 9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#555555', fontSize: 12, fontWeight: 700 }}
          >
            <span>{M.feed.cheer}</span>
            <span>{post.reactions.cheer ?? 0}</span>
          </button>
        </div>
      ))}
    </>
  )
}
