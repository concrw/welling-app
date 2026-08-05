const ko = {
  // profile header
  profileAlt: 'profile',
  handleLine: (nickname: string) => `@${nickname}.welling · WELLING`,
  followersLabel: 'followers',
  followingLabel: 'following',
  editRoutine: '루틴편집',
  share: '공유',
  messages: '메시지',
  shareText: (nickname: string) => `${nickname}님의 루틴을 확인해보세요`,
  // tabs
  tabDashboard: '대시보드',
  tabRoutine: '루틴',
  // routine tab
  publicBadge: 'Public',
  privateBadge: 'Private',
  routineTabFooter: '공개 설정된 루틴이 팔로워 피드에 노출됩니다.',
  // sign out sheet
  signOutTitle: '로그아웃 하시겠습니까?',
  signOutDesc: '모든 로컬 데이터가 초기화됩니다.',
  signOut: '로그아웃',
  // admin panel
  adminBadge: 'ADMIN',
  adminUsers: '유저 관리',
  adminAds: '광고 관리',
  totalUsers: '총 유저',
  todayPosts: '오늘 게시물',
  adImpressions: '광고 노출',
  adCtr: '광고 CTR',
  // weekly recap
  weeklyRecapTitle: '이번 주 회고',
  deltaVsLastWeek: (delta: number) => `지난주 대비 ${delta > 0 ? '+' : ''}${delta}%p`,
  streakBadge: (n: number) => `${n}-day streak`,
  // period selector (values are store ids as well as display labels)
  periods: {
    'This week': 'This week',
    'This month': 'This month',
    'All time': 'All time',
  } as Record<string, string>,
  // achievement card
  currentRoutineTitle: (period: string) => `Current Routine · ${period}`,
  // past routines
  pastRoutines: 'Past Routines',
  periodRange: (start: number, end: number) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${new Date(start).toLocaleDateString('ko-KR', opts)} – ${new Date(end).toLocaleDateString('ko-KR', opts)}`
  },
  // dashboard section headers
  sectionGoalVsActual: 'Goal vs. Actual',
  sectionEveningReflection: 'Evening reflection',
  sectionRoutineHistory: 'Routine history',
  sectionRoutinePrivacy: 'Routine privacy',
  sectionInsights: 'Insights',
  sectionSettings: 'Settings',
  // evening reflection section
  eveningReflectionDesc: '오늘 하루를 돌아보며 기록하세요.',
  eveningReflectionCta: '기록하기',
  // insights section suggestion card
  suggestedRoutineTitle: 'Suggested routine for team meeting days',
  suggestedRoutinePeople: '75 people with similar schedules do this',
  todayOnly: 'Today only',
  saveAsRoutine: 'Save as routine',
  // settings section
  settingsItems: {
    notifications: 'Notifications',
    homeScreen: 'Home screen',
    defaultVisibility: 'Default visibility',
    profileVisibility: 'Profile visibility',
    googleCalendar: 'Google Calendar',
    changeUsername: 'Change username',
    signOut: 'Sign out',
  },
}

const en: typeof ko = {
  profileAlt: 'Profile',
  handleLine: (nickname: string) => `@${nickname}.welling · WELLING`,
  followersLabel: 'followers',
  followingLabel: 'following',
  editRoutine: 'Edit routine',
  share: 'Share',
  messages: 'Messages',
  shareText: (nickname: string) => `Check out ${nickname}'s routines`,
  tabDashboard: 'Dashboard',
  tabRoutine: 'Routine',
  publicBadge: 'Public',
  privateBadge: 'Private',
  routineTabFooter: "Public routines are visible in your followers' feed.",
  signOutTitle: 'Sign out?',
  signOutDesc: 'All local data will be reset.',
  signOut: 'Sign out',
  adminBadge: 'ADMIN',
  adminUsers: 'Manage users',
  adminAds: 'Manage ads',
  totalUsers: 'Total users',
  todayPosts: 'Posts today',
  adImpressions: 'Ad impressions',
  adCtr: 'Ad CTR',
  weeklyRecapTitle: 'This week recap',
  deltaVsLastWeek: (delta: number) => `${delta > 0 ? '+' : ''}${delta}%p vs last week`,
  streakBadge: (n: number) => `${n}-day streak`,
  periods: {
    'This week': 'This week',
    'This month': 'This month',
    'All time': 'All time',
  } as Record<string, string>,
  currentRoutineTitle: (period: string) => `Current Routine · ${period}`,
  pastRoutines: 'Past Routines',
  periodRange: (start: number, end: number) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${new Date(start).toLocaleDateString('en-US', opts)} – ${new Date(end).toLocaleDateString('en-US', opts)}`
  },
  sectionGoalVsActual: 'Goal vs. Actual',
  sectionEveningReflection: 'Evening reflection',
  sectionRoutineHistory: 'Routine history',
  sectionRoutinePrivacy: 'Routine privacy',
  sectionInsights: 'Insights',
  sectionSettings: 'Settings',
  eveningReflectionDesc: 'Reflect on your day and write it down.',
  eveningReflectionCta: 'Write',
  suggestedRoutineTitle: 'Suggested routine for team meeting days',
  suggestedRoutinePeople: '75 people with similar schedules do this',
  todayOnly: 'Today only',
  saveAsRoutine: 'Save as routine',
  settingsItems: {
    notifications: 'Notifications',
    homeScreen: 'Home screen',
    defaultVisibility: 'Default visibility',
    profileVisibility: 'Profile visibility',
    googleCalendar: 'Google Calendar',
    changeUsername: 'Change username',
    signOut: 'Sign out',
  },
}

export const myPage = { ko, en }
