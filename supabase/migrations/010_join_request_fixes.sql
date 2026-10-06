CREATE OR REPLACE FUNCTION join_by_invite(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_community RECORD;
  v_request_status text;
  v_user_group_count int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, name, invite_expires_at, archived_at, requires_approval
  INTO v_community
  FROM communities
  WHERE invite_code = p_code;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'invalid');
  END IF;

  IF v_community.invite_expires_at IS NOT NULL AND v_community.invite_expires_at < now() THEN
    RETURN json_build_object('status', 'expired');
  END IF;

  IF v_community.archived_at IS NOT NULL THEN
    RETURN json_build_object('status', 'archived');
  END IF;

  IF EXISTS (SELECT 1 FROM community_bans WHERE community_id = v_community.id AND user_id = v_user_id) THEN
    RETURN json_build_object('status', 'banned');
  END IF;

  IF EXISTS (SELECT 1 FROM community_members WHERE community_id = v_community.id AND user_id = v_user_id) THEN
    RETURN json_build_object('status', 'already', 'community_id', v_community.id, 'name', v_community.name);
  END IF;

  SELECT COUNT(*) INTO v_user_group_count FROM community_members WHERE user_id = v_user_id;
  IF v_user_group_count >= 50 THEN
    RETURN json_build_object('status', 'too_many_groups');
  END IF;

  IF v_community.requires_approval THEN
    SELECT status INTO v_request_status
    FROM community_join_requests
    WHERE community_id = v_community.id AND user_id = v_user_id
    FOR UPDATE;

    IF v_request_status = 'pending' THEN
      RETURN json_build_object('status', 'pending', 'community_id', v_community.id, 'name', v_community.name);
    END IF;

    INSERT INTO community_join_requests (community_id, user_id, status, requested_at)
    VALUES (v_community.id, v_user_id, 'pending', now())
    ON CONFLICT (community_id, user_id)
    DO UPDATE SET status = 'pending', requested_at = now(), reviewed_by = NULL, reviewed_at = NULL;

    RETURN json_build_object('status', 'pending', 'community_id', v_community.id, 'name', v_community.name);
  END IF;

  INSERT INTO community_members (community_id, user_id, role, joined_at)
  VALUES (v_community.id, v_user_id, 'member', now());

  RETURN json_build_object('status', 'success', 'community_id', v_community.id, 'name', v_community.name);
END;
$$;

REVOKE ALL ON FUNCTION join_by_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION join_by_invite(text) TO authenticated;

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
  v_community RECORD;
  v_user_group_count int;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT community_id, user_id, status INTO v_request
  FROM community_join_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  SELECT role INTO v_caller_role
  FROM community_members
  WHERE community_id = v_request.community_id AND user_id = v_caller_id;

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  IF v_request.status <> 'pending' THEN
    RETURN json_build_object('status', 'already_processed', 'current_status', v_request.status);
  END IF;

  SELECT archived_at, invite_expires_at INTO v_community
  FROM communities
  WHERE id = v_request.community_id;

  IF v_community.archived_at IS NOT NULL THEN
    RETURN json_build_object('status', 'archived', 'community_id', v_request.community_id);
  END IF;

  IF v_community.invite_expires_at IS NOT NULL AND v_community.invite_expires_at < now() THEN
    RETURN json_build_object('status', 'expired', 'community_id', v_request.community_id);
  END IF;

  IF EXISTS (SELECT 1 FROM community_bans WHERE community_id = v_request.community_id AND user_id = v_request.user_id) THEN
    UPDATE community_join_requests
    SET status = 'rejected', reviewed_by = v_caller_id, reviewed_at = now()
    WHERE id = p_request_id;
    RETURN json_build_object('status', 'banned', 'community_id', v_request.community_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_request.user_id)
     OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_request.user_id) THEN
    UPDATE community_join_requests
    SET status = 'rejected', reviewed_by = v_caller_id, reviewed_at = now()
    WHERE id = p_request_id;
    RETURN json_build_object('status', 'user_not_found', 'community_id', v_request.community_id);
  END IF;

  IF EXISTS (SELECT 1 FROM community_members WHERE community_id = v_request.community_id AND user_id = v_request.user_id) THEN
    UPDATE community_join_requests
    SET status = 'approved', reviewed_by = v_caller_id, reviewed_at = now()
    WHERE id = p_request_id;
    RETURN json_build_object('status', 'already_member', 'community_id', v_request.community_id);
  END IF;

  SELECT COUNT(*) INTO v_user_group_count FROM community_members WHERE user_id = v_request.user_id;
  IF v_user_group_count >= 50 THEN
    RETURN json_build_object('status', 'too_many_groups', 'community_id', v_request.community_id);
  END IF;

  INSERT INTO community_members (community_id, user_id, role, joined_at)
  VALUES (v_request.community_id, v_request.user_id, 'member', now());

  UPDATE community_join_requests
  SET status = 'approved', reviewed_by = v_caller_id, reviewed_at = now()
  WHERE id = p_request_id;

  RETURN json_build_object('status', 'success', 'community_id', v_request.community_id);
END;
$$;

REVOKE ALL ON FUNCTION approve_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION approve_join_request(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION create_group(
  p_name text,
  p_desc text DEFAULT '',
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
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO v_user_group_count FROM community_members WHERE user_id = v_user_id;
  IF v_user_group_count >= 50 THEN
    RETURN json_build_object('status', 'too_many_groups');
  END IF;

  v_community_id := gen_random_uuid()::text;
  v_invite_code := generate_invite_code();

  INSERT INTO communities (id, name, initial, color, members, focus, "desc", visibility, owner_id, invite_code, member_count)
  VALUES (v_community_id, p_name, upper(substr(p_name, 1, 1)), '#00A389', 1, '', p_desc, p_visibility, v_user_id, v_invite_code, 0);

  INSERT INTO community_members (community_id, user_id, role, joined_at)
  VALUES (v_community_id, v_user_id, 'owner', now());

  RETURN json_build_object('success', true, 'community_id', v_community_id, 'invite_code', v_invite_code);
END;
$$;

REVOKE ALL ON FUNCTION create_group(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_group(text, text, text) TO authenticated;
