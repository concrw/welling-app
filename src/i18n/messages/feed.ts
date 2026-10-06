const ko = {
  logoAlt: 'welling',
  allTab: '전체',
  quietBanner: (n: number) => `${n}일째 기록이 없어요. 오늘 기록해볼까요?`,
  createGroupButton: '+ 그룹',
  pendingApproval: (name: string) => `${name} 가입 승인 대기 중`,
  cheer: '응원',
  loading: '기록을 불러오는 중이에요…',
  errorTitle: '기록을 불러오지 못했어요',
  errorBody: '네트워크 연결을 확인하고 다시 시도해주세요.',
  retry: '다시 시도',
  emptyTitle: '아직 오늘 기록이 없어요',
  emptyBody: '첫 기록을 남겨보세요.',
  recordCta: '기록하기',
  inviteCta: '친구 초대하기',
}

const en: typeof ko = {
  logoAlt: 'welling',
  allTab: 'All',
  quietBanner: (n: number) => `No records for ${n} days. How about logging one today?`,
  createGroupButton: '+ Group',
  pendingApproval: (name: string) => `Waiting for approval to join ${name}`,
  cheer: 'Cheer',
  loading: 'Loading records…',
  errorTitle: 'Could not load records',
  errorBody: 'Check your connection and try again.',
  retry: 'Try again',
  emptyTitle: 'No records yet today',
  emptyBody: 'Be the first to share one.',
  recordCta: 'Record now',
  inviteCta: 'Invite friends',
}

export const feed = { ko, en }
