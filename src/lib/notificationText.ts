import type { Notification } from '../store/appStore'
import type { Messages } from '../i18n'

// 알림 표시 문구는 저장된 text가 아니라 type/kind 기반으로 i18n에서 계산한다
// (언어 토글에 즉시 반응하고, 서버에 저장된 한국어 원문이 EN 모드에 노출되지 않도록).
export function getNotificationText(n: Notification, M: Messages): string {
  if (n.kind === 'newPosts') return M.notifications.newPostsText(n.count ?? 0)
  if (n.kind === 'joinApproved') return M.notifications.joinApprovedText
  if (n.type === 'reaction') return M.notifications.reactionText(n.count ?? 1)
  if (n.type === 'like') return M.notifications.likeText(n.count ?? 1)
  if (n.type === 'follow') return M.notifications.followText
  if (n.type === 'comment') return M.notifications.commentText
  if (n.type === 'copy') return M.notifications.copyText
  if (n.type === 'report') return M.notifications.reportText
  if (n.type === 'group_join') return M.notifications.groupJoinText
  return n.text
}
