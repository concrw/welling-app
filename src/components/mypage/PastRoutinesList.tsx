import { useMessages } from '../../i18n'

interface PastRoutine {
  id: string
  period: string
  achievement: number
}

export function PastRoutinesList({ items, expanded, onToggle }: { items: PastRoutine[]; expanded: boolean; onToggle: () => void }) {
  const M = useMessages()
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', padding: '10px 12px', borderRadius: 10, border: '1px solid #EBEBEB', color: '#111111', cursor: 'pointer' }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{M.myPage.pastRoutines}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M2 4l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {expanded && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 && (
            <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300, textAlign: 'center', padding: '8px 0' }}>{M.routineHistory.empty}</p>
          )}
          {items.map((prev) => (
            <div key={prev.id} style={{ padding: '10px 12px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{prev.period}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111111' }}>{prev.achievement}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
