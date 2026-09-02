import { useAppStore } from '../store/appStore'
import { ExploreSearchBar } from '../components/explore/ExploreSearchBar'
import { ExploreNoResults } from '../components/explore/ExploreNoResults'
import { ExploreCommunityList } from '../components/explore/ExploreCommunityList'
import { ExploreAdBanner } from '../components/explore/ExploreAdBanner'
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
  const navigate = useAppStore((s) => s.navigate)
  const openAdModal = useAppStore((s) => s.openAdModal)
  const setAdPageData = useAppStore((s) => s.setAdPageData)
  const adSlots = useAppStore((s) => s.adSlots)
  const exploreAd = adSlots.explore

  const handleAdClick = () => {
    if (exploreAd.clickAction === 'link') {
      window.open(exploreAd.url, '_blank')
    } else if (exploreAd.clickAction === 'modal') {
      openAdModal({ brand: exploreAd.brand, desc: exploreAd.desc, modalTitle: exploreAd.modalTitle, modalBody: exploreAd.modalBody, ctaUrl: exploreAd.url })
    } else {
      setAdPageData({ brand: exploreAd.brand, desc: exploreAd.desc, slotKey: 'explore' })
      navigate('ad-page')
    }
  }

  const q = searchQuery.toLowerCase()
  const filteredCommunities = q
    ? communities.filter((c) => c.name.toLowerCase().includes(q) || c.focus.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
    : communities
  const filteredPeople = q
    ? suggestedUsers.filter((u) => u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q))
    : suggestedUsers
  const noResults = q && filteredCommunities.length === 0 && filteredPeople.length === 0

  return (
    <div data-testid="explore-screen">
      <ExploreSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div style={{ padding: 20 }}>
        {noResults ? (
          <ExploreNoResults searchQuery={searchQuery} />
        ) : (
          <>
            <ExploreCommunityList communities={filteredCommunities} onSelect={selectCommunity} onToggleJoin={toggleJoinCommunity} />

            <ExploreAdBanner brand={exploreAd.brand} desc={exploreAd.desc} onClick={handleAdClick} />

            <ExplorePeopleList people={filteredPeople} followedUsers={followedUsers} onSelectUser={selectUser} onToggleFollow={toggleFollowUser} />

            <ExploreNewCommunityCard onClick={() => navigate('new-community')} />
          </>
        )}
      </div>
    </div>
  )
}
