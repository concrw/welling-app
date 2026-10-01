# WELLING migrations 001-007 — scratch validation report v2

Date: 2026-10-01 (Asia/Seoul). Engine: PostgreSQL 17.11, local scratch cluster (unix socket /tmp, port 54329, DB `scratch`, data dir /workspace/pgdata).
**No real Supabase DB was touched. Nothing was pushed to GitHub.**
Base: branch `cursor/group-first-restructure-4a6a` @ a557742 (original files) + earlier `fixes.patch` + the corrections below.

## Method
1. `fixture/live_baseline.v2.sql` (+ `00_stubs.sql`, `02_seed_v2.sql`): tables rebuilt to the live shapes you verified (reports, routine_groups/items/privacy, post_comments, post_likes, post_reactions, post_reports, notifications, follows, FK targets auth.users); live `notify_on_post_like` and `can_view_profile(target_id)` bodies as you described; earlier fixes kept (quoted `"like"`, live policy names, `auth.role` stub, default grants).
2. `reset_and_load_v2.sh` -> fresh DB. `run_migs_v2.sh` ran `patched_v2/001..007` twice, each file `psql -v ON_ERROR_STOP=1 -1 -f`: **14/14 invocations exit 0, 0 ERROR lines** (logs `11_v2_run1.log`, `12_v2_run2.log`).
3. `assertions_v2.sql` (a-j + extras x1-x10) run as superuser, switching to `authenticated`/`anon` with `SET LOCAL ROLE` + `request.jwt.claim.sub`. Full result list in `14_results_v2.txt` / `13_assertions_v2.log`.
4. Mutation check (`15_mutation_check.txt`): re-running with the OLD 005 behaviour (`UPDATE reports SET reported_user_id=NULL`, no post_reports cleanup before the group delete) makes `g.delete_account_member_only`, `x6`, `x7` FAIL, so those assertions do detect the live-schema problems.

## Assertion results (28 rows, 28 PASS, 0 FAIL)
Row numbers are `val.res.seq` (gaps come from temporary rows deleted by the harness).

| # | Assertion | Result | Detail |
|---|---|---|---|
| 1 | `a.create_group` | PASS | {"success" : true, "community_id" : "6a9f7762-91d0-4cc3-be18-ab805ff7fe59", "invite_code" : "A4AQYVW6"} |
| 43 | `a.no_member_cap` | PASS | members=42 member_count=42 join_failures=0 max_members_col=f |
| 44 | `b.join_normal` | PASS | {"status" : "success", "community_id" : "6a9f7762-91d0-4cc3-be18-ab805ff7fe59", "name" : "Group One"} |
| 47 | `b.join_requires_approval` | PASS | requires_approval=t status=pending member_rows=0 request_rows=1 request_status=pending |
| 48 | `c.single_like_one_row` | PASS | insert=OK notif_rows=1 triggers_on_post_likes=1(notify_on_post_like_trigger) |
| 49 | `c.two_likes_one_row_count2` | PASS | inserts=OK/OK notif_rows=1 actor_count=2 |
| 50 | `d.two_comments_two_rows` | PASS | c1=OK c2=OK comment_notif_rows=2 |
| 51 | `e.group_post_member_vs_nonmember` | PASS | insert_as_member=OK nonmember_sees=0 member_sees=1 author_sees=1 |
| 52 | `e.public_readable_by_all` | PASS | nonmember=1 follower=1 |
| 53 | `e.followers_private_semantics` | PASS | followers: follower=1 nonfollower=0 groupmember-nonfollower=0 \| private: author=1 other=0 |
| 54 | `f.leave_group_owner_transfer` | PASS | result={"status" : "success"} new_owner=99000000-0000-0000-0000-000000000005 new_owner_role=owner old_owner_rows=0 member_count=2 |
| 55 | `g.delete_account_owner` | PASS | call=OK group_exists=1 new_owner_is_u8=t profile_gone=t |
| 56 | `g.delete_account_member_only` | PASS | call=OK remaining: profiles=0 auth.users=0 members=0 posts=0 follows=0 likes=0 \| member_count g1=42 actual=42 |
| 57 | `h.search_default_max20` | PASS | rows=20 err=- |
| 58 | `h.search_cap_enforced_vs_p_limit` | PASS | search_profiles('cap',1000) rows=20 err=- |
| 59 | `h.search_hides_private_nonmutual` | PASS | private_nonmutual=0 private_who_follows_me=1 NULL_visibility_profile_rows=0 err=- |
| 60 | `i.toggle_only_caller_row` | PASS | caller_row_muted=t other_rows_muted=0 caller={"status" : "success", "muted" : true} nonmember={"status" : "not_member"} |
| 61 | `j.anon_cannot_execute` | PASS | create_group(anon=false), delete_account(anon=false), join_by_invite(anon=false) \| create_group: permission denied for function create_group \| join_by_invite: permission denied for function join_by_invite \| delete_account: p... |
| 62 | `x1.anon_can_read_public_posts` | PASS | anon sees 6 public posts (total public=6) |
| 63 | `x2.same_user_double_like_rejected_by_live_pk` | PASS | 1st=OK 2nd=ERR: duplicate key value violates unique constraint "post_likes_pkey" like_rows=1 notif_rows=1 actor_count=1 |
| 64 | `x3.like_after_read_new_row` | PASS | like notif rows after read+new like=2 (expect 2) |
| 65 | `x4.delete_account_group_owner_who_banned_and_reviewed` | PASS | call=OK |
| 66 | `x5.delete_account_sole_owner_group_removed` | PASS | call=OK group_exists=f |
| 67 | `x6.delete_account_full_data_user` | PASS | call=OK \| leftover_refs_to_U=none \| group: owner=t role=owner \| ban_row=1 banned_by_null=t \| review_row=1 reviewed_by_null=t \| O_posts=1 O_reports=1 O_routine_groups=1 O_items=1 O_privacy=1 M_group_post=1 M_post_reports=1 |
| 68 | `x7.delete_account_sole_owner_group_with_reported_posts` | PASS | call=OK group_gone=t post_gone=t report_gone=t |
| 69 | `x8.rls_live_permissive_policies_removed` | PASS | other_sees_comments=0 other_sees_likes=0 author_sees_comments=1 nonmember_group_insert=ERR: new row violates row-level security policy for table "posts" \| comment_on_invisible_post=ERR: new row violates row-level security poli... |
| 70 | `x9.search_profiles_runs_without_avatar_column` | PASS | profiles.avatar_url exists=f returned avatar_url=NULL |
| 71 | `x10.triggers_and_type_check` | PASS | triggers=notify_on_post_comment_trigger,notify_on_post_like_trigger type_check=1 old_live_trigger_present=f |

Note: the old `x2` ("same user double like gives actor_count 2") is dropped as a requirement. It is replaced by `x2.same_user_double_like_rejected_by_live_pk`, which asserts the live PK(user_id, post_id) rejects the duplicate and actor_count stays 1. `008_post_likes_unique.sql` was deleted from `patched/` and the patch set.

## Changes per file (vs ORIGINAL branch files; all in `fixes_v2.patch`, `git apply --check` OK on a fresh clone of the branch)
| File | Change |
|---|---|
| 001_groups.sql | `community_bans.banned_by` made nullable (original `NOT NULL ... ON DELETE SET NULL` makes delete_account fail for a user who banned someone). `community_join_requests.reviewed_by` -> `ON DELETE SET NULL`. `create_group` inserts `member_count = 0` (the member-count trigger adds 1 for the owner row; original made it 2). |
| 002_posts_visibility.sql | `DROP CONSTRAINT IF EXISTS posts_group_has_community` before ADD (re-runnable). |
| 003_rls_membership.sql | Added anon SELECT policy `posts_select_anon_public` (live policy had no role restriction, so anon could read public posts; `is_member()` is not executable by anon so it needs its own policy). NEW in v2: also drop the live permissive policies that the original 003 did not drop and that would survive next to the new ones: `"users can insert/update/delete their own posts"` (posts), `"post likes are publicly readable"`, `"users can like posts themselves"`, `"users can unlike posts themselves"` (post_likes), `"post comments are publicly readable"`, `"users can comment themselves"` (post_comments). Without this, SELECT USING(true) policies bypass `can_view_post()` (verified by x8). |
| 004_notifications.sql | NEW in v2: both trigger functions return early when the post owner is NULL (live `notifications.user_id` is NOT NULL; the live trigger also returns early). Already correct: adds `related_id`, `post_id`, `actor_count` before use; drops live trigger `on_post_like_notify`; type CHECK extended. |
| 005_account_deletion.sql | (1) reports: removed `DELETE ... reporter_id` (no such column) and replaced `UPDATE ... reported_id = NULL` with `DELETE FROM reports WHERE reported_user_id = calling_user_id` before the profile delete. (2) routines: `routine_privacy` deleted via `item_id IN (items whose group_id in user's groups)`, then `routine_items` by `group_id`, then `routine_groups`. (3) NEW: before `DELETE FROM communities WHERE owner_id = calling_user_id`, delete `post_reports` for all posts in those communities (live post_reports.post_id FK has no cascade; others' posts in the group cascade-delete). Header comment updated. |
| 006_search_profiles.sql | `profiles.avatar_url` does not exist live -> `NULL::text AS avatar_url` (return signature unchanged). Hard cap `LIMIT LEAST(GREATEST(COALESCE(p_limit,20),1),20)`. |
| 007_notifications_muted.sql | unchanged from original. |
| 008_post_likes_unique.sql | removed (live post_likes already has PK). |

Scan of 001-007 for columns that do not exist live: `routine_items.user_id`, `routine_privacy.user_id`, `post_comments.content`, `reports.reporter_id/reported_id`, `profiles.avatar_url` (all fixed above); `notifications.related_id/post_id/actor_count` are only used after 004 adds them; `community_members.created_at` not referenced. No other hits. Runtime proof: all 001-007 execute on the v2 fixture (twice).

## Remaining assumptions NOT verified against live (explicit)
1. Fixture shapes for tables you did not describe are my guesses: `profiles` (only id/nickname/created_at/bio/is_admin/suspended/profile_visibility, no avatar_url — you confirmed no avatar_url), `communities`, `community_members`, `posts` (columns, CHECKs, FK actions: posts.user_id -> profiles ON DELETE CASCADE, communities.owner_id -> profiles with no cascade, posts.community_id cascade), `follows` (PK, created_at), `evening_reflections`, `custom_quick_buttons`, `calendar_event_snapshots`, `notification_settings`, view `follow_counts`.
2. Live FK actions of any table not in the fixture. If any other live table references `profiles(id)` or `auth.users(id)` without ON DELETE CASCADE/SET NULL (e.g. tables I do not know about, storage, anything Supabase-internal), `delete_account()` could still fail live. The generic leftover-reference scan in x6 only covers tables that exist in the fixture.
3. RLS policies on routine_*, reports, post_reports, follows, profiles, notification_settings etc. are placeholders; only the policy names for communities/community_members/posts/notifications/post_likes/post_comments/profiles came from earlier live reads. If live has other permissive policies on posts/post_likes/post_comments/post_reactions/post_reports/communities/community_members with names I did not list, 003 will not drop them (check `select policyname,tablename from pg_policies where schemaname='public'` on live before applying).
4. Live triggers/functions other than `on_post_like_notify` / `notify_on_post_like`, `on_follow_notify` / `notify_on_follow` are unknown (e.g. triggers on post_comments, community_members, posts). The fixture `notify_on_follow` body is a stub.
5. Live `can_view_profile(target_id)` was modelled from your description; it is not used by 001-007, so nothing depends on it here.
6. Supabase role grants/default privileges and the real `auth.uid()/auth.role()` implementations are stubs (JWT-claim GUC based). Real Supabase `auth.users` has many more columns and its own FKs/triggers; deleting from `auth.users` inside the SECURITY DEFINER function requires the function owner (postgres) to have that privilege live (normally true) — untested.
7. Live data: the fixture has a handful of rows, not the real 11 profiles / 143 posts / 5 notifications / 7 communities. Backfills, the 004 unread-like dedupe and the unique index creation were only exercised on tiny data. The widened `notifications_type_check` is a superset of the live like/follow/comment, so it cannot fail on existing rows.
8. Concurrency/locking/runtime on live are untested (the 004 DDL takes ACCESS EXCLUSIVE locks briefly; tiny tables).
9. Behaviour decisions I carried over rather than verified: anon can still read public posts (new anon policy); `delete_account` transfers group ownership to the earliest joined member and deletes sole-owner groups with all their posts; reports about the deleted user are deleted (not anonymised) because live column is NOT NULL.
10. `community_members` 007 `notifications_muted` and the `role`/`joined_at` columns: `joined_at` exists live per earlier fixture; if live lacks it, 001's `ADD COLUMN IF NOT EXISTS` handles it.
11. The edge: `post_reports` rows against posts that are cascade-deleted by any path other than delete_account (e.g. a user deleting their own post through RLS with outstanding post_reports) will fail on live because of the missing cascade — pre-existing live behaviour, not changed here.

## Artifacts
See the path list in the final message of the run; main files: `fixture/live_baseline.v2.sql`, `fixture/02_seed_v2.sql`, `patched_v2/`, `fixes_v2.patch`, `assertions_v2.sql`, `14_results_v2.txt`.
