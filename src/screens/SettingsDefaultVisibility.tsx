import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function SettingsDefaultVisibility() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const defaultVisibility = useAppStore((s) => s.defaultVisibility)
  const setDefaultVisibility = useAppStore((s) => s.setDefaultVisibility)

  const OPTIONS: { value: 'public' | 'followers' | 'private'; label: string; desc: string }[] = [
    { value: 'public', label: M.settings.visPublic, desc: M.settings.visPublicPostDesc },
    { value: 'followers', label: M.settings.visFollowers, desc: M.settings.visFollowersDesc },
    { value: 'private', label: M.settings.visPrivate, desc: M.settings.visPrivateDesc },
  ]

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.settings.defaultVisibility}</span>
      </div>

      <div style={{ padding: '8px 20px' }}>
        <p style={{ margin: '16px 0 12px', fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{M.settings.defaultVisibilityGuide}</p>
        {OPTIONS.map((opt) => {
          const active = defaultVisibility === opt.value
          return (
            <div
              key={opt.value}
              onClick={() => setDefaultVisibility(opt.value)}
              style={{ padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${active ? '#111111' : '#EBEBEB'}`, background: active ? '#F8F8F8' : '#FFFFFF', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: '#111111' }}>{opt.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{opt.desc}</p>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? '#111111' : '#DDDDDD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#111111' }} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
