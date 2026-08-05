// 화면에 고정으로 들어가는 목업 콘텐츠(가짜 대화/게시물/루틴). UI 문구가 아니므로
// i18n 카탈로그가 아닌 데이터 파일로 관리한다.

// TODO: store(routineGroups)에서 오늘 루틴 아이템을 파생하도록 교체 필요 — 현재 목업 고정값
export const MOCK_ROUTINE_ITEMS = [
  { time: '06:30', name: 'Wake Up', desc: '매일 아침 6:30에 기상. 주말도 동일하게 유지해요.', bg: '#E0F2FE', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=120&h=120&fit=crop', isPublic: true },
  { time: '06:15', name: 'Morning Stretch', desc: '전신 스트레칭 10분. 어깨, 허리 중점.', bg: '#F0FDF4', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=120&h=120&fit=crop', isPublic: true },
  { time: '07:00', name: 'Meditation', desc: '명상 앱 사용, 호흡 집중 5분.', bg: '#FDF4FF', img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=120&h=120&fit=crop', isPublic: false },
  { time: '12:30', name: 'Lunch Walk', desc: '점심 식사 후 산책 20분.', bg: '#FFFBEB', img: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=120&h=120&fit=crop', isPublic: true },
  { time: '21:00', name: 'Reading', desc: '취침 전 독서 30분. 스크린 없는 시간.', bg: '#FFF1F2', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&h=120&fit=crop', isPublic: false },
]

export const MOCK_CHAT_MESSAGES = [
  { id: 'm1', me: false, text: '오늘 루틴 어떻게 됐어?', time: '10:28', justify: 'flex-start', radius: '14px 14px 14px 4px', bg: '#F0F0F0', textColor: '#111111' },
  { id: 'm2', me: true, text: '4/5 완료했어! Running만 못했네', time: '10:30', justify: 'flex-end', radius: '14px 14px 4px 14px', bg: '#111111', textColor: '#fff' },
  { id: 'm3', me: false, text: '나도 비슷해. 내일은 같이 뛰자!', time: '10:31', justify: 'flex-start', radius: '14px 14px 14px 4px', bg: '#F0F0F0', textColor: '#111111' },
  { id: 'm4', me: true, text: '좋아! 몇 시에?', time: '10:31', justify: 'flex-end', radius: '14px 14px 4px 14px', bg: '#111111', textColor: '#fff' },
  { id: 'm5', me: false, text: '오전 7시 어때? 한강에서 만나자', time: '10:32', justify: 'flex-start', radius: '14px 14px 14px 4px', bg: '#F0F0F0', textColor: '#111111' },
]

export const MOCK_THREADS = [
  { id: 't1', name: 'Jay', last: '오늘 루틴 어떻게 됐어?', time: '10:32', unread: true },
  { id: 't2', name: 'Sora', last: 'Running 같이 해요!', time: '어제', unread: false },
  { id: 't3', name: 'Tom', last: '잘 자요 :)', time: '월', unread: false },
  { id: 't4', name: 'Mina', last: 'Morning Sync 참가해요?', time: '일', unread: true },
]

export const MOCK_ONBOARDING_POSTS = [
  { id: 'op1', user: 'Sora', initials: 'SR', color: '#6366F1', time: '2m', category: 'MORNING', content: '오늘도 새벽 5시 기상 완료. 스트레칭 10분 후 명상 5분.', reactions: [{ key: 'Good', count: 4 }, { key: 'Strong', count: 2 }] },
  { id: 'op2', user: 'Kevin', initials: 'KV', color: '#0EA5E9', time: '8m', category: 'GYM', content: 'Gym session done. Pull day — 4 sets lat pulldown, 3 sets rows.', reactions: [{ key: 'Good', count: 7 }] },
  { id: 'op3', user: 'Mina', initials: 'MN', color: '#F59E0B', time: '14m', category: 'WALKING', content: '점심 산책 20분. 계단으로만 이동 성공.', reactions: [{ key: 'Good', count: 11 }, { key: 'Cute', count: 3 }] },
  { id: 'op4', user: 'Jay', initials: 'JY', color: '#10B981', time: '22m', category: 'COLD', content: 'Cold shower at 6am. Day 32 streak.', reactions: [{ key: 'Strong', count: 9 }, { key: 'Wow', count: 4 }] },
]
