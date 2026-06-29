import { useAppStore } from '../store/appStore'

export default function SyncAlarm() {
  const showSyncAlarm = useAppStore((s) => s.showSyncAlarm)
  const syncAlarmStatusTime = useAppStore((s) => s.syncAlarmStatusTime)
  const syncAlarmClockDisplay = useAppStore((s) => s.syncAlarmClockDisplay)
  const syncAlarmDate = useAppStore((s) => s.syncAlarmDate)
  const syncAlarmUserColor = useAppStore((s) => s.syncAlarmUserColor)
  const syncAlarmUserInitial = useAppStore((s) => s.syncAlarmUserInitial)
  const syncAlarmUserDisplay = useAppStore((s) => s.syncAlarmUserDisplay)
  const syncAlarmGroupLabel = useAppStore((s) => s.syncAlarmGroupLabel)
  const syncAlarmContent = useAppStore((s) => s.syncAlarmContent)
  const syncAlarmHasImg = useAppStore((s) => s.syncAlarmHasImg)
  const syncAlarmBgImg = useAppStore((s) => s.syncAlarmBgImg)
  const syncAlarmFallbackGrad = useAppStore((s) => s.syncAlarmFallbackGrad)
  const closeSyncAlarm = useAppStore((s) => s.closeSyncAlarm)
  const completeSyncAlarm = useAppStore((s) => s.completeSyncAlarm)

  if (!showSyncAlarm) return null

  return (
    <div onClick={closeSyncAlarm} style={{ position: 'absolute', inset: 0, zIndex: 150, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
      {/* background layers */}
      {syncAlarmHasImg && syncAlarmBgImg ? (
        <>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${syncAlarmBgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.58) 0%,rgba(0,0,0,.04) 38%,rgba(0,0,0,.04) 52%,rgba(0,0,0,.84) 100%)', pointerEvents: 'none' }} />
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', inset: 0, background: syncAlarmFallbackGrad ?? 'linear-gradient(160deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.28) 0%,transparent 40%,transparent 55%,rgba(0,0,0,.55) 100%)', pointerEvents: 'none' }} />
        </>
      )}

      {/* status bar */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px 0', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: '-.2px' }}>{syncAlarmStatusTime ?? '9:41'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="15" height="10" viewBox="0 0 15 10" fill="none"><rect x="0" y="3" width="3" height="7" rx=".5" fill="white" opacity=".5"/><rect x="4" y="2" width="3" height="8" rx=".5" fill="white" opacity=".7"/><rect x="8" y="0" width="3" height="10" rx=".5" fill="white"/></svg>
          <svg width="16" height="12" viewBox="0 0 24 16" fill="none"><path d="M1 4C5.5-.5 18.5-.5 23 4" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".5"/><path d="M4 7.5C7.5 4 16.5 4 20 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".7"/><path d="M7.5 11C9.5 9 14.5 9 16.5 11" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="14" r="1.5" fill="white"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0" y="1" width="22" height="10" rx="2" stroke="white" strokeWidth="1.5" opacity=".7"/><rect x="22.5" y="3.5" width="2.5" height="5" rx="1" fill="white" opacity=".5"/><rect x="1.5" y="2.5" width="16" height="7" rx="1" fill="white"/></svg>
        </div>
      </div>

      {/* clock */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '20px 0 0', flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 80, fontWeight: 100, color: '#fff', letterSpacing: '-4px', lineHeight: 1, fontFamily: "'Plus Jakarta Sans','Noto Sans KR',sans-serif", textShadow: '0 2px 24px rgba(0,0,0,.25)' }}>{syncAlarmClockDisplay ?? '9:41'}</p>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: 'rgba(255,255,255,.85)', fontWeight: 300 }}>{syncAlarmDate ?? ''}</p>
      </div>

      {/* spacer */}
      <div style={{ position: 'relative', flex: 1 }} />

      {/* user + notification */}
      <div style={{ position: 'relative', padding: '0 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: syncAlarmUserColor ?? '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid rgba(255,255,255,.45)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{syncAlarmUserInitial ?? 'S'}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>{syncAlarmUserDisplay ?? ''}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', fontWeight: 300 }}>의 루틴</span>
        </div>

        {/* frosted notification card */}
        <div onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(20,20,20,.52)', borderRadius: 16, padding: '14px 16px', border: '1px solid rgba(255,255,255,.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/uploads/welling-black.png" style={{ height: 14, width: 'auto', filter: 'invert(1)' }} alt="welling" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', flex: 1 }}>WELLING · 루틴 알림</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>지금</span>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(255,255,255,.9)', fontWeight: 300, lineHeight: 1.6 }}>
            {syncAlarmGroupLabel && `${syncAlarmGroupLabel} · `}{syncAlarmContent ?? ''}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); completeSyncAlarm() }}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#C9A84C', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              실행완료
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); closeSyncAlarm() }}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'rgba(255,255,255,.18)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* swipe hint */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '14px 0 22px', flexShrink: 0 }}>
        <div style={{ width: 36, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.28)', margin: '0 auto 10px' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '.06em' }}>탭하여 잠금 해제</span>
      </div>
    </div>
  )
}
