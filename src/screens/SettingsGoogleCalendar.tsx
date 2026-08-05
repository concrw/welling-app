import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { isConnected, connectGoogle, clearToken } from '../lib/googleCalendar'
import { useMessages } from '../i18n'

export default function SettingsGoogleCalendar() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setConnected(isConnected())
  }, [])

  const handle = async () => {
    setError(null)
    if (connected) {
      clearToken()
      setConnected(false)
      return
    }
    setLoading(true)
    try {
      await connectGoogle()
      setConnected(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.settings.googleCalendar}</span>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ padding: 20, borderRadius: 16, border: '1px solid #EBEBEB', background: '#FAFAFA', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFFFF', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="1" y="3" width="20" height="18" rx="3" stroke="#111111" strokeWidth="1.5" />
                <path d="M1 8h20" stroke="#111111" strokeWidth="1.5" />
                <path d="M7 1v3M15 1v3" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#111111' }}>{M.settings.googleCalendar}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>
                {connected ? M.settings.connectedStatus : M.settings.notConnectedStatus}
              </p>
            </div>
            {connected && (
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#00A389', background: '#E8F7F4', padding: '3px 9px', borderRadius: 20 }}>{M.settings.connectedStatus}</span>
            )}
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#777777', lineHeight: 1.7, fontWeight: 300 }}>
            {M.settings.googleCalendarDesc}
          </p>
          <button
            onClick={handle}
            disabled={loading}
            style={{ width: '100%', padding: '12px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: loading ? 'default' : 'pointer', background: connected ? '#F5F5F5' : '#111111', color: connected ? '#888888' : '#FFFFFF', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? M.settings.connecting : connected ? M.settings.disconnect : M.settings.connect}
          </button>
          {error && <p style={{ margin: '10px 0 0', fontSize: 11, color: '#E53535' }}>{error}</p>}
        </div>
      </div>
    </div>
  )
}
