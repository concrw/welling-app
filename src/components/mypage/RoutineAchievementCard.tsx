import type { AchievementResult } from '../../lib/achievement'
import { useMessages } from '../../i18n'

export function RoutineAchievementCard({ achievement, period }: { achievement: AchievementResult; period: string }) {
  const M = useMessages()
  return (
    <div style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#AAAAAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>{M.myPage.currentRoutineTitle(M.myPage.periods[period] ?? period)}</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111111', letterSpacing: '-.5px' }}>{achievement.overall}%</p>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#111111', background: '#EBEBEB', padding: '4px 10px', borderRadius: 20, letterSpacing: '.02em' }}>{M.myPage.streakBadge(achievement.streak)}</div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: '#EBEBEB', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ width: `${achievement.overall}%`, height: '100%', background: '#111111', borderRadius: 3 }} />
      </div>
      {achievement.groups.map((group) => (
        <div key={group.name} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{group.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111111' }}>{group.achievement}%</span>
          </div>
          <div style={{ height: 3, borderRadius: 3, background: '#EBEBEB', marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ width: `${group.achievement}%`, height: '100%', background: '#111111', borderRadius: 3 }} />
          </div>
          {group.items.map((item) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0 2px 8px' }}>
              <span style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>· {item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 40, height: 2, borderRadius: 2, background: '#EBEBEB', overflow: 'hidden' }}>
                  <div style={{ width: `${item.rate}%`, height: '100%', background: '#111111' }} />
                </div>
                <span style={{ fontSize: 10, color: '#AAAAAA', width: 26, textAlign: 'right' }}>{item.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
