const ko = {
  title: '유저 / 게시물 관리',
  usersTab: (n: number) => `유저 (${n})`,
  userReportsTab: (n: number) => `유저 신고 (${n})`,
  postReportsTab: (n: number) => `게시물 신고 (${n})`,
  statusSuspended: '정지됨',
  statusActive: '활성',
  followersCount: (n: number) => `팔로워 ${n.toLocaleString()}명`,
  restore: '복구',
  suspend: '정지',
  reporter: (name: string) => `신고자: @${name}`,
  reportedUser: (name: string, count: number) => `@${name} · 신고 ${count}건`,
  dismiss: '무시',
  emptyReports: '신고된 게시물이 없어요.',
}

const en: typeof ko = {
  title: 'User / Post management',
  usersTab: (n: number) => `Users (${n})`,
  userReportsTab: (n: number) => `User reports (${n})`,
  postReportsTab: (n: number) => `Post reports (${n})`,
  statusSuspended: 'Suspended',
  statusActive: 'Active',
  followersCount: (n: number) => `${n.toLocaleString()} followers`,
  restore: 'Restore',
  suspend: 'Suspend',
  reporter: (name: string) => `Reporter: @${name}`,
  reportedUser: (name: string, count: number) => `@${name} · ${count} reports`,
  dismiss: 'Dismiss',
  emptyReports: 'No reported posts.',
}

export const adminUsers = { ko, en }
