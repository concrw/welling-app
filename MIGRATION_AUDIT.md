# Migration Audit Report - UNTESTED (No Postgres available)

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

**UNTESTED** - No Postgres/Docker available in VM.

**Manual audit conducted:**
- Line-by-line review of all 7 migrations
- Cross-referenced with live schema facts
- Verified column existence at each step
- Checked policy names match live
- Confirmed FK references valid tables/columns

**Recommended verification before production:**
1. Restore prod snapshot to staging DB
2. Run migrations 001-007 in sequence
3. Verify: `SELECT DISTINCT type FROM notifications;`
4. Test: invite join, cheer (1 notif), 2 comments (no collision), RLS blocks non-member
