import { useMessages } from '../../i18n'
import { useAppStore } from '../../store/appStore'

export function RoutineTab() {
  const M = useMessages()
  const groups = useAppStore((s) => s.routineGroups)
  const privacy = useAppStore((s) => s.routinePrivacy)
  const navigate = useAppStore((s) => s.navigate)
  const items = groups.flatMap((group) => group.items.map((item) => ({ group, item })))

  if (items.length === 0) return (
    <div style={{ padding: '64px 24px', textAlign: 'center', background: '#FAF8F4' }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>🌱</div>
      <h2 style={{ margin: '0 0 8px', fontSize: 19 }}>{M.myPage.emptyTitle}</h2>
      <p style={{ margin: '0 auto 20px', maxWidth: 300, color: '#777777', fontSize: 14, lineHeight: 1.55 }}>{M.myPage.emptyBody}</p>
      <button onClick={() => navigate('routine-edit')} style={{ padding: '11px 16px', border: 0, borderRadius: 10, background: '#111111', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>{M.myPage.emptyRoutineCta}</button>
    </div>
  )
  return (
    <div style={{ background: '#FAF8F4', padding: '24px 16px 32px' }}>
      {items.map(({ group, item }, i) => {
        const privacyGroup = privacy.find((entry) => entry.name === group.name)
        const itemPrivacy = privacyGroup?.items.find((entry) => entry.name === item.name)
        const isPublic = Boolean(privacyGroup?.on && (itemPrivacy?.on ?? true))
        return <div key={item.id} style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
          <div style={{ width: 54, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111111', letterSpacing: '-.3px' }}>{item.time || '—'}</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111111', margin: '6px 0 0', flexShrink: 0 }} />
            {i < items.length - 1 && <div style={{ width: 1, flex: 1, background: '#DDDDDD', minHeight: 32 }} />}
          </div>
          <div style={{ flex: 1, marginLeft: 12, marginBottom: 20 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
              {item.imgUrl && <div style={{ width: '100%', height: 180, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundImage: `url(${item.imgUrl})` }} />}
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 600, color: '#111111' }}>{M.myPage.routineLabel(item.name)}</span>
                  <button onClick={() => navigate('routine-privacy')} style={{ padding: '7px 10px', borderRadius: 100, background: isPublic ? 'rgba(0,0,0,.05)' : '#111111', cursor: 'pointer', border: 0, flexShrink: 0, marginLeft: 10, color: isPublic ? '#666666' : '#fff', fontSize: 10, fontWeight: 700 }}>{isPublic ? M.myPage.publicBadge : M.myPage.privateBadge}</button>
                </div>
                <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#999999', lineHeight: 1.6 }}>{item.desc || group.name}</p>
              </div>
            </div>
          </div>
        </div>
      })}
      <p style={{ margin: '8px 0 0 66px', fontSize: 11, color: '#BBBBBB', fontWeight: 300, lineHeight: 1.7 }}>{M.myPage.routineTabFooter}</p>
    </div>
  )
}
