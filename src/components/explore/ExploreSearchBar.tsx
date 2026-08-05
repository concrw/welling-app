import { useMessages } from '../../i18n'

interface ExploreSearchBarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export function ExploreSearchBar({ searchQuery, setSearchQuery }: ExploreSearchBarProps) {
  const M = useMessages()
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: 'calc(16px + env(safe-area-inset-top)) 20px 12px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="#AAAAAA" strokeWidth="1.5" />
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={M.explore.searchPlaceholder}
          style={{ flex: 1, background: 'none', border: 'none', fontSize: 13, color: '#111111', outline: 'none' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="6.5" fill="#CCCCCC" />
              <line x1="5" y1="5" x2="10" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="5" x2="5" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
