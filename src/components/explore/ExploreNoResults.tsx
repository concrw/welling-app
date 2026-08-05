import { useMessages } from '../../i18n'

interface ExploreNoResultsProps {
  searchQuery: string
}

export function ExploreNoResults({ searchQuery }: ExploreNoResultsProps) {
  const M = useMessages()
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111111' }}>{M.explore.noResultsTitle}</p>
      <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.explore.noResultsBody(searchQuery)}</p>
    </div>
  )
}
