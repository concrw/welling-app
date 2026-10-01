# Migration Audit Report - VALIDATED ON SCRATCH FIXTURE (not run on the live DB)

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

**Status: validated on a scratch Postgres 17 fixture built from the live schema (read via SQL editor), not run on the live DB.**

- Migrations 001-007 (with the fixes in `fixes_v2.patch`) were applied twice in a row (`psql -v ON_ERROR_STOP=1 -1`) to a scratch PostgreSQL 17.11 database whose tables, FKs, CHECKs, policies and the live `notify_on_post_like` trigger were recreated from the live schema read through the Supabase SQL editor. No real Supabase database was touched.
- 28 behavioural assertions (group create/join/approval, no member cap, like/comment notifications, RLS visibility, owner transfer, delete_account incl. users with routines, reports, post_reports, bans and join-request reviews, search_profiles, mute toggle, anon privileges) all pass; see `REPORT_v2.md`.
- Not covered: live data volume/contents, live objects not captured in the fixture (other tables/triggers/policies/FKs), real Supabase auth internals. Remaining assumptions are listed in `REPORT_v2.md`. Run the pre-checks in it against live (read-only) before applying.
