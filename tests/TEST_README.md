# Test Suite README

## Overview

This test suite uses **Playwright** for end-to-end testing of the WELLING app.

## Test Requirements

### Environment Variables

All tests require a live Supabase instance with the following environment variables:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Create a `.env` file in the project root with these variables before running tests.

### Test Data

The existing E2E tests (`full.spec.ts`, `fixes.spec.ts`, `home-nudge.spec.ts`) require:

1. **Seeded database** with:
   - Demo users with profile data
   - Multiple communities with members
   - Posts and comments
   - Follow relationships

2. **Demo user access** for authentication flows

These tests were written before the group-first restructure and expect:
- A "Skip to demo" button (no longer exists)
- 5 hardcoded community tabs (now dynamic based on joined groups)
- Specific test user data (e.g., "정도윤")

## Test Types

### 1. Full E2E Tests (`full.spec.ts`)
- Feed loading and community tabs
- Post detail views
- Explore tab
- Record modal
- Ranking tab
- MyPage and subroutes
- OtherProfile views

### 2. Fix Verification Tests (`fixes.spec.ts`)
- Home screen record setting persistence
- "See all" list expansion
- Comment author navigation
- Community creation validation

### 3. Home Nudge Tests (`home-nudge.spec.ts`)
- Home screen nudge behavior
- Usage tracking logic
- Settings persistence

### 4. Smoke Test (`smoke.spec.ts`)
- Basic group creation flow
- Share screen rendering
- Quick post functionality
- **Status**: Currently requires Supabase credentials (app initializes with Supabase client)
- Tests document expected flows but need environment setup to run

## Running Tests

### Run all tests (requires Supabase):
```bash
npx playwright test
```

### Run smoke test only (no Supabase required):
```bash
npx playwright test smoke
```

### Run with UI:
```bash
npx playwright test --ui
```

### Generate test report:
```bash
npx playwright show-report
```

## Known Issues

- **Group-first restructure**: Many tests assume the old flow and need updating to match dynamic group tabs and invite-first onboarding.
- **Demo mode removed**: Tests originally relied on a "Skip to demo" button that no longer exists. They now require actual Supabase authentication.
- **Hardcoded expectations**: Some tests expect specific user names and community counts that may not match your test database.

## Recommendations

To make the test suite production-ready:

1. **Add Supabase test credentials** to CI environment
2. **Seed a test database** with consistent demo data
3. **Update E2E tests** to match the group-first flow:
   - Remove hardcoded community tab counts
   - Update onboarding flow expectations
   - Use data-testid attributes consistently
4. **Add unit tests** for store logic and components
5. **Add integration tests** for Supabase RPCs
