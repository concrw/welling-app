import type { Community } from '../../store/appStore'
import { useMessages } from '../../i18n'

interface ExploreCommunityListProps {
  communities: Community[]
  onSelect: (c: Community) => void
  onToggleJoin: (id: string) => void
}

export function ExploreCommunityList({ communities, onSelect, onToggleJoin }: ExploreCommunityListProps) {
  const M = useMessages()
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.explore.communitiesHeading}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {communities.map((c) => (
          <div key={c.id} onClick={() => onSelect(c)} style={{ padding: '12px 14px', borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{c.initial}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#111111' }}>{c.name}</p>
              <p style={{ margin: '0 0 2px', fontSize: 11, color: '#AAAAAA' }}>{M.explore.memberCount(c.members)}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#CCCCCC', letterSpacing: '.04em', textTransform: 'uppercase' }}>{c.focus || c.desc}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleJoin(c.id) }}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: c.joined ? '#F5F5F5' : '#111111',
                color: c.joined ? '#111111' : '#fff',
                border: c.joined ? '1px solid #EBEBEB' : 'none',
                cursor: 'pointer', flexShrink: 0
              }}
            >
              {c.joined ? M.explore.leaveCommunity : M.explore.joinCommunity}
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
