import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'
import { computeAchievementForRange } from '../lib/achievement'

export default function RoutineHistory() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const navigate = useAppStore((s) => s.navigate)
  const routineGroups = useAppStore((s) => s.routineGroups)
  const routineHistory = useAppStore((s) => s.routineHistory)
  const currentRoutineStartDate = useAppStore((s) => s.currentRoutineStartDate)
  const posts = useAppStore((s) => s.posts)
  const nickname = useAppStore((s) => s.nickname)
  const userName = nickname || 'Min'

  // Current routine summary from routineGroups
  const allItems = routineGroups.flatMap((g) => g.items)
  const itemNames = allItems.map((i) => i.name)

  const now = Date.now()
  const currentAchievement = computeAchievementForRange(routineGroups, posts, userName, currentRoutineStartDate, now)
  const currentCompletion = currentAchievement.overall
  const currentPeriodLabel = `${M.routineHistory.periodRange(currentRoutineStartDate, now)}`

  // Build a label summary for current routine items
  const displayNames = itemNames.slice(0, 2).join(', ')
  const extraCount = itemNames.length > 2 ? itemNames.length - 2 : 0
  const itemSummary = M.routineHistory.itemSummary(displayNames, extraCount)

  const priorPeriods = routineHistory.map((entry) => ({
    id: entry.id,
    period: M.routineHistory.periodRange(entry.startDate, entry.endDate),
    achievement: computeAchievementForRange(entry.groups, posts, userName, entry.startDate, entry.endDate).overall,
  }))

  return (
    <div>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', background: '#FFFFFF', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111111' }}>{M.routineHistory.title}</span>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: 16, borderRadius: 12, background: '#111111', color: '#fff' }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, opacity: 0.6, letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.routineHistory.currentBadge}</p>
          <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800 }}>{currentPeriodLabel}</p>
          <p style={{ margin: '0 0 10px', fontSize: 11, opacity: 0.6 }}>
            {M.routineHistory.completionSummary(currentCompletion, itemSummary)}
          </p>
          <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
            <div style={{ width: `${currentCompletion}%`, height: 3, background: '#fff', borderRadius: 3 }} />
          </div>
        </div>

        {priorPeriods.length === 0 && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#AAAAAA', fontWeight: 300, textAlign: 'center', padding: '8px 0' }}>{M.routineHistory.empty}</p>
        )}

        {priorPeriods.map((p) => (
          <div key={p.id} style={{ padding: '14px 16px', borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111111' }}>{p.period}</p>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#111111' }}>{p.achievement}%</span>
            </div>
            <div style={{ height: 3, borderRadius: 3, background: '#EBEBEB', overflow: 'hidden' }}>
              <div style={{ width: `${p.achievement}%`, height: 3, background: '#111111', borderRadius: 3 }} />
            </div>
          </div>
        ))}

        <div onClick={() => navigate('routine-edit')} style={{ padding: 14, borderRadius: 10, border: '1px dashed #CCCCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{M.routineHistory.newRoutine}</span>
        </div>
      </div>
    </div>
  )
}
