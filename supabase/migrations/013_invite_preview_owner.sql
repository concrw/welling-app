CREATE OR REPLACE FUNCTION get_invite_preview(p_code text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_community RECORD;
BEGIN
  SELECT c.id, c.name, c.member_count, c.invite_expires_at, c.archived_at, p.nickname AS owner_nickname
  INTO v_community
  FROM communities c
  LEFT JOIN profiles p ON p.id = c.owner_id
  WHERE c.invite_code = p_code;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'invalid');
  END IF;
  IF v_community.invite_expires_at IS NOT NULL AND v_community.invite_expires_at < now() THEN
    RETURN json_build_object('status', 'expired');
  END IF;
  IF v_community.archived_at IS NOT NULL THEN
    RETURN json_build_object('status', 'archived');
  END IF;

  RETURN json_build_object(
    'status', 'valid',
    'community_id', v_community.id,
    'name', v_community.name,
    'member_count', v_community.member_count,
    'owner_nickname', v_community.owner_nickname
  );
END;
$$;

REVOKE ALL ON FUNCTION get_invite_preview(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_invite_preview(text) TO authenticated, anon;
