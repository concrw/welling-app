import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'

const SUB_OPTIONS = ['새 게시물', '새 멤버', '멘션', '주간 요약']

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
  const goBack = useAppStore((s) => s.goBack)
  const communities = useAppStore((s) => s.communities)
  const [list, setList] = useState(() =>
    communities.map((c) => ({
      id: c.id,
      initial: c.initial,
      name: c.name,
      color: c.color,
      master: c.joined,
      options: [c.joined, false, false, false],
    }))
  )

  useEffect(() => {
    setList(communities.map((c) => ({
      id: c.id,
      initial: c.initial,
      name: c.name,
      color: c.color,
      master: c.joined,
      options: [c.joined, false, false, false],
    })))
  }, [communities])

  const toggleMaster = (id: string) => setList((prev) => prev.map((c) => c.id === id ? { ...c, master: !c.master } : c))
  const toggleOption = (id: string, idx: number) => setList((prev) => prev.map((c) => c.id === id ? { ...c, options: c.options.map((v, i) => i === idx ? !v : v) } : c))

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>커뮤니티 알림</span>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, color: '#AAAAAA', fontWeight: 300, lineHeight: 1.7 }}>커뮤니티별로 알림을 개별 설정할 수 있어요.</p>

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
