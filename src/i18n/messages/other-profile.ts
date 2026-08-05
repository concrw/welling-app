const ko = {
  notFound: '사용자를 찾을 수 없어요.',
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
  handleLine: (handle: string) => `@${handle} · WELLING`,
  followersLabel: 'followers',
  followingLabel: 'following',
  following: 'Following',
  follow: 'Follow',
  synced: 'Synced',
  syncRoutine: 'Sync routine',
}

export const otherProfile = { ko, en }
