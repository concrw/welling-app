const ko = {
  title: '새 그룹 만들기', titleCreated: '그룹 생성 완료!', promptName: '그룹 이름을 정해주세요', promptDesc: '함께할 사람들과 공유할 이름이에요',
  namePlaceholder: '우리 셋 식단운동', nameExample: '예: 우리 셋 식단운동, 헬스 메이트, 다이어트 챌린지', btnCreate: '그룹 만들기', btnCreating: '생성 중...',
  privacyNote: '그룹은 비공개로 생성됩니다', privacyDetail: '초대받은 사람만 참여할 수 있어요', shareTitle: '그룹이 생성되었습니다!', shareSubtitle: '친구들을 초대해보세요',
  shareLinkLabel: '초대 링크', shareCopied: '✓ 복사 완료', shareCopy: '📋 복사', shareButton: '🔗 링크 보내기', shareTip: '💡 KakaoTalk이나 문자로 링크를 공유하면', shareTipDetail: '친구가 클릭만으로 그룹에 가입할 수 있어요', done: '완료',
  shareTextTemplate: (groupName: string) => `${groupName} 그룹에 초대합니다!\n\n함께 건강한 습관을 만들어요 💪\n\n`, shareTitleTemplate: (groupName: string) => `${groupName} 그룹 초대`,
}
const en: typeof ko = {
  title: 'Create a group', titleCreated: 'Group created!', promptName: 'Name your group', promptDesc: 'Choose a name your friends will recognize',
  namePlaceholder: 'Our healthy trio', nameExample: 'For example: Gym friends or Healthy challenge', btnCreate: 'Create group', btnCreating: 'Creating...',
  privacyNote: 'Groups are private by default', privacyDetail: 'Only people with an invitation can join', shareTitle: 'Your group is ready!', shareSubtitle: 'Invite your friends to join',
  shareLinkLabel: 'Invitation link', shareCopied: '✓ Copied', shareCopy: '📋 Copy', shareButton: '🔗 Share link', shareTip: '💡 Share the link in a message', shareTipDetail: 'and friends can join with one tap', done: 'Done',
  shareTextTemplate: (groupName: string) => `Join my ${groupName} group!\n\nLet's build healthy habits together 💪\n\n`, shareTitleTemplate: (groupName: string) => `${groupName} group invitation`,
}
export const newCommunity = { ko, en }
