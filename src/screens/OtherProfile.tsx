import { useAppStore } from '../store/appStore'

export default function OtherProfile() {
  const goBack = useAppStore((s) => s.goBack)
  const selectedUser = useAppStore((s) => s.selectedUser)
  const followedUsers = useAppStore((s) => s.followedUsers)
  const toggleFollowUser = useAppStore((s) => s.toggleFollowUser)
  const openSyncSheet = useAppStore((s) => s.openSyncSheet)
  const syncedList = useAppStore((s) => s.syncedList)

  if (!selectedUser) return null

  const isFollowed = followedUsers.has(selectedUser.id)
  const isSynced = syncedList.has(selectedUser.id)

  return (
    <div>
      <div style={{ padding: '12px 16px 12px', background: '#FFFFFF', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #EBEBEB' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div style={{ background: '#FFFFFF', padding: '16px 20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', flexShrink: 0, background: selectedUser.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{selectedUser.initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 20, fontWeight: 700, color: '#111111', letterSpacing: '-.3px', lineHeight: 1 }}>{selectedUser.name}</p>
            <p style={{ margin: '0 0 5px', fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#AAAAAA', fontWeight: 400 }}>@{selectedUser.handle} · WELLING</p>
            <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, color: '#333333', fontWeight: 400 }}>
              <span style={{ fontWeight: 700 }}>{selectedUser.followers.toLocaleString()}</span> followers &nbsp;
              <span style={{ fontWeight: 700 }}>{selectedUser.following.toLocaleString()}</span> following
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => toggleFollowUser(selectedUser.id)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 24,
              background: isFollowed ? '#111111' : 'transparent',
              color: isFollowed ? '#fff' : '#111111',
              border: '1.5px solid #111111',
              fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
            }}
          >
            {isFollowed ? '팔로잉' : '팔로우'}
          </button>
          <button
            onClick={() => openSyncSheet(selectedUser)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 24,
              background: isSynced ? '#111111' : '#C9A84C',
              color: '#fff',
              border: 'none',
              fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
            }}
          >
            {isSynced ? '싱크됨' : '루틴싱크'}
          </button>
        </div>
      </div>

      <div style={{ background: '#FAF8F4', padding: '24px 16px 32px' }}>
        {selectedUser.routines.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
            <div style={{ width: 54, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '.04em' }}>{r.group}</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A84C', margin: '6px 0 0', flexShrink: 0 }} />
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
    </div>
  )
}
