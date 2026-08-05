import { useMessages } from '../../i18n'
import { MOCK_ROUTINE_ITEMS as ROUTINE_ITEMS } from '../../data/mock'

export function RoutineTab() {
  const M = useMessages()
  return (
    <div style={{ background: '#FAF8F4', padding: '24px 16px 32px' }}>
      {ROUTINE_ITEMS.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
          <div style={{ width: 54, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111111', letterSpacing: '-.3px' }}>{item.time}</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111111', margin: '6px 0 0', flexShrink: 0 }} />
            {i < ROUTINE_ITEMS.length - 1 && <div style={{ width: 1, flex: 1, background: '#DDDDDD', minHeight: 32 }} />}
          </div>
          <div style={{ flex: 1, marginLeft: 12, marginBottom: 20 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
              {item.img ? (
                <div style={{ width: '100%', height: 180, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundImage: `url(${item.img})` }} />
              ) : (
                <div style={{ width: '100%', height: 140, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 52, lineHeight: 1 }}>{item.name[0]}</span>
                </div>
              )}
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 600, color: '#111111' }}>{item.name}</span>
                  <div style={{ padding: '4px 10px', borderRadius: 100, background: item.isPublic ? 'rgba(0,0,0,.05)' : '#111111', cursor: 'pointer', flexShrink: 0, marginLeft: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 10, fontWeight: 700, color: item.isPublic ? '#666666' : '#fff', whiteSpace: 'nowrap', lineHeight: 1 }}>{item.isPublic ? M.myPage.publicBadge : M.myPage.privateBadge}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#999999', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      <p style={{ margin: '8px 0 0 66px', fontSize: 11, color: '#BBBBBB', fontWeight: 300, lineHeight: 1.7 }}>{M.myPage.routineTabFooter}</p>
    </div>
  )
}
