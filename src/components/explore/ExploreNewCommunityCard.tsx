import { useMessages } from '../../i18n'

interface ExploreNewCommunityCardProps {
  onClick: () => void
}

export function ExploreNewCommunityCard({ onClick }: ExploreNewCommunityCardProps) {
  const M = useMessages()
  return (
    <div onClick={onClick} style={{ padding: 14, borderRadius: 12, border: '1px dashed #DDDDDD', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 18, color: '#111111', fontWeight: 200, lineHeight: 1 }}>+</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: '#111111' }}>{M.explore.newCommunityTitle}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>{M.explore.newCommunitySubtitle}</p>
      </div>
    </div>
  )
}
