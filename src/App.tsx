import { lazy, Suspense, useEffect, useRef, type ComponentType } from 'react'
import { useAppStore, type Screen } from './store/appStore'
import Onboarding from './screens/Onboarding'
import Feed from './screens/Feed'
import BottomNav from './components/BottomNav'
import { AsyncErrorBoundary, BrandedLoading } from './components/AsyncBoundary'
import { lazyWithReload } from './lib/lazyWithReload'

const imports = {
  ResetPassword: () => import('./screens/ResetPassword'), SocialNickname: () => import('./screens/SocialNickname'),
  Explore: () => import('./screens/Explore'), MyPage: () => import('./screens/MyPage'), Ranking: () => import('./screens/Ranking'),
  OtherProfile: () => import('./screens/OtherProfile'), CommunityDetail: () => import('./screens/CommunityDetail'),
  NewCommunity: () => import('./screens/NewCommunity'), CommunityEdit: () => import('./screens/CommunityEdit'),
  CommunitySettings: () => import('./screens/CommunitySettings'), RoutineEdit: () => import('./screens/RoutineEdit'),
  RoutineHistory: () => import('./screens/RoutineHistory'), RoutinePrivacy: () => import('./screens/RoutinePrivacy'),
  GoalVsActual: () => import('./screens/GoalVsActual'), Insights: () => import('./screens/Insights'), Settings: () => import('./screens/Settings'),
  CommNotifications: () => import('./screens/CommNotifications'), Notifications: () => import('./screens/Notifications'),
  Alarm: () => import('./screens/Alarm'), AdminUsers: () => import('./screens/AdminUsers'), EveningReflection: () => import('./screens/EveningReflection'),
  SettingsHomeScreen: () => import('./screens/SettingsHomeScreen'), SettingsDefaultVisibility: () => import('./screens/SettingsDefaultVisibility'),
  SettingsProfileVisibility: () => import('./screens/SettingsProfileVisibility'), SettingsGoogleCalendar: () => import('./screens/SettingsGoogleCalendar'),
  SettingsChangeUsername: () => import('./screens/SettingsChangeUsername'), SettingsDeleteAccount: () => import('./screens/SettingsDeleteAccount'),
  RecordModal: () => import('./overlays/RecordModal'), PostDetailSheet: () => import('./overlays/PostDetailSheet'),
  SyncConfirmSheet: () => import('./overlays/SyncConfirmSheet'), SyncAlarm: () => import('./overlays/SyncAlarm'),
  HomePrompt: () => import('./overlays/HomePrompt'), WelcomeAnimation: () => import('./overlays/WelcomeAnimation'),
}

const lazyComponent = <T extends { default: ComponentType<unknown> }>(load: () => Promise<T>) => lazy(lazyWithReload(load))
const ResetPassword = lazyComponent(imports.ResetPassword), SocialNickname = lazyComponent(imports.SocialNickname)
const Explore = lazyComponent(imports.Explore), MyPage = lazyComponent(imports.MyPage), Ranking = lazyComponent(imports.Ranking)
const OtherProfile = lazyComponent(imports.OtherProfile), CommunityDetail = lazyComponent(imports.CommunityDetail)
const NewCommunity = lazyComponent(imports.NewCommunity), CommunityEdit = lazyComponent(imports.CommunityEdit), CommunitySettings = lazyComponent(imports.CommunitySettings)
const RoutineEdit = lazyComponent(imports.RoutineEdit), RoutineHistory = lazyComponent(imports.RoutineHistory), RoutinePrivacy = lazyComponent(imports.RoutinePrivacy)
const GoalVsActual = lazyComponent(imports.GoalVsActual), Insights = lazyComponent(imports.Insights), Settings = lazyComponent(imports.Settings)
const CommNotifications = lazyComponent(imports.CommNotifications), Notifications = lazyComponent(imports.Notifications), Alarm = lazyComponent(imports.Alarm)
const AdminUsers = lazyComponent(imports.AdminUsers), EveningReflection = lazyComponent(imports.EveningReflection)
const SettingsHomeScreen = lazyComponent(imports.SettingsHomeScreen), SettingsDefaultVisibility = lazyComponent(imports.SettingsDefaultVisibility)
const SettingsProfileVisibility = lazyComponent(imports.SettingsProfileVisibility), SettingsGoogleCalendar = lazyComponent(imports.SettingsGoogleCalendar)
const SettingsChangeUsername = lazyComponent(imports.SettingsChangeUsername), SettingsDeleteAccount = lazyComponent(imports.SettingsDeleteAccount)
const RecordModal = lazyComponent(imports.RecordModal), PostDetailSheet = lazyComponent(imports.PostDetailSheet)
const SyncConfirmSheet = lazyComponent(imports.SyncConfirmSheet), SyncAlarm = lazyComponent(imports.SyncAlarm)
const HomePrompt = lazyComponent(imports.HomePrompt), WelcomeAnimation = lazyComponent(imports.WelcomeAnimation)

const ONBOARDING_SCREENS: Screen[] = ['onboarding-username', 'onboarding-preview', 'onboarding-follow', 'onboarding-firstrecord']
const NAV_SCREENS: Screen[] = ['feed', 'explore', 'ranking', 'mypage']

function removeInviteFromUrl() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('invite')) return
  url.searchParams.delete('invite')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  sessionStorage.removeItem('welling_processed_invite')
}

export default function App() {
  const screen = useAppStore((s) => s.screen), authInitializing = useAppStore((s) => s.authInitializing)
  const isDemo = useAppStore((s) => s.isDemo), checkPendingInvite = useAppStore((s) => s.checkPendingInvite)
  const pendingInviteCode = useAppStore((s) => s.pendingInviteCode), toastMessage = useAppStore((s) => s.toastMessage)
  const loadNotifications = useAppStore((s) => s.loadNotifications), showRecordModal = useAppStore((s) => s.showRecordModal)
  const showPostDetail = useAppStore((s) => s.showPostDetail), showSyncConfirm = useAppStore((s) => s.showSyncConfirm)
  const showSyncAlarm = useAppStore((s) => s.showSyncAlarm), showHomePrompt = useAppStore((s) => s.showHomePrompt)
  const showWelcomeAnimation = useAppStore((s) => s.showWelcomeAnimation)
  const inviteCheckFinished = useRef(false), hadPendingInvite = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search), inviteCode = params.get('invite')
    const processedInvite = sessionStorage.getItem('welling_processed_invite')
    if (inviteCode && processedInvite !== inviteCode) {
      localStorage.setItem('welling_pending_invite', JSON.stringify({ code: inviteCode, savedAt: Date.now() }))
      sessionStorage.setItem('welling_processed_invite', inviteCode)
    }
    void checkPendingInvite().then(() => {
      inviteCheckFinished.current = true
      if (useAppStore.getState().pendingInviteCode) hadPendingInvite.current = true
      else if (inviteCode) removeInviteFromUrl()
    })
  }, [checkPendingInvite])

  useEffect(() => {
    if (pendingInviteCode) hadPendingInvite.current = true
    else if (inviteCheckFinished.current && hadPendingInvite.current) { removeInviteFromUrl(); hadPendingInvite.current = false }
  }, [pendingInviteCode])

  useEffect(() => {
    if (isDemo) return
    const refresh = () => { if (document.visibilityState === 'visible') void loadNotifications() }
    let intervalId: ReturnType<typeof setInterval> | null = document.visibilityState === 'visible' ? setInterval(refresh, 60_000) : null
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') { refresh(); if (!intervalId) intervalId = setInterval(refresh, 60_000) }
      else if (intervalId) { clearInterval(intervalId); intervalId = null }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => { document.removeEventListener('visibilitychange', onVisibilityChange); if (intervalId) clearInterval(intervalId) }
  }, [isDemo, loadNotifications])

  useEffect(() => {
    const prefetch = () => { void imports.MyPage(); void imports.RecordModal(); void imports.Notifications() }
    const idleWindow = window as unknown as { requestIdleCallback?: (callback: () => void) => number; cancelIdleCallback?: (id: number) => void }
    if (idleWindow.requestIdleCallback) { const id = idleWindow.requestIdleCallback(prefetch); return () => idleWindow.cancelIdleCallback?.(id) }
    const id = window.setTimeout(prefetch, 1200)
    return () => window.clearTimeout(id)
  }, [])

  if (authInitializing && !isDemo) return <div style={{ minHeight: '100dvh', position: 'relative' }}><BrandedLoading />{toastMessage && <Toast message={toastMessage} />}</div>

  const isOnboarding = ONBOARDING_SCREENS.includes(screen), showNav = NAV_SCREENS.includes(screen)
  const overlayKey = `${showRecordModal}-${showPostDetail}-${showSyncConfirm}-${showSyncAlarm}-${showHomePrompt}-${showWelcomeAnimation}`
  return (
    <div className="app-shell" style={{ overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', background: '#FFFFFF', color: '#111111', fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}><div style={{ flex: 1, overflowY: 'auto', minHeight: 0, overscrollBehavior: 'none' }}>
        <AsyncErrorBoundary key={screen}><Suspense fallback={<BrandedLoading />}>
          {isOnboarding && <Onboarding />}{screen === 'reset-password' && <ResetPassword />}{screen === 'social-nickname' && <SocialNickname />}
          {screen === 'feed' && <Feed />}{screen === 'explore' && <Explore />}{screen === 'mypage' && <MyPage />}{screen === 'ranking' && <Ranking />}
          {screen === 'other-profile' && <OtherProfile />}{screen === 'community-detail' && <CommunityDetail />}{screen === 'new-community' && <NewCommunity />}
          {screen === 'community-edit' && <CommunityEdit />}{screen === 'community-settings' && <CommunitySettings />}{screen === 'routine-edit' && <RoutineEdit />}
          {screen === 'routine-history' && <RoutineHistory />}{screen === 'routine-privacy' && <RoutinePrivacy />}{screen === 'goal-vs-actual' && <GoalVsActual />}
          {screen === 'insights' && <Insights />}{screen === 'settings' && <Settings />}{screen === 'comm-notifications' && <CommNotifications />}
          {screen === 'notifications' && <Notifications />}{screen === 'alarm' && <Alarm />}{screen === 'admin-users' && <AdminUsers />}
          {screen === 'evening-reflection' && <EveningReflection />}{screen === 'settings-home-screen' && <SettingsHomeScreen />}
          {screen === 'settings-default-visibility' && <SettingsDefaultVisibility />}{screen === 'settings-profile-visibility' && <SettingsProfileVisibility />}
          {screen === 'settings-google-calendar' && <SettingsGoogleCalendar />}{screen === 'settings-change-username' && <SettingsChangeUsername />}
          {screen === 'settings-delete-account' && <SettingsDeleteAccount />}
        </Suspense></AsyncErrorBoundary>
      </div></div>
      {showNav && <BottomNav />}
      <AsyncErrorBoundary compact key={overlayKey}><Suspense fallback={null}>
        {showRecordModal && <RecordModal />}{showPostDetail && <PostDetailSheet />}{showSyncConfirm && <SyncConfirmSheet />}
        {showSyncAlarm && <SyncAlarm />}{showHomePrompt && <HomePrompt />}{showWelcomeAnimation && <WelcomeAnimation />}
      </Suspense></AsyncErrorBoundary>
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  )
}

function Toast({ message }: { message: string }) {
  return <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#111111', color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, zIndex: 999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>{message}</div>
}
