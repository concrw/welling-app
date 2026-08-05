interface OtherProfileHeaderProps {
  onBack: () => void
}

export function OtherProfileHeader({ onBack }: OtherProfileHeaderProps) {
  return (
    <div style={{ padding: '12px 16px 12px', background: '#FFFFFF', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #EBEBEB' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  )
}
