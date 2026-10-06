const ko = {
  title: '알림',
  markAllRead: '모두 읽음',
  emptyTitle: '알림 없음',
  emptyDesc: '누군가 나에게 반응하면 여기서 확인할 수 있어요.',
  reactionText: (count: number) => count > 1 ? `님 외 ${count - 1}명이 응원했어요` : '님이 응원했어요',
  likeText: (count: number) => count > 1 ? `님 외 ${count - 1}명이 👏 응원했어요` : '님이 👏 응원했어요',
  followText: '님을 팔로우하기 시작했어요.',
  commentText: '님이 댓글을 남겼어요.',
  newPostsText: (count: number) => `커뮤니티에 새 게시물이 ${count}개 있어요.`,
  joinApprovedText: '커뮤니티에 가입 승인되었어요.',
  copyText: '님이 루틴을 복사했어요.',
  reportText: '신고 처리 결과가 도착했어요.',
  groupJoinText: '그룹 가입 요청이 처리됐어요.',
}

const en: typeof ko = {
  title: 'Notifications',
  markAllRead: 'Mark all read',
  emptyTitle: 'No notifications',
  emptyDesc: 'When someone reacts to you, it will show up here.',
  reactionText: (count: number) => count > 1 ? ` and ${count - 1} others cheered your post` : ' cheered your post',
  likeText: (count: number) => count > 1 ? ` and ${count - 1} others cheered 👏 your post` : ' cheered 👏 your post',
  followText: ' started following you.',
  commentText: ' commented on your post.',
  newPostsText: (count: number) => `There are ${count} new posts in the community.`,
  joinApprovedText: 'Your group join request was approved.',
  copyText: ' copied your routine.',
  reportText: 'Your report has been reviewed.',
  groupJoinText: 'Your group join request was updated.',
}

export const notifications = { ko, en }
