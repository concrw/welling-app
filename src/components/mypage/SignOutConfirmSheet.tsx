import { useMessages } from '../../i18n'

export function SignOutConfirmSheet({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const M = useMessages()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: '24px 20px calc(24px + env(safe-area-inset-bottom))' }}>
        <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111111' }}>{M.myPage.signOutTitle}</p>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.myPage.signOutDesc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onConfirm} style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: '#E53535', color: '#FFFFFF', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{M.myPage.signOut}</button>
          <button onClick={onCancel} style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: '#F5F5F5', color: '#111111', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{M.common.cancel}</button>
        </div>
      </div>
    </div>
  )
}
