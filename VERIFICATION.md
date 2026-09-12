# Home Screen Nudge Fix - Verification

## Changes Made

### 1. Added Usage Tracking
- Added `feedVisitCount` and `recordUseCount` to track user behavior
- `feedVisitCount` increments when user navigates to the Feed tab
- `recordUseCount` increments when user opens the Record modal

### 2. Updated Nudge Logic
- Changed from "show on first post" to "show when record usage > feed usage"
- The prompt now appears only when `recordUseCount > feedVisitCount`
- `hasPromptedHome` flag prevents re-showing after first prompt

### 3. Behavior
- **Later** button: Sets `hasPromptedHome = true` and `homeScreenIsRecord = false`, permanently suppressing auto-prompt
- **Set it** button: Sets `hasPromptedHome = true` and `homeScreenIsRecord = true`, enabling record-as-home
- Settings screen can always override the home screen preference manually

### 4. Test Coverage
Added comprehensive test suite in `tests/home-nudge.spec.ts`:
- ✅ Prompt does NOT show on first record alone
- ✅ Prompt shows when record usage exceeds feed usage
- ✅ "Later" permanently suppresses the prompt
- ✅ "Set it" enables homeScreenIsRecord
- ✅ Settings can still change home screen after dismissal

## Manual Verification Steps

1. **Fresh start**: Clear localStorage or start in demo mode
2. **Visit feed**: Navigate to Feed tab (feedVisitCount = 1)
3. **Use record once**: Open record modal, close it (recordUseCount = 1)
   - Expected: No prompt (1 is not > 1)
4. **Use record again**: Open record modal, submit a post (recordUseCount = 2)
   - Expected: Prompt appears (2 > 1)
5. **Click "Later"**: 
   - Expected: Prompt closes, homeScreenIsRecord = false
6. **Create another post**:
   - Expected: Prompt does NOT reappear
7. **Go to Settings → Home Screen**:
   - Expected: Can still change setting to Record

## Build Verification

```bash
npx tsc --noEmit  # ✅ Passes
npm run build     # ✅ Passes
```

## Notes for Testing

The Playwright tests require Supabase credentials to be set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Without these, the app cannot initialize and tests will fail to load the UI.
This affects all tests in the repo, not just the new ones.
