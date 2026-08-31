import { useMessages } from '../../i18n'

interface OnboardingPost {
  id: string
  user: string
  initials: string
  color: string
  time: string
  category: string
  content: string
  reactions: { key: string; count: number }[]
}

interface PreviewScreenProps {
  posts: OnboardingPost[]
  onContinue: () => void
}

export function PreviewScreen({ posts, onContinue }: PreviewScreenProps) {
  const M = useMessages()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', minHeight: '100dvh' }}>
      <div style={{ padding: 'calc(22px + env(safe-area-inset-top)) 20px 14px', borderBottom: '1px solid #EBEBEB', flexShrink: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#111111', letterSpacing: '.1em', textTransform: 'uppercase' }}>WELLING</p>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{M.onboarding.previewTitle}</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {posts.map((op) => (
          <div key={op.id} style={{ padding: '14px 20px', borderBottom: '1px solid #EBEBEB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: op.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{op.initials}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>{op.user}</span>
              <span style={{ fontSize: 11, color: '#AAAAAA', marginLeft: 2 }}>{op.time}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#BBBBBB', letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0 }}>{op.category}</span>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{op.content}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {op.reactions.map((r) => (
                <span key={r.key} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid #EBEBEB', color: '#AAAAAA' }}>{r.key} {r.count}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '16px 20px', borderTop: '1px solid #EBEBEB', flexShrink: 0 }}>
        <button onClick={onContinue} style={{ width: '100%', padding: 14, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {M.onboarding.continue}
        </button>
      </div>
    </div>
  )
}
