const ko = {
  title: 'Routine History',
  currentBadge: 'Current',
  periodRange: (start: number, end: number) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${new Date(start).toLocaleDateString('ko-KR', opts)} – ${new Date(end).toLocaleDateString('ko-KR', opts)}`
  },
  itemSummary: (names: string, extra: number) => (extra > 0 ? `${names} + ${extra} more` : names),
  completionSummary: (pct: number, summary: string) => (summary ? `${pct}% · ${summary}` : `${pct}%`),
  empty: '아직 이전 루틴 구간이 없어요.',
  newRoutine: '새 루틴 시작',
}

const en: typeof ko = {
  title: 'Routine History',
  currentBadge: 'Current',
  periodRange: (start: number, end: number) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${new Date(start).toLocaleDateString('en-US', opts)} – ${new Date(end).toLocaleDateString('en-US', opts)}`
  },
  itemSummary: (names: string, extra: number) => (extra > 0 ? `${names} + ${extra} more` : names),
  completionSummary: (pct: number, summary: string) => (summary ? `${pct}% · ${summary}` : `${pct}%`),
  empty: 'No previous routine periods yet.',
  newRoutine: 'Start new routine',
}

export const routineHistory = { ko, en }
