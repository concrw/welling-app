import { useMessages } from '../../i18n'

export function RankingAdBanner({ brand, desc, onClick }: { brand: string; desc: string; onClick: () => void }) {
  const M = useMessages()
  return (
    <div style={{ padding: '14px 20px 0' }}>
      <div onClick={onClick} style={{ padding: '12px 14px', borderRadius: 10, background: '#F8F8F8', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <div style={{ width: 40, height: 40, borderRadius: 9, background: '#FEF3C7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="12" width="3" height="6" rx="1" fill="#D97706"/>
            <rect x="8.5" y="8" width="3" height="10" rx="1" fill="#D97706"/>
            <rect x="14" y="4" width="3" height="14" rx="1" fill="#D97706"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{brand}</p>
          <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: '#CCCCCC', letterSpacing: '.06em', textTransform: 'uppercase' }}>{M.ranking.adLabel}</span>
          <button onClick={(e) => { e.stopPropagation(); onClick() }} style={{ padding: '5px 11px', borderRadius: 6, background: '#111111', color: '#fff', fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}>{M.ranking.adView}</button>
        </div>
      </div>
    </div>
  )
}
