const ko = {
  allTab: 'All',
  champions: 'Habit Champions',
  emptyCommunity: '이 커뮤니티에 기록된 유저가 없어요.',
  streak: (n: number) => `${n}-day streak`,
  adLabel: '광고',
  adView: '보기',
}

const en: typeof ko = {
  allTab: 'All',
  champions: 'Habit Champions',
  emptyCommunity: 'No users have logged in this community yet.',
  streak: (n: number) => `${n}-day streak`,
  adLabel: 'Ad',
  adView: 'View',
}

export const ranking = { ko, en }
