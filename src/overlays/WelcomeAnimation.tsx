import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'

export default function WelcomeAnimation() {
  const showWelcomeAnimation = useAppStore((s) => s.showWelcomeAnimation)
  const dismissWelcomeAnimation = useAppStore((s) => s.dismissWelcomeAnimation)
  const nickname = useAppStore((s) => s.nickname)
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    if (!showWelcomeAnimation) return
    setPhase('in')
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), 1800)
    const t3 = setTimeout(() => dismissWelcomeAnimation(), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [showWelcomeAnimation, dismissWelcomeAnimation])

  if (!showWelcomeAnimation) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 500,
      background: '#111111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      opacity: phase === 'out' ? 0 : 1,
      transition: phase === 'out' ? 'opacity 0.4s ease' : phase === 'in' ? 'opacity 0.3s ease' : 'none',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: phase === 'in' ? 'translateY(12px)' : 'translateY(0)',
        opacity: phase === 'in' ? 0 : 1,
        transition: 'transform 0.4s ease, opacity 0.4s ease',
      }}>
        <img src="/uploads/welling-black.png" style={{ height: 28, width: 'auto', filter: 'invert(1)', marginBottom: 28, opacity: 0.9 }} alt="welling" />
        <h2 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-.5px' }}>안녕하세요, {nickname}님!</h2>
        <p style={{ margin: '0 0 40px', fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 300, letterSpacing: '.02em' }}>루틴을 함께 시작해요.</p>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, color: '#fff', fontWeight: 200, lineHeight: 1 }}>✓</span>
        </div>
      </div>
    </div>
  )
}
