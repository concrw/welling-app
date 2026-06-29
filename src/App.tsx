import { useAppStore } from './store/appStore'
import Onboarding from './screens/Onboarding'
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

  const isOnboarding = ONBOARDING_SCREENS.includes(screen)
  const showNav = NAV_SCREENS.includes(screen)
  const showAdStrip = !isOnboarding && (screen === 'mypage' || screen === 'other-profile')

  return (
    <div style={{
      width: 390,
      minHeight: 844,
      borderRadius: 20,
      boxShadow: '0 16px 48px rgba(0,0,0,.14)',
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
        </div>
        {showAdStrip && <AdStrip />}
        {showNav && <BottomNav />}
      </div>
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
