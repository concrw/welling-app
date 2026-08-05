import type { Screen } from '../../../store/appStore'
import { SectionHeader } from '../../ui/SectionHeader'
import { useMessages, useLangStore, type Lang } from '../../../i18n'
import { LANG_LABELS } from '../../../i18n/langStore'

const LANG_OPTIONS = (['ko', 'en'] as Lang[]).map((value) => ({ value, label: LANG_LABELS[value] }))

type SettingsItemKey =
  | 'notifications'
  | 'homeScreen'
  | 'defaultVisibility'
  | 'profileVisibility'
  | 'googleCalendar'
  | 'changeUsername'
  | 'signOut'

const SETTINGS_ITEMS: { key: SettingsItemKey; color: string; nav?: Screen; isSignOut?: boolean }[] = [
  { key: 'notifications', color: '#111111', nav: 'alarm' },
  { key: 'homeScreen', color: '#111111', nav: 'settings-home-screen' },
  { key: 'defaultVisibility', color: '#111111', nav: 'settings-default-visibility' },
  { key: 'profileVisibility', color: '#111111', nav: 'settings-profile-visibility' },
  { key: 'googleCalendar', color: '#111111', nav: 'settings-google-calendar' },
  { key: 'changeUsername', color: '#111111', nav: 'settings-change-username' },
  { key: 'signOut', color: '#E53535', isSignOut: true },
]

export function SettingsSection({
  open,
  onToggle,
  onNavigate,
  onSignOutRequest,
}: {
  open: boolean
  onToggle: () => void
  onNavigate: (screen: Screen) => void
  onSignOutRequest: () => void
}) {
  const M = useMessages()
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
  return (
    <div style={{ paddingBottom: open ? 12 : 0 }}>
      <SectionHeader label={M.myPage.sectionSettings} open={open} onToggle={onToggle} />
      {open && (
        <div style={{ paddingLeft: 0 }}>
          <div style={{ padding: '12px 4px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          {SETTINGS_ITEMS.map((si) => (
            <div
              key={si.key}
              onClick={si.isSignOut ? onSignOutRequest : si.nav ? () => onNavigate(si.nav!) : undefined}
              style={{ padding: '12px 4px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <p style={{ margin: 0, fontSize: 13, color: si.color }}>{M.myPage.settingsItems[si.key]}</p>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#CCCCCC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
