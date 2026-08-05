import { useMessages } from '../../i18n'

export function SectionHeader({ label, open, onToggle, onExpand }: { label: string; open: boolean; onToggle: () => void; onExpand?: () => void }) {
  const M = useMessages()
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', borderBottom: open ? '1px solid #F0F0F0' : 'none', marginBottom: open ? 12 : 0 }}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{label}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
          <path d="M3 5l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {onExpand && (
        <button
          onClick={onExpand}
          style={{ padding: '4px 0 4px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#AAAAAA' }}
        >
          {M.ui.viewAll}
        </button>
      )}
    </div>
  )
}
