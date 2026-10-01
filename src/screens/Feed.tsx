import { useState, useEffect } from 'react'
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
  const toggleLikePost = useAppStore((s) => s.toggleLikePost)
  const openPostDetail = useAppStore((s) => s.openPostDetail)
  const selectUser = useAppStore((s) => s.selectUser)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const navigate = useAppStore((s) => s.navigate)
  const notifications = useAppStore((s) => s.notifications)
  const nickname = useAppStore((s) => s.nickname)
  const openRecordModal = useAppStore((s) => s.openRecordModal)
  const loadFeedData = useAppStore((s) => s.loadFeedData)
  const selectCommunity = useAppStore((s) => s.selectCommunity)
  
  const [quietBannerDismissed, setQuietBannerDismissed] = useState(false)
  const [communityTabOrder, setCommunityTabOrder] = useState<string[]>([])

  const hasUnread = notifications.some((n) => !n.read)
  const quietDays = daysSinceLastPost(posts, nickname)
  const showQuietBanner = !quietBannerDismissed && quietDays >= QUIET_DAY_THRESHOLD && quietDays !== Infinity

  // Build tabs from joined communities
  const joinedCommunities = communities.filter((c) => c.joined)
  
  useEffect(() => {
    // Load custom order from localStorage
    const stored = localStorage.getItem('welling_community_tab_order')
    if (stored) {
      try {
        const order = JSON.parse(stored)
        setCommunityTabOrder(order)
      } catch {
        // Fallback to joined order
        setCommunityTabOrder(joinedCommunities.map((c) => c.id))
      }
    } else {
      setCommunityTabOrder(joinedCommunities.map((c) => c.id))
    }
  }, [communities])

  // Save order when changed
  const handleTabOrderChange = (newOrder: string[]) => {
    setCommunityTabOrder(newOrder)
    localStorage.setItem('welling_community_tab_order', JSON.stringify(newOrder))
  }

  // Sort tabs by custom order
  const tabs = communityTabOrder
    .map((id) => joinedCommunities.find((c) => c.id === id))
    .filter(Boolean) as typeof joinedCommunities
  
  // Add any new joined communities not in order
  const missingTabs = joinedCommunities.filter((c) => !communityTabOrder.includes(c.id))
  const allTabs = [...tabs, ...missingTabs]

  // Focus note from active tab
  const activeComm = allTabs.find((c) => c.id === activeCommunityTab)
  const focusNote = activeComm?.desc || activeComm?.focus || ''

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

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => {
      loadFeedData()
    }
    window.addEventListener('visibilitychange', handleFocus)
    return () => window.removeEventListener('visibilitychange', handleFocus)
  }, [loadFeedData])

  return (
    <div>
      <FeedHeader
        activeCommunityTab={activeCommunityTab}
        setActiveCommunityTab={setActiveCommunityTab}
        communityTabOrder={communityTabOrder}
        setCommunityTabOrder={handleTabOrderChange}
        tabs={allTabs}
        hasUnread={hasUnread}
        onNavigateNotifications={() => navigate('notifications')}
        joinedCount={joinedCommunities.length}
        onCreateGroup={() => navigate('new-community')}
        onOpenGroupSettings={(groupId) => {
          const group = allTabs.find((t) => t.id === groupId)
          if (group) {
            selectCommunity(group)
            navigate('community-settings')
          }
        }}
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
    </div>
  )
}
