import { useAppStore } from '../store/appStore'
import type { Screen } from '../store/appStore'
import { useMessages, useLangStore, type Lang } from '../i18n'
import { LANG_LABELS } from '../i18n/langStore'

const LANG_OPTIONS: { value: Lang; label: string }[] = (['ko', 'en'] as Lang[]).map((value) => ({ value, label: LANG_LABELS[value] }))

const STATIC_ITEMS: { labelKey: 'notifications' | 'googleCalendar' | 'homeScreen' | 'defaultVisibility' | 'profileVisibility' | 'changeUsername' | 'signOut'; hasArrow: boolean; color: string; nav?: Screen; action?: 'signOut' }[] = [
  { labelKey: 'notifications', hasArrow: true, color: '#111111', nav: 'alarm' },
  { labelKey: 'googleCalendar', hasArrow: true, color: '#111111', nav: 'settings-google-calendar' },
  { labelKey: 'homeScreen', hasArrow: true, color: '#111111', nav: 'settings-home-screen' },
  { labelKey: 'defaultVisibility', hasArrow: true, color: '#111111', nav: 'settings-default-visibility' },
  { labelKey: 'profileVisibility', hasArrow: true, color: '#111111', nav: 'settings-profile-visibility' },
  { labelKey: 'changeUsername', hasArrow: true, color: '#111111', nav: 'settings-change-username' },
  { labelKey: 'signOut', hasArrow: false, color: '#E53535', action: 'signOut' },
]

export default function Settings() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const navigate = useAppStore((s) => s.navigate)
  const signOut = useAppStore((s) => s.signOut)
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.settings.title}</span>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ padding: '14px 4px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#111111' }}>{M.settings.language}</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {LANG_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setLang(o.value)}
                style={{
                  border: '1px solid ' + (lang === o.value ? '#111111' : '#DDDDDD'),
                  background: lang === o.value ? '#111111' : '#FFFFFF',
                  color: lang === o.value ? '#FFFFFF' : '#666666',
                  borderRadius: 14, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {STATIC_ITEMS.map((si) => (
          <div
            key={si.labelKey}
            onClick={si.nav ? () => navigate(si.nav!) : si.action === 'signOut' ? signOut : undefined}
            style={{ padding: '14px 4px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: si.nav || si.action ? 'pointer' : 'default' }}
          >
            <p style={{ margin: 0, fontSize: 13, color: si.color }}>{M.settings[si.labelKey]}</p>
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
