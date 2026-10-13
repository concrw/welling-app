-- 015_rls_hardening.sql
-- Source: .agent/live_rls_result.md (findings F1, F2, F4, F5, F6, F7);
-- revised per .agent/review_015_result.md (F1 direct INSERT dropped, F2 community_id immutable).
-- NOT applied to any DB by whoever wrote this file. Review, then apply on a branch first.
-- Independent of 014 (does not touch approve_join_request / notifications constraints).
--
-- Deliberately NOT included: F3 (profiles/follows SELECT) because author embeds
-- (posts -> profiles!posts_user_id_fkey, comment authors, Ranking, CommunitySettings)
-- would return null for followers/private profiles; needs an app-side change.
-- F8-F10 and get_routine_suggestions_for_keyword min_users: not touched.

BEGIN;

-- ============================================================================
-- F1. community_members: no direct client INSERT at all
-- ============================================================================
-- The app joins only through join_by_invite / create_group / approve_join_request
-- (SECURITY DEFINER, owner postgres = BYPASSRLS, so they need no INSERT policy).
-- With no INSERT policy `authenticated` cannot insert any row directly: no self-assigned
-- owner/admin, and no way around invite expiry, the 50-group cap, bans, archived groups
-- or requires_approval. Owner/admin rows are written only by those RPCs plus
-- transfer_ownership / set_member_role.
-- Known side effect: the unreferenced appStore.createCommunity direct-insert path will
-- fail (it already fails after F7 below). Left as is on purpose.
DROP POLICY IF EXISTS community_members_insert ON community_members;

-- ============================================================================
-- F2. posts: block direct client edits of moderation columns and of community_id
-- ============================================================================
-- RLS cannot compare OLD/NEW, so this is a trigger. posts_update is NOT changed: it stays
-- author-only (USING/WITH CHECK user_id = auth.uid()); a WITH CHECK is_member() would break
-- edits of old posts after leaving a group.
--
-- Admin moderation (hide/unhide): the client has no post UPDATE and posts_update has no
-- admin branch, so a platform admin cannot UPDATE another user's post through PostgREST
-- (zero rows affected; the trigger is never reached). Admin hide/unhide is therefore
-- service-role / BYPASSRLS / a future SECURITY DEFINER RPC only. This trigger has no
-- is_admin exemption; it restricts only statements running as 'authenticated'/'anon'
-- (current_user), so service_role, postgres and a future postgres-owned SECURITY DEFINER
-- RPC (current_user = postgres even though auth.uid() is still set) pass.
CREATE OR REPLACE FUNCTION public.posts_protect_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.hidden_at IS DISTINCT FROM OLD.hidden_at
       OR NEW.hidden_by IS DISTINCT FROM OLD.hidden_by THEN
      RAISE EXCEPTION 'moderation columns are read-only';
    END IF;

    IF NEW.community_id IS DISTINCT FROM OLD.community_id THEN
      RAISE EXCEPTION 'community_id cannot be changed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.posts_protect_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS posts_protect_columns_trigger ON posts;
CREATE TRIGGER posts_protect_columns_trigger
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.posts_protect_columns();

-- ============================================================================
-- F4. storage bucket post-images: size/MIME limits, no public listing
-- ============================================================================
-- Client (RecordModal) allows image/* up to 10 MB, so the limit matches 10 MB.
-- MIME allow-list excludes SVG/HTML (served from the project domain otherwise).
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','image/avif']
WHERE id = 'post-images';

-- Public bucket URLs (getPublicUrl) do not need a SELECT policy. The app still calls
-- .list(userId) and .remove() on the user's OWN folder (account deletion, post delete),
-- and those need SELECT, so replace the open policy with an owner-folder one.
DROP POLICY IF EXISTS "post images public read" ON storage.objects;
DROP POLICY IF EXISTS "post images read by owner" ON storage.objects;
CREATE POLICY "post images read by owner" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- F5. RLS on non-API schemas (deny-all for non-owner roles; owner/service unaffected)
-- ============================================================================
-- BEFORE APPLY: inventory every consumer of these schemas that is neither the table owner
-- nor a BYPASSRLS role (jobs, reporting roles, future grants); they will see no rows.
-- The loop covers whatever tables exist at apply time, not a frozen list.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('welling', 'backup_20261001') AND c.relkind IN ('r', 'p')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.nspname, r.relname);
  END LOOP;
END $$;

-- ============================================================================
-- F6. function EXECUTE hygiene (trigger functions; EXECUTE is checked at CREATE TRIGGER, not at fire time)
-- ============================================================================
REVOKE ALL ON FUNCTION public.update_community_member_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_post_comment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.nullify_post_snapshot_on_insert() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.snapshot_reported_post() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.generate_invite_code() SET search_path = public;

-- ============================================================================
-- F7. communities: creation only via create_group(); freeze system columns on direct writes
-- ============================================================================
-- The app creates groups via create_group (NewCommunity.tsx); the old direct insert in
-- appStore.createCommunity is unreferenced.
DROP POLICY IF EXISTS communities_insert ON communities;

-- Direct client PATCH runs as current_user = 'authenticated'. The group RPCs (leave_group,
-- rotate_invite_code, set_invite_expiry, transfer_ownership) and the member_count trigger
-- are SECURITY DEFINER owned by postgres, so current_user = 'postgres' there and they pass.
CREATE OR REPLACE FUNCTION public.communities_protect_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon')
     AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin)
     AND (NEW.owner_id IS DISTINCT FROM OLD.owner_id
          OR NEW.member_count IS DISTINCT FROM OLD.member_count
          OR NEW.members IS DISTINCT FROM OLD.members
          OR NEW.invite_code IS DISTINCT FROM OLD.invite_code
          OR NEW.invite_expires_at IS DISTINCT FROM OLD.invite_expires_at
          OR NEW.archived_at IS DISTINCT FROM OLD.archived_at) THEN
    RAISE EXCEPTION 'use the group RPCs to change owner, invite or archive settings';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.communities_protect_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS communities_protect_columns_trigger ON communities;
CREATE TRIGGER communities_protect_columns_trigger
  BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION public.communities_protect_columns();

COMMIT;

-- ============================================================================
-- ROLLBACK (run manually, in this order, if needed)
-- ============================================================================
-- F7:
--   DROP TRIGGER IF EXISTS communities_protect_columns_trigger ON communities;
--   DROP FUNCTION IF EXISTS public.communities_protect_columns();
--   CREATE POLICY communities_insert ON communities FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
-- F6:
--   GRANT EXECUTE ON FUNCTION public.update_community_member_count() TO PUBLIC, anon, authenticated;
--   GRANT EXECUTE ON FUNCTION public.notify_on_post_comment() TO authenticated;
--   GRANT EXECUTE ON FUNCTION public.nullify_post_snapshot_on_insert() TO authenticated;
--   GRANT EXECUTE ON FUNCTION public.snapshot_reported_post() TO authenticated;
--   ALTER FUNCTION public.generate_invite_code() RESET search_path;
--   (live grants before this migration: update_community_member_count -> PUBLIC/anon/authenticated;
--    the other three -> authenticated only)
-- F5:
--   DO $$ DECLARE r record; BEGIN
--     FOR r IN SELECT n.nspname, c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
--              WHERE n.nspname IN ('welling','backup_20261001') AND c.relkind IN ('r','p') LOOP
--       EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', r.nspname, r.relname);
--     END LOOP; END $$;
-- F4:
--   UPDATE storage.buckets SET file_size_limit = NULL, allowed_mime_types = NULL WHERE id = 'post-images';
--   DROP POLICY IF EXISTS "post images read by owner" ON storage.objects;
--   CREATE POLICY "post images public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'post-images');
-- F2:
--   DROP TRIGGER IF EXISTS posts_protect_columns_trigger ON posts;
--   DROP FUNCTION IF EXISTS public.posts_protect_columns();
-- F1:
--   CREATE POLICY community_members_insert ON community_members FOR INSERT TO authenticated
--     WITH CHECK ((user_id = auth.uid()) AND EXISTS (SELECT 1 FROM communities c
--                 WHERE c.id = community_members.community_id AND c.visibility = 'public'));
--   (restores the original policy, which lets any user self-insert as owner/admin; prefer fixing forward)
