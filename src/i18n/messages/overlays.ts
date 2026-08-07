const ko = {
  // HomePrompt
  homePromptTitle: '기록 화면을 홈 화면으로 설정할까요?',
  homePromptBody: '앱을 실행하면 입력 화면이 바로 열려요.',
  homePromptYes: '네, 설정할게요',
  homePromptNotNow: '나중에요',

  // PostDetailSheet
  reactionLabels: {
    cheer: '힘내요',
    inspired: '자극받았어요',
    nice: '멋져요',
  },
  follow: '팔로우',
  following: '팔로잉',
  report: '신고',
  reportConfirm: '이 게시물을 신고하시겠어요?',
  reportReceived: '신고가 접수됐습니다.',
  reportReasonInappropriate: '부적절한 게시물',
  attachedImageAlt: '첨부 이미지',
  commentPlaceholder: '댓글을 입력하세요…',

  // RecordModal
  categoryLabels: {
    habit: '습관',
    diet: '식단',
    reflection: '저녁 단상',
    routine: '루틴 공유',
  },
  visibilityLabels: {
    public: '전체공개',
    followers: '친구만',
    private: '비공개',
  },
  recordDone: '기록 완료',
  imageUploading: '이미지 올리는 중…',
  imageUploadFailed: '이미지 업로드에 실패했어요. 다시 시도해주세요.',
  recordDoneWithLabel: (label: string) => `${label} 기록 완료`,
  guidelineWarning: '이 글은 습관/식단과 관련이 없어 보여요. 계속 올리시겠어요?',
  continuePosting: '계속 올리기',
  quickRecordHint: '탭 한 번으로 즉시 기록',
  minutes: (min: number) => `${min}분`,
  pickTimerDuration: (label: string) => `${label} — 시간을 선택하세요`,
  addButton: '버튼 추가',
  add: '추가',
  buttonNamePlaceholder: '버튼 이름 입력',
  recordType: '기록 유형',
  visibilityScope: '공개 범위',
  noCommunitySelected: '커뮤니티 선택 안 함',
  instaLinkPlaceholder: '인스타그램 링크 (선택)',
  recordPlaceholder: '오늘 한 것을 자유롭게 입력하세요.',
  record: '기록하기',

  // SyncAlarm
  routineSuffix: '의 루틴',
  routineNotifTitle: 'WELLING · 루틴 알림',
  now: '지금',
  markDone: '실행완료',
  tapToUnlock: '탭하여 잠금 해제',

  // SyncConfirmSheet
  routineSync: '루틴싱크',
  syncDesc: (name: string) => `${name}님의 루틴 시간에 알림을 받아요`,
  startSync: '싱크 시작하기',

  // WelcomeAnimation
  welcomeTitle: (name: string) => `안녕하세요, ${name}님!`,
  welcomeSubtitle: '루틴을 함께 시작해요.',
}

const en: typeof ko = {
  // HomePrompt
  homePromptTitle: 'Set recording as your home screen?',
  homePromptBody: 'The input screen opens immediately when you launch the app.',
  homePromptYes: 'Yes, set it',
  homePromptNotNow: 'Not now',

  // PostDetailSheet
  reactionLabels: {
    cheer: 'Cheer',
    inspired: 'Inspired',
    nice: 'Nice',
  },
  follow: 'Follow',
  following: 'Following',
  report: 'Report',
  reportConfirm: 'Report this post?',
  reportReceived: 'Your report has been received.',
  reportReasonInappropriate: 'Inappropriate post',
  attachedImageAlt: 'Attached image',
  commentPlaceholder: 'Add a comment…',

  // RecordModal
  categoryLabels: {
    habit: 'Habit',
    diet: 'Diet',
    reflection: 'Evening Notes',
    routine: 'Routine Share',
  },
  visibilityLabels: {
    public: 'Public',
    followers: 'Friends Only',
    private: 'Private',
  },
  recordDone: 'Recorded',
  imageUploading: 'Uploading image…',
  imageUploadFailed: 'Image upload failed. Please try again.',
  recordDoneWithLabel: (label: string) => `${label} recorded`,
  guidelineWarning: 'This post does not seem related to habits or diet. Post anyway?',
  continuePosting: 'Post Anyway',
  quickRecordHint: 'Record instantly with one tap',
  minutes: (min: number) => `${min}m`,
  pickTimerDuration: (label: string) => `${label} — choose a duration`,
  addButton: 'Add button',
  add: 'Add',
  buttonNamePlaceholder: 'Enter button name',
  recordType: 'Record type',
  visibilityScope: 'Visibility',
  noCommunitySelected: 'No community',
  instaLinkPlaceholder: 'Instagram link (optional)',
  recordPlaceholder: 'What did you do today?',
  record: 'Record',

  // SyncAlarm
  routineSuffix: "'s routine",
  routineNotifTitle: 'WELLING · Routine Alert',
  now: 'now',
  markDone: 'Done',
  tapToUnlock: 'Tap to unlock',

  // SyncConfirmSheet
  routineSync: 'Routine Sync',
  syncDesc: (name: string) => `Get alerts at ${name}'s routine times`,
  startSync: 'Start Sync',

  // WelcomeAnimation
  welcomeTitle: (name: string) => `Hello, ${name}!`,
  welcomeSubtitle: "Let's start your routine together.",
}

export const overlays = { ko, en }
