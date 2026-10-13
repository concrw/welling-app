-- 008_rls_bans_requests.sql
-- WELLING: RLS on community_bans and community_join_requests + approval/role RPCs
--
-- SECURITY FIX: 001 created these tables but did not enable RLS.
-- With Supabase's default grants, anon/authenticated could read/write via API.
--
-- Changes:
--   • Enable RLS on community_bans, community_join_requests
--   • community_bans: NO policies (RPC-only access via remove_member)
--   • community_join_requests: SELECT policy (requester or owner/admin of that group)
--   • REVOKE ALL from anon on both tables
--   • New RPCs: approve_join_request, reject_join_request, set_member_role (SECURITY DEFINER, owner/admin)
--
-- v4 hardening (validated on scratch PG17, see migration-validation/REPORT_v4.md):
--   • NULL-safe authorization: a caller who is NOT a member of the group has v_caller_role = NULL.
--     `NULL NOT IN ('owner','admin')` and `NULL <> 'owner'` evaluate to NULL (not true) so a plain
--     `IF ... THEN return not_authorized` silently does NOT fire -> any logged-in user was authorized.
--     All checks now use `v_caller_role IS NULL OR ...` / `IS DISTINCT FROM`.
--   • authorization is checked BEFORE the request status is revealed (no already_processed leak to outsiders)
--   • approve_join_request: row lock (FOR UPDATE), refuses + rejects requests of banned users,
--     refuses (and rejects) requests whose profile no longer exists
--   • set_member_role: NULL/empty role rejected, self-change reported as cannot_change_own_role
--   • authenticated keeps only SELECT on community_join_requests and nothing on community_bans
--     (RLS already denies writes; this also removes TRUNCATE/REFERENCES/TRIGGER from the default Supabase grants)

-- ============================================================================
-- 1. Enable RLS and revoke anon access
-- ============================================================================

ALTER TABLE community_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON community_bans FROM PUBLIC, anon, authenticated;
REVOKE ALL ON community_join_requests FROM PUBLIC, anon, authenticated;
-- the SELECT policy below needs the table privilege; all writes go through SECURITY DEFINER RPCs
GRANT SELECT ON community_join_requests TO authenticated;

-- ============================================================================
-- 2. community_bans: NO policies (RPC-only)
-- ============================================================================

-- community_bans is managed through remove_member(p_ban := true) RPC only.
-- No direct SELECT/INSERT/UPDATE/DELETE policies.

-- ============================================================================
-- 3. community_join_requests: SELECT policy
-- ============================================================================

-- Drop existing if rerunning
DROP POLICY IF EXISTS community_join_requests_select ON community_join_requests;

-- SELECT: requester sees own requests, owner/admin of the group sees all requests for that group
CREATE POLICY community_join_requests_select ON community_join_requests
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_join_requests.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );

-- No INSERT/UPDATE/DELETE policies: managed through join_by_invite, approve_join_request, reject_join_request RPCs

-- ============================================================================
-- 4. approve_join_request RPC (owner/admin only)
-- ============================================================================

CREATE OR REPLACE FUNCTION approve_join_request(p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_request RECORD;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get request details (row lock: two admins approving at the same time must not both insert the member)
  SELECT community_id, user_id, status INTO v_request
  FROM community_join_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  -- Check caller is owner or admin of the group.
  -- NULL-safe: a non-member has v_caller_role = NULL and `NULL NOT IN (...)` is NULL, which would skip the check.
  -- Done BEFORE looking at the status so outsiders learn nothing about the request.
  SELECT role INTO v_caller_role
  FROM community_members
  WHERE community_id = v_request.community_id AND user_id = v_caller_id;

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  IF v_request.status <> 'pending' THEN
    RETURN json_build_object('status', 'already_processed', 'current_status', v_request.status);
  END IF;

  -- Banned users can never be approved (remove_member(p_ban := true) after the request was created)
  IF EXISTS (SELECT 1 FROM community_bans WHERE community_id = v_request.community_id AND user_id = v_request.user_id) THEN
    UPDATE community_join_requests
    SET status = 'rejected', reviewed_by = v_caller_id, reviewed_at = now()
    WHERE id = p_request_id;
    RETURN json_build_object('status', 'banned', 'community_id', v_request.community_id);
  END IF;

  -- Requester's profile/account must still exist (defensive: FK ON DELETE CASCADE normally removes the request with the profile)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_request.user_id)
     OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_request.user_id) THEN
    UPDATE community_join_requests
    SET status = 'rejected', reviewed_by = v_caller_id, reviewed_at = now()
    WHERE id = p_request_id;
    RETURN json_build_object('status', 'user_not_found', 'community_id', v_request.community_id);
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM community_members WHERE community_id = v_request.community_id AND user_id = v_request.user_id) THEN
    -- Mark as approved but don't re-insert
    UPDATE community_join_requests
    SET status = 'approved', reviewed_by = v_caller_id, reviewed_at = now()
    WHERE id = p_request_id;
    RETURN json_build_object('status', 'already_member', 'community_id', v_request.community_id);
  END IF;

  -- Add member (triggers member_count increment)
  INSERT INTO community_members (community_id, user_id, role, joined_at)
  VALUES (v_request.community_id, v_request.user_id, 'member', now());

  -- Mark request as approved
  UPDATE community_join_requests
  SET status = 'approved', reviewed_by = v_caller_id, reviewed_at = now()
  WHERE id = p_request_id;

  RETURN json_build_object('status', 'success', 'community_id', v_request.community_id);
END;
$$;

REVOKE ALL ON FUNCTION approve_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION approve_join_request(uuid) TO authenticated;

COMMENT ON FUNCTION approve_join_request IS 'Owner/admin approves a pending join request. Inserts community_members row and updates request status.';

-- ============================================================================
-- 5. reject_join_request RPC (owner/admin only)
-- ============================================================================

CREATE OR REPLACE FUNCTION reject_join_request(p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_request RECORD;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get request details
  SELECT community_id, user_id, status INTO v_request
  FROM community_join_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  -- Check caller is owner or admin of the group.
  -- NULL-safe: a non-member has v_caller_role = NULL and `NULL NOT IN (...)` is NULL, which would skip the check.
  SELECT role INTO v_caller_role
  FROM community_members
  WHERE community_id = v_request.community_id AND user_id = v_caller_id;

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  IF v_request.status <> 'pending' THEN
    RETURN json_build_object('status', 'already_processed', 'current_status', v_request.status);
  END IF;

  -- Mark request as rejected
  UPDATE community_join_requests
  SET status = 'rejected', reviewed_by = v_caller_id, reviewed_at = now()
  WHERE id = p_request_id;

  RETURN json_build_object('status', 'success');
END;
$$;

REVOKE ALL ON FUNCTION reject_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION reject_join_request(uuid) TO authenticated;

COMMENT ON FUNCTION reject_join_request IS 'Owner/admin rejects a pending join request.';

-- ============================================================================
-- 6. set_member_role RPC (owner only, cannot assign owner)
-- ============================================================================

CREATE OR REPLACE FUNCTION set_member_role(
  p_community_id text,
  p_user_id uuid,
  p_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_target_current_role text;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check caller is owner of the group.
  -- NULL-safe: a non-member has v_caller_role = NULL and `NULL <> 'owner'` is NULL, which would skip the check.
  SELECT role INTO v_caller_role
  FROM community_members
  WHERE community_id = p_community_id AND user_id = v_caller_id;

  IF v_caller_role IS DISTINCT FROM 'owner' THEN
    RETURN json_build_object('status', 'not_authorized', 'message', 'Only owner can change member roles');
  END IF;

  -- Validate role (NULL-safe: `NULL NOT IN (...)` is NULL and community_members.role is nullable)
  IF p_role IS NULL OR p_role NOT IN ('member', 'admin') THEN
    RETURN json_build_object('status', 'invalid_role', 'message', 'Role must be member or admin. Use transfer_ownership to change owner.');
  END IF;

  -- Cannot change own role (owner trying to demote self)
  IF p_user_id IS NULL OR p_user_id = v_caller_id THEN
    RETURN json_build_object('status', 'cannot_change_own_role');
  END IF;

  -- Check target is a member
  SELECT role INTO v_target_current_role
  FROM community_members
  WHERE community_id = p_community_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_member');
  END IF;

  -- Cannot change another owner's role through this RPC (e.g. legacy data with two owner rows)
  IF v_target_current_role = 'owner' THEN
    RETURN json_build_object('status', 'cannot_change_owner', 'message', 'Use transfer_ownership to change owner');
  END IF;

  -- Update role
  UPDATE community_members
  SET role = p_role
  WHERE community_id = p_community_id AND user_id = p_user_id;

  RETURN json_build_object('status', 'success', 'new_role', p_role);
END;
$$;

REVOKE ALL ON FUNCTION set_member_role(text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_member_role(text, uuid, text) TO authenticated;

COMMENT ON FUNCTION set_member_role IS 'Owner changes member role (member ↔ admin). Cannot assign owner; use transfer_ownership.';

-- ============================================================================
-- 완료
-- ============================================================================

-- 확인 쿼리:
--   SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('community_bans', 'community_join_requests');
--   \d community_bans
--   \d community_join_requests
