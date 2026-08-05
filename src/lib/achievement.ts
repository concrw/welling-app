import type { Post, RoutineGroupData } from '../store/appStore'

const DAY_MS = 86400000

export interface ItemAchievement {
  name: string
  rate: number
}

export interface GroupAchievement {
  name: string
  achievement: number
  items: ItemAchievement[]
}

export interface AchievementResult {
  overall: number
  groups: GroupAchievement[]
  streak: number
}

// 게시글 내용에 루틴 항목 이름이 포함돼 있는지 판정한다.
// 항목 이름의 첫 단어(예: "달리기 5km" -> "달리기")를 기준으로 매칭한다.
export function matchesItem(postContent: string, itemName: string): boolean {
  const keyword = itemName.trim().split(' ')[0]?.toLowerCase()
  if (!keyword) return false
  return postContent.toLowerCase().includes(keyword)
}

function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// [startDate, endDate] 구간 안에서 실제 게시글을 근거로 달성률/streak을 계산한다.
// streak은 endDate부터 거슬러 올라가며 하루라도 매칭이 끊기면 멈춘다.
export function computeAchievementForRange(
  routineGoals: RoutineGroupData[],
  posts: Post[],
  userName: string,
  startDate: number,
  endDate: number
): AchievementResult {
  const periodDays = Math.max(1, Math.round((endDate - startDate) / DAY_MS))
  const userPosts = posts.filter((p) => p.user === userName && p.createdAt >= startDate && p.createdAt <= endDate)

  const groups: GroupAchievement[] = routineGoals.map((group) => {
    const items: ItemAchievement[] = group.items.map((item) => {
      const completedDays = new Set<string>()
      for (const post of userPosts) {
        if (matchesItem(post.content, item.name)) completedDays.add(dayKey(post.createdAt))
      }
      const rate = Math.round((completedDays.size / periodDays) * 100)
      return { name: item.name, rate: Math.min(100, rate) }
    })
    const achievement = items.length ? Math.round(items.reduce((sum, i) => sum + i.rate, 0) / items.length) : 0
    return { name: group.name, achievement, items }
  })

  const allItems = groups.flatMap((g) => g.items)
  const overall = allItems.length ? Math.round(allItems.reduce((sum, i) => sum + i.rate, 0) / allItems.length) : 0

  const allItemNames = routineGoals.flatMap((g) => g.items.map((i) => i.name))
  let streak = 0
  for (let d = 0; d < periodDays; d++) {
    const targetKey = dayKey(endDate - d * DAY_MS)
    const hasHit = userPosts.some(
      (p) => dayKey(p.createdAt) === targetKey && allItemNames.some((name) => matchesItem(p.content, name))
    )
    if (!hasHit) break
    streak++
  }

  return { overall, groups, streak }
}

// 지금부터 periodDays일 전까지의 trailing window로 계산하는 편의 래퍼.
export function computeAchievement(
  routineGoals: RoutineGroupData[],
  posts: Post[],
  userName: string,
  periodDays: number
): AchievementResult {
  const now = Date.now()
  return computeAchievementForRange(routineGoals, posts, userName, now - periodDays * DAY_MS, now)
}

// 해당 유저의 마지막 게시물로부터 며칠이 지났는지. 게시물이 전혀 없으면 Infinity.
export function daysSinceLastPost(posts: Post[], userName: string): number {
  const userPosts = posts.filter((p) => p.user === userName)
  if (userPosts.length === 0) return Infinity
  const lastCreatedAt = Math.max(...userPosts.map((p) => p.createdAt))
  return Math.floor((Date.now() - lastCreatedAt) / DAY_MS)
}
