export function Toggle({ on, onToggle, label, small = false }: { on: boolean; onToggle: () => void; label: string; small?: boolean }) {
  const visualWidth = small ? 34 : 40
  const visualHeight = small ? 19 : 22
  const knob = small ? 15 : 18
  const inset = (visualHeight - knob) / 2
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onToggle} style={{ width: 44, height: 44, padding: 0, border: 0, background: 'transparent', cursor: 'pointer', position: 'relative', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
      <span aria-hidden="true" style={{ width: visualWidth, height: visualHeight, borderRadius: visualHeight / 2, background: on ? '#111111' : '#DDDDDD', position: 'relative', transition: 'background .2s', display: 'block' }}>
        <span style={{ width: knob, height: knob, borderRadius: '50%', background: '#fff', position: 'absolute', top: inset, left: on ? visualWidth - knob - inset : inset, boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
      </span>
    </button>
  )
}
