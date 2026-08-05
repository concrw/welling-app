import type { RoutinePrivacyGroup } from '../../../store/appStore'
import { SectionHeader } from '../../ui/SectionHeader'
import { Toggle } from '../../ui/Toggle'
import { useMessages } from '../../../i18n'

export function RoutinePrivacySection({
  open,
  onToggle,
  onExpand,
  routinePrivacy,
  onToggleGroup,
  onToggleItem,
}: {
  open: boolean
  onToggle: () => void
  onExpand: () => void
  routinePrivacy: RoutinePrivacyGroup[]
  onToggleGroup: (gi: number) => void
  onToggleItem: (gi: number, ii: number) => void
}) {
  const M = useMessages()
  return (
    <div style={{ borderBottom: '1px solid #EBEBEB', paddingBottom: open ? 12 : 0 }}>
      <SectionHeader label={M.myPage.sectionRoutinePrivacy} open={open} onToggle={onToggle} onExpand={onExpand} />
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', lineHeight: 1.7, fontWeight: 300 }}>{M.routinePrivacy.desc}</p>
          {routinePrivacy.map((pg, gi) => (
            <div key={pg.name} style={{ borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
              <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EBEBEB' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: pg.on ? '#111111' : '#AAAAAA' }}>{pg.name}</span>
                <Toggle on={pg.on} onToggle={() => onToggleGroup(gi)} />
              </div>
              {pg.items.map((pgi, ii) => (
                <div key={pgi.name} style={{ padding: '9px 14px 9px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F5F5F5' }}>
                  <span style={{ fontSize: 11, color: pgi.on ? '#111111' : '#AAAAAA', fontWeight: 300 }}>· {pgi.name}</span>
                  <Toggle on={pgi.on} onToggle={() => onToggleItem(gi, ii)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
