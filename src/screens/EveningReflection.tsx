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
        // Get current community for group posting, fall back to private if no group or toggle is off
        const communities = useAppStore.getState().communities
        const joinedCommunities = communities.filter(c => c.joined)
        const currentCommunityId = joinedCommunities.length > 0 ? joinedCommunities[0].id : null
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
