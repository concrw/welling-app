import { useEffect, useRef } from 'react'
import { useAppStore } from './store/appStore'
import Onboarding from './screens/Onboarding'
import ResetPassword from './screens/ResetPassword'
import SocialNickname from './screens/SocialNickname'
import Feed from './screens/Feed'
import Explore from './screens/Explore'
import MyPage from './screens/MyPage'
import Ranking from './screens/Ranking'
import OtherProfile from './screens/OtherProfile'
import CommunityDetail from './screens/CommunityDetail'
import NewCommunity from './screens/NewCommunity'
import CommunityEdit from './screens/CommunityEdit'
import CommunitySettings from './screens/CommunitySettings'
import RoutineEdit from './screens/RoutineEdit'
import RoutineHistory from './screens/RoutineHistory'
import RoutinePrivacy from './screens/RoutinePrivacy'
import GoalVsActual from './screens/GoalVsActual'
import Insights from './screens/Insights'
import Settings from './screens/Settings'
import CommNotifications from './screens/CommNotifications'
import Notifications from './screens/Notifications'
import Alarm from './screens/Alarm'
import AdminUsers from './screens/AdminUsers'
import EveningReflection from './screens/EveningReflection'
import SettingsHomeScreen from './screens/SettingsHomeScreen'
import SettingsDefaultVisibility from './screens/SettingsDefaultVisibility'
import SettingsProfileVisibility from './screens/SettingsProfileVisibility'
import SettingsGoogleCalendar from './screens/SettingsGoogleCalendar'
import SettingsChangeUsername from './screens/SettingsChangeUsername'
import SettingsDeleteAccount from './screens/SettingsDeleteAccount'
import BottomNav from './components/BottomNav'
import RecordModal from './overlays/RecordModal'
import PostDetailSheet from './overlays/PostDetailSheet'
import SyncConfirmSheet from './overlays/SyncConfirmSheet'
import SyncAlarm from './overlays/SyncAlarm'
import HomePrompt from './overlays/HomePrompt'
import WelcomeAnimation from './overlays/WelcomeAnimation'
import { useMessages } from './i18n'

const ONBOARDING_SCREENS = ['onboarding-username', 'onboarding-preview', 'onboarding-follow', 'onboarding-firstrecord']
const NAV_SCREENS = ['feed', 'explore', 'ranking', 'mypage']

function removeInviteFromUrl() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('invite')) return
  url.searchParams.delete('invite')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  sessionStorage.removeItem('welling_processed_invite')
}

export default function App() {
  const M = useMessages()
  const screen = useAppStore((s) => s.screen)
  const authInitializing = useAppStore((s) => s.authInitializing)
  const isDemo = useAppStore((s) => s.isDemo)
  const checkPendingInvite = useAppStore((s) => s.checkPendingInvite)
  const pendingInviteCode = useAppStore((s) => s.pendingInviteCode)
  const toastMessage = useAppStore((s) => s.toastMessage)
  const inviteCheckFinished = useRef(false)
  const hadPendingInvite = useRef(false)

  // Parse invite code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const inviteCode = params.get('invite')
    const processedInvite = sessionStorage.getItem('welling_processed_invite')
    if (inviteCode && processedInvite !== inviteCode) {
      localStorage.setItem('welling_pending_invite', JSON.stringify({
        code: inviteCode,
        savedAt: Date.now(),
      }))
      sessionStorage.setItem('welling_processed_invite', inviteCode)
    }
    // Check for pending invite after URL parsing
    void checkPendingInvite().then(() => {
      inviteCheckFinished.current = true
      if (useAppStore.getState().pendingInviteCode) {
        hadPendingInvite.current = true
      } else if (inviteCode) {
        removeInviteFromUrl()
      }
    })
  }, [checkPendingInvite])

  useEffect(() => {
    if (pendingInviteCode) {
      hadPendingInvite.current = true
    } else if (inviteCheckFinished.current && hadPendingInvite.current) {
      removeInviteFromUrl()
      hadPendingInvite.current = false
    }
  }, [pendingInviteCode])

  const isOnboarding = ONBOARDING_SCREENS.includes(screen)
  const showNav = NAV_SCREENS.includes(screen)

  if (authInitializing && !isDemo) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <img src="/uploads/welling-black.png" alt="WELLING" style={{ width: 112, height: 'auto' }} />
        <div aria-label={M.common.loading} style={{ width: 24, height: 24, border: '3px solid #E8F3F1', borderTopColor: '#00A389', borderRadius: '50%', animation: 'welling-spin .8s linear infinite' }} />
        <style>{'@keyframes welling-spin{to{transform:rotate(360deg)}}'}</style>
        {toastMessage && (
          <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#111111', color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, zIndex: 999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {toastMessage}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-shell" style={{
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      background: '#FFFFFF',
      color: '#111111',
      fontFamily: "'Noto Sans KR', system-ui, sans-serif",
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, overscrollBehavior: 'none' }}>
          {isOnboarding && <Onboarding />}
          {screen === 'reset-password' && <ResetPassword />}
          {screen === 'social-nickname' && <SocialNickname />}
          {screen === 'feed' && <Feed />}
          {screen === 'explore' && <Explore />}
          {screen === 'mypage' && <MyPage />}
          {screen === 'ranking' && <Ranking />}
          {screen === 'other-profile' && <OtherProfile />}
          {screen === 'community-detail' && <CommunityDetail />}
          {screen === 'new-community' && <NewCommunity />}
          {screen === 'community-edit' && <CommunityEdit />}
          {screen === 'community-settings' && <CommunitySettings />}
          {screen === 'routine-edit' && <RoutineEdit />}
          {screen === 'routine-history' && <RoutineHistory />}
          {screen === 'routine-privacy' && <RoutinePrivacy />}
          {screen === 'goal-vs-actual' && <GoalVsActual />}
          {screen === 'insights' && <Insights />}
          {screen === 'settings' && <Settings />}
          {screen === 'comm-notifications' && <CommNotifications />}
          {screen === 'notifications' && <Notifications />}
          {screen === 'alarm' && <Alarm />}
          {screen === 'admin-users' && <AdminUsers />}
          {screen === 'evening-reflection' && <EveningReflection />}
          {screen === 'settings-home-screen' && <SettingsHomeScreen />}
          {screen === 'settings-default-visibility' && <SettingsDefaultVisibility />}
          {screen === 'settings-profile-visibility' && <SettingsProfileVisibility />}
          {screen === 'settings-google-calendar' && <SettingsGoogleCalendar />}
          {screen === 'settings-change-username' && <SettingsChangeUsername />}
          {screen === 'settings-delete-account' && <SettingsDeleteAccount />}
        </div>
      </div>
      {showNav && <BottomNav />}
      <RecordModal />
      <PostDetailSheet />
      <SyncConfirmSheet />
      <SyncAlarm />
      <HomePrompt />
      <WelcomeAnimation />
      {toastMessage && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#111111', color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, zIndex: 999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}
