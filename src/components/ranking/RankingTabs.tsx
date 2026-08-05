import { useMessages } from '../../i18n'

export function RankingTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  const M = useMessages()
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
      <div style={{ display: 'flex', gap: 6, padding: 'calc(14px + env(safe-area-inset-top)) 20px 12px', overflowX: 'auto' }}>
        {tabs.map((rt) => {
          const isActive = active === rt
          return (
            <button key={rt} onClick={() => onChange(rt)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: isActive ? 700 : 400, background: isActive ? '#111111' : 'transparent', color: isActive ? '#fff' : '#666666', border: `1px solid ${isActive ? '#111111' : '#E0E0E0'}`, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0 }}>
              {rt === 'All' ? M.ranking.allTab : rt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
