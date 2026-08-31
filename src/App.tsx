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
import RoutineEdit from './screens/RoutineEdit'
import RoutineHistory from './screens/RoutineHistory'
import RoutinePrivacy from './screens/RoutinePrivacy'
import GoalVsActual from './screens/GoalVsActual'
import Insights from './screens/Insights'
import Settings from './screens/Settings'
import CommNotifications from './screens/CommNotifications'
import Notifications from './screens/Notifications'
import Alarm from './screens/Alarm'
import Messages from './screens/Messages'
import ChatThread from './screens/ChatThread'
import AdminUsers from './screens/AdminUsers'
import AdminAds from './screens/AdminAds'
import AdPage from './screens/AdPage'
import EveningReflection from './screens/EveningReflection'
import SettingsHomeScreen from './screens/SettingsHomeScreen'
import SettingsDefaultVisibility from './screens/SettingsDefaultVisibility'
import SettingsProfileVisibility from './screens/SettingsProfileVisibility'
import SettingsGoogleCalendar from './screens/SettingsGoogleCalendar'
import SettingsChangeUsername from './screens/SettingsChangeUsername'
import BottomNav from './components/BottomNav'
import AdStrip from './components/AdStrip'
import RecordModal from './overlays/RecordModal'
import PostDetailSheet from './overlays/PostDetailSheet'
import SyncConfirmSheet from './overlays/SyncConfirmSheet'
import SyncAlarm from './overlays/SyncAlarm'
import AdModal from './overlays/AdModal'
import HomePrompt from './overlays/HomePrompt'
import WelcomeAnimation from './overlays/WelcomeAnimation'

const ONBOARDING_SCREENS = ['onboarding-username', 'onboarding-preview', 'onboarding-follow', 'onboarding-firstrecord']
const NAV_SCREENS = ['feed', 'explore', 'ranking', 'mypage']

export default function App() {
  const screen = useAppStore((s) => s.screen)
  const authInitializing = useAppStore((s) => s.authInitializing)
  const isDemo = useAppStore((s) => s.isDemo)

  const isOnboarding = ONBOARDING_SCREENS.includes(screen)
  const showNav = NAV_SCREENS.includes(screen)
  const showAdStrip = !isOnboarding && (screen === 'mypage' || screen === 'other-profile' || screen === 'community-detail')

  if (authInitializing && !isDemo) {
    return <div style={{ minHeight: '100dvh', background: '#FFFFFF' }} />
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
          {screen === 'routine-edit' && <RoutineEdit />}
          {screen === 'routine-history' && <RoutineHistory />}
          {screen === 'routine-privacy' && <RoutinePrivacy />}
          {screen === 'goal-vs-actual' && <GoalVsActual />}
          {screen === 'insights' && <Insights />}
          {screen === 'settings' && <Settings />}
          {screen === 'comm-notifications' && <CommNotifications />}
          {screen === 'notifications' && <Notifications />}
          {screen === 'alarm' && <Alarm />}
          {screen === 'messages' && <Messages />}
          {screen === 'chat-thread' && <ChatThread />}
          {screen === 'admin-users' && <AdminUsers />}
          {screen === 'admin-ads' && <AdminAds />}
          {screen === 'ad-page' && <AdPage />}
          {screen === 'evening-reflection' && <EveningReflection />}
          {screen === 'settings-home-screen' && <SettingsHomeScreen />}
          {screen === 'settings-default-visibility' && <SettingsDefaultVisibility />}
          {screen === 'settings-profile-visibility' && <SettingsProfileVisibility />}
          {screen === 'settings-google-calendar' && <SettingsGoogleCalendar />}
          {screen === 'settings-change-username' && <SettingsChangeUsername />}
        </div>
        {showAdStrip && (
          <AdStrip
            slotKey={
              screen === 'mypage' ? 'mypage' : screen === 'community-detail' ? 'community-detail' : 'otherProfile'
            }
          />
        )}
      </div>
      {showNav && <BottomNav />}
      <RecordModal />
      <PostDetailSheet />
      <SyncConfirmSheet />
      <SyncAlarm />
      <AdModal />
      <HomePrompt />
      <WelcomeAnimation />
    </div>
  )
}
