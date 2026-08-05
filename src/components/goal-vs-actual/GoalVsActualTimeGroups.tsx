import { useMessages } from '../../i18n'

export type GoalVsActualItem = {
  groupName: string
  name: string
  time?: string
  desc?: string
}

export type GoalVsActualTimeGroup = {
  time: string
  items: GoalVsActualItem[]
}

export type GoalVsActualStatus = {
  statusLabel: string
  statusColor: string
  statusLabelBg: string
  statusBg: string
  statusBorder: string
}

export function GoalVsActualTimeGroups({
  timeGroups,
  getStatus,
}: {
  timeGroups: GoalVsActualTimeGroup[]
  getStatus: (itemName: string) => GoalVsActualStatus
}) {
  const M = useMessages()
  if (timeGroups.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300, textAlign: 'center', paddingTop: 24 }}>{M.goalVsActual.empty}</p>
    )
  }

  return (
    <>
      {timeGroups.map((tg, gi) => (
        <div key={gi} style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.1em', textTransform: 'uppercase' }}>{tg.time}</p>
          {tg.items.map((ti, ii) => {
            const status = getStatus(ti.name)
            return (
              <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderRadius: 8, background: status.statusBg, marginBottom: 5, border: `1px solid ${status.statusBorder}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: status.statusColor, background: status.statusLabelBg, padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 1, letterSpacing: '.04em' }}>{status.statusLabel}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#111111' }}>{ti.name}</p>
                  {ti.desc ? <p style={{ margin: 0, fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>{ti.desc}</p> : null}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}
