import { useState } from 'react'
import { useAppStore } from '../store/appStore'

const PALETTE = ['#374151', '#0984E3', '#00B894', '#6C5CE7', '#B45309', '#047857', '#0369A1', '#7C3AED']
function getColor(name: string) { return PALETTE[name.charCodeAt(0) % PALETTE.length] }
function getInitials(name: string) { return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() }

const USERS_DATA = [
  { id: 'u1', name: 'Jay', statusLabel: 'Active', statusColor: '#16A34A', followers: 1243, suspended: false },
  { id: 'u2', name: 'Sora', statusLabel: 'Active', statusColor: '#16A34A', followers: 892, suspended: false },
  { id: 'u3', name: 'Tom', statusLabel: 'Suspended', statusColor: '#E53535', followers: 231, suspended: true },
  { id: 'u4', name: 'Mina', statusLabel: 'Active', statusColor: '#16A34A', followers: 567, suspended: false },
  { id: 'u5', name: 'Kevin', statusLabel: 'Active', statusColor: '#16A34A', followers: 412, suspended: false },
  { id: 'u6', name: 'Dana', statusLabel: 'Active', statusColor: '#16A34A', followers: 334, suspended: false },
  { id: 'u7', name: 'Ryan', statusLabel: 'Active', statusColor: '#16A34A', followers: 789, suspended: false },
  { id: 'u8', name: 'Lily', statusLabel: 'Suspended', statusColor: '#E53535', followers: 102, suspended: true },
  { id: 'u9', name: 'Eric', statusLabel: 'Active', statusColor: '#16A34A', followers: 1501, suspended: false },
  { id: 'u10', name: 'Nina', statusLabel: 'Active', statusColor: '#16A34A', followers: 655, suspended: false },
]

const REPORTS_DATA = [
  { id: 'r1', user: 'spamuser99', initials: 'SP', count: 3, content: '반복적인 스팸 게시물을 올리고 있습니다.', reason: '스팸' },
  { id: 'r2', user: 'hate_acc01', initials: 'HA', count: 7, content: '다른 사용자에 대한 혐오 발언을 반복하고 있습니다.', reason: '혐오발언' },
  { id: 'r3', user: 'fake_routine', initials: 'FR', count: 2, content: '허위 루틴 기록으로 커뮤니티를 오도하고 있습니다.', reason: '허위정보' },
]

type Tab = 'users' | 'reports'

export default function AdminUsers() {
  const goBack = useAppStore((s) => s.goBack)
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState(USERS_DATA)
  const [dismissedReports, setDismissedReports] = useState<Set<string>>(new Set())
  const [deletedReports, setDeletedReports] = useState<Set<string>>(new Set())

  const toggleSuspend = (id: string) => setUsers((prev) => prev.map((u) => u.id === id ? { ...u, suspended: !u.suspended, statusLabel: u.suspended ? 'Active' : 'Suspended', statusColor: u.suspended ? '#16A34A' : '#E53535' } : u))
  const dismissReport = (id: string) => setDismissedReports((prev) => new Set([...prev, id]))
  const deleteReport = (id: string) => setDeletedReports((prev) => new Set([...prev, id]))
  const visibleReports = REPORTS_DATA.filter((r) => !dismissedReports.has(r.id) && !deletedReports.has(r.id))

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: active ? '#111111' : '#F5F5F5', color: active ? '#fff' : '#111111', border: 'none', transition: 'all .2s'
  })

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>유저 / 게시물 관리</span>
      </div>

      <div style={{ display: 'flex', padding: '12px 20px', gap: 8, borderBottom: '1px solid #EBEBEB' }}>
        <button onClick={() => setTab('users')} style={tabBtnStyle(tab === 'users')}>유저 ({users.length})</button>
        <button onClick={() => setTab('reports')} style={tabBtnStyle(tab === 'reports')}>신고 ({visibleReports.length})</button>
      </div>

      {tab === 'users' && (
        <div>
          {users.map((u) => (
            <div key={u.id} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F5F5F5' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: getColor(u.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{getInitials(u.name)}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#111111' }}>{u.name}</p>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 300 }}>
                  <span style={{ color: u.statusColor }}>{u.statusLabel}</span>
                  <span style={{ color: '#CCCCCC' }}> · {u.followers.toLocaleString()} followers</span>
                </p>
              </div>
              <button onClick={() => toggleSuspend(u.id)} style={{ padding: '6px 13px', borderRadius: 7, background: '#F5F5F5', color: '#111111', fontSize: 11, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer', flexShrink: 0, letterSpacing: '.02em' }}>
                {u.suspended ? '복구' : '정지'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div>
          {visibleReports.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>신고된 게시물이 없어요.</p>
            </div>
          ) : visibleReports.map((r) => (
            <div key={r.id} style={{ padding: '14px 20px', borderBottom: '1px solid #F5F5F5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: getColor(r.user), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{r.initials}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111111' }}>@{r.user} · 신고 {r.count}건</p>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#555555', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.content}</p>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#FEF2F2', color: '#DC2626', fontWeight: 600, letterSpacing: '.04em' }}>{r.reason}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => deleteReport(r.id)} style={{ flex: 1, padding: '8px', borderRadius: 7, background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>삭제</button>
                <button onClick={() => dismissReport(r.id)} style={{ flex: 1, padding: '8px', borderRadius: 7, background: '#F5F5F5', color: '#AAAAAA', fontSize: 12, fontWeight: 600, border: '1px solid #EBEBEB', cursor: 'pointer' }}>무시</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
