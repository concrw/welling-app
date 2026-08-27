const ko = {
  notFound: '사용자를 찾을 수 없어요.',
  privateTitle: '비공개 프로필',
  privateBody: '이 사용자가 프로필을 공개하지 않았어요.',
  handleLine: (handle: string) => `@${handle} · WELLING`,
  followersLabel: 'followers',
  followingLabel: 'following',
  following: '팔로잉',
  follow: '팔로우',
  synced: '싱크됨',
  syncRoutine: '루틴싱크',
}

const en: typeof ko = {
  notFound: 'User not found.',
  privateTitle: 'Private profile',
  privateBody: 'This user has not made their profile public.',
  handleLine: (handle: string) => `@${handle} · WELLING`,
  followersLabel: 'followers',
  followingLabel: 'following',
  following: 'Following',
  follow: 'Follow',
  synced: 'Synced',
  syncRoutine: 'Sync routine',
}

export const otherProfile = { ko, en }
