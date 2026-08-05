// 데모/목업 데이터. appStore.ts에서 옮겨온 그대로이며 번역 대상이 아니다.
import type { Post, Community, User, Notification } from '../store/appStore'

const DAY_MS = 86400000

// n일 전 특정 시각의 epoch ms. 데모 데이터에 실제 날짜를 부여하기 위한 헬퍼.
export function daysAgo(n: number, hour = 8, minute = 0): number {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.getTime() - n * DAY_MS
}

export const SAMPLE_POSTS: Post[] = [
  { id: 'p0a', user: 'Min', initials: 'M', color: '#00A389', content: 'Water', community: 'morning-runners', time: '방금', createdAt: daysAgo(0, 7, 40), liked: true, reactions: {} },
  { id: 'p0b', user: 'Min', initials: 'M', color: '#00A389', content: 'Squat 20', community: 'morning-runners', time: '방금', createdAt: daysAgo(0, 7, 45), liked: false, reactions: {} },
  { id: 'p0c', user: 'Min', initials: 'M', color: '#00A389', content: '3333', community: 'morning-runners', time: '방금', createdAt: daysAgo(0, 7, 50), liked: false, reactions: {} },
  { id: 'p0d', user: 'Min', initials: 'M', color: '#00A389', content: '111', community: 'morning-runners', time: '방금', createdAt: daysAgo(0, 7, 55), liked: false, reactions: {} },
  { id: 'p1', user: '정도윤', initials: '정', color: '#1A6B4A', content: '오늘 아침 달리기 5km. 날씨 좋아서 더 잘 됐어요.', community: 'morning-runners', time: '5분', createdAt: daysAgo(0, 6, 5), liked: false, reactions: { Cheer: 8, Inspired: 12, Nice: 5 }, comments: [{ user: '한다솜', text: '저도 오늘 뛰었어요! 같이 해요.' }, { user: '김민준', text: '5km 대단해요.' }] },
  { id: 'p2', user: '한다솜', initials: '한', color: '#C2600A', content: '기상 직후 스트레칭 10분 + 조깅 3km 완료.', community: 'morning-runners', time: '22분', createdAt: daysAgo(0, 6, 30), liked: false, reactions: { Cheer: 4, Inspired: 6, Nice: 3 } },
  { id: 'p3', user: '김민준', initials: '김', color: '#555555', content: '새벽 6시 달리기. 어제보다 0.5km 늘었어요.', community: 'morning-runners', time: '1시간', createdAt: daysAgo(0, 6, 0), liked: false, reactions: {} },
  { id: 'p4', user: '이서연', initials: '이', color: '#C2600A', content: '그릭 요거트 + 블루베리 + 견과류 아침 식사. 칼로리 계산하면서 먹는 것도 이제 습관이 됐어요.', community: 'clean-eaters', time: '8분', createdAt: daysAgo(0, 8, 10), liked: false, reactions: { Cheer: 3, Inspired: 11, Nice: 7 }, comments: [{ user: '김민준', text: '저도 들어가도 될까요?' }] },
  { id: 'p5', user: '최수아', initials: '최', color: '#C2600A', content: '점심 현미밥 + 두부구이 + 나물 3종. 탄단지 비율 맞추는 중.', community: 'clean-eaters', time: '1시간', createdAt: daysAgo(0, 12, 20), liked: false, reactions: { Cheer: 6, Inspired: 9, Nice: 4 } },
  { id: 'p5b', user: '한다솜', initials: '한', color: '#C2600A', content: '하루 물 2L 챌린지 14일째. 매일 알람 맞춰놓고 마시고 있어요.', community: 'clean-eaters', time: '3시간', createdAt: daysAgo(0, 9, 0), liked: false, reactions: {} },
  { id: 'p6', user: '박지호', initials: '박', color: '#1A6B4A', content: '독서 30분 완료. "아주 작은 습관의 힘" 읽는 중. 공감되는 내용 너무 많아요.', community: 'book-club', time: '23분', createdAt: daysAgo(0, 21, 0), liked: false, reactions: {} },
  { id: 'p7', user: '김민준', initials: '김', color: '#555555', content: '스쿼트 50개 완료. 오늘도 좋은 시작이에요.', community: 'morning-runners', time: '방금', createdAt: daysAgo(0, 6, 15), liked: false, reactions: { Cheer: 12, Inspired: 5, Nice: 8 }, comments: [{ user: '이서연', text: '매일 하시는 거예요? 대단해요.' }, { user: '박지호', text: '저도 자극받았어요.' }] },
  { id: 'p8', user: '정도윤', initials: '정', color: '#1A6B4A', content: '아침: 물 한 잔 + 스트레칭 / 점심: 계단 오르기 성공.', community: 'morning-runners', time: '5분', createdAt: daysAgo(0, 12, 30), liked: false, reactions: {} },
  { id: 'p9', user: '오재원', initials: '오', color: '#6B6B6B', content: '명상 10분 완료. 아침을 이렇게 시작하니 하루가 달라요.', community: 'morning-runners', time: '44분', createdAt: daysAgo(0, 7, 0), liked: false, reactions: {} },
  { id: 'p10', user: '강지우', initials: '강', color: '#1A6B4A', content: '기상 직후 찬물 세수. 별거 아닌 것 같지만 확실히 깨요.', community: 'morning-runners', time: '1시간', createdAt: daysAgo(0, 6, 45), liked: false, reactions: {} },
  { id: 'p11', user: '이서연', initials: '이', color: '#C2600A', content: '아침 공복 물 한 잔 + 레몬즙. 3개월째 지속 중.', community: 'clean-eaters', time: '2시간', createdAt: daysAgo(0, 7, 30), liked: false, reactions: { Cheer: 7, Inspired: 3 } },
  { id: 'p12', user: '김민준', initials: '김', color: '#555555', content: '웨이트 풀 데이 완료. 데드리프트 120kg 성공.', community: 'strength-lab', time: '2시간', createdAt: daysAgo(0, 18, 0), liked: false, reactions: { Cheer: 14, Inspired: 9, Nice: 6 } },
  { id: 'p13', user: '박지호', initials: '박', color: '#1A6B4A', content: '명상 15분 + 감사 일기 작성. 루틴에 저널링 추가해봤어요.', community: 'mind-first', time: '3시간', createdAt: daysAgo(0, 22, 0), liked: false, reactions: { Inspired: 8, Nice: 4 } },
  { id: 'p14', user: '최수아', initials: '최', color: '#C2600A', content: '스쿼트 100개 챌린지 7일째. 허벅지가 비명을 질러요.', community: 'strength-lab', time: '4시간', createdAt: daysAgo(0, 19, 0), liked: false, reactions: { Cheer: 11, Inspired: 5 } },
  { id: 'p15', user: '한다솜', initials: '한', color: '#C2600A', content: '"아주 작은 습관의 힘" 완독. 오늘부터 2% 개선 실천.', community: 'book-club', time: '5시간', createdAt: daysAgo(0, 20, 0), liked: false, reactions: { Inspired: 16, Nice: 7 } },
]

// 랭킹/대시보드 달성률 계산이 실제 여러 날에 걸친 기록을 근거로 할 수 있도록,
// 유저별 목표 루틴 항목이 지난 14일 중 어느 날 지켜졌는지를 과거 기록으로 채워넣는다.
// (오늘자 기록은 위 SAMPLE_POSTS에 이미 있으므로 여기서는 1~13일 전만 다룸)
interface HistoricalEntry { content: string; community: string; initials: string; color: string; days: number[] }
interface HistoricalUser { user: string; entries: HistoricalEntry[] }

const HISTORICAL_RECORDS: HistoricalUser[] = [
  { user: '김민준', entries: [
    { content: '새벽 달리기 5km 완료.', community: 'morning-runners', initials: '김', color: '#555555', days: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13] },
    { content: '스쿼트 50개 완료.', community: 'morning-runners', initials: '김', color: '#555555', days: [2, 4, 6, 8, 10, 12] },
    { content: '데드리프트 세트 완료.', community: 'strength-lab', initials: '김', color: '#555555', days: [4, 8, 12] },
  ] },
  { user: '이서연', entries: [
    { content: '아침 물 한 잔 + 레몬즙.', community: 'clean-eaters', initials: '이', color: '#C2600A', days: [1, 2, 4, 5, 7, 8, 9, 11, 12] },
    { content: '그릭 요거트 아침 식사.', community: 'clean-eaters', initials: '이', color: '#C2600A', days: [2, 3, 6, 7, 10, 13] },
  ] },
  { user: '박지호', entries: [
    { content: '독서 30분 완료.', community: 'book-club', initials: '박', color: '#1A6B4A', days: [1, 3, 4, 6, 7, 9, 10, 12] },
    { content: '명상 15분 완료.', community: 'mind-first', initials: '박', color: '#1A6B4A', days: [2, 5, 8, 11] },
  ] },
  { user: '최수아', entries: [
    { content: '현미밥 클린 식단.', community: 'clean-eaters', initials: '최', color: '#C2600A', days: [1, 3, 5, 7, 9, 11, 13] },
    { content: '스쿼트 100개 챌린지.', community: 'strength-lab', initials: '최', color: '#C2600A', days: [1, 2, 3, 4, 5, 6] },
  ] },
  { user: '한다솜', entries: [
    { content: '기상 직후 스트레칭 완료.', community: 'morning-runners', initials: '한', color: '#C2600A', days: [1, 3, 5, 7, 9] },
    { content: '조깅 3km 완료.', community: 'morning-runners', initials: '한', color: '#C2600A', days: [2, 4, 6, 8] },
    { content: '하루 물 2L 챌린지.', community: 'clean-eaters', initials: '한', color: '#C2600A', days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  ] },
  { user: '정도윤', entries: [
    { content: '아침 달리기 완료.', community: 'morning-runners', initials: '정', color: '#1A6B4A', days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { content: '아침 물 한 잔 + 스트레칭.', community: 'morning-runners', initials: '정', color: '#1A6B4A', days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
    { content: '계단 오르기 성공.', community: 'morning-runners', initials: '정', color: '#1A6B4A', days: [1, 2, 4, 5, 7, 8, 10, 11, 13] },
  ] },
  { user: '오재원', entries: [
    { content: '명상 10분 완료.', community: 'morning-runners', initials: '오', color: '#6B6B6B', days: [2, 5, 9] },
  ] },
  { user: '강지우', entries: [
    { content: '기상 직후 찬물 세수.', community: 'morning-runners', initials: '강', color: '#1A6B4A', days: [3, 8] },
  ] },
]

export function generateHistoricalPosts(): Post[] {
  const posts: Post[] = []
  for (const hu of HISTORICAL_RECORDS) {
    hu.entries.forEach((entry, ei) => {
      entry.days.forEach((d) => {
        posts.push({
          id: `hist-${hu.user}-${ei}-${d}`,
          user: hu.user,
          initials: entry.initials,
          color: entry.color,
          content: entry.content,
          community: entry.community,
          time: `${d}일 전`,
          createdAt: daysAgo(d, 7, 30),
          liked: false,
          reactions: {},
        })
      })
    })
  }
  return posts
}

export const SAMPLE_COMMUNITIES: Community[] = [
  { id: 'morning-runners', name: 'Morning Runners', initial: 'R', color: '#0984E3', members: 1243, focus: 'exercise & movement records', desc: '운동과 러닝 루틴만 공유하는 새벽 커뮤니티.', joined: true },
  { id: 'clean-eaters', name: 'Clean Eaters', initial: 'C', color: '#00A389', members: 892, focus: 'nutrition & meal records', desc: '식단 기록과 건강한 음식 루틴 공유.', joined: true },
  { id: 'book-club', name: 'Book Club 30m', initial: 'B', color: '#7C3AED', members: 567, focus: 'reading records', desc: '하루 30분 독서 습관을 함께 만드는 클럽.', joined: false },
  { id: 'office-workout', name: 'Office Workout', initial: 'W', color: '#B45309', members: 388, focus: 'exercise records', desc: '사무실 틈새 운동 루틴 공유.', joined: false },
]

export const SAMPLE_USERS: User[] = [
  { id: 'u1', name: '김민준', handle: 'minjun.k', initials: '김', color: '#0984E3', bio: '새벽 러닝 + 루틴 설계 중', followers: 234, following: 89, followed: false, synced: false, routines: [{ group: 'Morning', items: '6am 기상 · 러닝 5km · 스트레칭' }], routineGoals: [
    { id: 'g-u1-1', name: 'Morning', items: [{ id: 'i-u1-1', name: '달리기 5km', time: '06:00', desc: '' }, { id: 'i-u1-2', name: '스쿼트 50개', time: '06:30', desc: '' }] },
    { id: 'g-u1-2', name: 'Strength', items: [{ id: 'i-u1-3', name: '데드리프트', time: '18:00', desc: '' }] },
  ] },
  { id: 'u2', name: '이서연', handle: 'seoyeon.i', initials: '이', color: '#00A389', bio: '식단 관리 + 아침 루틴 3개월째', followers: 156, following: 67, followed: false, synced: false, routines: [{ group: 'Morning', items: '아침 식사 · 물 2L · 영양제' }], routineGoals: [
    { id: 'g-u2-1', name: 'Morning', items: [{ id: 'i-u2-1', name: '물 한 잔', time: '07:00', desc: '' }, { id: 'i-u2-2', name: '그릭 요거트', time: '07:30', desc: '' }] },
  ] },
  { id: 'u3', name: '박지호', handle: 'jiho.p', initials: '박', color: '#0984E3', bio: '한강 러닝 매일 | Morning Runners', followers: 89, following: 234, followed: true, synced: false, routines: [{ group: 'Morning', items: '5am 기상 · 한강 러닝 7km' }], routineGoals: [
    { id: 'g-u3-1', name: 'Evening', items: [{ id: 'i-u3-1', name: '독서 30분', time: '21:00', desc: '' }, { id: 'i-u3-2', name: '명상 15분', time: '21:30', desc: '' }] },
  ] },
  { id: 'u4', name: '최수아', handle: 'sua.c', initials: '최', color: '#00A389', bio: '클린 이팅 + 주 5회 운동', followers: 412, following: 123, followed: false, synced: false, routines: [{ group: 'Meals', items: '샐러드 · 단백질 쉐이크 · 현미밥' }], routineGoals: [
    { id: 'g-u4-1', name: 'Meals', items: [{ id: 'i-u4-1', name: '현미밥 식단', time: '12:00', desc: '' }] },
    { id: 'g-u4-2', name: 'Strength', items: [{ id: 'i-u4-2', name: '스쿼트 100개', time: '19:00', desc: '' }] },
  ] },
  { id: 'u5', name: '한다솜', handle: '한다솜', initials: '한', color: '#C2600A', bio: '저녁 요가 · 마인드풀 이팅', followers: 203, following: 77, followed: false, synced: false, routines: [{ group: 'Evening', items: '요가 45분 · 감사 일기' }], routineGoals: [
    { id: 'g-u5-1', name: 'Morning', items: [{ id: 'i-u5-1', name: '스트레칭', time: '06:00', desc: '' }, { id: 'i-u5-2', name: '조깅 3km', time: '06:20', desc: '' }] },
    { id: 'g-u5-2', name: 'Daily', items: [{ id: 'i-u5-3', name: '물 2L', time: '', desc: '' }] },
  ] },
  { id: 'u6', name: '정도윤', handle: 'doyun.j', initials: '정', color: '#1A6B4A', bio: '아침 러닝 5km · 루틴 지킴이', followers: 178, following: 54, followed: false, synced: false, routines: [{ group: 'Morning', items: '5am 기상 · 달리기 5km · 물 한 잔' }], routineGoals: [
    { id: 'g-u6-1', name: 'Morning', items: [{ id: 'i-u6-1', name: '아침 달리기', time: '05:00', desc: '' }, { id: 'i-u6-2', name: '물 한 잔', time: '05:30', desc: '' }] },
    { id: 'g-u6-2', name: 'Lunch', items: [{ id: 'i-u6-3', name: '계단 오르기', time: '12:30', desc: '' }] },
  ] },
  { id: 'u7', name: '오재원', handle: 'jaewon.o', initials: '오', color: '#6B6B6B', bio: '명상 + 마음 챙김 루틴', followers: 92, following: 41, followed: false, synced: false, routines: [{ group: 'Morning', items: '명상 10분 · 감사 일기 · 스트레칭' }], routineGoals: [
    { id: 'g-u7-1', name: 'Morning', items: [{ id: 'i-u7-1', name: '명상 10분', time: '07:00', desc: '' }] },
  ] },
  { id: 'u8', name: '강지우', handle: 'jiwoo.k', initials: '강', color: '#1A6B4A', bio: '기상 루틴 챌린지 중', followers: 64, following: 88, followed: false, synced: false, routines: [{ group: 'Morning', items: '찬물 세수 · 스트레칭 · 아침 산책' }], routineGoals: [
    { id: 'g-u8-1', name: 'Morning', items: [{ id: 'i-u8-1', name: '찬물 세수', time: '06:45', desc: '' }] },
  ] },
]

export const SAMPLE_NOTIFS: Notification[] = [
  { id: 'n1', user: '박지호', type: 'follow', text: '회원님을 팔로우하기 시작했어요.', read: false, time: '5분' },
  { id: 'n2', user: '이서연', type: 'like', text: '회원님의 게시물에 반응했어요.', read: false, time: '12분' },
  { id: 'n3', user: 'Morning Runners', type: 'comment', text: '커뮤니티에 새 게시물이 10개 있어요.', read: false, time: '1시간' },
  { id: 'n4', user: '김민준', type: 'follow', text: '회원님을 팔로우하기 시작했어요.', read: false, time: '2시간' },
  { id: 'n5', user: '최수아', type: 'like', text: '달리기 기록 게시물에 반응했어요.', read: true, time: '3시간' },
  { id: 'n6', user: 'Clean Eaters', type: 'comment', text: '커뮤니티에 새 게시물이 5개 있어요.', read: true, time: '4시간' },
  { id: 'n7', user: '오재원', type: 'follow', text: '회원님을 팔로우하기 시작했어요.', read: true, time: '어제' },
  { id: 'n8', user: '한다솜', type: 'comment', text: '루틴 게시물에 댓글을 남겼어요: "저도 같이 해요!"', read: true, time: '어제' },
  { id: 'n9', user: 'Book Club 30m', type: 'comment', text: '커뮤니티에 가입 승인되었어요.', read: true, time: '2일' },
]
