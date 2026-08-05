import type { useAppStore } from '../../store/appStore'
import { getColor, getInitials } from './adminUsersUtils'
import { useMessages } from '../../i18n'

type AdminUser = ReturnType<typeof useAppStore.getState>['adminUsers'][number]

export function AdminUsersList({ users, onToggleSuspend }: { users: AdminUser[]; onToggleSuspend: (id: string) => void }) {
  const M = useMessages()
  return (
    <div>
      {users.map((u) => (
        <div key={u.id} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F5F5F5' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: getColor(u.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{getInitials(u.name)}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#111111' }}>{u.name}</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 300 }}>
              <span style={{ color: u.suspended ? '#E53535' : '#16A34A' }}>{u.suspended ? M.adminUsers.statusSuspended : M.adminUsers.statusActive}</span>
              <span style={{ color: '#CCCCCC' }}> · {M.adminUsers.followersCount(u.followers)}</span>
            </p>
          </div>
          <button onClick={() => onToggleSuspend(u.id)} style={{ padding: '6px 13px', borderRadius: 7, background: '#F5F5F5', color: '#111111', fontSize: 11, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer', flexShrink: 0, letterSpacing: '.02em' }}>
            {u.suspended ? M.adminUsers.restore : M.adminUsers.suspend}
          </button>
        </div>
      ))}
    </div>
  )
}
