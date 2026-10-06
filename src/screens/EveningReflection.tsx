import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useMessages } from '../i18n'
import { EveningReflectionHeader } from '../components/evening-reflection/EveningReflectionHeader'
import { ReflectionPromptList } from '../components/evening-reflection/ReflectionPromptList'
import { EveningReflectionSaveFooter } from '../components/evening-reflection/EveningReflectionSaveFooter'
import { getLocalDate } from '../lib/date'

export default function EveningReflection() {
  const M = useMessages()
  const prompts = M.eveningReflection.prompts
  const navigate = useAppStore((s) => s.navigate)
  const saveEveningReflection = useAppStore((s) => s.saveEveningReflection)
  const eveningReflections = useAppStore((s) => s.eveningReflections)
  const addPost = useAppStore((s) => s.addPost)
  const todayKey = getLocalDate()

  const [answers, setAnswers] = useState(() => {
    const existing = eveningReflections.find((e) => e.date === todayKey)
    return existing ? existing.answers : ['', '', '']
  })
  const [saved, setSaved] = useState(false)
  const [isPublic, setIsPublic] = useState(true)

  const setAnswer = (i: number, val: string) =>
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)))

  const handleSave = async () => {
    saveEveningReflection({ date: todayKey, answers })
    if (isPublic) {
      const content = prompts.map((p, i) => answers[i].trim() ? `${p}\n${answers[i].trim()}` : '').filter(Boolean).join('\n\n')
      if (content) {
        // Post to ACTIVE group (fallback: first joined group; private if none or toggle off)
        const state = useAppStore.getState()
        const communities = state.communities
        const activeCommunityTab = state.activeCommunityTab
        const joinedCommunities = communities.filter(c => c.joined)
        
        // Try to use active tab, then first joined, then null
        let currentCommunityId: string | null = null
        if (activeCommunityTab && activeCommunityTab !== 'all') {
          const activeComm = joinedCommunities.find(c => c.id === activeCommunityTab)
          if (activeComm) currentCommunityId = activeCommunityTab
        }
        if (!currentCommunityId && joinedCommunities.length > 0) {
          currentCommunityId = joinedCommunities[0].id
        }
        
        const visibility: 'group' | 'private' = currentCommunityId ? 'group' : 'private'
        
        const success = await addPost(content, undefined, 'reflection', visibility, currentCommunityId)
        if (!success) {
          alert(M.eveningReflection.postFailed)
          return
        }
      }
    }
    setSaved(true)
    setTimeout(() => navigate('mypage'), 1200)
  }

  const filled = answers.some((a) => a.trim() !== '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#FFFFFF' }}>
      <EveningReflectionHeader onBack={() => navigate('mypage')} />

      <ReflectionPromptList prompts={prompts} answers={answers} onChangeAnswer={setAnswer} />

      <EveningReflectionSaveFooter
        saved={saved}
        isPublic={isPublic}
        onTogglePublic={() => setIsPublic((v) => !v)}
        filled={filled}
        onSave={handleSave}
      />
    </div>
  )
}
