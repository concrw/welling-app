import type { useAppStore } from '../../store/appStore'
import { useMessages } from '../../i18n'

type AdminPostReport = ReturnType<typeof useAppStore.getState>['adminPostReports'][number]

export function AdminPostReportsList({
  reports, onDelete, onDismiss
}: {
  reports: AdminPostReport[]
  onDelete: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const M = useMessages()
  if (reports.length === 0) {
    return (
      <div style={{ padding: '48px 20px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.adminUsers.emptyReports}</p>
      </div>
    )
  }

  return (
    <div>
      {reports.map((r) => (
        <div key={r.id} style={{ padding: '14px 20px', borderBottom: '1px solid #F5F5F5' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{M.adminUsers.reporter(r.reporterNickname)}</p>
          <p style={{ margin: '0 0 6px', fontSize: 12, color: '#555555', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.postContent}</p>
          <span style={{ display: 'inline-block', marginBottom: 10, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#FEF2F2', color: '#DC2626', fontWeight: 600, letterSpacing: '.04em' }}>{r.reason}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onDelete(r.id)} style={{ flex: 1, padding: '8px', borderRadius: 7, background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{M.common.delete}</button>
            <button onClick={() => onDismiss(r.id)} style={{ flex: 1, padding: '8px', borderRadius: 7, background: '#F5F5F5', color: '#AAAAAA', fontSize: 12, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}>{M.adminUsers.dismiss}</button>
          </div>
        </div>
      ))}
    </div>
  )
}
