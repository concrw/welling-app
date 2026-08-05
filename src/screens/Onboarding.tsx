import { useAppStore } from '../store/appStore'
import { MOCK_ONBOARDING_POSTS } from '../data/mock'
import { UsernameScreen } from '../components/onboarding/UsernameScreen'
import { PreviewScreen } from '../components/onboarding/PreviewScreen'
import { FollowScreen } from '../components/onboarding/FollowScreen'
import { FirstRecordScreen } from '../components/onboarding/FirstRecordScreen'

export default function Onboarding() {
  const screen = useAppStore((s) => s.screen)
  const nicknameInput = useAppStore((s) => s.nicknameInput)
  const setNicknameInput = useAppStore((s) => s.setNicknameInput)
  const emailInput = useAppStore((s) => s.emailInput)
  const setEmailInput = useAppStore((s) => s.setEmailInput)
  const passwordInput = useAppStore((s) => s.passwordInput)
  const setPasswordInput = useAppStore((s) => s.setPasswordInput)
  const authMode = useAppStore((s) => s.authMode)
  const setAuthMode = useAppStore((s) => s.setAuthMode)
  const authError = useAppStore((s) => s.authError)
  const authLoading = useAppStore((s) => s.authLoading)
  const submitNickname = useAppStore((s) => s.submitNickname)
  const submitLogin = useAppStore((s) => s.submitLogin)
  const goFeedDemo = useAppStore((s) => s.goFeedDemo)
  const navigate = useAppStore((s) => s.navigate)
  const toggleFollowOnboard = useAppStore((s) => s.toggleFollowOnboard)
  const onboardingFollowed = useAppStore((s) => s.onboardingFollowed)
  const suggestedUsers = useAppStore((s) => s.suggestedUsers)
  const goToMain = useAppStore((s) => s.goToMain)
  const goToMainWithRecord = useAppStore((s) => s.goToMainWithRecord)

  const ONBOARDING_POSTS = MOCK_ONBOARDING_POSTS

  if (screen === 'onboarding-username') {
    return (
      <UsernameScreen
        nicknameInput={nicknameInput}
        setNicknameInput={setNicknameInput}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authError={authError}
        authLoading={authLoading}
        submitNickname={submitNickname}
        submitLogin={submitLogin}
        goFeedDemo={goFeedDemo}
      />
    )
  }

  if (screen === 'onboarding-preview') {
    return (
      <PreviewScreen
        posts={ONBOARDING_POSTS}
        onContinue={() => navigate('onboarding-follow')}
      />
    )
  }

  if (screen === 'onboarding-follow') {
    return (
      <FollowScreen
        suggestedUsers={suggestedUsers}
        onboardingFollowed={onboardingFollowed}
        toggleFollowOnboard={toggleFollowOnboard}
        onContinue={() => navigate('onboarding-firstrecord')}
        onSkip={() => navigate('onboarding-firstrecord')}
      />
    )
  }

  if (screen === 'onboarding-firstrecord') {
    return (
      <FirstRecordScreen
        goToMainWithRecord={goToMainWithRecord}
        goToMain={goToMain}
      />
    )
  }

  return null
}
