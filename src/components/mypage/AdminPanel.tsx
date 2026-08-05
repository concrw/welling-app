import type { Screen } from '../../store/appStore'
import { useMessages } from '../../i18n'

export function AdminPanel({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const M = useMessages()
  return (
    <div style={{ margin: '-18px -20px 18px', background: '#111111', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '.12em', textTransform: 'uppercase', background: 'rgba(255,255,255,.15)', padding: '3px 9px', borderRadius: 4 }}>{M.myPage.adminBadge}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onNavigate('admin-users')} style={{ padding: '6px 13px', borderRadius: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{M.myPage.adminUsers}</button>
          <button onClick={() => onNavigate('admin-ads')} style={{ padding: '6px 13px', borderRadius: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{M.myPage.adminAds}</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)' }}>
          <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.06em' }}>{M.myPage.totalUsers}</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>1,247</p>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)' }}>
          <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.06em' }}>{M.myPage.todayPosts}</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>34</p>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)' }}>
          <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.06em' }}>{M.myPage.adImpressions}</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>45,231</p>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)' }}>
          <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,.5)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.06em' }}>{M.myPage.adCtr}</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>3.2%</p>
        </div>
      </div>
    </div>
  )
}
