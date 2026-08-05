import type { RankedUser } from './RankingPodium'
import { useMessages } from '../../i18n'

export function RankingList({ items, onTapProfile }: { items: RankedUser[]; onTapProfile: (userName: string) => void }) {
  const M = useMessages()
  return (
    <div style={{ padding: '0 20px' }}>
      {items.map((r) => (
        <div key={r.rank} onClick={() => onTapProfile(r.user)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5', cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#AAAAAA', width: 22, textAlign: 'right', flexShrink: 0 }}>{r.rank}</span>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{r.initials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: '#111111' }}>{r.user}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA' }}>{M.ranking.streak(r.streak)}</p>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111111' }}>{r.completion}%</span>
        </div>
      ))}
    </div>
  )
}
