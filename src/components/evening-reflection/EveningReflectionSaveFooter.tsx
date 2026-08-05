import { useMessages } from '../../i18n'

export function EveningReflectionSaveFooter({
  saved,
  isPublic,
  onTogglePublic,
  filled,
  onSave,
}: {
  saved: boolean
  isPublic: boolean
  onTogglePublic: () => void
  filled: boolean
  onSave: () => void
}) {
  const M = useMessages()
  return (
    <div style={{ padding: '12px 20px', borderTop: '1px solid #EBEBEB', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
      {!saved && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#555555', fontWeight: 600 }}>{M.eveningReflection.publicToFeed}</span>
          <button
            onClick={onTogglePublic}
            style={{ width: 40, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: isPublic ? '#111111' : '#EBEBEB', position: 'relative', padding: 0 }}
          >
            <span style={{ position: 'absolute', top: 3, left: isPublic ? 19 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
          </button>
        </div>
      )}
      {saved ? (
        <div style={{ textAlign: 'center', padding: '13px 0', fontSize: 13, fontWeight: 600, color: '#16A34A' }}>{M.eveningReflection.savedMessage}</div>
      ) : (
        <button
          onClick={onSave}
          disabled={!filled}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            background: filled ? '#111111' : '#EBEBEB',
            color: filled ? '#fff' : '#AAAAAA',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: filled ? 'pointer' : 'default',
          }}
        >
          {M.eveningReflection.saveButton}
        </button>
      )}
    </div>
  )
}
