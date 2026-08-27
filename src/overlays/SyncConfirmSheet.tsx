import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function SyncConfirmSheet() {
  const M = useMessages()
  const showSyncConfirm = useAppStore((s) => s.showSyncConfirm)
  const syncSheetUserName = useAppStore((s) => s.syncSheetUserName)
  const syncSheetAlarms = useAppStore((s) => s.syncSheetAlarms)
  const closeSyncConfirm = useAppStore((s) => s.closeSyncConfirm)
  const confirmSync = useAppStore((s) => s.confirmSync)

  if (!showSyncConfirm) return null

  return (
    <div data-testid="sync-confirm-sheet" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={closeSyncConfirm} style={{ flex: 1 }} />
      <div style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: '24px 24px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/uploads/welling-black.png" alt="welling" style={{ height: 20, width: 'auto', filter: 'invert(1)' }} />
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 900, color: '#111111', letterSpacing: '-.3px' }}>{M.overlays.routineSync}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{M.overlays.syncDesc(syncSheetUserName)}</p>
          </div>
        </div>
        <div style={{ height: 1, background: '#EBEBEB', margin: '16px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          {(syncSheetAlarms ?? []).map((alarm: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #EBEBEB' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="9" cy="9.5" r="6.5" stroke="#AAAAAA" strokeWidth="1.5"/>
                <path d="M9 6.5V9.5L11 11.5" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 700, color: '#111111' }}>{alarm.time}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alarm.items}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#BBBBBB', letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0 }}>{alarm.group}</span>
            </div>
          ))}
        </div>
        <button onClick={confirmSync} style={{ width: '100%', padding: 14, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.02em', marginBottom: 6 }}>{M.overlays.startSync}</button>
        <button onClick={closeSyncConfirm} style={{ width: '100%', padding: 12, borderRadius: 10, background: 'transparent', color: '#AAAAAA', fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: 300 }}>{M.common.cancel}</button>
      </div>
    </div>
  )
}
