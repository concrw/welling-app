const ko = {
  notFound: '커뮤니티를 찾을 수 없어요.',
  joined: 'Joined',
  join: 'Join',
  memberAndFocus: (n: number, focus: string) => `${n.toLocaleString('ko-KR')}명 · ${focus}`,
  memberOnly: (n: number) => `${n.toLocaleString('ko-KR')}명`,
  writePost: '이 커뮤니티에 기록 남기기',
  recentPosts: '최근 게시물',
  emptyTitle: '아직 게시물이 없어요.',
  emptyBody: '첫 번째 기록을 남겨보세요!',
  inviteFriends: '친구 초대',
  inviteShareTitle: (name: string) => `${name} 그룹 초대`,
  inviteShareText: (name: string) => `${name}에서 함께 건강한 습관을 만들어요.`,
  inviteCopied: '초대 링크를 복사했어요.',
  inviteCopyFailed: '초대 링크를 복사하지 못했어요.',
}

const en: typeof ko = {
  notFound: 'Community not found.',
  joined: 'Joined',
  join: 'Join',
  memberAndFocus: (n: number, focus: string) => `${n.toLocaleString('en-US')} members · ${focus}`,
  memberOnly: (n: number) => `${n.toLocaleString('en-US')} members`,
  writePost: 'Post to this community',
  recentPosts: 'Recent posts',
  emptyTitle: 'No posts yet.',
  emptyBody: 'Be the first to leave a record!',
  inviteFriends: 'Invite friends',
  inviteShareTitle: (name: string) => `Invitation to ${name}`,
  inviteShareText: (name: string) => `Build healthy habits together in ${name}.`,
  inviteCopied: 'Invitation link copied.',
  inviteCopyFailed: 'Could not copy the invitation link.',
}

export const communityDetail = { ko, en }
