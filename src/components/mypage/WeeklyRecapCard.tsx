import { useMessages } from '../../i18n'

export function WeeklyRecapCard({ overall, delta, streak }: { overall: number; delta: number; streak: number }) {
  const M = useMessages()
  return (
    <div style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
      <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.myPage.weeklyRecapTitle}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{overall}%</p>
          <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 400 }}>
            {M.myPage.deltaVsLastWeek(delta)}
          </p>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#111111', background: '#EBEBEB', padding: '4px 10px', borderRadius: 20, letterSpacing: '.02em' }}>{M.myPage.streakBadge(streak)}</div>
      </div>
    </div>
  )
}
