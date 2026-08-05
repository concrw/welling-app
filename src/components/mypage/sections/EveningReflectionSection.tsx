import { SectionHeader } from '../../ui/SectionHeader'
import { useMessages } from '../../../i18n'

export function EveningReflectionSection({ open, onToggle, onNavigate }: { open: boolean; onToggle: () => void; onNavigate: () => void }) {
  const M = useMessages()
  return (
    <div style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: open ? 12 : 0 }}>
      <SectionHeader label={M.myPage.sectionEveningReflection} open={open} onToggle={onToggle} />
      {open && (
        <div>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#AAAAAA', fontWeight: 300, lineHeight: 1.7 }}>{M.myPage.eveningReflectionDesc}</p>
          <button onClick={onNavigate} style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: '#111111', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 4 }}>
            {M.myPage.eveningReflectionCta}
          </button>
        </div>
      )}
    </div>
  )
}
