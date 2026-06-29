import { useAppStore } from '../store/appStore'
import type { Screen } from '../store/appStore'

const SETTINGS_ITEMS: { label: string; hasArrow: boolean; hasSub: boolean; color: string; nav?: Screen; wip?: boolean }[] = [
  { label: 'Notifications', hasArrow: true, hasSub: false, color: '#111111', nav: 'comm-notifications' },
  { label: 'Home screen', hasArrow: false, hasSub: false, color: '#AAAAAA', wip: true },
  { label: 'Default visibility', hasArrow: false, hasSub: false, color: '#AAAAAA', wip: true },
  { label: 'Profile visibility', hasArrow: false, hasSub: false, color: '#AAAAAA', wip: true },
  { label: 'Google Calendar', hasArrow: false, hasSub: false, color: '#AAAAAA', wip: true },
  { label: 'Change username', hasArrow: false, hasSub: false, color: '#AAAAAA', wip: true },
  { label: 'Sign out', hasArrow: false, hasSub: false, color: '#E53535', wip: true },
]


export default function Settings() {
  const goBack = useAppStore((s) => s.goBack)
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>Settings</span>
      </div>

      <div style={{ padding: '0 20px' }}>
        {SETTINGS_ITEMS.map((si) => (
          <div key={si.label} onClick={si.nav ? () => navigate(si.nav!) : undefined} style={{ padding: '14px 4px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: si.nav ? 'pointer' : 'default' }}>
            <p style={{ margin: 0, fontSize: 13, color: si.color }}>
              {si.label}
            </p>
            {si.hasArrow && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </div>
        ))}
      </div>
      <div style={{ height: 32 }} />
    </div>
  )
}
