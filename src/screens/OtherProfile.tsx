import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { supabase } from '../lib/supabaseClient'
import { useMessages } from '../i18n'
import { OtherProfileHeader } from '../components/other-profile/OtherProfileHeader'
import { OtherProfileNotFound } from '../components/other-profile/OtherProfileNotFound'
import { OtherProfileCard } from '../components/other-profile/OtherProfileCard'
import { OtherProfileRoutines } from '../components/other-profile/OtherProfileRoutines'

export default function OtherProfile() {
  const M = useMessages()
  const goBack = useAppStore((s) => s.goBack)
  const isDemo = useAppStore((s) => s.isDemo)
  const selectedUser = useAppStore((s) => s.selectedUser)
  const followedUsers = useAppStore((s) => s.followedUsers)
  const toggleFollowUser = useAppStore((s) => s.toggleFollowUser)
  const openSyncSheet = useAppStore((s) => s.openSyncSheet)
  const syncedList = useAppStore((s) => s.syncedList)

  // 공개 범위는 서버(can_view_profile RPC)가 판정한다. 클라이언트 값은 신뢰하지 않는다.
  const [canView, setCanView] = useState<boolean | null>(null)
  const targetId = selectedUser?.id ?? null

  useEffect(() => {
    let cancelled = false
    if (!targetId || isDemo) {
      setCanView(true)
      return
    }
    setCanView(null)
    supabase.rpc('can_view_profile', { target_id: targetId }).then(({ data, error }: { data: unknown; error: unknown }) => {
      if (cancelled) return
      setCanView(error ? false : data === true)
    })
    return () => { cancelled = true }
  }, [targetId, isDemo])

  if (!selectedUser) {
    return <OtherProfileNotFound onBack={goBack} />
  }

  if (canView === false) {
    return (
      <div data-testid="other-profile-screen">
        <OtherProfileHeader onBack={goBack} />
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111111' }}>{M.otherProfile.privateTitle}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#AAAAAA', fontWeight: 300 }}>{M.otherProfile.privateBody}</p>
        </div>
      </div>
    )
  }

  const isFollowed = followedUsers.has(selectedUser.id)
  const isSynced = syncedList.has(selectedUser.id)

  return (
    <div data-testid="other-profile-screen">
      <OtherProfileHeader onBack={goBack} />

      <OtherProfileCard
        user={selectedUser}
        isFollowed={isFollowed}
        isSynced={isSynced}
        onToggleFollow={() => toggleFollowUser(selectedUser.id)}
        onOpenSync={() => openSyncSheet(selectedUser)}
      />

      <OtherProfileRoutines routines={selectedUser.routines} />
    </div>
  )
}
