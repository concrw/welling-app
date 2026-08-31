const ko = {
  notFound: '커뮤니티를 찾을 수 없어요.',
  joined: 'Joined',
  join: 'Join',
  memberAndFocus: (n: number, focus: string) => `${n.toLocaleString()}명 · ${focus}`,
  memberOnly: (n: number) => `${n.toLocaleString()}명`,
  writePost: '이 커뮤니티에 기록 남기기',
  recentPosts: '최근 게시물',
  emptyTitle: '아직 게시물이 없어요.',
  emptyBody: '첫 번째 기록을 남겨보세요!',
}

const en: typeof ko = {
  notFound: 'Community not found.',
  joined: 'Joined',
  join: 'Join',
  memberAndFocus: (n: number, focus: string) => `${n.toLocaleString()} members · ${focus}`,
  memberOnly: (n: number) => `${n.toLocaleString()} members`,
  writePost: 'Post to this community',
  recentPosts: 'Recent posts',
  emptyTitle: 'No posts yet.',
  emptyBody: 'Be the first to leave a record!',
}

export const communityDetail = { ko, en }
