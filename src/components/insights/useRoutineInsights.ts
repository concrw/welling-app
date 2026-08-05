import { useAppStore } from '../../store/appStore'
import { useMessages } from '../../i18n'
import { computeAchievement } from '../../lib/achievement'

const PERIOD_TO_DAYS: Record<string, number> = { 'This week': 7, 'This month': 30, 'All time': 365 }

// Community conditions mapped to community ids for filtering posts
const COMMUNITY_CONDITIONS: { communityName: string; communityId: string; routine: string }[] = [
  { communityName: 'Morning Runners', communityId: 'morning-runners', routine: 'Morning' },
  { communityName: 'Clean Eaters', communityId: 'clean-eaters', routine: 'Meals' },
  { communityName: 'Book Club', communityId: 'book-club', routine: 'Evening' },
]

export function useRoutineInsights() {
  const M = useMessages()
  const posts = useAppStore((s) => s.posts)
  const dashboardPeriod = useAppStore((s) => s.dashboardPeriod)
  const nickname = useAppStore((s) => s.nickname)
  const routineGroups = useAppStore((s) => s.routineGroups)

  const windowDays = PERIOD_TO_DAYS[dashboardPeriod] ?? 30
  const userName = nickname || 'Min'

  // Overall achievement per routine group over the selected period (real calculation, matches MyPage)
  const overallByGroup = computeAchievement(routineGroups, posts, userName, windowDays).groups

  // Achievement per routine group, restricted to days the user was active in the condition's community
  const insights = COMMUNITY_CONDITIONS.map(({ communityName, communityId, routine }) => {
    const communityDays = new Set(
      posts.filter((p) => p.community === communityId).map((p) => new Date(p.createdAt).toDateString())
    )
    const postsOnCommunityDays = posts.filter((p) => communityDays.has(new Date(p.createdAt).toDateString()))
    const conditionalGroup = computeAchievement(routineGroups, postsOnCommunityDays, userName, windowDays).groups
      .find((g) => g.name === routine)
    const avgGroup = overallByGroup.find((g) => g.name === routine)
    return { condition: M.insights.communityActivityDay(communityName), routine, lowRate: conditionalGroup?.achievement ?? 0, avgRate: avgGroup?.achievement ?? 0 }
  })

  return { insights, overallByGroup, windowDays }
}
