import { useMessages } from '../../i18n'

export interface RankedUser {
  user: string
  initials: string
  color: string
  completion: number
  streak: number
  rank: number
}

export function RankingPodium({ top3, onTapProfile }: { top3: RankedUser[]; onTapProfile: (userName: string) => void }) {
  const M = useMessages()
  if (top3.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.ranking.emptyCommunity}</p>
      </div>
    )
  }

  if (top3.length < 3) {
    return (
      <div style={{ padding: '24px 16px 16px', background: '#FAFAFA', borderBottom: '1px solid #EBEBEB', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{M.ranking.champions}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 16px 0', background: '#FAFAFA', borderBottom: '1px solid #EBEBEB' }}>
      <p style={{ margin: '0 0 20px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center' }}>{M.ranking.champions}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
        {/* 2nd */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <svg width="26" height="20" viewBox="0 0 48 36" fill="none"><path d="M5 29h38M5 29V20l9 6 10-17 10 17 9-6v9" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="20" r="2.5" fill="#9CA3AF"/><circle cx="24" cy="12" r="2.5" fill="#9CA3AF"/><circle cx="43" cy="20" r="2.5" fill="#9CA3AF"/></svg>
          <div onClick={() => onTapProfile(top3[1].user)} style={{ width: 44, height: 44, borderRadius: '50%', background: top3[1].color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{top3[1].initials}</span>
          </div>
          <p onClick={() => onTapProfile(top3[1].user)} style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#111111', textAlign: 'center', cursor: 'pointer' }}>{top3[1].user}</p>
          <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA' }}>{top3[1].completion}%</p>
          <div style={{ width: '100%', height: 60, background: '#9CA3AF', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>2</span>
          </div>
        </div>

        {/* 1st */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <svg width="30" height="22" viewBox="0 0 48 36" fill="none"><path d="M5 29h38M5 29V20l9 6 10-17 10 17 9-6v9" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="20" r="2.5" fill="#F59E0B"/><circle cx="24" cy="12" r="2.5" fill="#F59E0B"/><circle cx="43" cy="20" r="2.5" fill="#F59E0B"/></svg>
          <div onClick={() => onTapProfile(top3[0].user)} style={{ width: 54, height: 54, borderRadius: '50%', background: top3[0].color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{top3[0].initials}</span>
          </div>
          <p onClick={() => onTapProfile(top3[0].user)} style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111111', textAlign: 'center', cursor: 'pointer' }}>{top3[0].user}</p>
          <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA' }}>{top3[0].completion}%</p>
          <div style={{ width: '100%', height: 88, background: '#F59E0B', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>1</span>
          </div>
        </div>

        {/* 3rd */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <svg width="26" height="20" viewBox="0 0 48 36" fill="none"><path d="M5 29h38M5 29V20l9 6 10-17 10 17 9-6v9" stroke="#CD7C41" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="20" r="2.5" fill="#CD7C41"/><circle cx="24" cy="12" r="2.5" fill="#CD7C41"/><circle cx="43" cy="20" r="2.5" fill="#CD7C41"/></svg>
          <div onClick={() => onTapProfile(top3[2].user)} style={{ width: 44, height: 44, borderRadius: '50%', background: top3[2].color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{top3[2].initials}</span>
          </div>
          <p onClick={() => onTapProfile(top3[2].user)} style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#111111', textAlign: 'center', cursor: 'pointer' }}>{top3[2].user}</p>
          <p style={{ margin: 0, fontSize: 10, color: '#AAAAAA' }}>{top3[2].completion}%</p>
          <div style={{ width: '100%', height: 44, background: '#CD7C41', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>3</span>
          </div>
        </div>
      </div>
    </div>
  )
}
