import { useState } from 'react'
import { useAppStore } from '../store/appStore'

export default function PostDetailSheet() {
  const showPostDetail = useAppStore((s) => s.showPostDetail)
  const selectedPost = useAppStore((s) => s.selectedPost)
  const closePostDetail = useAppStore((s) => s.closePostDetail)
  const toggleLikePost = useAppStore((s) => s.toggleLikePost)
  const followedUsers = useAppStore((s) => s.followedUsers)
  const toggleFollowUser = useAppStore((s) => s.toggleFollowUser)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<string[]>([])

  if (!showPostDetail || !selectedPost) return null

  const REACTIONS = ['Cheer', 'Inspired', 'Nice', 'Strong', 'Wow']
  const isFollowing = selectedPost.userId ? followedUsers.has(selectedPost.userId) : false

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={closePostDetail} style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ background: '#FFFFFF', borderRadius: '18px 18px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0E0' }} />
        </div>

        <div style={{ padding: '14px 20px', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: selectedPost.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{selectedPost.initials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111111' }}>{selectedPost.user}</span>
            <span style={{ fontSize: 11, color: '#CCCCCC', marginLeft: 6 }}>{selectedPost.time}</span>
          </div>
          <button
            onClick={() => toggleLikePost(selectedPost.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill={selectedPost.liked ? '#E53535' : 'none'}>
              <path d="M9 15S2 10.5 2 6A4 4 0 019 3.2 4 4 0 0116 6C16 10.5 9 15 9 15z" stroke={selectedPost.liked ? '#E53535' : '#CCCCCC'} strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => selectedPost.userId && toggleFollowUser(selectedPost.userId)}
            style={{ padding: '6px 14px', borderRadius: 20, background: isFollowing ? '#F5F5F5' : '#111111', color: isFollowing ? '#111111' : '#fff', fontSize: 12, fontWeight: 700, border: isFollowing ? '1px solid #EBEBEB' : 'none', cursor: 'pointer' }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button onClick={closePostDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="4" y1="4" x2="14" y2="14" stroke="#AAAAAA" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="14" y1="4" x2="4" y2="14" stroke="#AAAAAA" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5F5F5' }}>
            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#111111', lineHeight: 1.7, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{selectedPost.content}</p>

            {selectedPost.hasImg && selectedPost.imgUrl && (
              <div style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden' }}>
                <img src={selectedPost.imgUrl} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} alt="첨부 이미지" />
              </div>
            )}

            {selectedPost.hasInsta && selectedPost.instaUrl && (
              <div
                style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: '#FAFAFA', border: '1px solid #EBEBEB', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                onClick={() => window.open(selectedPost.instaUrl, '_blank')}
              >
                <span style={{ fontSize: 12, color: '#111111', fontWeight: 500 }}>Instagram</span>
                <span style={{ fontSize: 12, color: '#AAAAAA' }}>→</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {REACTIONS.map((r) => {
                const count = selectedPost.reactions[r] ?? 0
                return (
                  <button key={r} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #EBEBEB', background: '#FAFAFA', color: '#111111', fontSize: 12, cursor: 'pointer', fontWeight: count > 0 ? 600 : 400 }}>
                    {r}{count > 0 ? ` ${count}` : ''}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(() => {
              const existing = selectedPost.comments ?? []
              const userAdded = comments.map((text) => ({ user: '나', text }))
              const allComments = [...existing, ...userAdded]
              return allComments.map((cmt, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#888888' }}>{cmt.user}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111', cursor: 'pointer' }}>{cmt.user}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#333333', lineHeight: 1.55, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{cmt.text}</p>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid #EBEBEB', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const trimmed = comment.trim()
                if (!trimmed) return
                setComments((prev) => [...prev, trimmed])
                setComment('')
              }
            }}
            placeholder="Add a comment…"
            style={{ flex: 1, padding: '9px 14px', borderRadius: 20, border: '1px solid #EBEBEB', fontSize: 13, background: '#FAFAFA', color: '#111111', outline: 'none' }}
          />
          <button
            onClick={() => {
              const trimmed = comment.trim()
              if (!trimmed) return
              setComments((prev) => [...prev, trimmed])
              setComment('')
            }}
            style={{ width: 34, height: 34, borderRadius: '50%', background: '#111111', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
