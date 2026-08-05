import { useAppStore } from '../store/appStore'
import { OtherProfileHeader } from '../components/other-profile/OtherProfileHeader'
import { OtherProfileNotFound } from '../components/other-profile/OtherProfileNotFound'
import { OtherProfileCard } from '../components/other-profile/OtherProfileCard'
import { OtherProfileRoutines } from '../components/other-profile/OtherProfileRoutines'

export default function OtherProfile() {
  const goBack = useAppStore((s) => s.goBack)
  const selectedUser = useAppStore((s) => s.selectedUser)
  const followedUsers = useAppStore((s) => s.followedUsers)
  const toggleFollowUser = useAppStore((s) => s.toggleFollowUser)
  const openSyncSheet = useAppStore((s) => s.openSyncSheet)
  const syncedList = useAppStore((s) => s.syncedList)

  if (!selectedUser) {
    return <OtherProfileNotFound onBack={goBack} />
  }

  const isFollowed = followedUsers.has(selectedUser.id)
  const isSynced = syncedList.has(selectedUser.id)

  return (
    <div>
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
