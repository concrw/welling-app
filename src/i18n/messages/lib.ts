const ko = {
  // googleCalendar.ts
  popupBlocked: '팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.',
  loginWindowClosed: '로그인 창이 닫혔습니다.',
  tokenNotReceived: '토큰을 받지 못했습니다.',
  eventCreateFailed: '이벤트 생성 실패',
  eventFetchFailed: '일정 조회 실패',
}

const en: typeof ko = {
  // googleCalendar.ts
  popupBlocked: 'Popup blocked. Please allow popups and try again.',
  loginWindowClosed: 'The login window was closed.',
  tokenNotReceived: 'Failed to receive token.',
  eventCreateFailed: 'Failed to create event',
  eventFetchFailed: 'Failed to fetch events',
}

export const lib = { ko, en }
