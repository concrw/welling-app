import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

export default function AdModal() {
  const M = useMessages()
  const showAdModal = useAppStore((s) => s.showAdModal)
  const adModalData = useAppStore((s) => s.adModalData)
  const closeAdModal = useAppStore((s) => s.closeAdModal)

  if (!showAdModal || !adModalData) return null

  const title = (adModalData as any).modalTitle || adModalData.brand
  const body = (adModalData as any).modalBody || adModalData.desc
  const ctaLabel = (adModalData as any).ctaLabel || M.common.confirm

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={closeAdModal} style={{ flex: 1 }} />
      <div style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: '24px 24px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#111111', letterSpacing: '-.4px' }}>{title}</p>
          <button onClick={closeAdModal} style={{ width: 28, height: 28, borderRadius: '50%', background: '#F5F5F5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <line x1="1" y1="1" x2="10" y2="10" stroke="#666" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="10" y1="1" x2="1" y2="10" stroke="#666" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#555555', lineHeight: 1.7, fontWeight: 300 }}>{body}</p>
        <button onClick={closeAdModal} style={{ width: '100%', padding: 14, borderRadius: 12, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}
