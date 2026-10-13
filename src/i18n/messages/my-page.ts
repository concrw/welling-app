const ko = {
  // profile header
  profileAlt: '프로필',
  handleLine: (nickname: string) => `@${nickname}.welling · WELLING`,
  followersLabel: '팔로워',
  followingLabel: '팔로잉',
  editRoutine: '루틴편집',
  share: '공유',
  shareCopied: '링크 복사됨',
  messages: '메시지',
  emptyTitle: '아직 시작한 루틴이 없어요',
  emptyBody: '첫 루틴을 만들거나 오늘의 건강 기록을 남겨보세요.',
  emptyRoutineCta: '루틴 만들기',
  emptyRecordCta: '기록하기',
  shareText: (nickname: string) => `${nickname}님의 루틴을 확인해보세요`,
  // tabs
  tabDashboard: '대시보드',
  tabRoutine: '루틴',
  // routine tab
  publicBadge: '공개',
  privateBadge: '비공개',
  routineTabFooter: '공개 설정된 루틴이 팔로워 피드에 노출됩니다.',
  routineLabel: (name: string) => ({
    Morning: '아침', Meals: '식사', Evening: '저녁', Running: '러닝',
    'Morning Routine': '아침 루틴', 'Evening Routine': '저녁 루틴',
    'Morning Walk': '아침 산책', 'Cold Shower': '찬물 샤워', Meditation: '명상', Journaling: '일기 쓰기',
    'Running 5km': '5km 러닝', Stretching: '스트레칭', Reading: '독서', 'Wake Up': '기상',
    'Morning Stretch': '아침 스트레칭', 'Lunch Walk': '점심 산책',
  }[name] ?? name),
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
  streakBadge: (n: number) => `${n}일 연속`,
  // period selector (values are store ids as well as display labels)
  periods: {
    'This week': '이번 주',
    'This month': '이번 달',
    'All time': '전체 기간',
  } as Record<string, string>,
  // achievement card
  currentRoutineTitle: (period: string) => `현재 루틴 · ${period}`,
  // past routines
  pastRoutines: '지난 루틴',
  periodRange: (start: number, end: number) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${new Date(start).toLocaleDateString('ko-KR', opts)} – ${new Date(end).toLocaleDateString('ko-KR', opts)}`
  },
  // dashboard section headers
  sectionGoalVsActual: '목표와 실제',
  sectionEveningReflection: '저녁 회고',
  sectionRoutineHistory: '루틴 기록',
  sectionRoutinePrivacy: '루틴 공개 설정',
  sectionInsights: '루틴 인사이트',
  sectionSettings: '설정',
  // evening reflection section
  eveningReflectionDesc: '오늘 하루를 돌아보며 기록하세요.',
  eveningReflectionCta: '기록하기',
  // insights section suggestion card
  suggestedRoutineTitle: '팀 회의가 있는 날의 추천 루틴',
  suggestedRoutinePeople: '비슷한 일정의 75명이 실천하고 있어요',
  todayOnly: '오늘만',
  saveAsRoutine: '루틴으로 저장',
  // settings section
  settingsItems: {
    notifications: '알림',
    ranking: '통계',
    homeScreen: '홈 화면',
    defaultVisibility: '기본 공개 범위',
    profileVisibility: '프로필 공개 범위',
    googleCalendar: 'Google 캘린더',
    changeUsername: '사용자명 변경',
    signOut: '로그아웃',
  },
}

const en: typeof ko = {
  profileAlt: 'Profile',
  handleLine: (nickname: string) => `@${nickname}.welling · WELLING`,
  followersLabel: 'followers',
  followingLabel: 'following',
  editRoutine: 'Edit routine',
  share: 'Share',
  shareCopied: 'Link copied',
  messages: 'Messages',
  emptyTitle: 'No routines yet',
  emptyBody: 'Create your first routine or share a healthy moment from today.',
  emptyRoutineCta: 'Create routine',
  emptyRecordCta: 'Record now',
  shareText: (nickname: string) => `Check out ${nickname}'s routines`,
  tabDashboard: 'Dashboard',
  tabRoutine: 'Routine',
  publicBadge: 'Public',
  privateBadge: 'Private',
  routineTabFooter: "Public routines are visible in your followers' feed.",
  routineLabel: (name: string) => name,
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
    ranking: 'Stats',
    homeScreen: 'Home screen',
    defaultVisibility: 'Default visibility',
    profileVisibility: 'Profile visibility',
    googleCalendar: 'Google Calendar',
    changeUsername: 'Change username',
    signOut: 'Sign out',
  },
}

export const myPage = { ko, en }
