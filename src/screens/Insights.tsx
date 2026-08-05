import { useState, useEffect } from 'react'
import { useAppStore, type RoutineSuggestion } from '../store/appStore'
import { useMessages } from '../i18n'
import { isConnected } from '../lib/googleCalendar'
import { computeAchievement, computeAchievementForRange } from '../lib/achievement'
import { matchScheduleKeywords, type ScheduleKeyword } from '../lib/calendarInsights'
import { InsightsHeader } from '../components/insights/InsightsHeader'
import { CalendarStatusCard } from '../components/insights/CalendarStatusCard'
import { RoutineInsightsList } from '../components/insights/RoutineInsightsList'
import { CalendarKeywordInsightsList } from '../components/insights/CalendarKeywordInsightsList'
import { RoutineSuggestionCard } from '../components/insights/RoutineSuggestionCard'

const PERIOD_TO_DAYS: Record<string, number> = { 'This week': 7, 'This month': 30, 'All time': 365 }
const MIN_SNAPSHOT_DAYS_FOR_KEYWORD = 3

// Community conditions mapped to community ids for filtering posts
const COMMUNITY_CONDITIONS: { communityName: string; communityId: string; routine: string }[] = [
  { communityName: 'Morning Runners', communityId: 'morning-runners', routine: 'Morning' },
  { communityName: 'Clean Eaters', communityId: 'clean-eaters', routine: 'Meals' },
  { communityName: 'Book Club', communityId: 'book-club', routine: 'Evening' },
]

export default function Insights() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const posts = useAppStore((s) => s.posts)
  const dashboardPeriod = useAppStore((s) => s.dashboardPeriod)
  const nickname = useAppStore((s) => s.nickname)
  const routineGroups = useAppStore((s) => s.routineGroups)
  const calendarSnapshots = useAppStore((s) => s.calendarSnapshots)
  const fetchRoutineSuggestions = useAppStore((s) => s.fetchRoutineSuggestions)
  const saveRoutineGroups = useAppStore((s) => s.saveRoutineGroups)

  const calendarConnected = isConnected()
  const windowDays = PERIOD_TO_DAYS[dashboardPeriod] ?? 30
  const userName = nickname || 'Min'

  // Overall achievement per routine group over the selected period (real calculation, matches MyPage)
  const overallByGroup = computeAchievement(routineGroups, posts, userName, windowDays).groups
  const overallRate = overallByGroup.length
    ? Math.round(overallByGroup.reduce((sum, g) => sum + g.achievement, 0) / overallByGroup.length)
    : 0

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

  const displayInsights = insights

  // Calendar keyword insights: group snapshot days by matched keyword, compare that day's
  // overall achievement against the user's average. Requires several days of accumulated
  // snapshots (past-day calendar data isn't available via the read-only-today API).
  const daysByKeyword = new Map<ScheduleKeyword, string[]>()
  for (const snapshot of calendarSnapshots) {
    for (const keyword of matchScheduleKeywords(snapshot.eventTitles)) {
      const list = daysByKeyword.get(keyword) ?? []
      list.push(snapshot.date)
      daysByKeyword.set(keyword, list)
    }
  }
  const calendarKeywordInsights = [...daysByKeyword.entries()].map(([keyword, dates]) => {
    const rates = dates.map((dateStr) => {
      const dayStart = new Date(`${dateStr}T00:00:00`).getTime()
      const dayEnd = new Date(`${dateStr}T23:59:59`).getTime()
      return computeAchievementForRange(routineGroups, posts, userName, dayStart, dayEnd).overall
    })
    const avgOnDays = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0
    return { keyword, dayCount: dates.length, avgOnDays }
  })

  const topKeyword = [...daysByKeyword.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0]
  const [suggestions, setSuggestions] = useState<RoutineSuggestion[]>([])
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false)
  const [savedSuggestion, setSavedSuggestion] = useState(false)

  useEffect(() => {
    if (!topKeyword) {
      setSuggestionsLoaded(true)
      return
    }
    fetchRoutineSuggestions(topKeyword).then((result) => {
      setSuggestions(result)
      setSuggestionsLoaded(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topKeyword])

  const handleSaveSuggestion = () => {
    const newGroup = {
      id: `suggested-${Date.now()}`,
      name: M.insights.suggestedGroupName(topKeyword ?? ''),
      items: suggestions.map((s, i) => ({ id: `sg-item-${i}`, name: s.itemName, time: '', desc: '' })),
    }
    saveRoutineGroups([...routineGroups, newGroup])
    setSavedSuggestion(true)
  }

  return (
    <div>
      <InsightsHeader onBack={goBack} />

      <div style={{ padding: 20 }}>
        <CalendarStatusCard calendarConnected={calendarConnected} calendarDateLabel={M.insights.syncedLabel(new Date())} />

        <RoutineInsightsList dashboardPeriod={dashboardPeriod} insights={displayInsights} />

        {calendarConnected && (
          <CalendarKeywordInsightsList
            calendarKeywordInsights={calendarKeywordInsights}
            overallRate={overallRate}
            minSnapshotDaysForKeyword={MIN_SNAPSHOT_DAYS_FOR_KEYWORD}
          />
        )}

        {calendarConnected && topKeyword && suggestionsLoaded && suggestions.length > 0 && (
          <RoutineSuggestionCard
            topKeyword={topKeyword}
            suggestions={suggestions}
            savedSuggestion={savedSuggestion}
            onSave={handleSaveSuggestion}
          />
        )}
      </div>
    </div>
  )
}
