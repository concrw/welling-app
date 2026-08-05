export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#111111' : '#DDDDDD', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 20 : 2, boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
    </div>
  )
}
