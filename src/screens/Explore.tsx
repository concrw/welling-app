import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import type { User } from '../store/appStore'
import { ExploreSearchBar } from '../components/explore/ExploreSearchBar'
import { ExploreNoResults } from '../components/explore/ExploreNoResults'
import { ExploreCommunityList } from '../components/explore/ExploreCommunityList'
import { ExplorePeopleList } from '../components/explore/ExplorePeopleList'
import { ExploreNewCommunityCard } from '../components/explore/ExploreNewCommunityCard'

export default function Explore() {
  const communities = useAppStore((s) => s.communities)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const followedUsers = useAppStore((s) => s.followedUsers)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const toggleJoinCommunity = useAppStore((s) => s.toggleJoinCommunity)
  const toggleFollowUser = useAppStore((s) => s.toggleFollowUser)
  const selectCommunity = useAppStore((s) => s.selectCommunity)
  const selectUser = useAppStore((s) => s.selectUser)

  const searchProfiles = useAppStore((s) => s.searchProfiles)
  const [remote, setRemote] = useState<{ query: string; users: User[] } | null>(null)

  // Debounced server search; stale responses are dropped. On failure/null the local filter is used as before.
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    let cancelled = false
    const t = setTimeout(() => {
      searchProfiles(trimmed)
        .then((users) => { if (!cancelled) setRemote(users ? { query: trimmed, users } : null) })
        .catch(() => { if (!cancelled) setRemote(null) })
    }, 300)
    return () => { cancelled = true; clearTimeout(t) }
  }, [searchQuery, searchProfiles])

  const q = searchQuery.toLowerCase()
  const filteredCommunities = q
    ? communities.filter((c) => c.name.toLowerCase().includes(q) || c.focus.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
    : communities
  const localPeople = q
    ? suggestedUsers.filter((u) => u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q))
    : suggestedUsers
  const remoteUsers = q && remote && remote.query === searchQuery.trim() ? remote.users : null
  const filteredPeople = remoteUsers
    ? [...remoteUsers, ...localPeople.filter((u) => !remoteUsers.some((r) => r.id === u.id))]
    : localPeople
  const noResults = q && filteredCommunities.length === 0 && filteredPeople.length === 0

  return (
    <div data-testid="explore-screen">
      <ExploreSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div style={{ padding: 20 }}>
        {noResults ? (
          <ExploreNoResults searchQuery={searchQuery} />
        ) : (
          <>
            <ExploreCommunityList
              communities={filteredCommunities}
              onSelect={selectCommunity}
              onToggleJoin={toggleJoinCommunity}
            />

            <ExplorePeopleList
              people={filteredPeople}
              followedUsers={followedUsers}
              onToggleFollow={toggleFollowUser}
              onSelectUser={selectUser}
            />

            <ExploreNewCommunityCard onClick={() => useAppStore.getState().navigate('new-community')} />
          </>
        )}
      </div>
    </div>
  )
}
