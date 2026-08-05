import { useMessages } from '../../i18n'

export type AdminUsersTab = 'users' | 'reports' | 'postReports'

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  background: active ? '#111111' : '#F5F5F5', color: active ? '#fff' : '#111111', border: 'none', transition: 'all .2s'
})

export function AdminUsersTabs({
  tab, onChange, userCount, reportCount, postReportCount
}: {
  tab: AdminUsersTab
  onChange: (t: AdminUsersTab) => void
  userCount: number
  reportCount: number
  postReportCount: number
}) {
  const M = useMessages()
  return (
    <div style={{ display: 'flex', padding: '12px 20px', gap: 8, borderBottom: '1px solid #EBEBEB' }}>
      <button onClick={() => onChange('users')} style={tabBtnStyle(tab === 'users')}>{M.adminUsers.usersTab(userCount)}</button>
      <button onClick={() => onChange('reports')} style={tabBtnStyle(tab === 'reports')}>{M.adminUsers.userReportsTab(reportCount)}</button>
      <button onClick={() => onChange('postReports')} style={tabBtnStyle(tab === 'postReports')}>{M.adminUsers.postReportsTab(postReportCount)}</button>
    </div>
  )
}
