import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'
import { computeAchievement, computeAchievementForRange } from '../lib/achievement'
import { ProfileHeader } from '../components/mypage/ProfileHeader'
import { TabBar } from '../components/mypage/TabBar'
import { RoutineTab } from '../components/mypage/RoutineTab'
import { DashboardTab, type AccordionState } from '../components/mypage/DashboardTab'
import { SignOutConfirmSheet } from '../components/mypage/SignOutConfirmSheet'

const PERIOD_TO_DAYS: Record<string, number> = { 'This week': 7, 'This month': 30, 'All time': 365 }

export default function MyPage() {
  const M = useMessages()
  const navigate = useAppStore((s) => s.navigate)
  const mypageTab = useAppStore((s) => s.mypageTab)
  const setMypageTab = useAppStore((s) => s.setMypageTab)
  const nickname = useAppStore((s) => s.nickname)
  const dashboardPeriod = useAppStore((s) => s.dashboardPeriod)
  const setDashboardPeriod = useAppStore((s) => s.setDashboardPeriod)
  const expandedPrev = useAppStore((s) => s.expandedPrev)
  const toggleExpandPrev = useAppStore((s) => s.toggleExpandPrev)
  const notifications = useAppStore((s) => s.notifications)
  const isAdmin = useAppStore((s) => s.isAdmin)
  const posts = useAppStore((s) => s.posts)
  const routineGroups = useAppStore((s) => s.routineGroups)
  const routineHistory = useAppStore((s) => s.routineHistory)
  const routinePrivacy = useAppStore((s) => s.routinePrivacy)
  const saveRoutinePrivacy = useAppStore((s) => s.saveRoutinePrivacy)
  const signOut = useAppStore((s) => s.signOut)

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  // 아코디언 열림 상태 — settings만 기본 닫힘
  const [open, setOpen] = useState<AccordionState>({
    goalVsActual: true,
    eveningReflection: true,
    routineHistory: true,
    routinePrivacy: true,
    insights: true,
    settings: false,
  })
  const toggleSection = (key: keyof AccordionState) => setOpen((s) => ({ ...s, [key]: !s[key] }))

  const windowDays = PERIOD_TO_DAYS[dashboardPeriod] ?? 30
  const achievement = computeAchievement(routineGroups, posts, nickname || 'Min', windowDays)

  const DAY_MS = 86400000
  const weeklyNow = Date.now()
  const thisWeek = computeAchievementForRange(routineGroups, posts, nickname || 'Min', weeklyNow - 7 * DAY_MS, weeklyNow)
  const lastWeek = computeAchievementForRange(routineGroups, posts, nickname || 'Min', weeklyNow - 14 * DAY_MS, weeklyNow - 7 * DAY_MS)
  const weeklyDelta = thisWeek.overall - lastWeek.overall
  const pastRoutines = routineHistory.map((entry) => ({
    id: entry.id,
    period: M.myPage.periodRange(entry.startDate, entry.endDate),
    achievement: computeAchievementForRange(entry.groups, posts, nickname || 'Min', entry.startDate, entry.endDate).overall,
  }))

  const togglePrivacyGroup = (gi: number) => saveRoutinePrivacy(routinePrivacy.map((g, i) => i === gi ? { ...g, on: !g.on } : g))
  const togglePrivacyItem = (gi: number, ii: number) => saveRoutinePrivacy(routinePrivacy.map((g, i) => i === gi ? { ...g, items: g.items.map((item, j) => j === ii ? { ...item, on: !item.on } : item) } : g))

  // TODO: store/API에서 실제 팔로워·팔로잉 수를 가져오도록 교체 필요
  const followersCount = 47
  const followingCount = 23

  const hasUnread = notifications.some((n) => !n.read)
  const unreadCount = notifications.filter((n) => !n.read).length
  const latestNotif = notifications.find((n) => !n.read)

  return (
    <div>
      {showSignOutConfirm && (
        <SignOutConfirmSheet onConfirm={() => signOut()} onCancel={() => setShowSignOutConfirm(false)} />
      )}

      <ProfileHeader
        nickname={nickname}
        followersCount={followersCount}
        followingCount={followingCount}
        hasUnread={hasUnread}
        unreadCount={unreadCount}
        latestNotifText={latestNotif?.text}
        mypageTab={mypageTab}
        onNavigate={navigate}
        onDashToggle={() => setMypageTab(mypageTab === 'routine' ? 'dashboard' : 'routine')}
      />

      <TabBar active={mypageTab} onChange={setMypageTab} />

      {mypageTab === 'routine' && <RoutineTab />}

      {mypageTab === 'dashboard' && (
        <DashboardTab
          isAdmin={isAdmin}
          thisWeek={thisWeek}
          weeklyDelta={weeklyDelta}
          dashboardPeriod={dashboardPeriod}
          onPeriodChange={setDashboardPeriod}
          achievement={achievement}
          pastRoutines={pastRoutines}
          expandedPrev={expandedPrev}
          onToggleExpandPrev={toggleExpandPrev}
          open={open}
          onToggleSection={toggleSection}
          routinePrivacy={routinePrivacy}
          onTogglePrivacyGroup={togglePrivacyGroup}
          onTogglePrivacyItem={togglePrivacyItem}
          onNavigate={navigate}
          onSignOutRequest={() => setShowSignOutConfirm(true)}
        />
      )}
    </div>
  )
}
