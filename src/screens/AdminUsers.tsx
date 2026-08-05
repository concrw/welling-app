import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { AdminUsersHeader } from '../components/admin-users/AdminUsersHeader'
import { AdminUsersTabs, type AdminUsersTab } from '../components/admin-users/AdminUsersTabs'
import { AdminUsersList } from '../components/admin-users/AdminUsersList'
import { AdminUserReportsList } from '../components/admin-users/AdminUserReportsList'
import { AdminPostReportsList } from '../components/admin-users/AdminPostReportsList'

export default function AdminUsers() {
  const goBack = useAppStore((s) => s.goBack)
  const isAdmin = useAppStore((s) => s.isAdmin)
  const adminUsers = useAppStore((s) => s.adminUsers)
  const adminReports = useAppStore((s) => s.adminReports)
  const adminPostReports = useAppStore((s) => s.adminPostReports)
  const toggleUserSuspend = useAppStore((s) => s.toggleUserSuspend)
  const dismissReport = useAppStore((s) => s.dismissReport)
  const deleteReport = useAppStore((s) => s.deleteReport)
  const dismissPostReport = useAppStore((s) => s.dismissPostReport)
  const deletePostReport = useAppStore((s) => s.deletePostReport)
  const [tab, setTab] = useState<AdminUsersTab>('users')

  if (!isAdmin) return null

  const visibleReports = adminReports.filter((r) => r.status === 'open')
  const visiblePostReports = adminPostReports.filter((r) => r.status === 'open')

  return (
    <div>
      <AdminUsersHeader onBack={goBack} />

      <AdminUsersTabs
        tab={tab}
        onChange={setTab}
        userCount={adminUsers.length}
        reportCount={visibleReports.length}
        postReportCount={visiblePostReports.length}
      />

      {tab === 'users' && (
        <AdminUsersList users={adminUsers} onToggleSuspend={toggleUserSuspend} />
      )}

      {tab === 'reports' && (
        <AdminUserReportsList reports={visibleReports} onDelete={deleteReport} onDismiss={dismissReport} />
      )}

      {tab === 'postReports' && (
        <AdminPostReportsList reports={visiblePostReports} onDelete={deletePostReport} onDismiss={dismissPostReport} />
      )}
    </div>
  )
}
