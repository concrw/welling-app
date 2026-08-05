import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'

function Toggle({ on, onToggle, small }: { on: boolean; onToggle: () => void; small?: boolean }) {
  const w = small ? 34 : 40
  const h = small ? 19 : 22
  const r = h / 2
  const knob = small ? 15 : 18
  return (
    <div onClick={onToggle} style={{ width: w, height: h, borderRadius: r, background: on ? '#111111' : '#DDDDDD', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
      <div style={{ width: knob, height: knob, borderRadius: '50%', background: '#fff', position: 'absolute', top: (h - knob) / 2, left: on ? w - knob - (h - knob) / 2 : (h - knob) / 2, boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
    </div>
  )
}

export default function CommNotifications() {
  const M = useMessages()
  const SUB_OPTIONS = [M.commNotifications.newPosts, M.commNotifications.newMembers, M.commNotifications.mentions, M.commNotifications.weeklyDigest]
  const goBack = useAppStore((s) => s.goBack)
  const communities = useAppStore((s) => s.communities)
  const storedSettings = useAppStore((s) => s.commNotifSettings)
  const saveCommNotifSettings = useAppStore((s) => s.saveCommNotifSettings)

  const [list, setList] = useState(() =>
    communities.map((c) => {
      const saved = storedSettings.find((s) => s.id === c.id)
      return {
        id: c.id,
        initial: c.initial,
        name: c.name,
        color: c.color,
        master: saved ? saved.master : c.joined,
        options: saved ? saved.options : [c.joined, false, false, false],
      }
    })
  )

  const toggleMaster = (id: string) => setList((prev) => prev.map((c) => c.id === id ? { ...c, master: !c.master } : c))
  const toggleOption = (id: string, idx: number) => setList((prev) => prev.map((c) => c.id === id ? { ...c, options: c.options.map((v, i) => i === idx ? !v : v) } : c))

  const handleSave = () => {
    saveCommNotifSettings(list.map((c) => ({ id: c.id, master: c.master, options: c.options })))
    goBack()
  }

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.commNotifications.title}</span>
        <button onClick={handleSave} style={{ padding: '7px 16px', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}>{M.common.save}</button>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, color: '#AAAAAA', fontWeight: 300, lineHeight: 1.7 }}>{M.commNotifications.guide}</p>

        {list.map((cn) => (
          <div key={cn.id} style={{ borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: cn.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{cn.initial}</span>
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#111111' }}>{cn.name}</span>
              <Toggle on={cn.master} onToggle={() => toggleMaster(cn.id)} />
            </div>

            {cn.master && SUB_OPTIONS.map((label, idx) => (
              <div key={idx} style={{ padding: '10px 16px 10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: 12, color: '#666666', fontWeight: 300 }}>{label}</span>
                <Toggle on={cn.options[idx]} onToggle={() => toggleOption(cn.id, idx)} small />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
