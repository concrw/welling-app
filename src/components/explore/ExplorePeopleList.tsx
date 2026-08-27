import { useState } from 'react'
import type { User } from '../../store/appStore'
import { useMessages } from '../../i18n'

const COLLAPSED_COUNT = 5

interface ExplorePeopleListProps {
  people: User[]
  followedUsers: Set<string>
  onSelectUser: (u: User) => void
  onToggleFollow: (id: string) => void
}

export function ExplorePeopleList({ people, followedUsers, onSelectUser, onToggleFollow }: ExplorePeopleListProps) {
  const M = useMessages()
  const [expanded, setExpanded] = useState(false)
  const canExpand = people.length > COLLAPSED_COUNT
  const visible = expanded || !canExpand ? people : people.slice(0, COLLAPSED_COUNT)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.explore.peopleHeading}</p>
        {canExpand && (
          <span data-testid="explore-see-all" onClick={() => setExpanded((v) => !v)} style={{ fontSize: 12, color: '#111111', cursor: 'pointer', fontWeight: 500 }}>
            {expanded ? M.explore.showLess : M.explore.seeAll}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
        {visible.map((su) => {
          const isFollowed = followedUsers.has(su.id)
          return (
            <div key={su.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #F5F5F5' }}>
              <div onClick={() => onSelectUser(su)} style={{ width: 38, height: 38, borderRadius: '50%', background: su.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{su.initials}</span>
              </div>
              <div onClick={() => onSelectUser(su)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#111111' }}>{su.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{su.bio}</p>
              </div>
              <button
                onClick={() => onToggleFollow(su.id)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: isFollowed ? '#111111' : 'transparent',
                  color: isFollowed ? '#fff' : '#111111',
                  border: '1.5px solid #111111',
                  cursor: 'pointer', flexShrink: 0
                }}
              >
                {isFollowed ? M.explore.following : M.explore.follow}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
