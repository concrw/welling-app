import { useRef, useState } from 'react'
import { useMessages } from '../../i18n'
import type { Community } from '../../store/appStore'

export function FeedHeader({
  activeCommunityTab,
  setActiveCommunityTab,
  communityTabOrder,
  setCommunityTabOrder,
  tabs,
  hasUnread,
  onNavigateNotifications,
  joinedCount,
  onCreateGroup,
}: {
  activeCommunityTab: string
  setActiveCommunityTab: (id: string) => void
  communityTabOrder: string[]
  setCommunityTabOrder: (order: string[]) => void
  tabs: Community[]
  hasUnread: boolean
  onNavigateNotifications: () => void
  joinedCount?: number
  onCreateGroup?: () => void
}) {
  const M = useMessages()
  const [logoError, setLogoError] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // HTML5 drag (desktop)
  const handleDragStart = (i: number) => setDragIdx(i)
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null) }
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIdx(i) }
  const handleDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return
    const next = [...communityTabOrder]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(i, 0, moved)
    setCommunityTabOrder(next)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  // Touch drag (mobile)
  const tabEls = useRef<(HTMLDivElement | null)[]>([])
  const touchDragIdx = useRef<number | null>(null)
  const touchActive = useRef(false)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getIdxAtX = (clientX: number) => {
    for (let i = 0; i < tabEls.current.length; i++) {
      const el = tabEls.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (clientX >= r.left && clientX <= r.right) return i
    }
    return null
  }

  const handleTouchStart = (i: number, _e: React.TouchEvent) => {
    touchDragIdx.current = i
    touchActive.current = false
    if (touchTimer.current) clearTimeout(touchTimer.current)
    touchTimer.current = setTimeout(() => {
      touchActive.current = true
      setDragIdx(i)
    }, 250)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchActive.current) {
      if (touchTimer.current) clearTimeout(touchTimer.current)
      return
    }
    e.preventDefault()
    const overIdx = getIdxAtX(e.touches[0].clientX)
    if (overIdx !== null) setDragOverIdx(overIdx)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
    if (!touchActive.current) { touchActive.current = false; return }
    touchActive.current = false
    const overIdx = getIdxAtX(e.changedTouches[0].clientX)
    const from = touchDragIdx.current
    if (overIdx !== null && from !== null && overIdx !== from) {
      const next = [...communityTabOrder]
      const [moved] = next.splice(from, 1)
      next.splice(overIdx, 0, moved)
      setCommunityTabOrder(next)
    }
    setDragIdx(null)
    setDragOverIdx(null)
    touchDragIdx.current = null
  }

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', display: 'flex', alignItems: 'center' }}>
        {logoError
          ? <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5, color: '#111111' }}>WELLING</span>
          : <img src="/uploads/welling-black.png" style={{ height: 21, width: 'auto' }} alt={M.feed.logoAlt} onError={() => setLogoError(true)} />
        }
        <button onClick={onNavigateNotifications} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 6, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a6 6 0 016 6v2l1.5 3H2.5L4 10V8a6 6 0 016-6z" stroke="#111111" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8.5 16a1.5 1.5 0 003 0" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {hasUnread && (
            <div style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#E53535', border: '1.5px solid #fff' }} />
          )}
        </button>
      </div>
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {joinedCount && joinedCount > 1 && (
          <div onClick={() => setActiveCommunityTab('all')} style={{ padding: '6px 14px', borderRadius: 22, background: activeCommunityTab === 'all' ? '#111111' : 'transparent', color: activeCommunityTab === 'all' ? '#FFFFFF' : '#AAAAAA', fontSize: 13, fontWeight: 600, border: activeCommunityTab === 'all' ? 'none' : '1px solid #EBEBEB', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>{M.feed.allTab}</div>
        )}

        {tabs.map((c, i) => (
          <div
            key={c.id}
            ref={(el) => { tabEls.current[i] = el }}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onTouchStart={(e) => handleTouchStart(i, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setActiveCommunityTab(c.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 22,
              background: activeCommunityTab === c.id ? '#111111' : 'transparent',
              color: activeCommunityTab === c.id ? '#FFFFFF' : '#111111',
              fontSize: 13,
              fontWeight: 600,
              border: activeCommunityTab === c.id ? 'none' : '1px solid #EBEBEB',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              flexShrink: 0,
              opacity: dragIdx === i ? 0.3 : 1,
              transform: dragOverIdx === i ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 150ms cubic-bezier(.25,.8,.25,1), opacity 100ms',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {c.name}
          </div>
        ))}
        
        {onCreateGroup && (
          <div onClick={onCreateGroup} style={{ padding: '6px 14px', borderRadius: 22, background: 'transparent', color: '#0984E3', fontSize: 13, fontWeight: 600, border: '1px solid #0984E3', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>{M.feed.createGroupButton}</div>
        )}
      </div>
    </div>
  )
}
