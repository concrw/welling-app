const ko = {
  signupFailed: '가입에 실패했습니다.',
  loginFailed: '로그인에 실패했습니다.',
  resetEmailSent: '재설정 링크를 이메일로 보냈어요. 메일함을 확인해주세요.',
  deletedUser: '탈퇴한 사용자',
  someone: '누군가',
  justNow: '방금',
  
  inviteJoinSuccess: '그룹에 가입되었습니다!',
  inviteAlreadyMember: '이미 가입된 그룹입니다',
  invitePending: '승인 대기 중입니다. 그룹장이 승인하면 가입됩니다.',
  inviteExpired: '만료된 초대 링크입니다',
  inviteArchived: '보관된 그룹입니다',
  inviteBanned: '이 그룹에서 차단되었습니다',
  inviteFull: '그룹 가입 상한(50개)에 도달했습니다',
  inviteInvalid: '유효하지 않은 초대 코드입니다',
  inviteUnknownError: (status: string) => `초대 처리 실패: ${status}`,
  joinFailed: '그룹에 가입하지 못했어요. 다시 시도해주세요.',
  leaveFailed: '그룹에서 나가지 못했어요. 다시 시도해주세요.',
  groupFallback: '그룹',
}

const en: typeof ko = {
  signupFailed: 'Sign-up failed.',
  loginFailed: 'Login failed.',
  resetEmailSent: 'We sent a reset link to your email. Please check your inbox.',
  deletedUser: 'Deleted user',
  someone: 'Someone',
  justNow: 'Just now',
  
  inviteJoinSuccess: 'Joined the group!',
  inviteAlreadyMember: 'Already a member of this group',
  invitePending: 'Approval pending. You will join once the owner approves.',
  inviteExpired: 'Expired invitation link',
  inviteArchived: 'Archived group',
  inviteBanned: 'You have been banned from this group',
  inviteFull: 'Group limit reached (50 groups)',
  inviteInvalid: 'Invalid invitation code',
  inviteUnknownError: (status: string) => `Invitation failed: ${status}`,
  joinFailed: 'Could not join the group. Please try again.',
  leaveFailed: 'Could not leave the group. Please try again.',
  groupFallback: 'Group',
}

export const store = { ko, en }
