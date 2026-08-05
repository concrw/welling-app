interface OtherProfileRoutinesProps {
  routines: { group: string; items: string }[]
}

export function OtherProfileRoutines({ routines }: OtherProfileRoutinesProps) {
  return (
    <div style={{ background: '#FAF8F4', padding: '24px 16px 32px' }}>
      {routines.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
          <div style={{ width: 54, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '.04em' }}>{r.group}</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0984E3', margin: '6px 0 0', flexShrink: 0 }} />
            <div style={{ width: 1, flex: 1, background: '#DDDDDD', minHeight: 32 }} />
          </div>
          <div style={{ flex: 1, marginLeft: 12, marginBottom: 18 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
              <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#555555', lineHeight: 1.65, wordBreak: 'keep-all' }}>{r.items}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
