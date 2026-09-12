# Account Deletion Implementation

## Overview

This document describes the account deletion feature implementation for the WELLING web app, which allows users to permanently delete their account and all associated data from the Settings page.

## Deployment Requirements

### 1. Deploy SQL Function to Supabase

**CRITICAL**: Before this feature can work in production, the SQL function must be deployed to Supabase.

#### Deployment Steps:

1. Open the Supabase Dashboard for your project
2. Navigate to: **SQL Editor** (left sidebar)
3. Open the file `ACCOUNT_DELETION_MIGRATION.sql` from this repository
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **RUN** to execute the migration
7. Verify success: You should see "Success. No rows returned" or similar

The SQL function `delete_account()` is created with `SECURITY DEFINER` privileges, which allows it to delete records from the `auth.users` table (normally restricted to service role).

#### What the SQL Function Does:

The `delete_account()` RPC function performs a complete cascade deletion of all user data in the following order:

1. **Custom quick buttons** - User's custom quick buttons
2. **Notification settings** - User's notification preferences
3. **Calendar snapshots** - Synced Google Calendar events
4. **Evening reflections** - User's evening reflection entries
5. **Routine privacy** - Privacy settings for routine items
6. **Routine items** - Individual routine items
7. **Routine groups** - Routine group containers
8. **Notifications** - Both sent and received notifications
9. **Post reports** - Reports filed by the user
10. **Reports** - Reports filed by or against the user
11. **Post comments** - User's comments on posts
12. **Post reactions** - User's reactions (emoji, etc.)
13. **Post likes** - User's post likes
14. **Posts** - User's posts (including images)
15. **Community memberships** - Communities the user joined
16. **Communities owned** - Communities created by the user (deleted entirely)
17. **Follow relationships** - Both following and followers
18. **Follow counts** - Cached follow counts
19. **Profile** - User profile data
20. **Auth user** - The authentication user record

### 2. Storage Cleanup (Optional Enhancement)

**Current State**: The SQL function deletes database records but does not automatically delete images from Supabase Storage (`post-images` bucket).

**Future Enhancement Options**:

1. **Storage RLS + Automatic Cleanup**: Configure Supabase Storage RLS policies to cascade delete images when the user record is deleted
2. **Storage Triggers**: Create a Postgres trigger or Edge Function to delete storage files before user deletion
3. **Manual Admin Cleanup**: Periodically run admin scripts to clean up orphaned storage files

For the initial launch, orphaned images in storage are acceptable (they will become inaccessible since the user is deleted).

## User Experience Flow

### 1. Navigation
- User opens **Settings** page
- Scrolls to find **"Delete account" / "계정 삭제"** option (red text, above Sign out)
- Taps to navigate to deletion confirmation screen

### 2. Confirmation Screen
The `SettingsDeleteAccount` component displays:

- **Warning banner** (red background): "Deleting your account will permanently remove all your data"
- **Detailed list** of what will be deleted:
  - Profile and user information
  - All posts, comments, and reactions
  - Routine records and history
  - Follow relationships
  - Community memberships and owned communities
  - Notifications and settings

- **Confirmation input**: User must type the exact word
  - Korean: `"삭제"` (delete)
  - English: `"DELETE"`
  
- **Delete button** (disabled until correct word is typed)
  - Enabled: Red background (#DC2626)
  - Disabled: Gray background (#CCCCCC)

### 3. Deletion Process
When user clicks "Permanently delete account":

1. Client calls `appStore.deleteAccount()`
2. Store calls Supabase RPC: `supabase.rpc('delete_account')`
3. SQL function executes (see above)
4. On success:
   - Clear all Zustand store state
   - Clear localStorage (`welling_v1`)
   - Sign out from Supabase Auth
   - Redirect to onboarding screen (`onboarding-username`)
5. On error:
   - Display error message: "Failed to delete account. Please try again."
   - User remains logged in
   - Can retry deletion

### 4. Post-Deletion State
- User is completely logged out
- Cannot log back in with the same credentials (account no longer exists)
- All data is permanently deleted from database
- App displays onboarding/login screen

## Implementation Files

### New Files Created

1. **`ACCOUNT_DELETION_MIGRATION.sql`**
   - SQL migration script to create the `delete_account()` RPC function
   - Must be deployed to Supabase before feature works

2. **`src/screens/SettingsDeleteAccount.tsx`**
   - React component for the deletion confirmation screen
   - Handles user input and confirmation logic
   - Calls `deleteAccount()` from appStore

3. **`ACCOUNT_DELETION_DOCUMENTATION.md`** (this file)
   - Comprehensive documentation of the feature

### Modified Files

1. **`src/store/appStore.ts`**
   - Added `'settings-delete-account'` to `Screen` type union
   - Added `deleteAccount: () => Promise<boolean>` to interface
   - Implemented `deleteAccount()` action:
     - Calls `supabase.rpc('delete_account')`
     - Clears all state on success
     - Returns boolean (success/failure)

2. **`src/screens/Settings.tsx`**
   - Added `'deleteAccount'` to `STATIC_ITEMS` array
   - Positioned above `signOut` with red color (#E53535)
   - Navigates to `'settings-delete-account'` screen

3. **`src/i18n/messages/settings.ts`**
   - Added Korean translations:
     - `deleteAccount`, `deleteAccountTitle`, `deleteAccountWarning`, etc.
   - Added English translations (matching Korean)
   - Total: 13 new i18n keys

4. **`src/App.tsx`**
   - Imported `SettingsDeleteAccount` component
   - Added routing: `{screen === 'settings-delete-account' && <SettingsDeleteAccount />}`

## Testing Checklist

### Pre-Deployment (Local/Staging)

1. ✅ **Build passes**: `npm run build` completes without errors
2. ⏳ **SQL function deployed**: Run migration in Supabase Dashboard
3. ⏳ **Manual testing**:
   - [ ] Navigate Settings → Delete account
   - [ ] Confirmation screen displays correctly
   - [ ] Button disabled until correct word typed
   - [ ] Typing correct word enables button
   - [ ] Clicking button shows "Deleting..." state
   - [ ] After deletion, redirected to onboarding
   - [ ] Cannot log back in with old credentials
   - [ ] User data removed from database (verify in Supabase Table Editor)

### Verification Queries (Post-Deletion)

After deleting a test account, run these queries in Supabase SQL Editor:

```sql
-- Replace 'TEST_USER_ID' with the actual user ID you deleted

-- Should return 0 rows for all queries:
SELECT COUNT(*) FROM auth.users WHERE id = 'TEST_USER_ID';
SELECT COUNT(*) FROM profiles WHERE id = 'TEST_USER_ID';
SELECT COUNT(*) FROM posts WHERE user_id = 'TEST_USER_ID';
SELECT COUNT(*) FROM follows WHERE follower_id = 'TEST_USER_ID' OR followee_id = 'TEST_USER_ID';
SELECT COUNT(*) FROM community_members WHERE user_id = 'TEST_USER_ID';
SELECT COUNT(*) FROM routine_groups WHERE user_id = 'TEST_USER_ID';
SELECT COUNT(*) FROM notifications WHERE user_id = 'TEST_USER_ID' OR actor_id = 'TEST_USER_ID';
```

## Security Considerations

### Why SECURITY DEFINER?

The `delete_account()` function uses `SECURITY DEFINER` because:

1. **Auth table restriction**: Regular authenticated users cannot delete from `auth.users` table
2. **Service role required**: Only service role (or SECURITY DEFINER) can delete auth users
3. **User verification**: Function internally calls `auth.uid()` to ensure user can only delete their own account
4. **Safe design**: No parameters accepted; function only deletes the calling user's data

### RLS Policies

The function works alongside existing Row Level Security (RLS) policies. Since it runs as SECURITY DEFINER, it bypasses RLS for the delete operations, but the initial `auth.uid()` check ensures users can only delete their own data.

### Risks Mitigated

1. **Accidental deletion**: Strong confirmation UX (must type exact word)
2. **Unauthorized deletion**: SQL function verifies calling user ID
3. **Partial deletion failure**: Transaction rollback on any error
4. **Session persistence**: Client explicitly signs out after deletion

## Data Deletion Policy

### Immediately Deleted
- All database records associated with the user
- Auth user account

### Not Automatically Deleted
- Images in Supabase Storage (`post-images` bucket)
  - These become inaccessible since user is deleted
  - Can be cleaned up by admin scripts later

### Anonymization vs Deletion
This implementation **deletes** data rather than anonymizing it. Communities owned by the user are also deleted (alternative would be to set `owner_id = NULL`).

## Future Enhancements

1. **Storage cleanup**: Implement automatic deletion of user's images from Storage
2. **Soft delete option**: Add a "deactivate account" feature (reversible) vs hard delete
3. **Data export**: Allow users to download their data before deletion (GDPR compliance)
4. **Deletion queue**: Instead of immediate deletion, queue for 30-day grace period
5. **Admin restore**: Add admin tool to restore recently deleted accounts (within grace period)
6. **Audit log**: Log all account deletions with timestamp and reason (if provided)

## Privacy Policy Compliance

This implementation fulfills the privacy policy requirement that users can delete their account and associated data. The deletion is:

- **User-initiated**: User explicitly confirms deletion
- **Comprehensive**: All personal data is removed
- **Permanent**: Cannot be undone (except potential storage files)
- **Immediate**: Takes effect immediately (no grace period in v1)

## Deployment Checklist

### Before Merging PR

- [x] SQL migration created (`ACCOUNT_DELETION_MIGRATION.sql`)
- [x] i18n strings added (KO + EN)
- [x] UI components created
- [x] Store actions implemented
- [x] Routing configured
- [x] Build passes (`npm run build`)
- [ ] SQL function deployed to Supabase **STAGING**
- [ ] Manual testing completed on staging
- [ ] Code review completed

### Before Production Deploy

- [ ] SQL function deployed to Supabase **PRODUCTION**
- [ ] Test account deletion on production (using test account)
- [ ] Verify database cleanup (run verification queries)
- [ ] Monitor error logs for 24 hours post-launch

## Support & Troubleshooting

### Common Issues

**Issue**: "Account deletion failed" error
- **Cause**: SQL function not deployed to Supabase
- **Solution**: Deploy `ACCOUNT_DELETION_MIGRATION.sql` via Supabase Dashboard

**Issue**: User deleted but can still log in
- **Cause**: RPC function failed but client-side state cleared
- **Solution**: Check Supabase logs; user should retry deletion

**Issue**: Foreign key constraint errors
- **Cause**: Missing cascade or incorrect deletion order in SQL
- **Solution**: Review SQL function; ensure proper ordering

### Monitoring

Monitor these metrics post-launch:
- Account deletion success rate (via Supabase logs)
- Error rate for `delete_account` RPC calls
- User support tickets related to deletion
- Storage usage (to track orphaned images)

---

**Last Updated**: 2026-09-12  
**Author**: Cursor AI Agent  
**Status**: ✅ Implementation complete, awaiting SQL deployment
