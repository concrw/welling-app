import type { RoutineSuggestion } from '../../store/appStore'
import { useMessages } from '../../i18n'

interface RoutineSuggestionCardProps {
  topKeyword: string
  suggestions: RoutineSuggestion[]
  savedSuggestion: boolean
  onSave: () => void
}

export function RoutineSuggestionCard({ topKeyword, suggestions, savedSuggestion, onSave }: RoutineSuggestionCardProps) {
  const M = useMessages()
  return (
    <div style={{ padding: 14, borderRadius: 10, background: '#FAFAFA', border: '1px solid #EBEBEB' }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#111111' }}>{M.insights.suggestionTitle(topKeyword)}</p>
      <p style={{ margin: '0 0 12px', fontSize: 11, color: '#AAAAAA', fontWeight: 300 }}>
        {M.insights.suggestionPeople(Math.max(...suggestions.map((s) => s.userCount)))}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {suggestions.map((s) => (
          <p key={s.itemName} style={{ margin: 0, fontSize: 12, color: '#111111' }}>{M.insights.suggestionItem(s.itemName, s.userCount)}</p>
        ))}
      </div>
      {savedSuggestion ? (
        <p style={{ margin: 0, fontSize: 12, color: '#16A34A', fontWeight: 600, textAlign: 'center' }}>{M.insights.savedToRoutine}</p>
      ) : (
        <button
          onClick={onSave}
          style={{ width: '100%', padding: '9px', borderRadius: 8, background: '#111111', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '.02em' }}
        >
          {M.insights.saveAsNewRoutine}
        </button>
      )}
    </div>
  )
}
