import { useMessages } from '../../i18n'

export function ReflectionPromptList({
  prompts,
  answers,
  onChangeAnswer,
}: {
  prompts: string[]
  answers: string[]
  onChangeAnswer: (index: number, value: string) => void
}) {
  const M = useMessages()
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px' }}>
      {prompts.map((prompt, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#555555', lineHeight: 1.6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#CCCCCC', marginRight: 6 }}>{M.eveningReflection.questionNo(i + 1)}</span>
            {prompt}
          </p>
          <textarea
            value={answers[i]}
            onChange={(e) => onChangeAnswer(i, e.target.value)}
            placeholder={M.eveningReflection.placeholder}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid #EBEBEB',
              fontSize: 14,
              background: '#FAFAFA',
              color: '#111111',
              resize: 'none',
              lineHeight: 1.7,
              outline: 'none',
              fontWeight: 300,
              fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>
      ))}
    </div>
  )
}
