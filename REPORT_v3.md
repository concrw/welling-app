# WELLING migrations 001-007 — scratch validation report v3

Date: 2026-10-01 (Asia/Seoul). Engine: PostgreSQL 17.11 (Debian), local scratch cluster (unix socket /tmp, port 54329, DB `scratch`, data dir /workspace/pgdata).
**No real Supabase DB was touched. Nothing was pushed to GitHub.**
Base: branch `cursor/group-first-restructure-4a6a` @ fbb10f8. `fixes_v3.patch` is a diff against fbb10f8 (`git apply --check` OK on a fresh clone; applying it reproduces `patched_v3/*` byte-for-byte).

Environment note: the scratch cluster in /workspace/pgdata was not startable (PG binaries missing from the box, data dir had lost its empty dirs, e.g. pg_notify, and had mode 755). I installed `postgresql-17` from Debian apt, moved the broken dir to /workspace/pgdata.broken and re-`initdb`ed /workspace/pgdata (same socket/port/DB name). The DB is fully rebuilt from the fixture on every run, so nothing was lost.

## What the v3 fixture now encodes (fixture/live_baseline.v3.sql + fixture/02_seed_v3.sql)
* FKs exactly as on live: everything NO ACTION except CASCADE on post_comments/post_likes/post_reactions.post_id, routine_items.group_id, routine_privacy.item_id. (profiles.id, posts.user_id/community_id, communities.owner_id, community_members.*, notifications.*, follows.*, evening_reflections, custom_quick_buttons, calendar_event_snapshots, notification_settings, routine_groups, post_*.user_id, post_reports.*, reports.reported_user_id all NO ACTION; evening_reflections/custom_quick_buttons/calendar_event_snapshots now reference auth.users per your list.) Asserted by `y2`.
* RLS policies exactly the live set you listed (names, cmds), placeholders only for tables you said are untouched by 003 (follows, reports, routine_*, evening_reflections, custom_quick_buttons, calendar_event_snapshots, notification_settings). Live policy *expressions* for post_reactions / post_reports / posts INSERT etc. were not given to me, so those are assumed (see "unverified").
* `get_routine_suggestions_for_keyword(keyword text, min_users int)` signature fixed.
* Seed resembling live: 11 profiles (one admin), 7 communities (6 ownerless, 5 with zero members, stale legacy `members` counters 7/12/3/5/2, `comm-<ts>` ids), exactly 2 community_members rows, 143 posts (142 with community_id, 125 of them *public* posts by non-members; categories habit/diet/reflection/routine; visibility public/followers/private only), comments/likes/reactions/post_reports on legacy posts incl. posts inside the groups that get deleted, 5 notifications all type 'follow' and read never NULL. (Loaded with session_replication_role=replica so no derived like-notifications pollute the 5.)

## Run results
* `reset_and_load_v3.sh` -> `run_migs_v3.sh` x2 (`psql -v ON_ERROR_STOP=1 -1 -f` per file): **14/14 invocations exit 0, 0 ERROR lines** (`21_v3_run1.log`, `22_v3_run2.log`).
* 001 on seed data: invite_code backfilled for all 7 (0 NULL, 0 dups), NOT NULL set; member_count backfill = real row count (the 5 empty ownerless groups and comm-...03.. = 0, the 2 populated = 1; legacy stale `members` counters ignored); roles: owner for the owner row, member for the other; 002 constraints apply (existing 142 community posts are public/followers/private, none is `group`, so `posts_group_has_community` holds); 004 type CHECK applies to the 5 follow rows.
* Assertions: `assertions_v3.sql` = old a–j + x1–x10 (unchanged) + new y1–y10 → **38 rows, 38 PASS, 0 FAIL**. Raw: `24_results_v3.txt`, `23_assertions_v3.log`.

## Assertion table (every row)
Row numbers are `val.res.seq` (gaps are temporary rows deleted by the harness).

| # | Assertion | Result | Detail |
|---|---|---|---|
| 1 | `a.create_group` | PASS | {"success" : true, "community_id" : "32325ed2-54f0-4417-8aff-5c5ff9170020", "invite_code" : "HF8UEYAZ"} |
| 43 | `a.no_member_cap` | PASS | members=42 member_count=42 join_failures=0 max_members_col=f |
| 44 | `b.join_normal` | PASS | {"status" : "success", "community_id" : "32325ed2-54f0-4417-8aff-5c5ff9170020", "name" : "Group One"} |
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
| 61 | `j.anon_cannot_execute` | PASS | create_group(anon=false), delete_account(anon=false), join_by_invite(anon=false) \| create_group: permission denied for function create_group \| join_by_invite: permission denied for function join_by_invite \| delete_account: permission denied for function delete_account |
| 62 | `x1.anon_can_read_public_posts` | PASS | anon sees 133 public posts (total public=133) |
| 63 | `x2.same_user_double_like_rejected_by_live_pk` | PASS | 1st=OK 2nd=ERR: duplicate key value violates unique constraint "post_likes_pkey" like_rows=1 notif_rows=1 actor_count=1 |
| 64 | `x3.like_after_read_new_row` | PASS | like notif rows after read+new like=2 (expect 2) |
| 65 | `x4.delete_account_group_owner_who_banned_and_reviewed` | PASS | call=OK |
| 66 | `x5.delete_account_sole_owner_group_removed` | PASS | call=OK group_exists=f |
| 67 | `x6.delete_account_full_data_user` | PASS | call=OK \| leftover_refs_to_U=none \| group: owner=t role=owner \| ban_row=1 banned_by_null=t \| review_row=1 reviewed_by_null=t \| O_posts=1 O_reports=1 O_routine_groups=1 O_items=1 O_privacy=1 M_group_post=1 M_post_reports=1 |
| 68 | `x7.delete_account_sole_owner_group_with_reported_posts` | PASS | call=OK group_gone=t post_gone=t report_gone=t |
| 69 | `x8.rls_live_permissive_policies_removed` | PASS | other_sees_comments=0 other_sees_likes=0 author_sees_comments=1 nonmember_group_insert=ERR: new row violates row-level security policy for table "posts" \| comment_on_invisible_post=ERR: new row violates row-level security policy for table "post_commen |
| 70 | `x9.search_profiles_runs_without_avatar_column` | PASS | profiles.avatar_url exists=f returned avatar_url=NULL |
| 71 | `x10.triggers_and_type_check` | PASS | triggers=notify_on_post_comment_trigger,notify_on_post_like_trigger type_check=1 old_live_trigger_present=f |
| 72 | `y1.migrations_on_live_like_seed_data` | PASS | seed communities=7 invite_code_nulls=0 dup_codes=0 member_count_mismatches=none \| ownerless+empty member_count: comm-1759000000003=0,comm-1759000000004=0,comm-1759000000005=0,comm-1759000000006=0,comm-1759000000007=0 \| roles(user suffix): 01=owner,02=member \| seed_posts=143 legacy_public_group_posts_by_nonmembers=125 \| follow_notifs=5 bad_types=0 invite_code_nullable=NO |
| 73 | `y2.fk_actions_match_live` | PASS | cascade FKs=[post_comments.post_id, post_likes.post_id, post_reactions.post_id, routine_items.group_id, routine_privacy.item_id] non-(NO ACTION/CASCADE) FKs=none total_checked=26 posts.community_id=NO ACTION notifications.post_id=CASCADE |
| 74 | `y3.exact_policy_set_after_migrations` | PASS | policy names match expected set on 9 tables (live "admins can update post reports", notifications+profiles policies kept) |
| 75 | `y4.group_only_post_reactions_likes_comments_hidden_from_nonviewer` | PASS | non-viewer sees reactions/likes/comments=0/0/0 \| member sees=1/1/1 \| non-viewer insert reaction=ERR: new row violates row-level security policy for table "p like=ERR: new row violates row-level security comment=ERR: new row violates row-level security report=ERR: new row violates row-level security \| member insert reaction=OK report=OK |
| 76 | `y5.post_reports_admin_update_and_visibility` | PASS | select: admin=1 reporter=1 unrelated=0 group_owner=1 \| update rows: unrelated=0 reporter=0 (status stays open) admin=1 -> now dismissed |
| 77 | `y6.old_like_trigger_dropped_nothing_depends_on_it` | PASS | on_post_like_notify exists=f \| triggers using notify_on_post_like()=1(notify_on_post_like_trigger) \| non-trigger dependents on that function=0 \| on_follow_notify kept=t \| untouched live fns: can_view_profile(uuid), get_routine_suggestions_for_keyword(text,integer), notify_on_follow() |
| 78 | `y7.leave_transfer_then_delete_old_owner` | PASS | sole leave={"status" : "success"} archived=t \| transfer={"status" : "success"} \| old owner delete_account=OK \| new owner ok=t member_count(g2)=1 member_count(archived g)=0 |
| 79 | `y8.delete_account_sole_owner_group_with_other_users_legacy_posts` | PASS | call=OK notifs_referencing_group_posts_before=7 \| group=0 posts_in_group=0 legacy_posts=0 comments=0 reactions=0 likes=0 reports=0 notifs=0 \| kept: pkeep=1 ckeep=1 rkeep=1 nkeep=2 \| profile=0 |
| 80 | `y9.seed_owner_delete_account_removes_group_and_nonmember_legacy_posts` | PASS | call=OK \| posts in group before=20 (by non-members=19) \| ownerless_groups_left=6 total_groups_with_seed_prefix=6 posts_in_deleted_group=0 orphan_comments=0 orphan_reports=0 orphan_notifs=0 |
| 81 | `y10.delete_account_user_who_hid_a_post` | PASS | call=OK hidden_by_after=NULL post_kept=t new_owner_is_member=t |

## Mutation check (`31_mutation_check_v3.txt`)
Each mutation re-ran the whole pipeline (reload, 001-007 x2, assertions); migrations still exit 0 in all of them, the assertions catch the regression:
| Mutation (old behaviour restored) | Assertions that FAIL |
|---|---|
| m1: 003 without the 3 post_reactions policy drops | `y3`, `y4` (non-viewer sees the reaction on a group-only post: 1 row) |
| m2: 003 without the 3 post_reports drops | `y3`, `y4` (live "users can report posts themselves"/"view their own reports"/"admins can view all" survive next to the new ones) |
| m3: 005 from v2 (only deletes post_reports, no explicit posts/community_members delete) | `x4`, `x5`, `x7`, `y8`, `y9` (FK `community_members_community_id_fkey` / posts FK violation on sole-owner group delete) |
| m4: 004 without `DROP TRIGGER on_post_like_notify` | `c.single_like_one_row`, `c.two_likes_one_row_count2`, `x2`, `x10`, `y6` (double notification, actor_count doubled) |
| m5: fixture FKs/policies back to v2 (CASCADE) | `y2` (and `y3`,`y5`,`y6` from v2's placeholder policies / no live admin policy) |
| m6: 003 also drops live "admins can update post reports" | `y3`, `y5` (admin update affects 0 rows) |
| m7: 001 without member_count backfill | `y1` (member_count 0 vs 1 real) |

Important finding: with CASCADE FKs in the v2 fixture, the v2 005 passed; with the live NO ACTION FKs the v2 005 **fails** (m3) — `DELETE FROM communities` is blocked by community_members rows (live-style FK) and by other users' legacy posts. This is the bug v3 fixes.

## Changes per file vs fbb10f8 (`fixes_v3.patch`)
| File | Change |
|---|---|
| 001_groups.sql | **unchanged** (no change needed): invite_code backfill/NOT NULL, role/joined_at, member_count backfill work on the live-like seed; community_bans/community_join_requests FKs to communities/profiles are ON DELETE CASCADE (+ SET NULL for banned_by/reviewed_by) so they do not block deleting a user or group (asserted by x4, x6, y10). |
| 002_posts_visibility.sql | unchanged. `posts.hidden_by` is ON DELETE SET NULL (y10). |
| 003_rls_membership.sql | + drop live `"post reactions are publicly readable"`, `"users can react to posts themselves"`, `"users can remove their own reactions"` (post_reactions); + drop live `"users can report posts themselves"`, `"users can view their own reports"`, `"admins can view all post reports"` (post_reports). Live `"admins can update post reports"` is deliberately KEPT (no replacement UPDATE policy, y5). Header comment updated. |
| 004_notifications.sql | unchanged (already drops `on_post_like_notify` + `notify_on_post_like_trigger`, re-creates function; confirmed by y6: nothing else depends on the old trigger, only the triggers `on_follow_notify` (follows) and the new `notify_on_post_like_trigger`/`notify_on_post_comment_trigger` remain; live functions can_view_profile/get_routine_suggestions_for_keyword/notify_on_follow untouched). |
| 005_account_deletion.sql | Sole-owner group deletion rewritten for NO ACTION FKs: collect the user's still-owned group ids (`v_dead_groups`), then in order delete post_reports, post_comments, post_reactions, post_likes, notifications (post_id) of **all** posts with `community_id` in those groups (regardless of author - legacy posts by non-members), then the posts, then the group's community_members rows, then the communities. (community_bans/join_requests cascade.) Rest of the function unchanged (it already explicitly deleted user rows in every NO ACTION table before profile/auth.users). Comments updated. |
| 006, 007 | unchanged |

Other tables vs delete_account(): audited every public table with a uuid FK to profiles/auth.users/posts/communities in the scratch DB after all migrations; the generic leftover scan in x6 (any uuid column = deleted user) finds nothing, and y8/y9/y10 + x4-x7 cover group/ban/review/hide cases. leave_group / transfer_ownership / remove_member do not delete communities or posts, so the FK change does not affect them (y7, f).

## Still unverified against live (explicit)
1. Policy **expressions** (USING / WITH CHECK) of every live policy — only names/commands were provided. The fixture uses assumed expressions for post_reactions, post_reports (incl. the admin definition `profiles.is_admin = true`), posts insert/update/delete, notifications, profiles. If live "admins can update post reports" is NOT admin-based on `profiles.is_admin`, or its UPDATE also needs a SELECT policy to see rows (RLS UPDATE needs a SELECT-visible row): after 003 the admin can still see rows through `post_reports_select` (admin branch), asserted in y5, but that depends on the live admin check being `profiles.is_admin`.
2. Policy roles: fixture creates live policies as `{public}` (no TO clause) and the new 003 policies are `TO authenticated`; anon behaviour for post_likes/comments/reactions/reports/communities/community_members after 003 follows from that (anon only gets `posts_select_anon_public`). Whether live app uses anon for any of these is not verified.
3. Live column defaults/constraints I did not receive (e.g. profiles columns beyond the list, check constraints on other tables, unique indexes such as `notifications_unread_like_uniq`, other live indexes, triggers on tables other than follows/post_likes, views/materialized views other than follow_counts, publication/realtime settings, GRANTs). Fixture grants are Supabase-default ALL to anon/authenticated/service_role.
4. Live seed fidelity: the data is synthetic. Real values (e.g. real `visibility` NULLs in communities/posts, duplicate community_members, ids, text lengths, real notification texts) are unknown. In particular if any live post has `visibility` NULL it passes the new CHECK (NULL is allowed) but would be invisible to policies; if live communities.visibility has other values the existing CHECK (`public`/`private`) would already reject them.
5. 001 `ALTER COLUMN invite_code SET NOT NULL` + `ADD COLUMN ... UNIQUE` are fine on 7 rows; lock/timing on a larger live table, Supabase-specific roles (supabase_admin ownership, `auth.role()`, `gen_random_uuid` availability) and extension schema are not reproduced (stubs only).
6. `delete_account()` on live has SECURITY DEFINER owner = postgres on Supabase; its ability to `DELETE FROM auth.users` and BYPASSRLS behaviour is emulated with a superuser-owned function in scratch.
7. Storage objects (post images) are still not deleted by the function (TODO in 005, unchanged).
8. Live trigger function bodies `notify_on_follow()`, `get_routine_suggestions_for_keyword` are stubs in the fixture (bodies unknown); 004 does not touch them.
9. `reports` RLS policy and the other "own" policies are placeholders; not exercised by 001-007.
10. Not verified: migration run time/locks on live, and behaviour when migrations are run through the Supabase CLI (single transaction per file is emulated with `-1`).
