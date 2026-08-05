const ko = {
  title: 'Evening Reflection',
  dateLabel: (d: Date) => d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }),
  prompts: [
    '오늘 가장 잘 된 루틴은 무엇인가요?',
    '오늘 놓친 루틴이 있다면, 이유는 무엇인가요?',
    '내일 더 잘 하려면 무엇을 바꿔볼 수 있을까요?',
  ],
  questionNo: (n: number) => `Q${n}`,
  placeholder: '자유롭게 적어보세요.',
  publicToFeed: '피드에 공개',
  savedMessage: '저장됐습니다.',
  saveButton: '저장하기',
}

const en: typeof ko = {
  title: 'Evening Reflection',
  dateLabel: (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'short' }),
  prompts: [
    'What routine went best today?',
    'If you missed a routine today, what got in the way?',
    'What could you change to do better tomorrow?',
  ],
  questionNo: (n: number) => `Q${n}`,
  placeholder: 'Write freely.',
  publicToFeed: 'Share to feed',
  savedMessage: 'Saved.',
  saveButton: 'Save',
}

export const eveningReflection = { ko, en }
