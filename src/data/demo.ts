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
  { id: 'p0a', user: 'Min', initials: 'M', color: '#00A389', content: '새벽 러닝 4km 완료. 컨디션 좋아요.', community: 'morning-runners', time: '방금', createdAt: daysAgo(0, 7, 40), liked: true, reactions: {} },
  { id: 'p0b', user: 'Min', initials: 'M', color: '#00A389', content: '스쿼트 30개 완료. 오늘도 꾸준히 갑니다.', community: 'morning-runners', time: '방금', createdAt: daysAgo(0, 7, 55), liked: false, reactions: {} },
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
// contents는 같은 습관을 가리키는 7개의 문구 풀이다. 7일 연속 구간은 요일(day % 7)이
// 모두 달라 서로 겹치지 않으므로, 어떤 7일 윈도우에도 완전히 동일한 문구가 두 번 나오지 않는다.
interface HistoricalEntry { contents: string[]; community: string; initials: string; color: string; days: number[] }
interface HistoricalUser { user: string; entries: HistoricalEntry[] }

const HISTORICAL_RECORDS: HistoricalUser[] = [
  { user: '김민준', entries: [
    { contents: [
      '새벽 달리기 5km 완료.',
      '오늘도 새벽 러닝 5km. 페이스 좋았어요.',
      '5km 러닝 끝. 숨은 차지만 개운해요.',
      '아침 공기 마시며 5km 완주.',
      '러닝 5km, 어제보다 1분 빨랐어요.',
      '새벽 조깅 5km. 무릎 상태 괜찮음.',
      '오늘 러닝은 5km, 평소보다 가볍게.',
    ], community: 'morning-runners', initials: '김', color: '#555555', days: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13] },
    { contents: [
      '스쿼트 50개 완료.',
      '오늘도 스쿼트 50개. 허벅지 타요.',
      '스쿼트 50개 끝. 자세 신경 썼어요.',
      '근력 루틴 - 스쿼트 50개 완주.',
      '스쿼트 50개, 숫자 세는 게 습관됐어요.',
      '하루 스쿼트 50개 클리어.',
      '오늘 스쿼트는 50개로 마무리.',
    ], community: 'morning-runners', initials: '김', color: '#555555', days: [2, 4, 6, 8, 10, 12] },
    { contents: [
      '데드리프트 세트 완료.',
      '데드리프트 5세트 끝. 폼 체크 완료.',
      '오늘 데드리프트, 무게 살짝 올렸어요.',
      '데드리프트 루틴 마무리. 그립감 좋았어요.',
      '데드리프트 날. 코어 단단히 잡고 진행.',
      '데드리프트 세트 끝. 다리 후들거려요.',
      '오늘은 데드리프트 중심 운동.',
    ], community: 'strength-lab', initials: '김', color: '#555555', days: [4, 8, 12] },
  ] },
  { user: '이서연', entries: [
    { contents: [
      '아침 물 한 잔 + 레몬즙.',
      '기상 후 레몬수 한 잔으로 시작.',
      '아침 공복에 레몬즙 물. 습관 3개월째.',
      '물에 레몬 두 조각 넣어 마셨어요.',
      '아침 루틴 - 레몬수로 몸 깨우기.',
      '레몬즙 물 한 잔, 오늘도 빠짐없이.',
      '공복 레몬수 완료. 속이 편해요.',
    ], community: 'clean-eaters', initials: '이', color: '#C2600A', days: [1, 2, 4, 5, 7, 8, 9, 11, 12] },
    { contents: [
      '그릭 요거트 아침 식사.',
      '그릭 요거트 + 견과류로 아침 해결.',
      '아침은 그릭 요거트에 블루베리 추가.',
      '그릭 요거트, 꿀 살짝 뿌려서 먹었어요.',
      '단백질 챙기려 그릭 요거트 아침.',
      '그릭 요거트 + 그래놀라 아침 식사.',
      '아침 식사로 그릭 요거트 한 그릇.',
    ], community: 'clean-eaters', initials: '이', color: '#C2600A', days: [2, 3, 6, 7, 10, 13] },
  ] },
  { user: '박지호', entries: [
    { contents: [
      '독서 30분 완료.',
      '오늘도 독서 30분. 챕터 하나 끝냄.',
      '잠들기 전 독서 30분.',
      '독서 30분, 집중 잘 됐어요.',
      '책 읽기 30분 루틴 지속 중.',
      '독서 30분 끝. 다음 장이 궁금해요.',
      '퇴근 후 독서 30분으로 하루 마무리.',
    ], community: 'book-club', initials: '박', color: '#1A6B4A', days: [1, 3, 4, 6, 7, 9, 10, 12] },
    { contents: [
      '명상 15분 완료.',
      '명상 15분 + 감사 일기 작성.',
      '오늘 명상은 15분, 호흡에 집중.',
      '명상 15분. 머리가 한결 가벼워요.',
      '저녁 명상 15분 루틴 완료.',
      '명상 15분 끝. 오늘 하루 정리.',
      '명상 15분, 조용한 음악과 함께.',
    ], community: 'mind-first', initials: '박', color: '#1A6B4A', days: [2, 5, 8, 11] },
  ] },
  { user: '최수아', entries: [
    { contents: [
      '현미밥 클린 식단.',
      '현미밥 + 나물 반찬으로 클린 식단.',
      '오늘 점심도 현미밥 클린하게.',
      '현미밥 + 두부 반찬, 클린 식단 유지.',
      '클린 식단 - 현미밥과 채소 위주.',
      '현미밥 식단 지속 중. 속이 편해요.',
      '현미밥 + 삶은 계란으로 클린 식단.',
    ], community: 'clean-eaters', initials: '최', color: '#C2600A', days: [1, 3, 5, 7, 9, 11, 13] },
    { contents: [
      '스쿼트 100개 챌린지.',
      '스쿼트 100개 챌린지 이어가는 중.',
      '오늘도 스쿼트 100개 완료.',
      '스쿼트 100개, 세트 나눠서 클리어.',
      '스쿼트 100개 챌린지 - 허벅지 터질 것 같아요.',
      '100개 스쿼트 끝. 꾸준히 하는 게 목표.',
      '스쿼트 100개 챌린지 오늘 분량 완료.',
    ], community: 'strength-lab', initials: '최', color: '#C2600A', days: [1, 2, 3, 4, 5, 6] },
  ] },
  { user: '한다솜', entries: [
    { contents: [
      '기상 직후 스트레칭 완료.',
      '일어나서 바로 스트레칭 10분.',
      '기상 스트레칭 루틴, 몸이 가벼워졌어요.',
      '아침 스트레칭 끝. 하루 시작이 편해요.',
      '기상 직후 전신 스트레칭 완료.',
      '스트레칭으로 아침 몸풀기 끝.',
      '기상 후 스트레칭, 오늘도 빠짐없이.',
    ], community: 'morning-runners', initials: '한', color: '#C2600A', days: [1, 3, 5, 7, 9] },
    { contents: [
      '조깅 3km 완료.',
      '가볍게 조깅 3km. 컨디션 체크.',
      '조깅 3km 끝. 숨 고르기 좋았어요.',
      '아침 조깅 3km로 하루 시작.',
      '조깅 3km, 페이스 유지하며 완주.',
      '오늘 조깅은 3km로 마무리.',
      '3km 조깅 완료. 날씨가 좋았어요.',
    ], community: 'morning-runners', initials: '한', color: '#C2600A', days: [2, 4, 6, 8] },
    { contents: [
      '하루 물 2L 챌린지.',
      '물 2L 챌린지 14일째 이어가는 중.',
      '오늘도 물 2L 다 마셨어요.',
      '물 2L 챌린지, 알람 맞춰두고 체크.',
      '하루 물 섭취량 2L 달성.',
      '물 2L 챌린지 - 틈틈이 마시는 습관.',
      '오늘 물 2L 완료. 피부가 좋아진 느낌.',
    ], community: 'clean-eaters', initials: '한', color: '#C2600A', days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  ] },
  { user: '정도윤', entries: [
    { contents: [
      '아침 달리기 완료.',
      '오늘 아침도 가볍게 러닝.',
      '아침 달리기 끝. 상쾌하게 하루 시작.',
      '새벽 러닝으로 아침을 열었어요.',
      '아침 달리기, 평소 루트로 완주.',
      '오늘 러닝 끝. 몸이 개운해요.',
      '아침 달리기 루틴 지속 중.',
    ], community: 'morning-runners', initials: '정', color: '#1A6B4A', days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { contents: [
      '아침 물 한 잔 + 스트레칭.',
      '기상 후 물 한 잔 마시고 스트레칭.',
      '아침 루틴 - 물 한 잔, 스트레칭 순서로.',
      '물 한 잔 마시고 가벼운 스트레칭.',
      '아침 스트레칭 + 물 한 잔으로 시작.',
      '물 한 잔과 스트레칭, 오늘도 빠짐없이.',
      '아침 물 한 잔 마신 뒤 스트레칭 완료.',
    ], community: 'morning-runners', initials: '정', color: '#1A6B4A', days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
    { contents: [
      '계단 오르기 성공.',
      '엘리베이터 대신 계단 오르기 완료.',
      '점심시간 계단 오르기, 오늘도 성공.',
      '계단 오르기로 틈새 운동 완료.',
      '오늘도 계단 이용, 운동 습관 지속.',
      '계단 오르기 성공. 숨은 차지만 뿌듯.',
      '사무실 계단 오르기 완료.',
    ], community: 'morning-runners', initials: '정', color: '#1A6B4A', days: [1, 2, 4, 5, 7, 8, 10, 11, 13] },
  ] },
  { user: '오재원', entries: [
    { contents: [
      '명상 10분 완료.',
      '아침 명상 10분으로 하루 시작.',
      '명상 10분, 오늘은 유독 집중 잘 됨.',
      '명상 10분 끝. 마음이 차분해져요.',
      '명상 10분 루틴 지속 중.',
      '오늘도 명상 10분 완료.',
      '명상 10분 + 호흡 정리.',
    ], community: 'morning-runners', initials: '오', color: '#6B6B6B', days: [2, 5, 9] },
  ] },
  { user: '강지우', entries: [
    { contents: [
      '기상 직후 찬물 세수.',
      '찬물 세수로 잠을 깨웠어요.',
      '기상 후 찬물 세수, 확실히 정신 들어요.',
      '오늘도 찬물 세수로 하루 시작.',
      '찬물 세수 완료. 개운하게 시작.',
      '아침 찬물 세수 루틴 지속.',
      '기상 직후 찬물로 세수 완료.',
    ], community: 'morning-runners', initials: '강', color: '#1A6B4A', days: [3, 8] },
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
          content: entry.contents[d % entry.contents.length],
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
