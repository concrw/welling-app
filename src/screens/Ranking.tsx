import { useAppStore } from '../store/appStore'
import { computeAchievement } from '../lib/achievement'
import { RankingTabs } from '../components/ranking/RankingTabs'
import { RankingPodium } from '../components/ranking/RankingPodium'
import { RankingAdBanner } from '../components/ranking/RankingAdBanner'
import { RankingList } from '../components/ranking/RankingList'

const RANKING_PERIOD_DAYS = 14

const AVATAR_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#0EA5E9', '#EC4899', '#EF4444', '#047857', '#14B8A6', '#111111', '#8B5CF6']

export default function Ranking() {
  const rankingTab = useAppStore((s) => s.rankingTab)
  const setRankingTab = useAppStore((s) => s.setRankingTab)
  const selectUser = useAppStore((s) => s.selectUser)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const communities = useAppStore((s) => s.communities)
  const posts = useAppStore((s) => s.posts)

  const RANKING_TABS = ['All', ...communities.map((c) => c.name)]

  const navigate = useAppStore((s) => s.navigate)
  const openAdModal = useAppStore((s) => s.openAdModal)
  const setAdPageData = useAppStore((s) => s.setAdPageData)
  const adSlots = useAppStore((s) => s.adSlots)
  const rankingAd = adSlots.ranking

  // Derive which community ids each user has posted in
  const userCommunityMap = new Map<string, Set<string>>()
  for (const post of posts) {
    if (!userCommunityMap.has(post.user)) userCommunityMap.set(post.user, new Set())
    userCommunityMap.get(post.user)!.add(post.community)
  }

  // Filter suggestedUsers by active tab
  const filteredUsers = rankingTab === 'All'
    ? suggestedUsers
    : suggestedUsers.filter((u) => {
        const community = communities.find((c) => c.name === rankingTab)
        if (!community) return false
        const commIds = userCommunityMap.get(u.name)
        return commIds ? commIds.has(community.id) : false
      })

  // Rank by actual habit achievement rate, computed from each user's real routine goals + posted records
  const ranked = filteredUsers
    .map((u) => {
      const { overall, streak } = computeAchievement(u.routineGoals, posts, u.name, RANKING_PERIOD_DAYS)
      return { user: u.name, initials: u.initials, color: u.color, completion: overall, streak }
    })
    .sort((a, b) => b.completion - a.completion || b.streak - a.streak)
    .map((r, i) => ({ ...r, rank: i + 1, color: r.color || AVATAR_COLORS[i % AVATAR_COLORS.length] }))

  const TOP3 = ranked.slice(0, 3)
  const REST = ranked.slice(3)

  const handleRankingAdClick = () => {
    if (rankingAd.clickAction === 'link') {
      window.open(rankingAd.url, '_blank')
    } else if (rankingAd.clickAction === 'modal') {
      openAdModal({ brand: rankingAd.brand, desc: rankingAd.desc, modalTitle: rankingAd.modalTitle, modalBody: rankingAd.modalBody })
    } else {
      setAdPageData({ brand: rankingAd.brand, desc: rankingAd.desc, slotKey: 'ranking' })
      navigate('ad-page')
    }
  }

  const handleTapProfile = (userName: string) => {
    const user = suggestedUsers.find((u) => u.name === userName)
    if (user) selectUser(user)
  }

  return (
    <div>
      <RankingTabs tabs={RANKING_TABS} active={rankingTab} onChange={setRankingTab} />

      <RankingPodium top3={TOP3} onTapProfile={handleTapProfile} />

      <RankingAdBanner brand={rankingAd.brand} desc={rankingAd.desc} onClick={handleRankingAdClick} />

      <RankingList items={REST} onTapProfile={handleTapProfile} />

      <div style={{ height: 24 }} />
    </div>
  )
}
