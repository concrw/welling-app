import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export type NavTab = 'feed' | 'explore' | 'ranking' | 'mypage'

export interface Post {
  id: string
  user: string
  initials: string
  color: string
  content: string
  community: string
  time: string
  liked: boolean
  reactions: Record<string, number>
  comments?: Array<{ user: string; text: string }>
  userId?: string
  hasInsta?: boolean
  instaUrl?: string
  hasImg?: boolean
  imgUrl?: string
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

interface AppState {
  screen: Screen
  prevScreen: Screen | null
  navTab: NavTab

  nickname: string
  nicknameInput: string
  isDemo: boolean

  followedUsers: Set<string>
  onboardingFollowed: Set<string>

  posts: Post[]
  communities: Community[]
  suggestedUsers: User[]
  notifications: Notification[]

  activeCommunityTab: string
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
  adModalData: { brand: string; desc: string; modalTitle?: string; modalBody?: string; ctaLabel?: string; slotKey?: 'explore' | 'ranking' | 'mypage' } | null
  showHomePrompt: boolean
  homeScreenIsRecord: boolean
  showWelcomeAnimation: boolean
  onboardingAnimating: boolean

  adSlots: {
    explore: { brand: string; desc: string; clickAction: 'link' | 'modal' | 'page'; url: string; modalTitle: string; modalBody: string; pageId: string }
    ranking: { brand: string; desc: string; clickAction: 'link' | 'modal' | 'page'; url: string; modalTitle: string; modalBody: string; pageId: string }
    mypage: { brand: string; desc: string; clickAction: 'link' | 'modal' | 'page'; url: string; modalTitle: string; modalBody: string; pageId: string }
  }
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

  // actions
  setChatUser: (name: string) => void
  navigate: (screen: Screen) => void
  goBack: () => void
  setNavTab: (tab: NavTab) => void
  setNicknameInput: (v: string) => void
  submitNickname: () => void
  goFeedDemo: () => void
  goToMain: () => void
  goToMainWithRecord: () => void
  setActiveCommunityTab: (tab: string) => void
  setMypageTab: (tab: 'routine' | 'dashboard') => void
  setRankingTab: (tab: string) => void
  setDashboardPeriod: (p: string) => void
  toggleExpandPrev: () => void
  setSearchQuery: (q: string) => void
  toggleFollowUser: (userId: string) => void
  toggleFollowOnboard: (userId: string) => void
  toggleJoinCommunity: (communityId: string) => void
  toggleLikePost: (postId: string) => void
  selectCommunity: (c: Community) => void
  selectUser: (u: User) => void
  setNewCommName: (v: string) => void
  setNewCommDesc: (v: string) => void
  setCommVisibility: (v: 'public' | 'private') => void
  markNotificationsRead: () => void
  markAllRead: () => void
  markSingleRead: (id: string) => void
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
  openAdModal: (data: { brand: string; desc: string; modalTitle?: string; modalBody?: string; ctaLabel?: string; slotKey?: 'explore' | 'ranking' | 'mypage' }) => void
  closeAdModal: () => void
  setAdPageData: (data: { brand: string; desc: string; slotKey: 'explore' | 'ranking' | 'mypage' }) => void
  acceptHomePrompt: () => void
  dismissHomePrompt: () => void
  showWelcomeAnim: () => void
  dismissWelcomeAnimation: () => void
  toggleSyncUser: (userId: string) => void
  setAdSlot: (key: 'explore' | 'ranking' | 'mypage', data: Partial<AppState['adSlots']['explore']>) => void
  closeSyncConfirm: () => void
}

const SAMPLE_POSTS: Post[] = [
  { id: 'p0a', user: 'Min', initials: 'M', color: '#00A389', content: 'Water', community: 'morning-runners', time: '방금', liked: true, reactions: {} },
  { id: 'p0b', user: 'Min', initials: 'M', color: '#00A389', content: 'Squat 20', community: 'morning-runners', time: '방금', liked: false, reactions: {} },
  { id: 'p0c', user: 'Min', initials: 'M', color: '#00A389', content: '3333', community: 'morning-runners', time: '방금', liked: false, reactions: {} },
  { id: 'p0d', user: 'Min', initials: 'M', color: '#00A389', content: '111', community: 'morning-runners', time: '방금', liked: false, reactions: {} },
  { id: 'p1', user: '정도윤', initials: '정', color: '#1A6B4A', content: '오늘 아침 달리기 5km. 날씨 좋아서 더 잘 됐어요.', community: 'morning-runners', time: '5분', liked: false, reactions: { Cheer: 8, Inspired: 12, Nice: 5 }, comments: [{ user: '한다솜', text: '저도 오늘 뛰었어요! 같이 해요.' }, { user: '김민준', text: '5km 대단해요.' }] },
  { id: 'p2', user: '한다솜', initials: '한', color: '#C2600A', content: '기상 직후 스트레칭 10분 + 조깅 3km 완료.', community: 'morning-runners', time: '22분', liked: false, reactions: { Cheer: 4, Inspired: 6, Nice: 3 } },
  { id: 'p3', user: '김민준', initials: '김', color: '#555555', content: '새벽 6시 달리기. 어제보다 0.5km 늘었어요.', community: 'morning-runners', time: '1시간', liked: false, reactions: {} },
  { id: 'p4', user: '이서연', initials: '이', color: '#C2600A', content: '그릭 요거트 + 블루베리 + 견과류 아침 식사. 칼로리 계산하면서 먹는 것도 이제 습관이 됐어요.', community: 'clean-eaters', time: '8분', liked: false, reactions: { Cheer: 3, Inspired: 11, Nice: 7 }, comments: [{ user: '김민준', text: '저도 들어가도 될까요?' }] },
  { id: 'p5', user: '최수아', initials: '최', color: '#C2600A', content: '점심 현미밥 + 두부구이 + 나물 3종. 탄단지 비율 맞추는 중.', community: 'clean-eaters', time: '1시간', liked: false, reactions: { Cheer: 6, Inspired: 9, Nice: 4 } },
  { id: 'p5b', user: '한다솜', initials: '한', color: '#C2600A', content: '하루 물 2L 챌린지 14일째. 매일 알람 맞춰놓고 마시고 있어요.', community: 'clean-eaters', time: '3시간', liked: false, reactions: {} },
  { id: 'p6', user: '박지호', initials: '박', color: '#1A6B4A', content: '독서 30분 완료. "아주 작은 습관의 힘" 읽는 중. 공감되는 내용 너무 많아요.', community: 'book-club', time: '23분', liked: false, reactions: {} },
  { id: 'p7', user: '김민준', initials: '김', color: '#555555', content: '스쿼트 50개 완료. 오늘도 좋은 시작이에요.', community: 'morning-runners', time: '방금', liked: false, reactions: { Cheer: 12, Inspired: 5, Nice: 8 }, comments: [{ user: '이서연', text: '매일 하시는 거예요? 대단해요.' }, { user: '박지호', text: '저도 자극받았어요.' }] },
  { id: 'p8', user: '정도윤', initials: '정', color: '#1A6B4A', content: '아침: 물 한 잔 + 스트레칭 / 점심: 게단 오르기 성공.', community: 'morning-runners', time: '5분', liked: false, reactions: {} },
  { id: 'p9', user: '오재원', initials: '오', color: '#6B6B6B', content: '명상 10분 완료. 아침을 이렇게 시작하니 하루가 달라요.', community: 'morning-runners', time: '44분', liked: false, reactions: {} },
  { id: 'p10', user: '강지우', initials: '강', color: '#1A6B4A', content: '기상 직후 찬물 세수. 별거 아닌 것 같지만 확실히 깨요.', community: 'morning-runners', time: '1시간', liked: false, reactions: {} },
  { id: 'p11', user: '이서연', initials: '이', color: '#C2600A', content: '아침 공복 물 한 잔 + 레몬즙. 3개월째 지속 중.', community: 'clean-eaters', time: '2시간', liked: false, reactions: { Cheer: 7, Inspired: 3 } },
  { id: 'p12', user: '김민준', initials: '김', color: '#555555', content: '웨이트 풀 데이 완료. 데드리프트 120kg 성공.', community: 'strength-lab', time: '2시간', liked: false, reactions: { Cheer: 14, Inspired: 9, Nice: 6 } },
  { id: 'p13', user: '박지호', initials: '박', color: '#1A6B4A', content: '명상 15분 + 감사 일기 작성. 루틴에 저널링 추가해봤어요.', community: 'mind-first', time: '3시간', liked: false, reactions: { Inspired: 8, Nice: 4 } },
  { id: 'p14', user: '최수아', initials: '최', color: '#C2600A', content: '스쿼트 100개 챌린지 7일째. 허벅지가 비명을 질러요.', community: 'strength-lab', time: '4시간', liked: false, reactions: { Cheer: 11, Inspired: 5 } },
  { id: 'p15', user: '한다솜', initials: '한', color: '#C2600A', content: '"아주 작은 습관의 힘" 완독. 오늘부터 2% 개선 실천.', community: 'book-club', time: '5시간', liked: false, reactions: { Inspired: 16, Nice: 7 } },
]

const SAMPLE_COMMUNITIES: Community[] = [
  { id: 'morning-runners', name: 'Morning Runners', initial: 'R', color: '#0984E3', members: 1243, focus: 'exercise & movement records', desc: '운동과 러닝 루틴만 공유하는 새벽 커뮤니티.', joined: true },
  { id: 'clean-eaters', name: 'Clean Eaters', initial: 'C', color: '#00A389', members: 892, focus: 'nutrition & meal records', desc: '식단 기록과 건강한 음식 루틴 공유.', joined: true },
  { id: 'book-club', name: 'Book Club 30m', initial: 'B', color: '#7C3AED', members: 567, focus: 'reading records', desc: '하루 30분 독서 습관을 함께 만드는 클럽.', joined: false },
  { id: 'office-workout', name: 'Office Workout', initial: 'W', color: '#B45309', members: 388, focus: 'exercise records', desc: '사무실 틈새 운동 루틴 공유.', joined: false },
]

const SAMPLE_USERS: User[] = [
  { id: 'u1', name: '김민준', handle: 'minjun.k', initials: '김', color: '#0984E3', bio: '새벽 러닝 + 루틴 설계 중', followers: 234, following: 89, followed: false, synced: false, routines: [{ group: 'Morning', items: '6am 기상 · 러닝 5km · 스트레칭' }] },
  { id: 'u2', name: '이서연', handle: 'seoyeon.i', initials: '이', color: '#00A389', bio: '식단 관리 + 아침 루틴 3개월째', followers: 156, following: 67, followed: false, synced: false, routines: [{ group: 'Morning', items: '아침 식사 · 물 2L · 영양제' }] },
  { id: 'u3', name: '박지호', handle: 'jiho.p', initials: '박', color: '#0984E3', bio: '한강 러닝 매일 | Morning Runners', followers: 89, following: 234, followed: true, synced: false, routines: [{ group: 'Morning', items: '5am 기상 · 한강 러닝 7km' }] },
  { id: 'u4', name: '최수아', handle: 'sua.c', initials: '최', color: '#00A389', bio: '클린 이팅 + 주 5회 운동', followers: 412, following: 123, followed: false, synced: false, routines: [{ group: 'Meals', items: '샐러드 · 단백질 쉐이크 · 현미밥' }] },
  { id: 'u5', name: '한다솜', handle: '한다솜', initials: '한', color: '#C2600A', bio: '저녁 요가 · 마인드풀 이팅', followers: 203, following: 77, followed: false, synced: false, routines: [{ group: 'Evening', items: '요가 45분 · 감사 일기' }] },
]

const SAMPLE_NOTIFS: Notification[] = [
  { id: 'n1', user: '박지호', type: 'follow', text: '회원님을 팔로우하기 시작했어요.', read: false, time: '5분' },
  { id: 'n2', user: '이서연', type: 'like', text: '회원님의 게시물에 반응했어요.', read: false, time: '12분' },
  { id: 'n3', user: 'Morning Runners', type: 'comment', text: '커뮤니티에 새 게시물이 10개 있어요.', read: false, time: '1시간' },
  { id: 'n4', user: '김민준', type: 'follow', text: '회원님을 팔로우하기 시작했어요.', read: false, time: '2시간' },
  { id: 'n5', user: '최수아', type: 'like', text: '달리기 기록 게시물에 반응했어요.', read: true, time: '3시간' },
  { id: 'n6', user: 'Clean Eaters', type: 'comment', text: '커뮤니티에 새 게시물이 5개 있어요.', read: true, time: '4시간' },
  { id: 'n7', user: '오재원', type: 'follow', text: '회원님을 팔로우하기 시작했어요.', read: true, time: '어제' },
  { id: 'n8', user: '한다솜', type: 'comment', text: '루틴 게시물에 댓글을 남겼어요: "저도 같이 해요!"', read: true, time: '어제' },
  { id: 'n9', user: 'Book Club 30m', type: 'comment', text: '커뮤니티에 가입 승인되었어요.', read: true, time: '2일' },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  screen: 'onboarding-username',
  prevScreen: null,
  navTab: 'feed',

  nickname: '',
  nicknameInput: '',
  isDemo: false,

  followedUsers: new Set(),
  onboardingFollowed: new Set(),

  posts: SAMPLE_POSTS,
  communities: SAMPLE_COMMUNITIES,
  suggestedUsers: SAMPLE_USERS,
  notifications: SAMPLE_NOTIFS,

  activeCommunityTab: 'morning-runners',
  mypageTab: 'routine',
  rankingTab: 'All',
  dashboardPeriod: 'All time',
  expandedPrev: false,
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
  homeScreenIsRecord: false,
  showWelcomeAnimation: false,
  onboardingAnimating: false,

  adSlots: {
    explore: { brand: '나이키 러닝 클럽', desc: '함께 달리면 더 멀리. 지금 참여하세요.', clickAction: 'link', url: 'https://nike.com/kr', modalTitle: '', modalBody: '', pageId: '' },
    ranking: { brand: '마이프로틴 Korea', desc: '루틴의 완성. 100% 유청 단백질.', clickAction: 'modal', url: '', modalTitle: '마이프로틴 특별 할인', modalBody: '루틴 챌린지 달성자 한정 20% 할인쿠폰을 드려요.\n프로모션 코드: WELLING20', pageId: '' },
    mypage: { brand: 'Calm · 마음 루틴', desc: '수면의 질이 루틴을 결정해요.', clickAction: 'page', url: '', modalTitle: '', modalBody: '', pageId: 'calm-detail' },
  },
  chatUser: '',
  syncSheetUserName: '',
  syncSheetAlarms: [],
  showSyncConfirm: false,
  syncAlarmHasImg: false,
  syncAlarmBgImg: '',
  syncAlarmFallbackGrad: 'linear-gradient(160deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
  syncAlarmStatusTime: '9:41',
  syncAlarmClockDisplay: '09:41',
  syncAlarmDate: '6월 28일 토요일',
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

  submitNickname: () => {
    const { nicknameInput } = get()
    const trimmed = nicknameInput.trim()
    if (trimmed.length < 2) return
    set({ nickname: trimmed, screen: 'onboarding-preview', prevScreen: 'onboarding-username' })
  },

  goFeedDemo: () => set({ nickname: 'Min', isDemo: true, screen: 'feed', navTab: 'feed', prevScreen: null }),

  goToMain: () => set({ screen: 'feed', navTab: 'feed', prevScreen: null, showWelcomeAnimation: true }),

  goToMainWithRecord: () => {
    set({ onboardingAnimating: true })
    setTimeout(() => {
      set({ screen: 'feed', navTab: 'feed', prevScreen: null, onboardingAnimating: false, showRecordModal: true, showWelcomeAnimation: true })
    }, 2200)
  },

  setActiveCommunityTab: (tab) => set({ activeCommunityTab: tab }),

  setMypageTab: (tab) => set({ mypageTab: tab }),

  setRankingTab: (tab) => set({ rankingTab: tab }),

  setDashboardPeriod: (p) => set({ dashboardPeriod: p }),

  toggleExpandPrev: () => set((s) => ({ expandedPrev: !s.expandedPrev })),

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleFollowUser: (userId) =>
    set((s) => {
      const next = new Set(s.followedUsers)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return { followedUsers: next }
    }),

  toggleFollowOnboard: (userId) =>
    set((s) => {
      const next = new Set(s.onboardingFollowed)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return { onboardingFollowed: next }
    }),

  toggleJoinCommunity: (communityId) =>
    set((s) => ({
      communities: s.communities.map((c) =>
        c.id === communityId ? { ...c, joined: !c.joined } : c
      ),
      selectedCommunity:
        s.selectedCommunity?.id === communityId
          ? { ...s.selectedCommunity, joined: !s.selectedCommunity.joined }
          : s.selectedCommunity,
    })),

  toggleLikePost: (postId) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, liked: !p.liked } : p
      ),
    })),

  selectCommunity: (c) => set((s) => ({ selectedCommunity: c, prevScreen: s.screen, screen: 'community-detail' })),

  selectUser: (u) => set((s) => ({ selectedUser: u, prevScreen: s.screen, screen: 'other-profile' })),

  setNewCommName: (v) => set({ newCommName: v }),
  setNewCommDesc: (v) => set({ newCommDesc: v }),
  setCommVisibility: (v) => set({ commVisibility: v }),

  markNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  markSingleRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),

  openRecordModal: () => set({ showRecordModal: true }),
  closeRecordModal: () => set({ showRecordModal: false }),

  openSyncSheet: (user) => set({
    showSyncSheet: true,
    showSyncConfirm: true,
    selectedSyncUser: user,
    syncSheetUserName: user.name,
    syncSheetAlarms: user.routines.map((r) => ({ time: r.group, items: r.items, group: r.group })),
  }),
  closeSyncSheet: () => set({ showSyncSheet: false, selectedSyncUser: null }),
  confirmSync: () => set({ showSyncSheet: false, showSyncAlarm: true }),
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
  completeSyncAlarm: () => set({ showSyncAlarm: false }),

  openPostDetail: (post) => set({ showPostDetail: true, selectedPost: post }),
  closePostDetail: () => set({ showPostDetail: false, selectedPost: null }),

  openAdModal: (data) => set({ showAdModal: true, adModalData: data }),
  closeAdModal: () => set({ showAdModal: false, adModalData: null }),
  setAdPageData: (data) => set({ adModalData: data }),

  acceptHomePrompt: () => set({ showHomePrompt: false, homeScreenIsRecord: true }),

  dismissHomePrompt: () => set({ showHomePrompt: false }),

  showWelcomeAnim: () => set({ showWelcomeAnimation: true }),

  dismissWelcomeAnimation: () => set({ showWelcomeAnimation: false }),

  toggleSyncUser: (userId) =>
    set((s) => {
      const next = new Set(s.syncedList)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return { syncedList: next }
    }),

  setAdSlot: (key, data) => set((s) => ({ adSlots: { ...s.adSlots, [key]: { ...s.adSlots[key], ...data } } })),

  closeSyncConfirm: () => set({ showSyncConfirm: false }),
    }),
    {
      name: 'welling_v1',
      partialize: (s) => ({
        nickname: s.nickname,
        isDemo: s.isDemo,
        posts: s.posts,
        communities: s.communities,
        notifications: s.notifications,
        mypageTab: s.mypageTab,
        dashboardPeriod: s.dashboardPeriod,
        adSlots: s.adSlots,
        isAdmin: s.isAdmin,
        chatUser: s.chatUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.nickname && state.nickname.trim() !== '') {
          state.screen = 'feed'
          state.navTab = 'feed'
        } else if (state.isDemo) {
          state.screen = 'feed'
          state.navTab = 'feed'
        } else {
          state.screen = 'onboarding-username'
        }
      },
    }
  )
)
