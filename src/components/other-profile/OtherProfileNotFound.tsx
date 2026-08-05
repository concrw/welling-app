import { OtherProfileHeader } from './OtherProfileHeader'
import { useMessages } from '../../i18n'

interface OtherProfileNotFoundProps {
  onBack: () => void
}

export function OtherProfileNotFound({ onBack }: OtherProfileNotFoundProps) {
  const M = useMessages()
  return (
    <div>
      <OtherProfileHeader onBack={onBack} />
      <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#AAAAAA', fontWeight: 300 }}>{M.otherProfile.notFound}</p>
      </div>
    </div>
  )
}
