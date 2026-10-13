// appStore 초기 상태에 들어가는 데모 값 모음. UI 문구가 아닌 목업 콘텐츠이므로
// i18n 카탈로그가 아닌 데이터 파일로 관리한다.
import type { RoutineGroupData, AdminReportRecord } from '../store/appStore'

export const DEMO_ROUTINE_GROUPS: RoutineGroupData[] = [
  {
    id: 'g1', name: 'Morning',
    items: [
      { id: 'i1', name: 'Morning Walk', time: '06:00', desc: '30분 가볍게' },
      { id: 'i2', name: 'Cold Shower', time: '06:30', desc: '' },
    ],
  },
  {
    id: 'g2', name: 'Running',
    items: [
      { id: 'i3', name: 'Running 5km', time: '08:00', desc: '한강 코스' },
    ],
  },
]

export const DEMO_ADMIN_REPORTS: AdminReportRecord[] = [
  { id: 'r1', user: 'spamuser99', initials: 'SP', count: 3, content: '반복적인 스팸 게시물을 올리고 있습니다.', reason: '스팸', status: 'open' },
  { id: 'r2', user: 'hate_acc01', initials: 'HA', count: 7, content: '다른 사용자에 대한 혐오 발언을 반복하고 있습니다.', reason: '혐오발언', status: 'open' },
  { id: 'r3', user: 'fake_routine', initials: 'FR', count: 2, content: '허위 루틴 기록으로 커뮤니티를 오도하고 있습니다.', reason: '허위정보', status: 'open' },
]

export const DEMO_SYNC_ALARM_DATE = '6월 28일 토요일'
