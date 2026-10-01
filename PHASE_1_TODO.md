# WELLING Group-First Restructure - Progress Tracker

## ✅ Phase 0: COMPLETE (Committed & Pushed)

### Completed Tasks:
1. **Removed mock messages**: Deleted Messages.tsx, ChatThread.tsx, MOCK_THREADS, MOCK_CHAT_MESSAGES
2. **Removed all ad code**: AdPage, AdminAds, AdModal, AdStrip, all ad components, ad state from appStore
3. **Korean onboarding strings**: Updated i18n/messages/onboarding.ts with Korean translations
4. **Fixed defaults**:
   - defaultVisibility: 'public' → 'group'
   - routine is_public: true → false (private by default)
   - evening reflection: uses defaultVisibility instead of hardcoded 'public'
5. **Added new types**:
   - PostCategory: added 'exercise'
   - PostVisibility: added 'group' (now first in order)
   - Updated category keywords for exercise
   - Added i18n labels for 'exercise' and 'group'
6. **Removed messages button** from MyPage ProfileHeader
7. **Created migration files** in `supabase/migrations/`:
   - 000_baseline.sql (documentation of assumptions)
   - 001_groups.sql (invite codes, roles, RPCs)
   - 002_posts_visibility.sql (group visibility, exercise category)
   - 003_rls_membership.sql (membership-based RLS)
   - 004_notifications.sql (comment trigger, cheer aggregation)
   - 005_account_deletion.sql (fixed version of PR #2)

### Build Status:
- ✅ TypeScript compilation: SUCCESS
- ✅ Vite build: SUCCESS (with code-splitting warning - acceptable)
- ✅ Lint: PASS (only pre-existing warnings)

## 🚧 Phase 1: IN PROGRESS - Core Group-First Features

### Priority 1: Critical Path (Must for PR)

#### A. Invite Link Flow (NOT STARTED)
- [ ] Parse `/?invite=CODE` on app load
- [ ] Store invite in localStorage with 7-day expiration
- [ ] Clear URL params after storing
- [ ] Show invite preview banner on username screen (before login)
- [ ] Auto-join after signup/login (both email and OAuth)
- [ ] OAuth: preserve invite through redirectTo flow
- [ ] Skip Preview/Follow for invited users
- [ ] Handle invite errors (invalid, expired, full, banned, too_many_groups)

#### B. Group Creation Updates (NOT STARTED)
- [ ] Simplify NewCommunity screen (only name field, always private)
- [ ] Add example name "우리 셋 식단운동"
- [ ] Show invite share screen after creation
- [ ] [링크 보내기] button with navigator.share fallback
- [ ] Use new create_group() RPC instead of direct insert
- [ ] Add group creation entry point to Feed (when user has no groups)

#### C. Feed Tabs from Joined Groups (NOT STARTED)
- [ ] Replace hardcoded communityTabOrder with dynamic joined groups
- [ ] Load from `communities.filter(c => c.joined)`
- [ ] Persist custom order in localStorage
- [ ] Show [+ 그룹] chip at end
- [ ] Hide tabs when user has only one group
- [ ] "전체" tab means "all my groups", not all posts
- [ ] Fix "오늘 요약 줄" to show group stats

#### D. RecordModal L1 Mode (NOT STARTED)
- [ ] Show [먹었어] [운동했어] buttons by default
- [ ] Map to category: diet / exercise
- [ ] Make text optional (default to "먹었어요" / "운동했어요")
- [ ] Hide visibility selector in L1, always use 'group'
- [ ] Make "올릴 곳" (community) picker required with last-used default
- [ ] Move quick buttons, timer, other categories to "더보기" section
- [ ] Fix quick button and timer posts to use selected group
- [ ] Content guideline warning only for public posts
- [ ] Update i18n strings

#### E. 👏 Cheer Implementation (NOT STARTED)
- [ ] Change heart to 👏 in Feed cards
- [ ] Update notification text to "👏 응원했어요"
- [ ] Keep using existing post_likes table and notify_on_post_like trigger
- [ ] (Aggregation handled by migration 004)

### Priority 2: Supporting Features (Should for PR)

#### F. Account Deletion Integration (NOT STARTED)
- [ ] Test 005_account_deletion.sql migration
- [ ] Verify storage file cleanup works
- [ ] Close PR #2 with note that it's superseded by this PR
- [ ] Update SettingsDeleteAccount screen if needed

#### G. Group Management UI (PARTIAL)
- [ ] Community settings: add invite code display
- [ ] Add "초대 코드 재발급" button (calls rotate_invite_code)
- [ ] Add "만료 설정" (7일 option)
- [ ] Add member list with roles (owner/member badge)
- [ ] Add "내보내기" button (owner only, calls remove_member)
- [ ] Add "소유권 이전" button (owner only)
- [ ] Add "나가기" button (calls leave_group, handles ownership transfer)

#### H. OG Meta Tags (NOT STARTED)
- [ ] Update index.html with OG tags for invite link previews
- [ ] Title: WELLING
- [ ] Description: invite preview text
- [ ] Image: app logo or placeholder

### Priority 3: Polish & Testing (Nice to have)

#### I. Feed Refetch on Focus (NOT STARTED)
- [ ] Add visibilitychange listener
- [ ] Refetch feed when app returns to foreground
- [ ] Implement pull-to-refresh

#### J. Tests Update (NOT STARTED)
- [ ] Update Playwright tests for new flows
- [ ] Remove ad-related test expectations
- [ ] Add invite link flow test
- [ ] Add group creation test

## 📋 Files That Need Major Changes for Phase 1

### Critical Files:
1. **src/store/appStore.ts** (~1800 lines)
   - Add invite state management
   - Add group RPCs (create_group, join_by_invite, etc.)
   - Update loadFeedData to use joined groups
   - Update createCommunity to use RPC
   - Update communityTabOrder logic

2. **src/screens/Feed.tsx**
   - Update tabs to use joined groups
   - Remove hardcoded communityTabOrder
   - Add "오늘 요약 줄"

3. **src/overlays/RecordModal.tsx**
   - Implement L1 mode UI
   - [먹었어] [운동했어] buttons
   - Make community selection required
   - Hide visibility in L1, add "더보기" section

4. **src/screens/NewCommunity.tsx**
   - Simplify to one field
   - Add invite share screen

5. **src/screens/Onboarding.tsx**
   - Add invite banner
   - Skip Preview/Follow for invited users

6. **src/screens/CommunityEdit.tsx** / **CommunityDetail.tsx**
   - Add invite code display
   - Add management buttons

7. **src/App.tsx**
   - Add invite URL parsing on mount
   - Handle OAuth return with invite

8. **index.html**
   - Add OG meta tags

## 🗂️ Migration Files Status
All SQL files are ready in `supabase/migrations/`:
- ✅ 000_baseline.sql - Documentation only
- ✅ 001_groups.sql - Tested schema, ready to apply
- ✅ 002_posts_visibility.sql - Ready
- ✅ 003_rls_membership.sql - Ready (WARNING: drops all existing policies)
- ✅ 004_notifications.sql - Ready
- ✅ 005_account_deletion.sql - Fixed version, supersedes PR #2

⚠️ **IMPORTANT**: These migrations are NOT YET APPLIED to any database. They are files only.
Before applying to production, they MUST be:
1. Tested on a dev/staging Supabase project
2. Verified against actual live schema (baseline assumptions)
3. Applied in order 001 → 002 → 003 → 004 → 005

## 🎯 Phase 1 Completion Criteria
- [ ] Invite link flow works end-to-end (email + Google + Kakao)
- [ ] Groups created with invite codes
- [ ] Feed tabs show user's joined groups only
- [ ] RecordModal L1 mode functional with [먹었어] [운동했어]
- [ ] Build passes
- [ ] Lint passes
- [ ] Basic manual testing completed

## 📝 Notes for Continuing Work
- This is a LARGE restructure, estimated 500+ lines of code changes remaining
- Focus on Priority 1 tasks first (critical path)
- Test invite flow manually with Google/Kakao OAuth
- Check that existing group features don't break
- Keep PR #2 context in mind when handling account deletion

## 🔗 Useful Links
- Design Doc: `/uploads/DESIGN_LAYERED_GROUP_FIRST_1d45.md`
- PR #2: https://github.com/concrw/welling-app/pull/2
- Current branch: `cursor/group-first-restructure-4a6a`
