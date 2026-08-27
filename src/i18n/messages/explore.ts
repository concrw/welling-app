const ko = {
  searchPlaceholder: '커뮤니티, 사람 검색',
  noResultsTitle: '검색 결과 없음',
  noResultsBody: (q: string) => `"${q}"에 해당하는 결과가 없어요.`,
  communitiesHeading: 'Communities',
  memberCount: (n: number) => `${n.toLocaleString()} members`,
  leaveCommunity: '탈퇴',
  joinCommunity: '가입하기',
  adLabel: '광고',
  adView: '보기',
  peopleHeading: 'People',
  seeAll: 'See all',
  showLess: 'Show less',
  follow: 'Follow',
  following: 'Following',
  newCommunityTitle: 'New community',
  newCommunitySubtitle: 'Open to anyone',
}

const en: typeof ko = {
  searchPlaceholder: 'Search communities, people',
  noResultsTitle: 'No results',
  noResultsBody: (q: string) => `No results found for "${q}".`,
  communitiesHeading: 'Communities',
  memberCount: (n: number) => `${n.toLocaleString()} members`,
  leaveCommunity: 'Leave',
  joinCommunity: 'Join',
  adLabel: 'Ad',
  adView: 'View',
  peopleHeading: 'People',
  seeAll: 'See all',
  showLess: 'Show less',
  follow: 'Follow',
  following: 'Following',
  newCommunityTitle: 'New community',
  newCommunitySubtitle: 'Open to anyone',
}

export const explore = { ko, en }
