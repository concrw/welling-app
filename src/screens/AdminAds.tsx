import { useState } from 'react'
import { useAppStore, type AdSlotKey } from '../store/appStore'
import { AdminAdsHeader } from '../components/admin-ads/AdminAdsHeader'
import { AdSlotList } from '../components/admin-ads/AdSlotList'
import type { AdSlot } from '../components/admin-ads/types'
import { useMessages } from '../i18n'

export default function AdminAds() {
  const M = useMessages()
  const SLOT_NAMES: Record<AdSlotKey, string> = {
    explore: M.adminAds.slotExplore,
    ranking: M.adminAds.slotRanking,
    mypage: M.adminAds.slotMypage,
    otherProfile: M.adminAds.slotOtherProfile,
    'community-detail': M.adminAds.slotCommunityDetail,
  }
  const goBack = useAppStore((s) => s.goBack)
  const isAdmin = useAppStore((s) => s.isAdmin)
  const adSlots = useAppStore((s) => s.adSlots)
  const setAdSlot = useAppStore((s) => s.setAdSlot)
  const [drafts, setDrafts] = useState<Record<string, AdSlot>>({})
  const [editing, setEditing] = useState<string | null>(null)

  if (!isAdmin) return null

  const slots: AdSlot[] = (['explore', 'ranking', 'mypage', 'otherProfile'] as const).map((id) => ({
    id,
    slotName: SLOT_NAMES[id],
    ...adSlots[id],
  }))

  const update = (id: string, patch: Partial<AdSlot>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? slots.find((s) => s.id === id)!), ...patch } }))

  const startEdit = (id: string) => {
    const slot = slots.find((s) => s.id === id)!
    setDrafts((prev) => ({ ...prev, [id]: { ...slot } }))
    setEditing(id)
  }

  const cancelEdit = (id: string) => {
    setDrafts((prev) => { const next = { ...prev }; delete next[id]; return next })
    setEditing(null)
  }

  const save = (id: string) => {
    const draft = drafts[id]
    if (draft) setAdSlot(id as AdSlotKey, draft)
    cancelEdit(id)
  }

  const getSlot = (id: string) => (editing === id && drafts[id]) ? drafts[id] : slots.find((s) => s.id === id)!

  return (
    <div>
      <AdminAdsHeader goBack={goBack} />
      <AdSlotList
        slots={slots}
        editing={editing}
        getSlot={getSlot}
        update={update}
        startEdit={startEdit}
        cancelEdit={cancelEdit}
        save={save}
      />
    </div>
  )
}
