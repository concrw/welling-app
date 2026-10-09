import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { computeAchievement, daysSinceLastPost } from '../lib/achievement'
import { FeedHeader } from '../components/feed/FeedHeader'
import { FeedQuietBanner, FeedFocusNote } from '../components/feed/FeedBanners'
import { FeedPostList } from '../components/feed/FeedPostList'
import { useMessages } from '../i18n'

const QUIET_DAY_THRESHOLD = 2

export default function Feed() {
  const M = useMessages()
  const posts = useAppStore((s) => s.posts)
  const communities = useAppStore((s) => s.communities)
  const activeCommunityTab = useAppStore((s) => s.activeCommunityTab)
  const setActiveCommunityTab = useAppStore((s) => s.setActiveCommunityTab)
  const toggleReaction = useAppStore((s) => s.toggleReaction)
  const openPostDetail = useAppStore((s) => s.openPostDetail)
  const selectUser = useAppStore((s) => s.selectUser)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const navigate = useAppStore((s) => s.navigate)
  const notifications = useAppStore((s) => s.notifications)
  const nickname = useAppStore((s) => s.nickname)
  const openRecordModal = useAppStore((s) => s.openRecordModal)
  const loadFeedData = useAppStore((s) => s.loadFeedData)
  const selectCommunity = useAppStore((s) => s.selectCommunity)
  const pendingJoinRequests = useAppStore((s) => s.pendingJoinRequests)
  const feedLoading = useAppStore((s) => s.feedLoading)
  const feedError = useAppStore((s) => s.feedError)
  const routineGroups = useAppStore((s) => s.routineGroups)
  
  const [quietBannerDismissed, setQuietBannerDismissed] = useState(false)
  const [communityTabOrder, setCommunityTabOrder] = useState<string[]>([])

  const hasUnread = notifications.some((n) => !n.read)
  const quietDays = daysSinceLastPost(posts, nickname)
  const showQuietBanner = !quietBannerDismissed && quietDays >= QUIET_DAY_THRESHOLD && quietDays !== Infinity

  // Build tabs from joined communities
  const joinedCommunities = communities.filter((c) => c.joined)
  
  useEffect(() => {
    const joinedIds = communities.filter((c) => c.joined).map((c) => c.id)
    // Load custom order from localStorage
    const stored = localStorage.getItem('welling_community_tab_order')
    if (stored) {
      try {
        const order = JSON.parse(stored)
        setCommunityTabOrder(order)
      } catch {
        // Fallback to joined order
        setCommunityTabOrder(joinedIds)
      }
    } else {
      setCommunityTabOrder(joinedIds)
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
  const activeMemberCount = activeComm?.members ?? 0

  const joinedCommunityIds = communities.filter((c) => c.joined).map((c) => c.id)
  const displayPosts = activeCommunityTab === 'all'
    ? posts.filter((p) => p.user === nickname || p.visibility === 'followers' || p.visibility === 'public' || joinedCommunityIds.includes(p.community))
    : posts.filter((p) => p.community === activeCommunityTab)
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const friendsToday = new Set(displayPosts.filter((post) => post.user !== nickname && post.createdAt >= todayStart).map((post) => post.user)).size
  const myStreak = computeAchievement(routineGroups, posts, nickname, 365).streak
  const activitySummary = friendsToday > 0 || myStreak > 0 ? M.feed.todaySummary(friendsToday, myStreak) : null

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
            useAppStore.setState({ selectedCommunity: group })
            navigate('community-settings')
          }
        }}
      />

      {pendingJoinRequests.map((request) => (
        <div key={request.communityId} style={{ margin: '10px 20px 0', padding: '10px 12px', borderRadius: 10, background: '#FFF8E1', color: '#6B4F00', fontSize: 12, fontWeight: 700 }}>
          {M.feed.pendingApproval(request.communityName)}
        </div>
      ))}

      {activitySummary && <div style={{ margin: '10px 20px 0', padding: '10px 12px', borderRadius: 10, background: '#F4F8F6', color: '#285943', fontSize: 12, fontWeight: 700 }}>{activitySummary}</div>}

      {showQuietBanner && (
        <FeedQuietBanner
          quietDays={quietDays}
          onTap={openRecordModal}
          onDismiss={() => setQuietBannerDismissed(true)}
        />
      )}

      {focusNote && <FeedFocusNote focusNote={focusNote} />}

      {feedLoading ? (
        <div style={{ padding: '56px 24px', textAlign: 'center', color: '#777777', fontSize: 14 }}>{M.feed.loading}</div>
      ) : feedError ? (
        <div role="alert" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800 }}>{M.feed.errorTitle}</p>
          <p style={{ margin: '0 0 18px', color: '#777777', fontSize: 14 }}>{M.feed.errorBody}</p>
          <button onClick={() => loadFeedData()} style={{ padding: '11px 18px', border: 0, borderRadius: 10, background: '#111111', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>{M.feed.retry}</button>
        </div>
      ) : displayPosts.length === 0 ? (
        <div style={{ padding: '52px 24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>{M.feed.emptyTitle}</p>
          <p style={{ margin: '0 0 18px', color: '#777777', fontSize: 14 }}>{M.feed.emptyBody}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button onClick={openRecordModal} style={{ padding: '11px 16px', border: 0, borderRadius: 10, background: '#111111', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>{M.feed.recordCta}</button>
            {activeComm && activeMemberCount <= 1 && <button onClick={() => { selectCommunity(activeComm); navigate('community-settings') }} style={{ padding: '11px 16px', border: '1px solid #D8D8D8', borderRadius: 10, background: '#FFFFFF', color: '#333333', fontWeight: 700, cursor: 'pointer' }}>{M.feed.inviteCta}</button>}
          </div>
        </div>
      ) : (
        <FeedPostList
          posts={displayPosts}
          onTapUser={handleTapUser}
          onTapPost={openPostDetail}
          onToggleCheer={(postId) => toggleReaction(postId, 'cheer')}
        />
      )}
    </div>
  )
}
