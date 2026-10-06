const ko = {
  title: '알림',
  markAllRead: '모두 읽음',
  emptyTitle: '알림 없음',
  emptyDesc: '누군가 나에게 반응하면 여기서 확인할 수 있어요.',
  reactionText: (count: number) => count > 1 ? `님 외 ${count - 1}명이 응원했어요` : '님이 응원했어요',
}

const en: typeof ko = {
  title: 'Notifications',
  markAllRead: 'Mark all read',
  emptyTitle: 'No notifications',
  emptyDesc: 'When someone reacts to you, it will show up here.',
  reactionText: (count: number) => count > 1 ? ` and ${count - 1} others cheered your post` : ' cheered your post',
}

export const notifications = { ko, en }
