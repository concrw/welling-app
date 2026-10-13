const ko = {
  title: '그룹 설정',
    tabInvite: '초대',
    tabMembers: '멤버',
    tabRequests: '요청',
    loading: '로딩 중...',
    
    // Invite section
    inviteLinkLabel: '초대 링크',
    inviteCopied: '✓ 복사 완료',
    inviteCopy: '📋 복사',
    inviteShare: '🔗 공유하기',
    inviteRotate: '🔄 초대 링크 재생성',
    inviteRotating: '재생성 중...',
    inviteRotateWarning: '링크가 유출되었다면 재생성하세요. 기존 링크는 무효화됩니다.',
    inviteShareText: (groupName: string) => `${groupName} 그룹에 초대합니다!\n\n함께 건강한 습관을 만들어요 💪\n\n`,
    inviteShareTitle: (groupName: string) => `${groupName} 그룹 초대`,
    
    // Approval
    approvalTitle: '가입 승인',
    approvalDesc: '새 멤버를 수동으로 승인합니다',
    
    // Members
    memberMe: ' (나)',
    roleOwner: '👑 그룹장',
    roleAdmin: '⭐ 부그룹장',
    roleMember: '멤버',
    actionPromote: '부그룹장',
    actionDemote: '멤버로',
    actionTransfer: '그룹장 위임',
    actionKick: '내보내기',
    leaveGroup: '그룹 나가기',
    leaveGroupOwner: '그룹 나가기 (소유권 자동 이전)',
    
    // Requests
    noRequests: '대기 중인 요청이 없습니다',
    approve: '승인',
    reject: '거절',
    
    // Dialogs
    leaveConfirmOwner: '그룹을 나가면 소유권이 다른 멤버에게 자동으로 이전됩니다. 계속하시겠습니까?',
    leaveConfirm: '그룹을 나가시겠습니까?',
    transferConfirm: (nickname: string) => `${nickname}님에게 그룹장 권한을 이전하시겠습니까? 이 작업은 취소할 수 없습니다.`,
    cancel: '취소',
  leave: '나가기',
  transfer: '위임하기',
}

export const groupSettings = { ko, en: ko }
