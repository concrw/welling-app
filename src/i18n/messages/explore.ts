const ko = {
  searchPlaceholder: '커뮤니티, 사람 검색',
  noResultsTitle: '검색 결과 없음',
  noResultsBody: (q: string) => `"${q}"에 해당하는 결과가 없어요.`,
  communitiesHeading: '커뮤니티',
  memberCount: (n: number) => `${n.toLocaleString('ko-KR')}명`,
  leaveCommunity: '탈퇴',
  joinCommunity: '가입하기',
  adLabel: '광고',
  adView: '보기',
  peopleHeading: '사람',
  seeAll: '모두 보기',
  showLess: '접기',
  follow: '팔로우',
  following: '팔로잉',
  newCommunityTitle: '새 커뮤니티',
  newCommunitySubtitle: '누구나 참여할 수 있어요',
}

const en: typeof ko = {
  searchPlaceholder: 'Search communities, people',
  noResultsTitle: 'No results',
  noResultsBody: (q: string) => `No results found for "${q}".`,
  communitiesHeading: 'Communities',
  memberCount: (n: number) => `${n.toLocaleString('en-US')} members`,
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
