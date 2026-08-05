import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function HomePrompt() {
  const M = useMessages()
  const showHomePrompt = useAppStore((s) => s.showHomePrompt)
  const acceptHomePrompt = useAppStore((s) => s.acceptHomePrompt)
  const dismissHomePrompt = useAppStore((s) => s.dismissHomePrompt)

  if (!showHomePrompt) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={dismissHomePrompt} style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: '24px 24px 44px' }}>
        <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 900, color: '#111111', letterSpacing: '-.3px' }}>{M.overlays.homePromptTitle}</p>
        <p style={{ margin: '0 0 22px', fontSize: 13, color: '#AAAAAA', lineHeight: 1.7, fontWeight: 300 }}>{M.overlays.homePromptBody}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={acceptHomePrompt}
            style={{ padding: 14, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}
          >
            {M.overlays.homePromptYes}
          </button>
          <button
            onClick={dismissHomePrompt}
            style={{ padding: 12, borderRadius: 10, background: 'transparent', color: '#AAAAAA', fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: 300 }}
          >
            {M.overlays.homePromptNotNow}
          </button>
        </div>
      </div>
    </div>
  )
}
