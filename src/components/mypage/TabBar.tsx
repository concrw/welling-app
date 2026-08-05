import { useMessages } from '../../i18n'

const TABS = ['dashboard', 'routine'] as const

export function TabBar({ active, onChange }: { active: 'dashboard' | 'routine'; onChange: (tab: 'dashboard' | 'routine') => void }) {
  const M = useMessages()
  return (
    <div style={{ display: 'flex', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            flex: 1, padding: '12px 0', fontSize: 13, fontWeight: active === tab ? 700 : 400,
            color: active === tab ? '#111111' : '#AAAAAA',
            background: 'none', border: 'none', borderBottom: active === tab ? '2px solid #111111' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}
        >
          {tab === 'routine' ? M.myPage.tabRoutine : M.myPage.tabDashboard}
        </button>
      ))}
    </div>
  )
}
