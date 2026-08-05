export function SyncToast({ message, isError }: { message: string; isError: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)',
      background: isError ? '#CC3333' : '#111111',
      color: '#fff', borderRadius: 10, padding: '11px 18px', fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap', zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,.18)',
    }}>
      {message}
    </div>
  )
}
