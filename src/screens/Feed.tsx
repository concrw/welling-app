import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { daysSinceLastPost } from '../lib/achievement'
import { FeedHeader } from '../components/feed/FeedHeader'
import { FeedQuietBanner, FeedFocusNote } from '../components/feed/FeedBanners'
import { FeedPostList } from '../components/feed/FeedPostList'

const QUIET_DAY_THRESHOLD = 2


export default function Feed() {
  const posts = useAppStore((s) => s.posts)
  const communities = useAppStore((s) => s.communities)
  const activeCommunityTab = useAppStore((s) => s.activeCommunityTab)
  const setActiveCommunityTab = useAppStore((s) => s.setActiveCommunityTab)
  const communityTabOrder = useAppStore((s) => s.communityTabOrder)
  const setCommunityTabOrder = useAppStore((s) => s.setCommunityTabOrder)
  const toggleLikePost = useAppStore((s) => s.toggleLikePost)
  const openPostDetail = useAppStore((s) => s.openPostDetail)
  const selectUser = useAppStore((s) => s.selectUser)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const navigate = useAppStore((s) => s.navigate)
  const notifications = useAppStore((s) => s.notifications)
  const nickname = useAppStore((s) => s.nickname)
  const openRecordModal = useAppStore((s) => s.openRecordModal)
  const [quietBannerDismissed, setQuietBannerDismissed] = useState(false)

  const hasUnread = notifications.some((n) => !n.read)
  const quietDays = daysSinceLastPost(posts, nickname)
  const showQuietBanner = !quietBannerDismissed && quietDays >= QUIET_DAY_THRESHOLD && quietDays !== Infinity

  // 순서대로 정렬된 커뮤니티 탭 목록
  const tabs = communityTabOrder
    .map((id) => communities.find((c) => c.id === id))
    .filter(Boolean) as typeof communities

  // 맨 앞 탭의 focus 메세지를 항상 표시
  const focusNote = tabs[0]?.focus || ''

  const myPosts = posts.filter((p) => p.user === nickname)
  const displayPosts = activeCommunityTab === 'all'
    ? posts
    : [
        ...myPosts,
        ...posts.filter((p) => p.community === activeCommunityTab && p.user !== nickname),
      ]

  const handleTapUser = (userName: string, post?: { initials: string; color: string }) => {
    if (userName === nickname) return
    const user = suggestedUsers.find((u) => u.name === userName)
    if (user) {
      selectUser(user)
    } else if (post) {
      selectUser({
        id: userName,
        name: userName,
        handle: userName,
        initials: post.initials,
        color: post.color,
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

  return (
    <div>
      <FeedHeader
        activeCommunityTab={activeCommunityTab}
        setActiveCommunityTab={setActiveCommunityTab}
        communityTabOrder={communityTabOrder}
        setCommunityTabOrder={setCommunityTabOrder}
        tabs={tabs}
        hasUnread={hasUnread}
        onNavigateNotifications={() => navigate('notifications')}
      />

      {showQuietBanner && (
        <FeedQuietBanner
          quietDays={quietDays}
          onTap={openRecordModal}
          onDismiss={() => setQuietBannerDismissed(true)}
        />
      )}

      {focusNote && <FeedFocusNote focusNote={focusNote} />}

      <FeedPostList
        posts={displayPosts}
        onTapUser={handleTapUser}
        onTapPost={openPostDetail}
        onToggleLike={toggleLikePost}
      />
      <div style={{ height: 24 }} />
    </div>
  )
}
