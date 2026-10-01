# Migration Audit Report - v3 APPLIED ON LIVE, v4 (008) PENDING

## Migration Status

- **001-007**: ✅ Applied on live DB 2026-10-01 (after backup schema `backup_20261001`)
- **008_rls_bans_requests.sql**: ⚠️ PENDING (security fix: RLS on bans/requests + approval RPCs)

## Critical Bugs Found & Fixed

| # | Bug | Fix | File |
|---|-----|-----|------|
| 1 | Dedupe uses `created_at` on community_members (doesn't exist) | Use `joined_at` | 001 |
| 2 | Backfill uses `created_at` (doesn't exist) | Remove backfill, use DEFAULT now() | 001 |
| 3 | `desc` unquoted (reserved word) | Quote as `"desc"` | 001 |
| 4 | `max_members` referenced but never added | Remove all references | 001 |
| 5 | `v_user_group_count` undeclared | Declare variable | 001 |
| 6 | 30 member cap enforced | Remove cap checks | 001 |
| 7 | 10 groups-per-user cap | Make generous (50) with note | 001 |
| 8 | remove_member/rotate/set_expiry owner-only | Allow admin OR owner | 001 |
| 9 | join_by_invite missing requires_approval flow | Insert into community_join_requests | 001 |
| 10 | Wrong live policy names dropped | Use exact live names | 003 |
| 11 | `related_id` doesn't exist live | Add column first | 004 |
| 12 | Duplicate trigger `on_post_like_notify` | Drop live trigger first | 004 |
| 13 | `reported_user_id` should be `reported_id` | Fix column name | 005 |
| 14 | routine_privacy wrong FK references | Fix to user_id only | 005 |
| 15 | `following_id` should be `followee_id` | Fix all references | 006 |
| 16 | toggle_community_notifications uses uuid | Change to text | 007 |

## Live Schema Facts Used

- communities.id: `text` (not uuid)
- communities."desc": reserved word, must be quoted
- community_members: NO created_at, NO role (initially)
- community_members PK: (user_id, community_id)
- notifications: NO related_id, NO post_id (initially)
- Live trigger: `on_post_like_notify` (must drop before creating new)
- Live policies: exact names like "communities are readable by visibility"
- follows: (follower_id, followee_id) not following_id
- reports: reported_id not reported_user_id
- routine_privacy: user_id PK only

## Validation Strategy

**Status: 001-007 applied on live DB; 008 pending, UNTESTED (no Postgres in VM)**

### 001-007 (v3, Applied Live)
- Validated v3 on scratch PostgreSQL 17.11 with exact live FKs (NO ACTION except 5 CASCADE), policies, triggers
- Seeded: 11 profiles, 7 communities (5 ownerless/empty), 143 posts (125 public by non-members), legacy data
- **38 assertions PASS** (0 FAIL): group ops, approval, no member cap, notifications, RLS, delete_account with legacy posts, search, mute, anon, FK actions, policy set, admin ops; see `REPORT_v3.md`
- 6 mutation checks prove v3 catches v2 regressions
- Applied on live DB 2026-10-01 after backup schema `backup_20261001`

### 008 (v4, Pending)
- **UNTESTED** - No Postgres available in VM
- Security fix: Enables RLS on `community_bans`, `community_join_requests` (001 created without RLS)
- New RPCs: `approve_join_request`, `reject_join_request`, `set_member_role` (SECURITY DEFINER, owner/admin only)
- UI fixed: `src/screens/CommunitySettings.tsx` now uses RPCs instead of direct DB writes that violate post-003 RLS
- Test suite: `supabase/tests/assertions_v4.sql` (6 assertions: RLS enabled, anon blocked, SELECT policy, approve/reject/role RPCs, bans RPC-only)
- Recommended: Test on staging clone before applying live
