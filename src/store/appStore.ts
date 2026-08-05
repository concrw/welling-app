import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabaseClient'
import { fetchTodayEvents, isConnected as isCalendarConnected } from '../lib/googleCalendar'
import { getMessages } from '../i18n'
import { daysAgo, generateHistoricalPosts, SAMPLE_POSTS, SAMPLE_COMMUNITIES, SAMPLE_USERS, SAMPLE_NOTIFS } from '../data/demo'
import { DEMO_AD_SLOTS, DEMO_ROUTINE_GROUPS, DEMO_ADMIN_REPORTS, DEMO_SYNC_ALARM_DATE } from '../data/demoState'

export type Screen =
  | 'onboarding-username'
  | 'onboarding-preview'
  | 'onboarding-follow'
  | 'onboarding-firstrecord'
  | 'feed'
  | 'explore'
  | 'mypage'
  | 'ranking'
  | 'other-profile'
  | 'community-detail'
  | 'new-community'
  | 'routine-edit'
  | 'routine-history'
  | 'routine-privacy'
  | 'goal-vs-actual'
  | 'insights'
  | 'settings'
  | 'comm-notifications'
  | 'notifications'
  | 'alarm'
  | 'messages'
  | 'chat-thread'
  | 'admin-users'
  | 'admin-ads'
  | 'ad-page'
  | 'evening-reflection'
  | 'settings-home-screen'
  | 'settings-default-visibility'
  | 'settings-profile-visibility'
  | 'settings-google-calendar'
  | 'settings-change-username'

export type NavTab = 'feed' | 'explore' | 'ranking' | 'mypage'

export type AdSlotKey = 'explore' | 'ranking' | 'mypage' | 'otherProfile' | 'community-detail'

export type PostCategory = 'habit' | 'diet' | 'reflection' | 'routine'
export type PostVisibility = 'public' | 'followers' | 'private'

export interface Post {
  id: string
  user: string
  initials: string
  color: string
  content: string
  community: string
  time: string
  createdAt: number
  liked: boolean
  reactions: Record<string, number>
  comments?: Array<{ user: string; text: string }>
  userId?: string
  hasInsta?: boolean
  instaUrl?: string
  hasImg?: boolean
  imgUrl?: string
  category?: PostCategory
  visibility?: PostVisibility
  myReactions?: Set<string>
}

export interface Community {
  id: string
  name: string
  initial: string
  color: string
  members: number
  focus: string
  desc: string
  joined: boolean
}

export interface User {
  id: string
  name: string
  handle: string
  initials: string
  color: string
  bio: string
  followers: number
  following: number
  followed: boolean
  synced: boolean
  routines: { group: string; items: string }[]
  routineGoals: RoutineGroupData[]
}

export interface Notification {
  id: string
  user: string
  type: 'like' | 'follow' | 'comment'
  text: string
  read: boolean
  time: string
  bgColor?: string
  preview?: string
}

export interface RoutineItemData {
  id: string
  name: string
  time: string
  desc: string
  imgUrl?: string
}

export interface RoutineGroupData {
  id: string
  name: string
  items: RoutineItemData[]
}

export interface RoutineHistoryEntry {
  id: string
  startDate: number
  endDate: number
  groups: RoutineGroupData[]
}

export interface RoutinePrivacyItem {
  name: string
  on: boolean
}

export interface RoutinePrivacyGroup {
  name: string
  on: boolean
  items: RoutinePrivacyItem[]
}

export interface EveningReflectionEntry {
  date: string
  answers: string[]
}

export interface CalendarEventSnapshot {
  date: string
  eventTitles: string[]
}

export interface RoutineSuggestion {
  itemName: string
  userCount: number
}

export interface AdminUserRecord {
  id: string
  name: string
  followers: number
  suspended: boolean
}

export interface AdminReportRecord {
  id: string
  user: string
  initials: string
  count: number
  content: string
  reason: string
  status: 'open' | 'dismissed' | 'deleted'
}

export interface AdminPostReportRecord {
  id: string
  postId: string
  postContent: string
  reporterNickname: string
  reason: string
  status: 'open' | 'dismissed' | 'deleted'
}

export interface CommNotifEntry {
  id: string
  master: boolean
  options: boolean[]
}

export interface AlarmSyncedItem {
  id: string
  on: boolean
}

export interface AlarmCommItem {
  id: string
  on: boolean
}

export interface CustomQuickButton {
  id: string
  label: string
}

interface AppState {
  screen: Screen
  prevScreen: Screen | null
  navTab: NavTab

  nickname: string
  nicknameInput: string
  isDemo: boolean
  userId: string | null
  emailInput: string
  passwordInput: string
  authMode: 'signup' | 'login'
  authError: string
  authLoading: boolean
  authInitializing: boolean

  followedUsers: Set<string>
  onboardingFollowed: Set<string>

  posts: Post[]
  communities: Community[]
  suggestedUsers: User[]
  notifications: Notification[]
  myFollowersCount: number
  myFollowingCount: number

  activeCommunityTab: string
  communityTabOrder: string[]
  mypageTab: 'routine' | 'dashboard'
  rankingTab: string
  dashboardPeriod: string
  expandedPrev: boolean
  searchQuery: string
  newCommName: string
  newCommDesc: string
  commVisibility: 'public' | 'private'

  selectedCommunity: Community | null
  selectedUser: User | null

  isAdmin: boolean
  showRecordModal: boolean

  syncedList: Set<string>
  showSyncSheet: boolean
  selectedSyncUser: User | null
  showSyncAlarm: boolean
  showPostDetail: boolean
  selectedPost: Post | null
  showAdModal: boolean
  adModalData: { brand: string; desc: string; modalTitle?: string; modalBody?: string; ctaLabel?: string; slotKey?: AdSlotKey } | null
  showHomePrompt: boolean
  hasPromptedHome: boolean
  homeScreenIsRecord: boolean
  showWelcomeAnimation: boolean
  pendingRecordAfterWelcome: boolean
  defaultVisibility: 'public' | 'followers' | 'private'
  profileVisibility: 'public' | 'followers' | 'private'
  nicknameEditInput: string
  onboardingAnimating: boolean

  adSlots: Record<AdSlotKey, { brand: string; desc: string; clickAction: 'link' | 'modal' | 'page'; url: string; modalTitle: string; modalBody: string; pageId: string }>
  chatUser: string
  syncSheetUserName: string
  syncSheetAlarms: Array<{ time: string; items: string; group: string }>
  showSyncConfirm: boolean
  syncAlarmHasImg: boolean
  syncAlarmBgImg: string
  syncAlarmFallbackGrad: string
  syncAlarmStatusTime: string
  syncAlarmClockDisplay: string
  syncAlarmDate: string
  syncAlarmUserColor: string
  syncAlarmUserInitial: string
  syncAlarmUserDisplay: string
  syncAlarmGroupLabel: string
  syncAlarmContent: string

  routineGroups: RoutineGroupData[]
  routineHistory: RoutineHistoryEntry[]
  currentRoutineStartDate: number
  currentRoutineGroupIds: string[]
  routineItemIdByName: Map<string, string>
  routinePrivacy: RoutinePrivacyGroup[]
  eveningReflections: EveningReflectionEntry[]
  calendarSnapshots: CalendarEventSnapshot[]
  commNotifSettings: CommNotifEntry[]
  alarmSyncedSettings: AlarmSyncedItem[]
  alarmCommSettings: AlarmCommItem[]
  adminUsers: AdminUserRecord[]
  adminReports: AdminReportRecord[]
  adminPostReports: AdminPostReportRecord[]
  customQuickButtons: CustomQuickButton[]

  // actions
  setChatUser: (name: string) => void
  navigate: (screen: Screen) => void
  goBack: () => void
  setNavTab: (tab: NavTab) => void
  setNicknameInput: (v: string) => void
  setEmailInput: (v: string) => void
  setPasswordInput: (v: string) => void
  setAuthMode: (m: 'signup' | 'login') => void
  submitNickname: () => Promise<void>
  submitLogin: () => Promise<void>
  restoreSession: () => Promise<void>
  goFeedDemo: () => void
  goToMain: () => void
  goToMainWithRecord: () => void
  commitOnboardingFollows: () => Promise<void>
  setActiveCommunityTab: (tab: string) => void
  setCommunityTabOrder: (order: string[]) => void
  setMypageTab: (tab: 'routine' | 'dashboard') => void
  setRankingTab: (tab: string) => void
  setDashboardPeriod: (p: string) => void
  toggleExpandPrev: () => void
  setSearchQuery: (q: string) => void
  toggleFollowUser: (userId: string) => Promise<void>
  toggleFollowOnboard: (userId: string) => void
  loadSuggestedUsers: () => Promise<void>
  toggleJoinCommunity: (communityId: string) => Promise<void>
  toggleLikePost: (postId: string) => Promise<void>
  toggleReaction: (postId: string, reactionType: string) => Promise<void>
  addComment: (postId: string, text: string) => Promise<void>
  addPost: (content: string, imgUrl?: string, category?: PostCategory, visibility?: PostVisibility, communityId?: string | null, instaUrl?: string) => Promise<void>
  loadFeedData: () => Promise<void>
  selectCommunity: (c: Community) => void
  selectUser: (u: User) => void
  setNewCommName: (v: string) => void
  setNewCommDesc: (v: string) => void
  setCommVisibility: (v: 'public' | 'private') => void
  createCommunity: () => Promise<void>
  markNotificationsRead: () => void
  markAllRead: () => Promise<void>
  markSingleRead: (id: string) => Promise<void>
  loadNotifications: () => Promise<void>
  openRecordModal: () => void
  closeRecordModal: () => void
  openSyncSheet: (user: User) => void
  closeSyncSheet: () => void
  confirmSync: () => void
  dismissSyncAlarm: () => void
  completeRoutineSync: () => void
  closeSyncAlarm: () => void
  completeSyncAlarm: () => void
  openPostDetail: (post: Post) => void
  closePostDetail: () => void
  openAdModal: (data: { brand: string; desc: string; modalTitle?: string; modalBody?: string; ctaLabel?: string; slotKey?: AdSlotKey }) => void
  closeAdModal: () => void
  setAdPageData: (data: { brand: string; desc: string; slotKey: AdSlotKey }) => void
  acceptHomePrompt: () => void
  dismissHomePrompt: () => void
  showWelcomeAnim: () => void
  dismissWelcomeAnimation: () => void
  toggleSyncUser: (userId: string) => void
  setAdSlot: (key: AdSlotKey, data: Partial<AppState['adSlots']['explore']>) => void
  closeSyncConfirm: () => void
  setDefaultVisibility: (v: 'public' | 'followers' | 'private') => void
  setProfileVisibility: (v: 'public' | 'followers' | 'private') => void
  setNicknameEditInput: (v: string) => void
  submitNicknameEdit: () => void
  signOut: () => void

  saveRoutineGroups: (groups: RoutineGroupData[]) => Promise<void>
  startNewRoutinePeriod: (groups: RoutineGroupData[]) => Promise<void>
  saveRoutinePrivacy: (privacy: RoutinePrivacyGroup[]) => Promise<void>
  loadRoutineData: () => Promise<void>
  saveEveningReflection: (entry: EveningReflectionEntry) => Promise<void>
  loadEveningReflections: () => Promise<void>
  syncTodayCalendarSnapshot: () => Promise<void>
  loadCalendarSnapshots: () => Promise<void>
  fetchRoutineSuggestions: (keyword: string) => Promise<RoutineSuggestion[]>
  saveCommNotifSettings: (settings: CommNotifEntry[]) => Promise<void>
  saveAlarmSettings: (synced: AlarmSyncedItem[], comms: AlarmCommItem[]) => Promise<void>
  loadNotificationSettings: () => Promise<void>

  toggleUserSuspend: (id: string) => Promise<void>
  dismissReport: (id: string) => Promise<void>
  deleteReport: (id: string) => Promise<void>
  reportPost: (postId: string, reason: string) => Promise<void>
  dismissPostReport: (id: string) => Promise<void>
  deletePostReport: (id: string) => Promise<void>
  loadAdminData: () => Promise<void>

  addCustomQuickButton: (label: string) => Promise<void>
  updateCustomQuickButton: (id: string, label: string) => Promise<void>
  removeCustomQuickButton: (id: string) => Promise<void>
  loadCustomQuickButtons: () => Promise<void>
}

async function insertRoutineGroups(userId: string, groups: RoutineGroupData[]): Promise<string[]> {
  const newIds: string[] = []
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi]
    const { data: groupRow, error } = await supabase
      .from('routine_groups')
      .insert({ user_id: userId, name: group.name, sort_order: gi, is_current: true, is_public: true })
      .select()
      .single()
    if (error || !groupRow) continue
    newIds.push(groupRow.id)
    if (group.items.length > 0) {
      await supabase.from('routine_items').insert(
        group.items.map((item, ii) => ({
          group_id: groupRow.id,
          name: item.name,
          time: item.time,
          desc: item.desc,
          img_url: item.imgUrl ?? null,
          sort_order: ii,
        }))
      )
    }
  }
  return newIds
}

async function replaceCurrentRoutineGroups(userId: string, groups: RoutineGroupData[], previousGroupIds: string[]): Promise<string[]> {
  if (previousGroupIds.length > 0) {
    await supabase.from('routine_groups').delete().in('id', previousGroupIds)
  }
  return insertRoutineGroups(userId, groups)
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  screen: 'onboarding-username',
  prevScreen: null,
  navTab: 'feed',

  nickname: '',
  nicknameInput: '',
  isDemo: false,
  userId: null,
  emailInput: '',
  passwordInput: '',
  authMode: 'signup',
  authError: '',
  authLoading: false,
  authInitializing: true,

  followedUsers: new Set(),
  onboardingFollowed: new Set(),

  posts: [...SAMPLE_POSTS, ...generateHistoricalPosts()],
  communities: SAMPLE_COMMUNITIES,
  suggestedUsers: SAMPLE_USERS,
  notifications: SAMPLE_NOTIFS,
  myFollowersCount: 0,
  myFollowingCount: 0,

  activeCommunityTab: 'morning-runners',
  communityTabOrder: ['morning-runners', 'clean-eaters', 'book-club', 'office-workout'],
  mypageTab: 'dashboard',
  rankingTab: 'All',
  dashboardPeriod: 'All time',
  expandedPrev: true,
  searchQuery: '',
  newCommName: '',
  newCommDesc: '',
  commVisibility: 'public',

  selectedCommunity: null,
  selectedUser: null,

  isAdmin: false,
  showRecordModal: false,

  syncedList: new Set(),
  showSyncSheet: false,
  selectedSyncUser: null,
  showSyncAlarm: false,
  showPostDetail: false,
  selectedPost: null,
  showAdModal: false,
  adModalData: null,
  showHomePrompt: false,
  hasPromptedHome: false,
  homeScreenIsRecord: false,
  showWelcomeAnimation: false,
  pendingRecordAfterWelcome: false,
  onboardingAnimating: false,
  defaultVisibility: 'public',
  profileVisibility: 'public',
  nicknameEditInput: '',

  adSlots: DEMO_AD_SLOTS,
  routineGroups: DEMO_ROUTINE_GROUPS,
  routineHistory: [],
  currentRoutineStartDate: daysAgo(20, 0, 0),
  currentRoutineGroupIds: [],
  routineItemIdByName: new Map(),
  routinePrivacy: [
    {
      name: 'Morning Routine',
      on: true,
      items: [{ name: 'Morning Walk', on: true }, { name: 'Cold Shower', on: true }, { name: 'Meditation', on: false }, { name: 'Journaling', on: false }],
    },
    {
      name: 'Evening Routine',
      on: true,
      items: [{ name: 'Running 5km', on: true }, { name: 'Stretching', on: true }, { name: 'Reading', on: true }],
    },
  ],
  eveningReflections: [],
  calendarSnapshots: [],
  commNotifSettings: [],
  alarmSyncedSettings: [
    { id: 's1', on: true },
    { id: 's2', on: false },
  ],
  alarmCommSettings: [
    { id: 'c1', on: true },
    { id: 'c2', on: true },
    { id: 'c3', on: false },
  ],
  adminUsers: [
    { id: 'u1', name: 'Jay', followers: 1243, suspended: false },
    { id: 'u2', name: 'Sora', followers: 892, suspended: false },
    { id: 'u3', name: 'Tom', followers: 231, suspended: true },
    { id: 'u4', name: 'Mina', followers: 567, suspended: false },
    { id: 'u5', name: 'Kevin', followers: 412, suspended: false },
    { id: 'u6', name: 'Dana', followers: 334, suspended: false },
    { id: 'u7', name: 'Ryan', followers: 789, suspended: false },
    { id: 'u8', name: 'Lily', followers: 102, suspended: true },
    { id: 'u9', name: 'Eric', followers: 1501, suspended: false },
    { id: 'u10', name: 'Nina', followers: 655, suspended: false },
  ],
  adminReports: DEMO_ADMIN_REPORTS,
  adminPostReports: [],
  customQuickButtons: [],

  chatUser: '',
  syncSheetUserName: '',
  syncSheetAlarms: [],
  showSyncConfirm: false,
  syncAlarmHasImg: false,
  syncAlarmBgImg: '',
  syncAlarmFallbackGrad: 'linear-gradient(160deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
  syncAlarmStatusTime: '9:41',
  syncAlarmClockDisplay: '09:41',
  syncAlarmDate: DEMO_SYNC_ALARM_DATE,
  syncAlarmUserColor: '#6366F1',
  syncAlarmUserInitial: 'W',
  syncAlarmUserDisplay: '',
  syncAlarmGroupLabel: '',
  syncAlarmContent: '',

  setChatUser: (name) => set({ chatUser: name }),

  navigate: (screen) => set((s) => ({ screen, prevScreen: s.screen })),

  goBack: () => set((s) => ({ screen: s.prevScreen ?? 'feed', prevScreen: null })),

  setNavTab: (tab) => {
    const screenMap: Record<NavTab, Screen> = { feed: 'feed', explore: 'explore', ranking: 'ranking', mypage: 'mypage' }
    set({ navTab: tab, screen: screenMap[tab], prevScreen: null })
  },

  setNicknameInput: (v) => set({ nicknameInput: v }),
  setEmailInput: (v) => set({ emailInput: v }),
  setPasswordInput: (v) => set({ passwordInput: v }),
  setAuthMode: (m) => set({ authMode: m, authError: '' }),

  submitNickname: async () => {
    const { nicknameInput, emailInput, passwordInput } = get()
    const trimmed = nicknameInput.trim()
    if (trimmed.length < 2) return
    set({ authLoading: true, authError: '' })
    const { data, error } = await supabase.auth.signUp({ email: emailInput, password: passwordInput })
    if (error || !data.user) {
      set({ authLoading: false, authError: error?.message ?? getMessages().store.signupFailed })
      return
    }
    const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, nickname: trimmed })
    if (profileError) {
      set({ authLoading: false, authError: profileError.message })
      return
    }
    set({
      nickname: trimmed,
      userId: data.user.id,
      isDemo: false,
      authLoading: false,
      screen: 'onboarding-preview',
      prevScreen: 'onboarding-username',
    })
    get().loadFeedData()
    get().loadSuggestedUsers()
    get().loadNotifications()
    get().loadRoutineData()
    get().loadEveningReflections()
    get().loadCalendarSnapshots()
    get().syncTodayCalendarSnapshot()
    get().loadNotificationSettings()
    get().loadAdminData()
    get().loadCustomQuickButtons()
  },

  submitLogin: async () => {
    const { emailInput, passwordInput } = get()
    set({ authLoading: true, authError: '' })
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput })
    if (error || !data.user) {
      set({ authLoading: false, authError: error?.message ?? getMessages().store.loginFailed })
      return
    }
    const { data: profile } = await supabase.from('profiles').select('nickname, is_admin').eq('id', data.user.id).single()
    set({
      nickname: profile?.nickname ?? '',
      userId: data.user.id,
      isDemo: false,
      isAdmin: profile?.is_admin ?? false,
      authLoading: false,
      screen: 'feed',
      navTab: 'feed',
      prevScreen: null,
    })
    get().loadFeedData()
    get().loadSuggestedUsers()
    get().loadNotifications()
    get().loadRoutineData()
    get().loadEveningReflections()
    get().loadCalendarSnapshots()
    get().syncTodayCalendarSnapshot()
    get().loadNotificationSettings()
    get().loadAdminData()
    get().loadCustomQuickButtons()
  },

  restoreSession: async () => {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    if (!user) {
      set({ authInitializing: false })
      return
    }
    const { data: profile } = await supabase.from('profiles').select('nickname, is_admin').eq('id', user.id).single()
    set({
      nickname: profile?.nickname ?? '',
      userId: user.id,
      isDemo: false,
      isAdmin: profile?.is_admin ?? false,
      authInitializing: false,
      screen: 'feed',
      navTab: 'feed',
    })
    get().loadFeedData()
    get().loadSuggestedUsers()
    get().loadNotifications()
    get().loadRoutineData()
    get().loadEveningReflections()
    get().loadCalendarSnapshots()
    get().syncTodayCalendarSnapshot()
    get().loadNotificationSettings()
    get().loadAdminData()
    get().loadCustomQuickButtons()
  },

  goFeedDemo: () => set({ nickname: 'Min', isDemo: true, userId: null, screen: 'feed', navTab: 'feed', prevScreen: null }),

  goToMain: () => {
    set({ screen: 'feed', navTab: 'feed', prevScreen: null, showWelcomeAnimation: true })
    get().commitOnboardingFollows()
  },

  goToMainWithRecord: () => {
    set({ onboardingAnimating: true })
    setTimeout(() => {
      set({ screen: 'feed', navTab: 'feed', prevScreen: null, onboardingAnimating: false, showWelcomeAnimation: true, pendingRecordAfterWelcome: true })
      get().commitOnboardingFollows()
    }, 2200)
  },

  commitOnboardingFollows: async () => {
    const { onboardingFollowed, userId, isDemo } = get()
    if (isDemo || !userId || onboardingFollowed.size === 0) return
    const rows = Array.from(onboardingFollowed).map((followeeId) => ({ follower_id: userId, followee_id: followeeId }))
    await supabase.from('follows').insert(rows)
    set((s) => ({ followedUsers: new Set([...s.followedUsers, ...onboardingFollowed]) }))
  },

  setActiveCommunityTab: (tab) => set({ activeCommunityTab: tab }),
  setCommunityTabOrder: (order) => set({ communityTabOrder: order }),

  setMypageTab: (tab) => set({ mypageTab: tab }),

  setRankingTab: (tab) => set({ rankingTab: tab }),

  setDashboardPeriod: (p) => set({ dashboardPeriod: p }),

  toggleExpandPrev: () => set((s) => ({ expandedPrev: !s.expandedPrev })),

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleFollowUser: async (userId) => {
    const { followedUsers, userId: myUserId, isDemo } = get()
    const nextFollowed = !followedUsers.has(userId)
    set((s) => {
      const next = new Set(s.followedUsers)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return { followedUsers: next }
    })
    if (isDemo || !myUserId) return
    set((s) => ({ myFollowingCount: Math.max(0, s.myFollowingCount + (nextFollowed ? 1 : -1)) }))
    if (nextFollowed) {
      await supabase.from('follows').insert({ follower_id: myUserId, followee_id: userId })
    } else {
      await supabase.from('follows').delete().eq('follower_id', myUserId).eq('followee_id', userId)
    }
  },

  toggleFollowOnboard: (userId) =>
    set((s) => {
      const next = new Set(s.onboardingFollowed)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return { onboardingFollowed: next }
    }),

  loadSuggestedUsers: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    const [{ data: profileRows }, { data: followRows }, { data: countRows }] = await Promise.all([
      supabase.from('profiles').select('id, nickname, bio').neq('id', userId),
      supabase.from('follows').select('followee_id').eq('follower_id', userId),
      supabase.from('follow_counts').select('*'),
    ])
    const followedIds = new Set((followRows ?? []).map((f) => f.followee_id))
    const countsById = new Map((countRows ?? []).map((c) => [c.user_id, c]))
    const profileIds = (profileRows ?? []).map((p) => p.id)

    const { data: groupRows } = profileIds.length
      ? await supabase.from('routine_groups').select('id, user_id, name, is_public, is_current').in('user_id', profileIds).eq('is_public', true).eq('is_current', true)
      : { data: [] as { id: string; user_id: string; name: string; is_public: boolean; is_current: boolean }[] }
    const groupIds = (groupRows ?? []).map((g) => g.id)
    const [{ data: itemRows }, { data: privacyRows }] = await Promise.all([
      groupIds.length ? supabase.from('routine_items').select('id, group_id, name, sort_order').in('group_id', groupIds).order('sort_order', { ascending: true }) : Promise.resolve({ data: [] as { id: string; group_id: string; name: string; sort_order: number }[] }),
      groupIds.length ? supabase.from('routine_privacy').select('item_id, is_public') : Promise.resolve({ data: [] as { item_id: string; is_public: boolean }[] }),
    ])
    const privateItemIds = new Set((privacyRows ?? []).filter((p) => !p.is_public).map((p) => p.item_id))
    const itemsByGroup = new Map<string, string[]>()
    for (const item of itemRows ?? []) {
      if (privateItemIds.has(item.id)) continue
      const list = itemsByGroup.get(item.group_id) ?? []
      list.push(item.name)
      itemsByGroup.set(item.group_id, list)
    }
    const groupsByUser = new Map<string, RoutineGroupData[]>()
    const routinesByUser = new Map<string, { group: string; items: string }[]>()
    for (const g of groupRows ?? []) {
      const itemNames = itemsByGroup.get(g.id) ?? []
      if (!itemNames.length) continue
      const groupsList = groupsByUser.get(g.user_id) ?? []
      groupsList.push({ id: g.id, name: g.name, items: itemNames.map((name) => ({ id: name, name, time: '', desc: '' })) })
      groupsByUser.set(g.user_id, groupsList)
      const routinesList = routinesByUser.get(g.user_id) ?? []
      routinesList.push({ group: g.name, items: itemNames.join(' · ') })
      routinesByUser.set(g.user_id, routinesList)
    }

    const palette = ['#0984E3', '#00A389', '#7C3AED', '#B45309', '#1A6B4A', '#C2600A']
    const suggestedUsers: User[] = (profileRows ?? []).map((p, i) => ({
      id: p.id,
      name: p.nickname,
      handle: p.nickname,
      initials: p.nickname[0]?.toUpperCase() ?? '?',
      color: palette[i % palette.length],
      bio: p.bio ?? '',
      followers: countsById.get(p.id)?.followers ?? 0,
      following: countsById.get(p.id)?.following ?? 0,
      followed: followedIds.has(p.id),
      synced: false,
      routines: routinesByUser.get(p.id) ?? [],
      routineGoals: groupsByUser.get(p.id) ?? [],
    }))
    set({
      suggestedUsers,
      followedUsers: followedIds,
      myFollowersCount: countsById.get(userId)?.followers ?? 0,
      myFollowingCount: countsById.get(userId)?.following ?? 0,
    })
  },

  toggleJoinCommunity: async (communityId) => {
    const { userId, isDemo, communities } = get()
    const nextJoined = !communities.find((c) => c.id === communityId)?.joined
    set((s) => ({
      communities: s.communities.map((c) =>
        c.id === communityId ? { ...c, joined: !c.joined } : c
      ),
      selectedCommunity:
        s.selectedCommunity?.id === communityId
          ? { ...s.selectedCommunity, joined: !s.selectedCommunity.joined }
          : s.selectedCommunity,
    }))
    if (isDemo || !userId) return
    if (nextJoined) {
      await supabase.from('community_members').insert({ user_id: userId, community_id: communityId })
    } else {
      await supabase.from('community_members').delete().eq('user_id', userId).eq('community_id', communityId)
    }
  },

  toggleLikePost: async (postId) => {
    const { userId, isDemo, posts } = get()
    const nextLiked = !posts.find((p) => p.id === postId)?.liked
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, liked: !p.liked } : p
      ),
    }))
    if (isDemo || !userId) return
    if (nextLiked) {
      await supabase.from('post_likes').insert({ user_id: userId, post_id: postId })
    } else {
      await supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', postId)
    }
  },

  toggleReaction: async (postId, reactionType) => {
    const { userId, isDemo, posts } = get()
    const post = posts.find((p) => p.id === postId)
    const alreadyReacted = post?.myReactions?.has(reactionType) ?? false
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== postId) return p
        const myReactions = new Set(p.myReactions ?? [])
        const reactions = { ...p.reactions }
        if (alreadyReacted) {
          myReactions.delete(reactionType)
          reactions[reactionType] = Math.max(0, (reactions[reactionType] ?? 1) - 1)
        } else {
          myReactions.add(reactionType)
          reactions[reactionType] = (reactions[reactionType] ?? 0) + 1
        }
        return { ...p, myReactions, reactions }
      }),
      selectedPost:
        s.selectedPost?.id === postId
          ? (() => {
              const myReactions = new Set(s.selectedPost.myReactions ?? [])
              const reactions = { ...s.selectedPost.reactions }
              if (alreadyReacted) {
                myReactions.delete(reactionType)
                reactions[reactionType] = Math.max(0, (reactions[reactionType] ?? 1) - 1)
              } else {
                myReactions.add(reactionType)
                reactions[reactionType] = (reactions[reactionType] ?? 0) + 1
              }
              return { ...s.selectedPost, myReactions, reactions }
            })()
          : s.selectedPost,
    }))
    if (isDemo || !userId) return
    if (alreadyReacted) {
      await supabase.from('post_reactions').delete().eq('user_id', userId).eq('post_id', postId).eq('reaction_type', reactionType)
    } else {
      await supabase.from('post_reactions').insert({ user_id: userId, post_id: postId, reaction_type: reactionType })
    }
  },

  addComment: async (postId, text) => {
    const { userId, isDemo, nickname } = get()
    const displayName = nickname || 'Min'
    if (isDemo || !userId) {
      const newComment = { user: displayName, text }
      set((s) => ({
        posts: s.posts.map((p) => p.id === postId ? { ...p, comments: [...(p.comments ?? []), newComment] } : p),
        selectedPost: s.selectedPost?.id === postId ? { ...s.selectedPost, comments: [...(s.selectedPost.comments ?? []), newComment] } : s.selectedPost,
      }))
      return
    }
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, text })
      .select()
      .single()
    if (error || !data) return
    const newComment = { user: displayName, text: data.text }
    set((s) => ({
      posts: s.posts.map((p) => p.id === postId ? { ...p, comments: [...(p.comments ?? []), newComment] } : p),
      selectedPost: s.selectedPost?.id === postId ? { ...s.selectedPost, comments: [...(s.selectedPost.comments ?? []), newComment] } : s.selectedPost,
    }))
  },

  addPost: async (content, imgUrl, category, visibility, communityId, instaUrl) => {
    const { userId, isDemo, nickname, hasPromptedHome, defaultVisibility } = get()
    const displayName = nickname || 'Min'
    const finalCategory: PostCategory = category ?? 'habit'
    const finalVisibility: PostVisibility = visibility ?? defaultVisibility
    if (isDemo || !userId) {
      const newPost: Post = {
        id: `p${Date.now()}`,
        user: displayName,
        initials: displayName[0]?.toUpperCase() ?? 'M',
        color: '#00A389',
        content,
        community: communityId ?? '',
        time: getMessages().store.justNow,
        createdAt: Date.now(),
        liked: false,
        reactions: {},
        category: finalCategory,
        visibility: finalVisibility,
        ...(imgUrl ? { hasImg: true, imgUrl } : {}),
        ...(instaUrl ? { hasInsta: true, instaUrl } : {}),
      }
      set((s) => ({
        posts: [newPost, ...s.posts],
        ...(hasPromptedHome ? {} : { showHomePrompt: true, hasPromptedHome: true }),
      }))
      return
    }
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        community_id: communityId ?? null,
        has_img: !!imgUrl,
        img_url: imgUrl ?? null,
        category: finalCategory,
        visibility: finalVisibility,
        has_insta: !!instaUrl,
        insta_url: instaUrl ?? null,
      })
      .select()
      .single()
    if (error || !data) return
    const newPost: Post = {
      id: data.id,
      user: displayName,
      initials: displayName[0]?.toUpperCase() ?? 'M',
      color: '#00A389',
      content: data.content,
      community: data.community_id,
      time: getMessages().store.justNow,
      createdAt: new Date(data.created_at).getTime(),
      liked: false,
      reactions: {},
      userId,
      category: data.category,
      visibility: data.visibility,
      ...(data.has_img ? { hasImg: true, imgUrl: data.img_url } : {}),
      ...(data.has_insta ? { hasInsta: true, instaUrl: data.insta_url } : {}),
    }
    set((s) => ({
      posts: [newPost, ...s.posts],
      ...(hasPromptedHome ? {} : { showHomePrompt: true, hasPromptedHome: true }),
    }))
  },

  loadFeedData: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    const [{ data: communityRows }, { data: memberRows }, { data: postRows }, { data: likeRows }] = await Promise.all([
      supabase.from('communities').select('*'),
      supabase.from('community_members').select('community_id').eq('user_id', userId),
      supabase.from('posts').select('*, profiles(nickname)').order('created_at', { ascending: false }),
      supabase.from('post_likes').select('post_id').eq('user_id', userId),
    ])
    const postIds = (postRows ?? []).map((p) => p.id)
    const [{ data: reactionRows }, { data: commentRows }] = await Promise.all([
      postIds.length ? supabase.from('post_reactions').select('post_id, user_id, reaction_type').in('post_id', postIds) : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from('post_comments').select('post_id, user_id, text, created_at').in('post_id', postIds).order('created_at', { ascending: true }) : Promise.resolve({ data: [] as { post_id: string; user_id: string; text: string; created_at: string }[] }),
    ])
    const commentAuthorIds = [...new Set((commentRows ?? []).map((c) => c.user_id))]
    const { data: commentAuthorRows } = commentAuthorIds.length
      ? await supabase.from('profiles').select('id, nickname').in('id', commentAuthorIds)
      : { data: [] as { id: string; nickname: string }[] }
    const nicknameById = new Map((commentAuthorRows ?? []).map((p) => [p.id, p.nickname]))
    const joinedIds = new Set((memberRows ?? []).map((m) => m.community_id))
    const likedIds = new Set((likeRows ?? []).map((l) => l.post_id))
    const reactionsByPost = new Map<string, Record<string, number>>()
    const myReactionsByPost = new Map<string, Set<string>>()
    for (const r of reactionRows ?? []) {
      const counts = reactionsByPost.get(r.post_id) ?? {}
      counts[r.reaction_type] = (counts[r.reaction_type] ?? 0) + 1
      reactionsByPost.set(r.post_id, counts)
      if (r.user_id === userId) {
        const mine = myReactionsByPost.get(r.post_id) ?? new Set<string>()
        mine.add(r.reaction_type)
        myReactionsByPost.set(r.post_id, mine)
      }
    }
    const commentsByPost = new Map<string, Array<{ user: string; text: string }>>()
    for (const c of commentRows ?? []) {
      const authorNickname = nicknameById.get(c.user_id) ?? getMessages().store.deletedUser
      const list = commentsByPost.get(c.post_id) ?? []
      list.push({ user: authorNickname, text: c.text })
      commentsByPost.set(c.post_id, list)
    }
    const communities: Community[] = (communityRows ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      initial: c.initial,
      color: c.color,
      members: c.members,
      focus: c.focus,
      desc: c.desc,
      joined: joinedIds.has(c.id),
    }))
    const posts: Post[] = (postRows ?? []).map((p) => {
      const authorNickname = (p as { profiles?: { nickname?: string } }).profiles?.nickname ?? getMessages().store.deletedUser
      return {
        id: p.id,
        user: authorNickname,
        initials: authorNickname[0]?.toUpperCase() ?? '?',
        color: '#00A389',
        content: p.content,
        community: p.community_id,
        time: '',
        createdAt: new Date(p.created_at).getTime(),
        liked: likedIds.has(p.id),
        reactions: reactionsByPost.get(p.id) ?? {},
        myReactions: myReactionsByPost.get(p.id) ?? new Set<string>(),
        comments: commentsByPost.get(p.id) ?? [],
        userId: p.user_id,
        category: p.category,
        visibility: p.visibility,
        ...(p.has_img ? { hasImg: true, imgUrl: p.img_url } : {}),
        ...(p.has_insta ? { hasInsta: true, instaUrl: p.insta_url } : {}),
      }
    })
    set({ communities, posts })
  },

  selectCommunity: (c) => set((s) => ({ selectedCommunity: c, prevScreen: s.screen, screen: 'community-detail' })),

  selectUser: (u) => set((s) => ({ selectedUser: u, prevScreen: s.screen, screen: 'other-profile' })),

  setNewCommName: (v) => set({ newCommName: v }),
  setNewCommDesc: (v) => set({ newCommDesc: v }),
  setCommVisibility: (v) => set({ commVisibility: v }),

  createCommunity: async () => {
    const { newCommName, newCommDesc, communities, userId, isDemo } = get()
    const name = newCommName.trim()
    if (!name) return
    const palette = ['#0984E3', '#00A389', '#7C3AED', '#B45309']
    const community: Community = {
      id: `comm-${Date.now()}`,
      name,
      initial: name[0].toUpperCase(),
      color: palette[communities.length % palette.length],
      members: 1,
      focus: newCommDesc.trim(),
      desc: newCommDesc.trim(),
      joined: true,
    }
    if (!isDemo && userId) {
      const { error } = await supabase.from('communities').insert({
        id: community.id,
        name: community.name,
        initial: community.initial,
        color: community.color,
        members: community.members,
        focus: community.focus,
        desc: community.desc,
      })
      if (!error) {
        await supabase.from('community_members').insert({ user_id: userId, community_id: community.id })
      }
    }
    set({
      communities: [...communities, community],
      newCommName: '',
      newCommDesc: '',
      commVisibility: 'public',
    })
  },

  markNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  markAllRead: async () => {
    const { userId, isDemo } = get()
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }))
    if (isDemo || !userId) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  },

  markSingleRead: async (id) => {
    const { userId, isDemo } = get()
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }))
    if (isDemo || !userId) return
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  },

  loadNotifications: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    const { data } = await supabase
      .from('notifications')
      .select('*, profiles!notifications_actor_id_fkey(nickname)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    const notifications: Notification[] = (data ?? []).map((n) => {
      const actorNickname = (n as { profiles?: { nickname?: string } }).profiles?.nickname ?? getMessages().store.someone
      return {
        id: n.id,
        user: actorNickname,
        type: n.type as Notification['type'],
        text: n.text,
        read: n.read,
        time: '',
      }
    })
    set({ notifications })
  },

  openRecordModal: () => set({ showRecordModal: true }),
  closeRecordModal: () => set({ showRecordModal: false }),

  openSyncSheet: (user) => {
    const alarms = user.routines.map((r) => ({ time: r.group, items: r.items, group: r.group }))
    const firstAlarm = alarms[0]
    set({
      showSyncSheet: true,
      showSyncConfirm: true,
      selectedSyncUser: user,
      syncSheetUserName: user.name,
      syncSheetAlarms: alarms,
      syncAlarmUserColor: user.color ?? '#6366F1',
      syncAlarmUserInitial: user.initials ?? user.name.charAt(0).toUpperCase(),
      syncAlarmUserDisplay: user.name,
      syncAlarmGroupLabel: firstAlarm?.group ?? '',
      syncAlarmContent: firstAlarm?.items ?? '',
    })
  },
  closeSyncSheet: () => set({ showSyncSheet: false, selectedSyncUser: null }),
  confirmSync: () => {
    const { selectedSyncUser, syncSheetAlarms, syncSheetUserName } = get()
    const firstAlarm = syncSheetAlarms[0]
    set({
      showSyncSheet: false,
      showSyncAlarm: true,
      syncAlarmUserColor: selectedSyncUser?.color ?? '#6366F1',
      syncAlarmUserInitial: selectedSyncUser?.initials ?? 'W',
      syncAlarmUserDisplay: syncSheetUserName || selectedSyncUser?.name || '',
      syncAlarmGroupLabel: firstAlarm?.group ?? '',
      syncAlarmContent: firstAlarm?.items ?? '',
    })
  },
  dismissSyncAlarm: () => {
    const { selectedSyncUser } = get()
    if (selectedSyncUser) {
      set((s) => {
        const next = new Set(s.syncedList)
        next.add(selectedSyncUser.id)
        return { showSyncAlarm: false, syncedList: next, selectedSyncUser: null }
      })
    } else {
      set({ showSyncAlarm: false })
    }
  },
  closeSyncAlarm: () => {
    const { selectedSyncUser } = get()
    if (selectedSyncUser) {
      set((s) => {
        const next = new Set(s.syncedList)
        next.add(selectedSyncUser.id)
        return { showSyncAlarm: false, syncedList: next, selectedSyncUser: null }
      })
    } else {
      set({ showSyncAlarm: false })
    }
  },
  completeRoutineSync: () => {
    const { selectedSyncUser } = get()
    if (selectedSyncUser) {
      set((s) => {
        const next = new Set(s.syncedList)
        next.add(selectedSyncUser.id)
        return { showSyncAlarm: false, syncedList: next, selectedSyncUser: null }
      })
    } else {
      set({ showSyncAlarm: false })
    }
  },
  completeSyncAlarm: () => {
    const { selectedSyncUser } = get()
    if (selectedSyncUser) {
      set((s) => {
        const next = new Set(s.syncedList)
        next.add(selectedSyncUser.id)
        return { showSyncAlarm: false, syncedList: next, selectedSyncUser: null }
      })
    } else {
      set({ showSyncAlarm: false })
    }
  },

  openPostDetail: (post) => set({ showPostDetail: true, selectedPost: post }),
  closePostDetail: () => set({ showPostDetail: false, selectedPost: null }),

  openAdModal: (data) => set({ showAdModal: true, adModalData: data }),
  closeAdModal: () => set({ showAdModal: false, adModalData: null }),
  setAdPageData: (data) => set({ adModalData: data }),

  acceptHomePrompt: () => set({ showHomePrompt: false, homeScreenIsRecord: true }),

  dismissHomePrompt: () => set({ showHomePrompt: false, homeScreenIsRecord: false }),

  showWelcomeAnim: () => set({ showWelcomeAnimation: true }),

  dismissWelcomeAnimation: () => set((s) => ({
    showWelcomeAnimation: false,
    pendingRecordAfterWelcome: false,
    showRecordModal: s.pendingRecordAfterWelcome ? true : s.showRecordModal,
  })),

  toggleSyncUser: (userId) =>
    set((s) => {
      const next = new Set(s.syncedList)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return { syncedList: next }
    }),

  setAdSlot: (key, data) => set((s) => ({ adSlots: { ...s.adSlots, [key]: { ...s.adSlots[key], ...data } } })),

  closeSyncConfirm: () => set({ showSyncConfirm: false }),

  setDefaultVisibility: (v) => set({ defaultVisibility: v }),
  setProfileVisibility: (v) => set({ profileVisibility: v }),
  setNicknameEditInput: (v) => set({ nicknameEditInput: v }),
  submitNicknameEdit: () => {
    const { nicknameEditInput } = get()
    const trimmed = nicknameEditInput.trim()
    if (!trimmed) return
    set({ nickname: trimmed, nicknameEditInput: '' })
  },
  saveRoutineGroups: async (groups) => {
    const { userId, isDemo, currentRoutineGroupIds } = get()
    set({ routineGroups: groups })
    if (isDemo || !userId) return
    const newIds = await replaceCurrentRoutineGroups(userId, groups, currentRoutineGroupIds)
    set({ currentRoutineGroupIds: newIds })
  },

  startNewRoutinePeriod: async (groups) => {
    const { userId, isDemo, currentRoutineGroupIds } = get()
    set((s) => ({
      routineHistory: [
        { id: `rh${Date.now()}`, startDate: s.currentRoutineStartDate, endDate: Date.now(), groups: s.routineGroups },
        ...s.routineHistory,
      ],
      routineGroups: groups,
      currentRoutineStartDate: Date.now(),
    }))
    if (isDemo || !userId) return
    if (currentRoutineGroupIds.length > 0) {
      await supabase.from('routine_groups').update({ period_end: new Date().toISOString(), is_current: false }).in('id', currentRoutineGroupIds)
    }
    const newIds = await insertRoutineGroups(userId, groups)
    set({ currentRoutineGroupIds: newIds })
  },

  saveRoutinePrivacy: async (privacy) => {
    const { userId, isDemo, routineItemIdByName } = get()
    set({ routinePrivacy: privacy })
    if (isDemo || !userId) return
    const rows: { item_id: string; is_public: boolean }[] = []
    for (const group of privacy) {
      for (const item of group.items) {
        const itemId = routineItemIdByName.get(item.name)
        if (itemId) rows.push({ item_id: itemId, is_public: item.on })
      }
    }
    if (rows.length > 0) {
      await supabase.from('routine_privacy').upsert(rows)
    }
  },

  loadRoutineData: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    const { data: groupRows } = await supabase
      .from('routine_groups')
      .select('*, routine_items(*)')
      .eq('user_id', userId)
      .eq('is_current', true)
      .order('sort_order', { ascending: true })
    if (!groupRows || groupRows.length === 0) {
      set({
        routineGroups: [],
        routineHistory: [],
        currentRoutineStartDate: Date.now(),
        currentRoutineGroupIds: [],
        routinePrivacy: [],
        routineItemIdByName: new Map(),
      })
      return
    }
    const itemIdByName = new Map<string, string>()
    const routineGroups: RoutineGroupData[] = groupRows.map((g) => ({
      id: g.id,
      name: g.name,
      items: (g.routine_items ?? [])
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((item: { id: string; name: string; time: string; desc: string; img_url: string | null }) => {
          itemIdByName.set(item.name, item.id)
          return { id: item.id, name: item.name, time: item.time, desc: item.desc, imgUrl: item.img_url ?? undefined }
        }),
    }))
    const { data: historyRows } = await supabase
      .from('routine_groups')
      .select('*, routine_items(*)')
      .eq('user_id', userId)
      .eq('is_current', false)
      .order('period_start', { ascending: false })
    const routineHistory: RoutineHistoryEntry[] = (historyRows ?? []).map((g) => ({
      id: g.id,
      startDate: new Date(g.period_start).getTime(),
      endDate: g.period_end ? new Date(g.period_end).getTime() : Date.now(),
      groups: [{
        id: g.id,
        name: g.name,
        items: (g.routine_items ?? []).map((item: { id: string; name: string; time: string; desc: string; img_url: string | null }) => ({
          id: item.id, name: item.name, time: item.time, desc: item.desc, imgUrl: item.img_url ?? undefined,
        })),
      }],
    }))
    const itemIds = Array.from(itemIdByName.values())
    const { data: privacyRows } = itemIds.length > 0
      ? await supabase.from('routine_privacy').select('*').in('item_id', itemIds)
      : { data: [] as { item_id: string; is_public: boolean }[] }
    const privacyByItemId = new Map((privacyRows ?? []).map((p) => [p.item_id, p.is_public]))
    const routinePrivacy: RoutinePrivacyGroup[] = routineGroups.map((g) => ({
      name: g.name,
      on: true,
      items: g.items.map((item) => ({ name: item.name, on: privacyByItemId.get(item.id) ?? true })),
    }))
    set({
      routineGroups,
      routineHistory,
      currentRoutineStartDate: new Date(groupRows[0].period_start).getTime(),
      currentRoutineGroupIds: groupRows.map((g) => g.id),
      routinePrivacy,
      routineItemIdByName: itemIdByName,
    })
  },

  saveEveningReflection: async (entry) => {
    const { userId, isDemo } = get()
    set((s) => {
      const existing = s.eveningReflections.filter((e) => e.date !== entry.date)
      return { eveningReflections: [entry, ...existing] }
    })
    if (isDemo || !userId) return
    await supabase.from('evening_reflections').upsert(
      { user_id: userId, date: entry.date, answers: entry.answers },
      { onConflict: 'user_id,date' }
    )
  },

  loadEveningReflections: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    const { data } = await supabase.from('evening_reflections').select('date, answers').eq('user_id', userId)
    const eveningReflections: EveningReflectionEntry[] = (data ?? []).map((r) => ({ date: r.date, answers: r.answers }))
    set({ eveningReflections })
  },

  syncTodayCalendarSnapshot: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId || !isCalendarConnected()) return
    const events = await fetchTodayEvents()
    const eventTitles = events.map((e) => e.summary)
    const dateStr = new Date().toISOString().slice(0, 10)
    set((s) => {
      const existing = s.calendarSnapshots.filter((e) => e.date !== dateStr)
      return { calendarSnapshots: [{ date: dateStr, eventTitles }, ...existing] }
    })
    await supabase.from('calendar_event_snapshots').upsert(
      { user_id: userId, date: dateStr, event_titles: eventTitles },
      { onConflict: 'user_id,date' }
    )
  },

  loadCalendarSnapshots: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    const { data } = await supabase.from('calendar_event_snapshots').select('date, event_titles').eq('user_id', userId)
    const calendarSnapshots: CalendarEventSnapshot[] = (data ?? []).map((r) => ({ date: r.date, eventTitles: r.event_titles }))
    set({ calendarSnapshots })
  },

  fetchRoutineSuggestions: async (keyword) => {
    const { isDemo } = get()
    if (isDemo) return []
    const { data, error } = await supabase.rpc('get_routine_suggestions_for_keyword', { keyword, min_users: 5 })
    if (error || !data) return []
    return (data as { item_name: string; user_count: number }[]).map((r) => ({ itemName: r.item_name, userCount: r.user_count }))
  },

  saveCommNotifSettings: async (settings) => {
    const { userId, isDemo } = get()
    set({ commNotifSettings: settings })
    if (isDemo || !userId) return
    const rows = settings.map((s) => ({
      user_id: userId,
      setting_key: `comm:${s.id}`,
      enabled: s.master,
      extra: { options: s.options },
    }))
    if (rows.length > 0) await supabase.from('notification_settings').upsert(rows, { onConflict: 'user_id,setting_key' })
  },

  saveAlarmSettings: async (synced, comms) => {
    const { userId, isDemo } = get()
    set({ alarmSyncedSettings: synced, alarmCommSettings: comms })
    if (isDemo || !userId) return
    const rows = [
      ...synced.map((s) => ({ user_id: userId, setting_key: `synced:${s.id}`, enabled: s.on, extra: null })),
      ...comms.map((c) => ({ user_id: userId, setting_key: `comm_alarm:${c.id}`, enabled: c.on, extra: null })),
    ]
    if (rows.length > 0) await supabase.from('notification_settings').upsert(rows, { onConflict: 'user_id,setting_key' })
  },

  loadNotificationSettings: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    const { data } = await supabase.from('notification_settings').select('*').eq('user_id', userId)
    const rows = data ?? []
    const commNotifSettings: CommNotifEntry[] = rows
      .filter((r) => r.setting_key.startsWith('comm:'))
      .map((r) => ({
        id: r.setting_key.slice('comm:'.length),
        master: r.enabled,
        options: (r.extra as { options?: boolean[] } | null)?.options ?? [false, false, false, false],
      }))
    const alarmSyncedSettings: AlarmSyncedItem[] = rows
      .filter((r) => r.setting_key.startsWith('synced:'))
      .map((r) => ({ id: r.setting_key.slice('synced:'.length), on: r.enabled }))
    const alarmCommSettings: AlarmCommItem[] = rows
      .filter((r) => r.setting_key.startsWith('comm_alarm:'))
      .map((r) => ({ id: r.setting_key.slice('comm_alarm:'.length), on: r.enabled }))
    set({ commNotifSettings, alarmSyncedSettings, alarmCommSettings })
  },

  toggleUserSuspend: async (id) => {
    const { adminUsers } = get()
    const nextSuspended = !adminUsers.find((u) => u.id === id)?.suspended
    set((s) => ({
      adminUsers: s.adminUsers.map((u) => u.id === id ? { ...u, suspended: !u.suspended } : u),
    }))
    await supabase.from('profiles').update({ suspended: nextSuspended }).eq('id', id)
  },
  dismissReport: async (id) => {
    set((s) => ({
      adminReports: s.adminReports.map((r) => r.id === id ? { ...r, status: 'dismissed' } : r),
    }))
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', id)
  },
  deleteReport: async (id) => {
    set((s) => ({
      adminReports: s.adminReports.map((r) => r.id === id ? { ...r, status: 'deleted' } : r),
    }))
    await supabase.from('reports').update({ status: 'deleted' }).eq('id', id)
  },

  reportPost: async (postId, reason) => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    await supabase.from('post_reports').insert({ post_id: postId, reporter_id: userId, reason })
  },
  dismissPostReport: async (id) => {
    set((s) => ({
      adminPostReports: s.adminPostReports.map((r) => r.id === id ? { ...r, status: 'dismissed' } : r),
    }))
    await supabase.from('post_reports').update({ status: 'dismissed' }).eq('id', id)
  },
  deletePostReport: async (id) => {
    set((s) => ({
      adminPostReports: s.adminPostReports.map((r) => r.id === id ? { ...r, status: 'deleted' } : r),
    }))
    await supabase.from('post_reports').update({ status: 'deleted' }).eq('id', id)
  },

  loadAdminData: async () => {
    const { isAdmin, isDemo } = get()
    if (isDemo || !isAdmin) return
    const [{ data: profileRows }, { data: followCounts }, { data: reportRows }, { data: postReportRows }] = await Promise.all([
      supabase.from('profiles').select('id, nickname, suspended'),
      supabase.from('follow_counts').select('*'),
      supabase.from('reports').select('*, profiles!reports_reported_user_id_fkey(nickname)'),
      supabase.from('post_reports').select('id, post_id, reporter_id, reason, status, posts(content)').eq('status', 'open'),
    ])
    const postReporterIds = [...new Set((postReportRows ?? []).map((r) => r.reporter_id))]
    const { data: postReporterRows } = postReporterIds.length
      ? await supabase.from('profiles').select('id, nickname').in('id', postReporterIds)
      : { data: [] as { id: string; nickname: string }[] }
    const reporterNicknameById = new Map((postReporterRows ?? []).map((p) => [p.id, p.nickname]))
    const adminPostReports: AdminPostReportRecord[] = (postReportRows ?? []).map((r) => ({
      id: r.id,
      postId: r.post_id,
      postContent: (r as { posts?: { content?: string } }).posts?.content ?? '',
      reporterNickname: reporterNicknameById.get(r.reporter_id) ?? getMessages().store.deletedUser,
      reason: r.reason,
      status: r.status as AdminPostReportRecord['status'],
    }))
    const followersById = new Map((followCounts ?? []).map((c) => [c.user_id, c.followers]))
    const adminUsers: AdminUserRecord[] = (profileRows ?? []).map((p) => ({
      id: p.id,
      name: p.nickname,
      followers: followersById.get(p.id) ?? 0,
      suspended: p.suspended,
    }))
    const adminReports: AdminReportRecord[] = (reportRows ?? []).map((r) => {
      const reportedNickname = (r as { profiles?: { nickname?: string } }).profiles?.nickname ?? getMessages().store.deletedUser
      return {
        id: r.id,
        user: reportedNickname,
        initials: reportedNickname[0]?.toUpperCase() ?? '?',
        count: r.count,
        content: r.content,
        reason: r.reason,
        status: r.status as AdminReportRecord['status'],
      }
    })
    set({ adminUsers, adminReports, adminPostReports })
  },

  addCustomQuickButton: async (label) => {
    const { userId, isDemo, customQuickButtons } = get()
    if (isDemo || !userId) {
      set((s) => ({ customQuickButtons: [...s.customQuickButtons, { id: `cqb${Date.now()}`, label }] }))
      return
    }
    const { data } = await supabase
      .from('custom_quick_buttons')
      .insert({ user_id: userId, label, sort_order: customQuickButtons.length })
      .select()
      .single()
    if (data) set((s) => ({ customQuickButtons: [...s.customQuickButtons, { id: data.id, label: data.label }] }))
  },
  updateCustomQuickButton: async (id, label) => {
    const { userId, isDemo } = get()
    set((s) => ({
      customQuickButtons: s.customQuickButtons.map((b) => b.id === id ? { ...b, label } : b),
    }))
    if (isDemo || !userId) return
    await supabase.from('custom_quick_buttons').update({ label }).eq('id', id)
  },
  removeCustomQuickButton: async (id) => {
    const { userId, isDemo } = get()
    set((s) => ({
      customQuickButtons: s.customQuickButtons.filter((b) => b.id !== id),
    }))
    if (isDemo || !userId) return
    await supabase.from('custom_quick_buttons').delete().eq('id', id)
  },

  loadCustomQuickButtons: async () => {
    const { userId, isDemo } = get()
    if (isDemo || !userId) return
    const { data } = await supabase.from('custom_quick_buttons').select('*').eq('user_id', userId).order('sort_order', { ascending: true })
    const customQuickButtons: CustomQuickButton[] = (data ?? []).map((b) => ({ id: b.id, label: b.label }))
    set({ customQuickButtons })
  },

  signOut: () => {
    supabase.auth.signOut()
    set({
      nickname: '',
      nicknameInput: '',
      emailInput: '',
      passwordInput: '',
      authError: '',
      isDemo: false,
      userId: null,
      isAdmin: false,
      posts: [...SAMPLE_POSTS, ...generateHistoricalPosts()],
      notifications: SAMPLE_NOTIFS,
      followedUsers: new Set(),
      onboardingFollowed: new Set(),
      syncedList: new Set(),
      homeScreenIsRecord: false,
      defaultVisibility: 'public',
      profileVisibility: 'public',
      nicknameEditInput: '',
      screen: 'onboarding-username',
      prevScreen: null,
      navTab: 'feed',
    })
    try { localStorage.removeItem('welling_v1') } catch (_) {}
  },
    }),
    {
      name: 'welling_v1',
      partialize: (s) => ({
        nickname: s.nickname,
        isDemo: s.isDemo,
        dashboardPeriod: s.dashboardPeriod,
        adSlots: s.adSlots,
        chatUser: s.chatUser,
        homeScreenIsRecord: s.homeScreenIsRecord,
        hasPromptedHome: s.hasPromptedHome,
        defaultVisibility: s.defaultVisibility,
        profileVisibility: s.profileVisibility,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const updates: Partial<AppState> = {
          mypageTab: 'dashboard',
          expandedPrev: true,
        }
        if (state.isDemo) {
          updates.screen = 'feed'
          updates.navTab = 'feed'
          updates.authInitializing = false
        } else {
          updates.screen = 'onboarding-username'
        }
        // zustand 5.0.14: onRehydrateStorage 콜백 안에서 동기적으로 setState를 호출하면
        // hydrate()의 내부 Promise 체인이 currentVersion 불일치로 중단되어 hasHydrated가
        // 영원히 false로 남는 결함이 있음. 다음 tick으로 미뤄 우회.
        // isDemo가 아니면 Supabase 세션 존재 여부로 최종 화면을 다시 판단해야 하므로
        // restoreSession()이 이어서 authInitializing/screen을 갱신한다.
        setTimeout(() => {
          useAppStore.setState(updates)
          if (!state.isDemo) useAppStore.getState().restoreSession()
        }, 0)
      },
    }
  )
)
