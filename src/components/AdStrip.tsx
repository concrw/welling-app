import { useAppStore } from '../store/appStore'

export default function AdStrip() {
  const navigate = useAppStore((s) => s.navigate)
  const openAdModal = useAppStore((s) => s.openAdModal)
  const setAdPageData = useAppStore((s) => s.setAdPageData)
  const adSlots = useAppStore((s) => s.adSlots)
  const mypageAd = adSlots.mypage

  const handleClick = () => {
    if (mypageAd.clickAction === 'link') {
      window.open(mypageAd.url, '_blank')
    } else if (mypageAd.clickAction === 'modal') {
      openAdModal({ brand: mypageAd.brand, desc: mypageAd.desc, modalTitle: mypageAd.modalTitle, modalBody: mypageAd.modalBody })
    } else {
      setAdPageData({ brand: mypageAd.brand, desc: mypageAd.desc, slotKey: 'mypage' })
      navigate('ad-page')
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        flexShrink: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #F0F0F0',
        padding: '9px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F0FFF4', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M10 3C6.5 3 4 6 4 10s2.5 7 6 7 6-3 6-7-2.5-7-6-7z" stroke="#16A34A" strokeWidth="1.5" fill="none"/>
          <path d="M10 7v3l2 2" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 1px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{mypageAd.brand}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mypageAd.desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: '#CCCCCC', letterSpacing: '.06em', textTransform: 'uppercase', border: '1px solid #EBEBEB', padding: '2px 5px', borderRadius: 3 }}>광고</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleClick() }}
          style={{ padding: '5px 10px', borderRadius: 6, background: '#111111', color: '#fff', fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          보기
        </button>
      </div>
    </div>
  )
}
