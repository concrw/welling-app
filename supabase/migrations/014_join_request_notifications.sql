-- Notify the requester when a join request is approved or rejected.
-- Notification row: user_id = requester, actor_id = reviewer, related_id = community id,
-- text = community name (the client renders the localized sentence from type + text).
-- Function bodies are identical to live (pg_get_functiondef) except for the notification inserts,
-- which happen only on the plain 'success' paths (not on ban / missing-user paths).

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'follow', 'comment', 'copy', 'report', 'group_join', 'reaction', 'join_approved', 'join_rejected'));

CREATE OR REPLACE FUNCTION public.approve_join_request(p_request_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  SELECT name, archived_at, invite_expires_at INTO v_community
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

  INSERT INTO notifications (user_id, actor_id, type, text, related_id, read, actor_count, created_at)
  VALUES (v_request.user_id, v_caller_id, 'join_approved', v_community.name, v_request.community_id::text, false, 1, now());

  RETURN json_build_object('status', 'success', 'community_id', v_request.community_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.reject_join_request(p_request_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_request RECORD;
  v_community_name text;
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

  UPDATE community_join_requests
  SET status = 'rejected', reviewed_by = v_caller_id, reviewed_at = now()
  WHERE id = p_request_id;

  SELECT name INTO v_community_name FROM communities WHERE id = v_request.community_id;

  -- Requester may have deleted their account; skip the notification rather than fail the rejection.
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_request.user_id) THEN
    INSERT INTO notifications (user_id, actor_id, type, text, related_id, read, actor_count, created_at)
    VALUES (v_request.user_id, v_caller_id, 'join_rejected', COALESCE(v_community_name, ''), v_request.community_id::text, false, 1, now());
  END IF;

  RETURN json_build_object('status', 'success');
END;
$function$;
