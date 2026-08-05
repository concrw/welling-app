const ko = {
  title: '설정',
  notifications: '알림',
  googleCalendar: 'Google 캘린더',
  homeScreen: '홈 화면',
  defaultVisibility: '기본 공개 범위',
  profileVisibility: '프로필 공개 범위',
  changeUsername: '사용자명 변경',
  language: '언어',
  signOut: '로그아웃',

  // Change username
  currentUsername: '현재 사용자명',
  newUsername: '새 사용자명',
  usernameHint: '영문, 숫자, 언더바 사용 가능. 최대 20자.',

  // Visibility options
  visPublic: '전체 공개',
  visFollowers: '팔로워만',
  visPrivate: '비공개',
  defaultVisibilityGuide: '새 게시물의 기본 공개 범위를 설정하세요. 게시물마다 개별 변경도 가능합니다.',
  visPublicPostDesc: '누구나 내 게시물을 볼 수 있습니다.',
  visFollowersDesc: '나를 팔로우하는 사람만 볼 수 있습니다.',
  visPrivateDesc: '나만 볼 수 있습니다.',
  profileVisibilityGuide: '내 프로필 페이지의 공개 범위를 설정하세요.',
  visPublicProfileDesc: '누구나 내 프로필을 볼 수 있습니다.',

  // Google Calendar
  connectedStatus: '연결됨',
  notConnectedStatus: '연결되지 않음',
  googleCalendarDesc: 'Google Calendar를 연결하면 일정에 따라 루틴 Insights를 분석할 수 있습니다. 캘린더 데이터는 분석 목적으로만 사용됩니다.',
  connecting: '연결 중...',
  disconnect: '연결 해제',
  connect: '연결하기',

  // Home screen
  homeScreenGuide: '앱을 열었을 때 표시할 화면을 선택하세요.',
  homeFeedOption: '피드',
  homeFeedOptionDesc: '앱을 열면 피드가 먼저 보입니다.',
  homeRecordOption: '기록 모달',
  homeRecordOptionDesc: '앱을 열면 바로 루틴 기록 화면이 열립니다.',
}

const en: typeof ko = {
  title: 'Settings',
  notifications: 'Notifications',
  googleCalendar: 'Google Calendar',
  homeScreen: 'Home screen',
  defaultVisibility: 'Default visibility',
  profileVisibility: 'Profile visibility',
  changeUsername: 'Change username',
  language: 'Language',
  signOut: 'Sign out',

  currentUsername: 'Current username',
  newUsername: 'New username',
  usernameHint: 'Letters, numbers, and underscores allowed. Max 20 characters.',

  visPublic: 'Public',
  visFollowers: 'Followers only',
  visPrivate: 'Private',
  defaultVisibilityGuide: 'Set the default visibility for new posts. You can also change it for each post.',
  visPublicPostDesc: 'Anyone can see my posts.',
  visFollowersDesc: 'Only people who follow me can see this.',
  visPrivateDesc: 'Only I can see this.',
  profileVisibilityGuide: 'Set the visibility of your profile page.',
  visPublicProfileDesc: 'Anyone can see my profile.',

  connectedStatus: 'Connected',
  notConnectedStatus: 'Not connected',
  googleCalendarDesc: 'Connect Google Calendar to analyze routine Insights based on your schedule. Calendar data is used for analysis purposes only.',
  connecting: 'Connecting...',
  disconnect: 'Disconnect',
  connect: 'Connect',

  homeScreenGuide: 'Choose the screen to show when you open the app.',
  homeFeedOption: 'Feed',
  homeFeedOptionDesc: 'The feed appears first when you open the app.',
  homeRecordOption: 'Record modal',
  homeRecordOptionDesc: 'The routine record screen opens right away when you open the app.',
}

export const settings = { ko, en }
