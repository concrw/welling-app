import { useMessages } from '../../i18n'

const PERIOD_TABS = ['This week', 'This month', 'All time']

export function PeriodSelector({ active, onChange }: { active: string; onChange: (period: string) => void }) {
  const M = useMessages()
  return (
    <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 8, padding: 3, marginBottom: 16, gap: 0 }}>
      {PERIOD_TABS.map((pt) => {
        const isActive = active === pt
        return (
          <button key={pt} onClick={() => onChange(pt)} style={{ flex: 1, padding: '7px 4px', borderRadius: 6, fontSize: 11, fontWeight: isActive ? 700 : 400, background: isActive ? '#FFFFFF' : 'transparent', color: isActive ? '#111111' : '#AAAAAA', border: 'none', cursor: 'pointer', transition: 'all .2s', letterSpacing: '.02em' }}>
            {M.myPage.periods[pt] ?? pt}
          </button>
        )
      })}
    </div>
  )
}
