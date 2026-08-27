import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

const REACTION_KEYS = ['cheer', 'inspired', 'nice'] as const

export default function PostDetailSheet() {
  const M = useMessages()
  const showPostDetail = useAppStore((s) => s.showPostDetail)
  const selectedPost = useAppStore((s) => s.selectedPost)
  const closePostDetail = useAppStore((s) => s.closePostDetail)
  const toggleLikePost = useAppStore((s) => s.toggleLikePost)
  const toggleReaction = useAppStore((s) => s.toggleReaction)
  const addComment = useAppStore((s) => s.addComment)
  const followedUsers = useAppStore((s) => s.followedUsers)
  const toggleFollowUser = useAppStore((s) => s.toggleFollowUser)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const selectUser = useAppStore((s) => s.selectUser)
  const nickname = useAppStore((s) => s.nickname)
  const reportPost = useAppStore((s) => s.reportPost)
  const [comment, setComment] = useState('')
  const [reported, setReported] = useState(false)
  const [showReportConfirm, setShowReportConfirm] = useState(false)

  if (!showPostDetail || !selectedPost) return null

  const handleReport = () => {
    reportPost(selectedPost.id, M.overlays.reportReasonInappropriate)
    setReported(true)
    setShowReportConfirm(false)
  }

  const getReactionCount = (key: string) => selectedPost.reactions[key] ?? 0
  const isFollowing = selectedPost.userId ? followedUsers.has(selectedPost.userId) : false

  const handleTapPostUser = () => {
    if (selectedPost.user === nickname) return
    const user = suggestedUsers.find((u) => u.name === selectedPost.user)
    if (user) {
      closePostDetail()
      selectUser(user)
    } else {
      closePostDetail()
      selectUser({
        id: selectedPost.userId ?? selectedPost.user,
        name: selectedPost.user,
        handle: selectedPost.user,
        initials: selectedPost.initials,
        color: selectedPost.color,
        bio: '',
        followers: 0,
        following: 0,
        followed: false,
        synced: false,
        routines: [],
        routineGoals: [],
      })
    }
  }

  const handleTapCommentUser = (cmtUser: string, cmtUserId?: string) => {
    if (cmtUser === nickname) return
    const user = suggestedUsers.find((u) => (cmtUserId && u.id === cmtUserId) || u.name === cmtUser)
    closePostDetail()
    if (user) {
      selectUser(user)
      return
    }
    selectUser({
      id: cmtUserId ?? cmtUser,
      name: cmtUser,
      handle: cmtUser,
      initials: cmtUser.slice(0, 2).toUpperCase(),
      color: '#E0E0E0',
      bio: '',
      followers: 0,
      following: 0,
      followed: false,
      synced: false,
      routines: [],
      routineGoals: [],
    })
  }

  return (
    <div data-testid="post-detail-sheet" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={closePostDetail} style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ background: '#FFFFFF', borderRadius: '18px 18px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0E0' }} />
        </div>

        <div style={{ padding: '14px 20px', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div onClick={handleTapPostUser} style={{ width: 32, height: 32, borderRadius: '50%', background: selectedPost.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: selectedPost.user !== nickname ? 'pointer' : 'default' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{selectedPost.initials}</span>
          </div>
          <div onClick={handleTapPostUser} style={{ flex: 1, cursor: selectedPost.user !== nickname ? 'pointer' : 'default' }}>
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
            {isFollowing ? M.overlays.following : M.overlays.follow}
          </button>
          {selectedPost.user !== nickname && !reported && (
            <button onClick={() => setShowReportConfirm(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: 11, color: '#AAAAAA', fontWeight: 600 }}>
              {M.overlays.report}
            </button>
          )}
          <button data-testid="post-detail-close" onClick={closePostDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="4" y1="4" x2="14" y2="14" stroke="#AAAAAA" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="14" y1="4" x2="4" y2="14" stroke="#AAAAAA" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {showReportConfirm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 24 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, maxWidth: 300, width: '100%' }}>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#111111', lineHeight: 1.6 }}>{M.overlays.reportConfirm}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowReportConfirm(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'transparent', color: '#AAAAAA', fontSize: 13, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.common.cancel}</button>
                <button onClick={handleReport} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#DC2626', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{M.overlays.report}</button>
              </div>
            </div>
          </div>
        )}
        {reported && (
          <div style={{ padding: '8px 20px', background: '#FEF2F2', borderBottom: '1px solid #F5F5F5' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#DC2626', fontWeight: 600 }}>{M.overlays.reportReceived}</p>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5F5F5' }}>
            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#111111', lineHeight: 1.7, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{selectedPost.content}</p>

            {selectedPost.hasImg && selectedPost.imgUrl && (
              <div style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden' }}>
                <img src={selectedPost.imgUrl} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} alt={M.overlays.attachedImageAlt} />
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
              {REACTION_KEYS.map((key) => {
                const label = M.overlays.reactionLabels[key]
                const count = getReactionCount(key)
                const active = selectedPost.myReactions?.has(key) ?? false
                return (
                  <button
                    key={key}
                    onClick={() => toggleReaction(selectedPost.id, key)}
                    style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${active ? '#111111' : '#EBEBEB'}`, background: active ? '#111111' : '#FAFAFA', color: active ? '#fff' : '#111111', fontSize: 12, cursor: 'pointer', fontWeight: count > 0 ? 600 : 400 }}
                  >
                    {label}{count > 0 ? ` ${count}` : ''}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(selectedPost.comments ?? []).map((cmt, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div onClick={() => handleTapCommentUser(cmt.user, cmt.userId)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#888888' }}>{cmt.user}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p data-testid="comment-author" onClick={() => handleTapCommentUser(cmt.user, cmt.userId)} style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111', cursor: 'pointer' }}>{cmt.user}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#333333', lineHeight: 1.55, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{cmt.text}</p>
                </div>
              </div>
            ))}
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
                addComment(selectedPost.id, trimmed)
                setComment('')
              }
            }}
            placeholder={M.overlays.commentPlaceholder}
            style={{ flex: 1, padding: '9px 14px', borderRadius: 20, border: '1px solid #EBEBEB', fontSize: 13, background: '#FAFAFA', color: '#111111', outline: 'none' }}
          />
          <button
            onClick={() => {
              const trimmed = comment.trim()
              if (!trimmed) return
              addComment(selectedPost.id, trimmed)
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
