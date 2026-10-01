const ko = {
  title: '계정 삭제',
  
  warning: '⚠️ 주의:',
  warningText: '계정 삭제는 되돌릴 수 없습니다. 모든 게시물, 댓글, 루틴 데이터가 영구적으로 삭제됩니다.',
  
  deleteTitle: '삭제될 데이터:',
  dataProfile: '프로필 정보 및 닉네임',
  dataPosts: '모든 게시물 및 댓글',
  dataRoutine: '루틴 및 캘린더 데이터',
  dataNotifs: '알림 설정 및 기록',
  dataCommunities: '소유한 커뮤니티 (소유권이 다른 멤버에게 이전됩니다)',
  
  btnProceed: '계정 삭제 진행',
  confirmPrompt: (nickname: string) => `계정 삭제를 확인하려면 닉네임 ${nickname}을(를) 입력하세요:`,
  cancel: '취소',
  btnDelete: '영구 삭제',
  btnDeleting: '삭제 중...',
  
  errorMismatch: '닉네임이 일치하지 않습니다',
  errorGeneric: '삭제 중 오류가 발생했습니다',
}

export const deleteAccount = { ko, en: ko }
