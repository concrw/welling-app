# Migration Audit Report - VALIDATED v3 ON SCRATCH FIXTURE (not run on the live DB)

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

**Status: validated v3 on a scratch Postgres 17 fixture built from the live schema (read via SQL editor), not run on the live DB.**

- Migrations 001-007 (with fixes in `fixes_v3.patch`) applied twice (`psql -v ON_ERROR_STOP=1 -1`) to a scratch PostgreSQL 17.11 database with tables, FKs (NO ACTION everywhere except CASCADE on post_comments/likes/reactions.post_id), CHECKs, policies, and live triggers recreated from the live schema. Seeded with 11 profiles, 7 communities (5 ownerless/empty), 143 posts (142 with community_id, 125 public posts by non-members), comments/likes/reactions/reports on legacy posts. No real Supabase database was touched.
- **38 assertions PASS** (0 FAIL): group ops, approval, no member cap, like/comment notifications, RLS (incl. reactions/reports on group posts), owner transfer, delete_account with routines/reports/bans/reviews/legacy posts by non-members in sole-owner groups, search_profiles, mute, anon, live-like seed data, FK actions, exact policy set, old trigger dropped, admin update reports; see `REPORT_v3.md`.
- 6 mutation checks confirm v3 fixes catch regressions (v2 005 fails with live NO ACTION FKs; missing policy drops leak data).
- Unverified: live data volume/contents beyond seed pattern, tables/triggers/functions not in fixture, real Supabase auth internals, concurrency. See `REPORT_v3.md` "Remaining unverified items". Run pre-checks against live (read-only) before applying.
