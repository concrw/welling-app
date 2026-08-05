import { useMessages } from '../../i18n'

export function FeedQuietBanner({
  quietDays,
  onTap,
  onDismiss,
}: {
  quietDays: number
  onTap: () => void
  onDismiss: () => void
}) {
  const M = useMessages()
  return (
    <div style={{ padding: '12px 20px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div onClick={onTap} style={{ flex: 1, cursor: 'pointer' }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#111111' }}>{M.feed.quietBanner(quietDays)}</p>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="3" y1="3" x2="11" y2="11" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="11" y1="3" x2="3" y2="11" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

export function FeedFocusNote({ focusNote }: { focusNote: string }) {
  return (
    <div style={{ padding: '10px 20px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#111111', flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: 11, color: '#999999', fontWeight: 400, letterSpacing: '.02em' }}>{focusNote}</p>
    </div>
  )
}
