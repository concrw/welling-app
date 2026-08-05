const ko = {
  title: 'Goal vs. Actual',
  todayLabel: (d: Date) => `오늘, ${d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}`,
  anytime: 'Anytime',
  statusDone: 'Done',
  statusMissed: 'Missed',
  legendDone: 'Done · green',
  legendAlt: 'Alt · amber',
  legendMissed: 'Missed · red',
  empty: '루틴을 추가하면 여기에 표시됩니다.',
}

const en: typeof ko = {
  title: 'Goal vs. Actual',
  todayLabel: (d: Date) => `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
  anytime: 'Anytime',
  statusDone: 'Done',
  statusMissed: 'Missed',
  legendDone: 'Done · green',
  legendAlt: 'Alt · amber',
  legendMissed: 'Missed · red',
  empty: 'Add routines to see them here.',
}

export const goalVsActual = { ko, en }
