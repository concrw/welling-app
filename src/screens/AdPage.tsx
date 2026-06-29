import { useAppStore } from '../store/appStore'

export default function AdPage() {
  const goBack = useAppStore((s) => s.goBack)
  const adModalData = useAppStore((s) => s.adModalData)
  const adSlots = useAppStore((s) => s.adSlots)

  const brand = adModalData?.brand ?? '—'
  const desc = adModalData?.desc ?? ''
  const initial = brand.charAt(0).toUpperCase()

  const handleCta = () => {
    const slotKey = adModalData?.slotKey
    const slot = slotKey ? adSlots[slotKey] : null
    if (slot?.url) {
      window.open(slot.url, '_blank')
    } else {
      goBack()
    }
  }

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{brand}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: '#CCCCCC', letterSpacing: '.06em', textTransform: 'uppercase' }}>광고</span>
      </div>

      <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid #EBEBEB' }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#111111' }}>{initial}</span>
        </div>
        <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{brand}</h2>
        <p style={{ margin: '0 0 32px', fontSize: 13, color: '#AAAAAA', lineHeight: 1.75, fontWeight: 300, maxWidth: 260, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{desc}</p>
        <button
          onClick={handleCta}
          style={{ width: '100%', maxWidth: 280, padding: 14, borderRadius: 10, background: '#111111', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}
        >
          자세히 보기
        </button>
      </div>
    </div>
  )
}
