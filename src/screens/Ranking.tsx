import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAppStore, fetchPublicRoutinesByUser } from '../store/appStore'
import type { User } from '../store/appStore'
import { computeAchievement } from '../lib/achievement'
import { RankingTabs } from '../components/ranking/RankingTabs'
import { RankingPodium } from '../components/ranking/RankingPodium'
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
  const userId = useAppStore((s) => s.userId)
  const nickname = useAppStore((s) => s.nickname)
  const routineGroups = useAppStore((s) => s.routineGroups)
  const [groupMembers, setGroupMembers] = useState<{ communityId: string; users: User[] } | null>(null)

  // 피드와 같은 그룹 칩을 쓴다: 가입한 커뮤니티만.
  const joinedCommunities = communities.filter((c) => c.joined)
  const RANKING_TABS = ['All', ...joinedCommunities.map((c) => c.name)]

  const activeCommunity = rankingTab === 'All' ? undefined : communities.find((c) => c.name === rankingTab)
  const activeCommunityId = activeCommunity?.id

  // 본인은 suggestedUsers(neq userId)에 없으므로 직접 만든다.
  const viewer: User | null = userId
    ? { id: userId, name: nickname, handle: nickname, initials: nickname[0]?.toUpperCase() ?? '?', color: AVATAR_COLORS[0], bio: '', followers: 0, following: 0, followed: false, synced: false, routines: [], routineGoals: routineGroups }
    : null

  // 그룹 탭: 해당 커뮤니티의 community_members + profiles로 목록을 만든다.
  useEffect(() => {
    if (!activeCommunityId) return
    let cancelled = false
    const load = async () => {
      const { data: memberRows, error: memberError } = await supabase
        .from('community_members')
        .select('user_id')
        .eq('community_id', activeCommunityId)
      if (memberError) {
        console.error('Failed to load ranking members:', memberError)
        return
      }
      const memberIds = (memberRows ?? []).map((m) => m.user_id)
      const { data: profileRows, error: profileError } = memberIds.length
        ? await supabase.from('profiles').select('id, nickname, bio').in('id', memberIds)
        : { data: [] as { id: string; nickname: string; bio: string | null }[], error: null }
      if (profileError) {
        console.error('Failed to load ranking profiles:', profileError)
        return
      }
      const known = new Map(suggestedUsers.map((u) => [u.id, u]))
      // suggestedUsers에 없는 멤버도 같은 로직(공개 루틴 + 게시글)으로 달성률을 계산하도록 루틴을 가져온다.
      const unknownIds = (profileRows ?? []).map((p) => p.id).filter((id) => !known.has(id) && id !== userId)
      const { groupsByUser, routinesByUser } = await fetchPublicRoutinesByUser(unknownIds)
      const users: User[] = (profileRows ?? []).map((p, i) => known.get(p.id) ?? {
        id: p.id,
        name: p.nickname,
        handle: p.nickname,
        initials: p.nickname[0]?.toUpperCase() ?? '?',
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        bio: p.bio ?? '',
        followers: 0,
        following: 0,
        followed: false,
        synced: false,
        routines: routinesByUser.get(p.id) ?? [],
        routineGoals: groupsByUser.get(p.id) ?? [],
      })
      if (!cancelled) setGroupMembers({ communityId: activeCommunityId, users })
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCommunityId])

  const withViewer = (list: User[]) =>
    viewer && !list.some((u) => u.id === viewer.id) ? [...list, viewer] : list.map((u) => (viewer && u.id === viewer.id ? viewer : u))

  const filteredUsers = rankingTab === 'All'
    ? withViewer(suggestedUsers)
    : groupMembers && groupMembers.communityId === activeCommunityId
      ? withViewer(groupMembers.users)
      : []

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

  const handleTapProfile = (userName: string) => {
    const user = filteredUsers.find((u) => u.name === userName)
    if (user) selectUser(user)
  }

  return (
    <div data-testid="ranking-screen">
      <RankingTabs tabs={RANKING_TABS} active={rankingTab} onChange={setRankingTab} />

      <RankingPodium top3={TOP3} onTapProfile={handleTapProfile} />

      <RankingList items={REST} onTapProfile={handleTapProfile} />

      <div style={{ height: 24 }} />
    </div>
  )
}
