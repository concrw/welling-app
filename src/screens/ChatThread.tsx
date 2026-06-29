import { useState } from 'react'
import { useAppStore } from '../store/appStore'

const INIT_MESSAGES = [
  { id: 'm1', me: false, text: '오늘 루틴 어떻게 됐어?', time: '10:28', justify: 'flex-start', radius: '14px 14px 14px 4px', bg: '#F0F0F0', textColor: '#111111' },
  { id: 'm2', me: true, text: '4/5 완료했어! Running만 못했네', time: '10:30', justify: 'flex-end', radius: '14px 14px 4px 14px', bg: '#111111', textColor: '#fff' },
  { id: 'm3', me: false, text: '나도 비슷해. 내일은 같이 뛰자!', time: '10:31', justify: 'flex-start', radius: '14px 14px 14px 4px', bg: '#F0F0F0', textColor: '#111111' },
  { id: 'm4', me: true, text: '좋아! 몇 시에?', time: '10:31', justify: 'flex-end', radius: '14px 14px 4px 14px', bg: '#111111', textColor: '#fff' },
  { id: 'm5', me: false, text: '오전 7시 어때? 한강에서 만나자', time: '10:32', justify: 'flex-start', radius: '14px 14px 14px 4px', bg: '#F0F0F0', textColor: '#111111' },
]

export default function ChatThread() {
  const goBack = useAppStore((s) => s.goBack)
  const chatUser = useAppStore((s) => s.chatUser)
  const [messages, setMessages] = useState(INIT_MESSAGES)
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim()) return
    const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [...prev, { id: `m${Date.now()}`, me: true, text: input.trim(), time, justify: 'flex-end', radius: '14px 14px 4px 14px', bg: '#111111', textColor: '#fff' }])
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(844px - 60px)' }}>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111111' }}>{chatUser || 'Jay'}</span>
      </div>

      <div style={{ flex: 1, padding: '20px 20px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.justify }}>
            <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: msg.radius, background: msg.bg }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: msg.textColor, lineHeight: 1.5, wordBreak: 'keep-all' }}>{msg.text}</p>
              <p style={{ margin: 0, fontSize: 10, opacity: 0.5, color: msg.textColor, textAlign: 'right' }}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px 28px', background: '#FFFFFF', borderTop: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', bottom: 0 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="메시지를 입력하세요"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 22, border: '1px solid #EBEBEB', fontSize: 14, background: '#FAFAFA', outline: 'none', color: '#111111', fontFamily: "'Noto Sans KR',sans-serif" }}
        />
        <button onClick={send} style={{ width: 38, height: 38, borderRadius: '50%', background: '#111111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M18 10L2 3l4 7-4 7 16-7z" fill="#fff"/></svg>
        </button>
      </div>
    </div>
  )
}
