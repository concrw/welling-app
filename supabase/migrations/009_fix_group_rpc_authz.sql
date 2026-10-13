-- 009_fix_group_rpc_authz.sql
-- WELLING: NULL-safe authorization fix for group management RPCs (001 functions)
--
-- SECURITY FIX: Role authorization checks in 001 were NULL-unsafe.
-- When a non-member called an RPC, v_caller_role was NULL, so checks like
-- `v_caller_role NOT IN ('owner','admin')` evaluated to NULL (not TRUE),
-- causing the IF to silently not fire -> any authenticated user was authorized.
--
-- Impact before this fix (live 001-008 applied 2026-10-01):
--   • remove_member / rotate_invite_code / set_invite_expiry: callable by any authenticated user
--   • transfer_ownership: ownerless legacy groups (6 of 7 live) allowed any member to become owner;
--     self-transfer would overwrite role to member
--
-- This migration (idempotent, safe to rerun):
--   • Replaces 4 functions from 001_groups.sql with NULL-safe checks
--   • Functions: remove_member, transfer_ownership, rotate_invite_code, set_invite_expiry
--   • All checks now use `v_caller_role IS NULL OR ...` / `IS DISTINCT FROM`
--   • transfer_ownership: rejects self-transfer (invalid_target) and NULL-safe owner check
--
-- Note: 008 RPCs (approve_join_request, reject_join_request, set_member_role) are already
-- fixed in migration 008 (v4 patch applied before this migration was created).

-- ============================================================================
-- 1. remove_member: 멤버 내보내기 (그룹장 또는 관리자)
-- ============================================================================

CREATE OR REPLACE FUNCTION remove_member(
  p_community_id text,
  p_user_id uuid,
  p_ban boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_owner_id uuid;
  v_caller_role text;
  v_target_role text;
  v_is_admin boolean;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT owner_id INTO v_owner_id FROM communities WHERE id = p_community_id;
  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  -- 권한 확인: owner 또는 admin
  SELECT role INTO v_caller_role FROM community_members WHERE community_id = p_community_id AND user_id = v_caller_id;
  SELECT is_admin INTO v_is_admin FROM profiles WHERE id = v_caller_id;
  
  -- NULL-safe: a non-member caller has v_caller_role = NULL; `NULL NOT IN (...)` is NULL (not true) and would skip this check
  IF (v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin')) AND NOT COALESCE(v_is_admin, false) THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  -- 자기 자신 내보내기 불가
  IF p_user_id = v_caller_id THEN
    RETURN json_build_object('status', 'cannot_remove_self');
  END IF;

  -- 관리자는 owner나 다른 admin을 내보낼 수 없음
  SELECT role INTO v_target_role FROM community_members WHERE community_id = p_community_id AND user_id = p_user_id;
  IF v_caller_role = 'admin' AND v_target_role IN ('owner', 'admin') THEN
    RETURN json_build_object('status', 'cannot_remove_owner_or_admin');
  END IF;

  -- 멤버 삭제
  DELETE FROM community_members WHERE community_id = p_community_id AND user_id = p_user_id;

  -- 차단 기록
  IF p_ban THEN
    INSERT INTO community_bans (community_id, user_id, banned_by)
    VALUES (p_community_id, p_user_id, v_caller_id)
    ON CONFLICT (community_id, user_id) DO NOTHING;
  END IF;

  RETURN json_build_object('status', 'success');
END;
$$;

REVOKE ALL ON FUNCTION remove_member(text, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION remove_member(text, uuid, boolean) TO authenticated;

-- ============================================================================
-- 2. transfer_ownership: 소유권 이전 (그룹장만)
-- ============================================================================

CREATE OR REPLACE FUNCTION transfer_ownership(
  p_community_id text,
  p_new_owner_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_owner_id uuid;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT owner_id INTO v_owner_id FROM communities WHERE id = p_community_id;
  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  -- NULL-safe: ownerless legacy groups have owner_id = NULL; `NULL <> uuid` is NULL (not true) and would skip this check
  IF v_owner_id IS DISTINCT FROM v_caller_id THEN
    RETURN json_build_object('status', 'not_owner');
  END IF;

  -- 자기 자신에게 이전 불가 (아래 두 UPDATE가 자기 role을 owner -> member로 덮어써서 owner_id만 남고 role이 member가 됨)
  IF p_new_owner_id IS NULL OR p_new_owner_id = v_caller_id THEN
    RETURN json_build_object('status', 'invalid_target');
  END IF;

  -- 대상이 멤버인지 확인
  IF NOT EXISTS (SELECT 1 FROM community_members WHERE community_id = p_community_id AND user_id = p_new_owner_id) THEN
    RETURN json_build_object('status', 'not_member');
  END IF;

  -- 소유권 이전
  UPDATE communities SET owner_id = p_new_owner_id WHERE id = p_community_id;
  UPDATE community_members SET role = 'owner' WHERE community_id = p_community_id AND user_id = p_new_owner_id;
  UPDATE community_members SET role = 'member' WHERE community_id = p_community_id AND user_id = v_caller_id;

  RETURN json_build_object('status', 'success');
END;
$$;

REVOKE ALL ON FUNCTION transfer_ownership(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION transfer_ownership(text, uuid) TO authenticated;

-- ============================================================================
-- 3. rotate_invite_code: 초대 코드 재발급 (그룹장 또는 관리자)
-- ============================================================================

CREATE OR REPLACE FUNCTION rotate_invite_code(p_community_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_new_code text;
  max_tries int := 10;
  i int;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 권한 확인: owner 또는 admin
  SELECT role INTO v_caller_role FROM community_members WHERE community_id = p_community_id AND user_id = v_caller_id;
  
  -- NULL-safe: a non-member caller has v_caller_role = NULL; `NULL NOT IN (...)` is NULL (not true) and would skip this check
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  -- 새 코드 생성 (중복 시 재시도)
  FOR i IN 1..max_tries LOOP
    v_new_code := generate_invite_code();
    BEGIN
      UPDATE communities SET invite_code = v_new_code WHERE id = p_community_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      CONTINUE;
    END;
  END LOOP;

  RETURN json_build_object('status', 'success', 'invite_code', v_new_code);
END;
$$;

REVOKE ALL ON FUNCTION rotate_invite_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION rotate_invite_code(text) TO authenticated;

-- ============================================================================
-- 4. set_invite_expiry: 초대 만료 설정 (그룹장 또는 관리자)
-- ============================================================================

CREATE OR REPLACE FUNCTION set_invite_expiry(
  p_community_id text,
  p_expires_at timestamptz
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 권한 확인: owner 또는 admin
  SELECT role INTO v_caller_role FROM community_members WHERE community_id = p_community_id AND user_id = v_caller_id;
  
  -- NULL-safe: a non-member caller has v_caller_role = NULL; `NULL NOT IN (...)` is NULL (not true) and would skip this check
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RETURN json_build_object('status', 'not_authorized');
  END IF;

  UPDATE communities SET invite_expires_at = p_expires_at WHERE id = p_community_id;

  RETURN json_build_object('status', 'success');
END;
$$;

REVOKE ALL ON FUNCTION set_invite_expiry(text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_invite_expiry(text, timestamptz) TO authenticated;

-- ============================================================================
-- 완료
-- ============================================================================

-- 확인 쿼리:
--   SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('remove_member','transfer_ownership','rotate_invite_code','set_invite_expiry');
