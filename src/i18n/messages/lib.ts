const ko = {
  // googleCalendar.ts
  popupBlocked: '팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.',
  loginWindowClosed: '로그인 창이 닫혔습니다.',
  tokenNotReceived: '토큰을 받지 못했습니다.',
  eventCreateFailed: '이벤트 생성 실패',
  eventFetchFailed: '일정 조회 실패',

  // date.ts - time of day labels
  timeOfDay: {
    morning: '아침',
    lunch: '점심',
    afternoon: '오후',
    dinner: '저녁',
    snack: '간식',
  },
  activityLabels: {
    exercise: '운동했어',
    snackMeal: '간식 먹었어',
    mealWithTime: (time: string) => `${time} 먹었어`,
  },

  // rpc.ts - RPC error messages
  rpcErrors: {
    not_authorized: '권한이 없습니다',
    not_found: '찾을 수 없습니다',
    already_processed: '이미 처리된 요청입니다',
    banned: '차단된 사용자입니다',
    user_not_found: '사용자를 찾을 수 없습니다',
    already_member: '이미 멤버입니다',
    not_member: '멤버를 찾을 수 없습니다',
    invalid_role: '잘못된 역할입니다',
    cannot_change_own_role: '자신의 역할은 변경할 수 없습니다',
    cannot_change_owner: '그룹장 역할은 변경할 수 없습니다',
    cannot_remove_self: '자신을 내보낼 수 없습니다',
    cannot_remove_owner_or_admin: '관리자는 그룹장이나 다른 관리자를 내보낼 수 없습니다',
    not_owner: '그룹장만 가능한 작업입니다',
    invalid_target: '유효하지 않은 대상입니다',
    archived: '보관된 그룹입니다',
    expired: '만료된 초대입니다',
    too_many_groups: '가입 가능한 그룹 수를 초과했습니다',
    not_invited: '초대받지 않았습니다',
    invalid_code: '유효하지 않은 초대 코드입니다',
    operation_failed: (status: string) => `작업 실패 (${status})`,
    generic_failure: '작업 실패',
  },
}

const en: typeof ko = {
  // googleCalendar.ts
  popupBlocked: 'Popup blocked. Please allow popups and try again.',
  loginWindowClosed: 'The login window was closed.',
  tokenNotReceived: 'Failed to receive token.',
  eventCreateFailed: 'Failed to create event',
  eventFetchFailed: 'Failed to fetch events',

  // date.ts
  timeOfDay: {
    morning: 'morning',
    lunch: 'lunch',
    afternoon: 'afternoon',
    dinner: 'dinner',
    snack: 'snack',
  },
  activityLabels: {
    exercise: 'worked out',
    snackMeal: 'had a snack',
    mealWithTime: (time: string) => `had ${time}`,
  },

  // rpc.ts
  rpcErrors: {
    not_authorized: 'Not authorized',
    not_found: 'Not found',
    already_processed: 'Already processed',
    banned: 'User is banned',
    user_not_found: 'User not found',
    already_member: 'Already a member',
    not_member: 'Not a member',
    invalid_role: 'Invalid role',
    cannot_change_own_role: 'Cannot change your own role',
    cannot_change_owner: 'Cannot change owner role',
    cannot_remove_self: 'Cannot remove yourself',
    cannot_remove_owner_or_admin: 'Admins cannot remove owner or other admins',
    not_owner: 'Only owner can perform this action',
    invalid_target: 'Invalid target',
    archived: 'Archived group',
    expired: 'Expired invitation',
    too_many_groups: 'Maximum number of groups reached',
    not_invited: 'Not invited',
    invalid_code: 'Invalid invitation code',
    operation_failed: (status: string) => `Operation failed (${status})`,
    generic_failure: 'Operation failed',
  },
}

export const lib = { ko, en }
