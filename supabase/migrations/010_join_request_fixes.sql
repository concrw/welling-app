-- 010_join_request_fixes.sql
-- WELLING: Fix join request handling and add group cap checks
--
-- Changes:
--   1. Allow rejected users to re-apply (upsert to pending status)
--   2. approve_join_request rechecks group cap (50), archived status, and invite expiry
--   3. create_group checks user's group cap (50)
--   4. join_by_invite checks group cap before approval/pending
--
-- Follows NULL-safe authorization pattern from 009
-- SECURITY DEFINER with SET search_path = public
-- Idempotent: safe to rerun

-- ============================================================================
-- 1. Fix join_by_invite: allow rejected user to re-apply via upsert
-- ============================================================================

CREATE OR REPLACE FUNCTION join_by_invite(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_community_id text;
  v_requires_approval boolean;
  v_archived_at timestamptz;
  v_invite_expires_at timestamptz;
  v_is_banned boolean;
  v_is_member boolean;
  v_user_group_count int;
  v_existing_request_status text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  SELECT id, requires_approval, archived_at, invite_expires_at
    INTO v_community_id, v_requires_approval, v_archived_at, v_invite_expires_at
    FROM communities
   WHERE invite_code = p_code;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'invalid_code');
  END IF;

  IF v_archived_at IS NOT NULL THEN
    RETURN json_build_object('status', 'archived');
  END IF;

  IF v_invite_expires_at IS NOT NULL AND v_invite_expires_at < now() THEN
    RETURN json_build_object('status', 'expired');
  END IF;

  SELECT COUNT(*) INTO v_user_group_count
    FROM community_members
   WHERE user_id = v_user_id;

  IF v_user_group_count >= 50 THEN
    RETURN json_build_object('status', 'too_many_groups');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM community_bans
     WHERE community_id = v_community_id
       AND user_id = v_user_id
  ) INTO v_is_banned;

  IF v_is_banned THEN
    RETURN json_build_object('status', 'banned');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM community_members
     WHERE community_id = v_community_id
       AND user_id = v_user_id
  ) INTO v_is_member;

  IF v_is_member THEN
    RETURN json_build_object('status', 'already_member');
  END IF;

  IF v_requires_approval THEN
    SELECT status INTO v_existing_request_status
      FROM community_join_requests
     WHERE community_id = v_community_id
       AND user_id = v_user_id;

    IF v_existing_request_status = 'pending' THEN
      RETURN json_build_object('status', 'pending', 'community_id', v_community_id);
    END IF;

    INSERT INTO community_join_requests (community_id, user_id, status)
    VALUES (v_community_id, v_user_id, 'pending')
    ON CONFLICT (community_id, user_id)
    DO UPDATE SET status = 'pending', created_at = now();

    RETURN json_build_object('status', 'pending', 'community_id', v_community_id);
  ELSE
    INSERT INTO community_members (community_id, user_id, role)
    VALUES (v_community_id, v_user_id, 'member');

    UPDATE community_join_requests
       SET status = 'approved'
     WHERE community_id = v_community_id
       AND user_id = v_user_id;

    RETURN json_build_object('status', 'success', 'community_id', v_community_id);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION join_by_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION join_by_invite(text) TO authenticated;

-- ============================================================================
-- 2. Fix approve_join_request: recheck cap, archived, expiry
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
  v_community_id text;
  v_target_user_id uuid;
  v_request_status text;
  v_archived_at timestamptz;
  v_invite_expires_at timestamptz;
  v_user_group_count int;
  v_is_banned boolean;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  SELECT community_id, user_id, status
    INTO v_community_id, v_target_user_id, v_request_status
    FROM community_join_requests
   WHERE id = p_request_id;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  IF v_request_status IS DISTINCT FROM 'pending' THEN
    RETURN json_build_object('status', 'already_processed');
  END IF;

  SELECT role INTO v_caller_role
    FROM community_members
   WHERE community_id = v_community_id
     AND user_id = v_caller_id;

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  SELECT archived_at, invite_expires_at
    INTO v_archived_at, v_invite_expires_at
    FROM communities
   WHERE id = v_community_id;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  IF v_archived_at IS NOT NULL THEN
    UPDATE community_join_requests SET status = 'rejected' WHERE id = p_request_id;
    RETURN json_build_object('status', 'archived');
  END IF;

  IF v_invite_expires_at IS NOT NULL AND v_invite_expires_at < now() THEN
    UPDATE community_join_requests SET status = 'rejected' WHERE id = p_request_id;
    RETURN json_build_object('status', 'expired');
  END IF;

  SELECT COUNT(*) INTO v_user_group_count
    FROM community_members
   WHERE user_id = v_target_user_id;

  IF v_user_group_count >= 50 THEN
    UPDATE community_join_requests SET status = 'rejected' WHERE id = p_request_id;
    RETURN json_build_object('status', 'too_many_groups');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM community_bans
     WHERE community_id = v_community_id
       AND user_id = v_target_user_id
  ) INTO v_is_banned;

  IF v_is_banned THEN
    UPDATE community_join_requests SET status = 'rejected' WHERE id = p_request_id;
    RETURN json_build_object('status', 'banned');
  END IF;

  INSERT INTO community_members (community_id, user_id, role)
  VALUES (v_community_id, v_target_user_id, 'member')
  ON CONFLICT (community_id, user_id) DO NOTHING;

  UPDATE community_join_requests
     SET status = 'approved'
   WHERE id = p_request_id;

  RETURN json_build_object('status', 'success');
END;
$$;

REVOKE ALL ON FUNCTION approve_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION approve_join_request(uuid) TO authenticated;

-- ============================================================================
-- 3. Fix create_group: check user's group cap
-- ============================================================================

CREATE OR REPLACE FUNCTION create_group(
  p_name text,
  p_desc text,
  p_visibility text DEFAULT 'private'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_community_id text;
  v_invite_code text;
  v_user_group_count int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  SELECT COUNT(*) INTO v_user_group_count
    FROM community_members
   WHERE user_id = v_user_id;

  IF v_user_group_count >= 50 THEN
    RETURN json_build_object('status', 'too_many_groups');
  END IF;

  v_community_id := LOWER(REPLACE(p_name, ' ', '-')) || '-' || substr(md5(random()::text), 1, 6);
  v_invite_code := substr(md5(random()::text || clock_timestamp()::text), 1, 12);

  INSERT INTO communities (id, name, "desc", visibility, owner_id, invite_code, requires_approval, created_at)
  VALUES (v_community_id, p_name, p_desc, p_visibility, v_user_id, v_invite_code, false, now());

  INSERT INTO community_members (community_id, user_id, role, joined_at)
  VALUES (v_community_id, v_user_id, 'owner', now());

  RETURN json_build_object(
    'success', true,
    'community_id', v_community_id,
    'invite_code', v_invite_code
  );
END;
$$;

REVOKE ALL ON FUNCTION create_group(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_group(text, text, text) TO authenticated;
