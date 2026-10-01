-- 001_groups.sql
-- WELLING 그룹 우선 재구성: 그룹 스키마와 멤버십
--
-- 변경 사항:
--   • communities: invite_code, invite_expires_at, max_members, member_count, archived_at 추가
--   • communities.id 생성을 서버 기본값으로 변경 (신규 행만)
--   • communities.visibility 기본값을 'private'로 변경
--   • community_members: role, joined_at 추가, unique 제약
--   • community_bans 테이블 신규 (선택 사항)
--   • 초대 코드 생성 함수
--   • 멤버 카운트 트리거
--   • 그룹 RPC: create_group, get_invite_preview, join_by_invite, leave_group, remove_member, transfer_ownership, rotate_invite_code, set_invite_expiry
--   • 멤버십 판정 헬퍼: is_member

-- ============================================================================
-- 1. communities 테이블 확장
-- ============================================================================

-- 초대 코드 생성 함수 (0/O, 1/I/l 제외 8자리 대문자+숫자)
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; -- 32글자 (0, O, 1, I, L 제외)
  result text := '';
  i int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 컬럼 추가
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS invite_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS invite_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS member_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- 기본값 변경: 신규 행부터 visibility = 'private'
-- 기존 행은 변경하지 않음
ALTER TABLE communities ALTER COLUMN visibility SET DEFAULT 'private';

-- id 생성 기본값 추가 (기존 text 타입 유지, 신규 행부터 uuid::text)
-- 기존 'comm-{timestamp}' ID는 그대로 유지
ALTER TABLE communities ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 기존 커뮤니티에 invite_code 백필 (중복 시 재시도)
DO $$
DECLARE
  rec RECORD;
  new_code text;
  max_tries int := 10;
  i int;
BEGIN
  FOR rec IN SELECT id FROM communities WHERE invite_code IS NULL LOOP
    FOR i IN 1..max_tries LOOP
      new_code := generate_invite_code();
      BEGIN
        UPDATE communities SET invite_code = new_code WHERE id = rec.id;
        EXIT; -- 성공
      EXCEPTION WHEN unique_violation THEN
        CONTINUE; -- 재시도
      END;
    END LOOP;
  END LOOP;
END
$$;

-- invite_code NOT NULL 제약 (백필 후)
ALTER TABLE communities ALTER COLUMN invite_code SET NOT NULL;

-- 인덱스
CREATE INDEX IF NOT EXISTS communities_invite_code_idx ON communities (invite_code);
CREATE INDEX IF NOT EXISTS communities_owner_id_idx ON communities (owner_id) WHERE owner_id IS NOT NULL;

-- ============================================================================
-- 2. community_members 테이블 확장
-- ============================================================================

-- 컬럼 추가
ALTER TABLE community_members
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now();

-- role check 제약
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'community_members_role_check' AND conrelid = 'community_members'::regclass
  ) THEN
    ALTER TABLE community_members ADD CONSTRAINT community_members_role_check CHECK (role IN ('owner', 'admin', 'member'));
  END IF;
END
$$;

-- unique 제약 (중복 가입 방지)
DO $$
BEGIN
  -- 기존 중복 제거 (joined_at 최신 것만 남김)
  DELETE FROM community_members a
  USING (
    SELECT community_id, user_id, MAX(joined_at) as max_joined
    FROM community_members
    GROUP BY community_id, user_id
    HAVING COUNT(*) > 1
  ) b
  WHERE a.community_id = b.community_id
    AND a.user_id = b.user_id
    AND a.joined_at < b.max_joined;

  -- unique 제약 추가 (이미 PK이지만 명시적 제약)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'community_members_community_user_unique' AND conrelid = 'community_members'::regclass
  ) THEN
    ALTER TABLE community_members ADD CONSTRAINT community_members_community_user_unique UNIQUE (community_id, user_id);
  END IF;
END
$$;

-- joined_at 백필은 불필요 (컬럼 추가 시 DEFAULT now() 적용됨)

-- role 백필: owner_id에 해당하는 멤버를 'owner'로
UPDATE community_members cm
SET role = 'owner'
FROM communities c
WHERE cm.community_id = c.id
  AND cm.user_id = c.owner_id
  AND cm.role = 'member';

-- 인덱스
CREATE INDEX IF NOT EXISTS community_members_user_id_idx ON community_members (user_id);
CREATE INDEX IF NOT EXISTS community_members_community_id_idx ON community_members (community_id);

-- ============================================================================
-- 3. community_bans 테이블 (선택 사항)
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_bans (
  community_id text NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES profiles(id) ON DELETE SET NULL, -- nullable so ON DELETE SET NULL can work (delete_account)
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_bans_user_id_idx ON community_bans (user_id);

-- Join requests table for approval-required groups
CREATE TABLE IF NOT EXISTS community_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id text NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  UNIQUE(community_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_join_requests_community_id_idx ON community_join_requests (community_id, status);
CREATE INDEX IF NOT EXISTS community_join_requests_user_id_idx ON community_join_requests (user_id);

-- ============================================================================
-- 4. 멤버 카운트 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE communities SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS community_member_count_trigger ON community_members;
CREATE TRIGGER community_member_count_trigger
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- 기존 멤버 수 백필
UPDATE communities c
SET member_count = (
  SELECT COUNT(*) FROM community_members WHERE community_id = c.id
);

-- ============================================================================
-- 5. 멤버십 판정 헬퍼 (RLS용, SECURITY DEFINER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_member(cid text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = cid AND user_id = auth.uid()
  );
$$;

-- 권한: anon 명시적으로 회수
REVOKE ALL ON FUNCTION public.is_member(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_member(text) TO authenticated;

COMMENT ON FUNCTION public.is_member IS 'RLS 헬퍼: 현재 사용자가 지정 커뮤니티 멤버인지 판정';

-- ============================================================================
-- 6. 그룹 RPC 함수
-- ============================================================================

-- 6.1 create_group: 비공개 그룹 생성 (트랜잭션 안전)
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
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 그룹 생성
  v_community_id := gen_random_uuid()::text;
  v_invite_code := generate_invite_code();

  INSERT INTO communities (id, name, initial, color, members, focus, "desc", visibility, owner_id, invite_code, member_count)
  VALUES (
    v_community_id,
    p_name,
    upper(substr(p_name, 1, 1)),
    '#00A389',
    1,
    '',
    p_desc,
    p_visibility,
    v_user_id,
    v_invite_code,
    0 -- member_count starts at 0: the community_member_count_trigger increments it when the owner row is inserted below
  );

  -- 소유자를 멤버로 추가
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

-- 6.2 get_invite_preview: 초대 코드로 그룹 정보 미리보기 (익명 허용 여부는 결정 필요)
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
  SELECT id, name, member_count, invite_expires_at, archived_at
  INTO v_community
  FROM communities
  WHERE invite_code = p_code;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'invalid');
  END IF;

  -- 만료 확인
  IF v_community.invite_expires_at IS NOT NULL AND v_community.invite_expires_at < now() THEN
    RETURN json_build_object('status', 'expired');
  END IF;

  -- 보관된 그룹
  IF v_community.archived_at IS NOT NULL THEN
    RETURN json_build_object('status', 'archived');
  END IF;

  RETURN json_build_object(
    'status', 'valid',
    'community_id', v_community.id,
    'name', v_community.name,
    'member_count', v_community.member_count
  );
END;
$$;

-- 익명 허용 (결정에 따라 주석 처리/해제)
REVOKE ALL ON FUNCTION get_invite_preview(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_invite_preview(text) TO authenticated, anon;

-- 6.3 join_by_invite: 초대 코드로 가입
CREATE OR REPLACE FUNCTION join_by_invite(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_community RECORD;
  v_is_banned boolean;
  v_is_member boolean;
  v_has_pending_request boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 커뮤니티 조회
  SELECT id, name, member_count, invite_expires_at, archived_at, requires_approval
  INTO v_community
  FROM communities
  WHERE invite_code = p_code;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'invalid');
  END IF;

  -- 만료
  IF v_community.invite_expires_at IS NOT NULL AND v_community.invite_expires_at < now() THEN
    RETURN json_build_object('status', 'expired');
  END IF;

  -- 보관
  IF v_community.archived_at IS NOT NULL THEN
    RETURN json_build_object('status', 'archived');
  END IF;

  -- 차단 확인
  SELECT EXISTS (SELECT 1 FROM community_bans WHERE community_id = v_community.id AND user_id = v_user_id)
  INTO v_is_banned;

  IF v_is_banned THEN
    RETURN json_build_object('status', 'banned');
  END IF;

  -- 이미 멤버
  SELECT EXISTS (SELECT 1 FROM community_members WHERE community_id = v_community.id AND user_id = v_user_id)
  INTO v_is_member;

  IF v_is_member THEN
    RETURN json_build_object('status', 'already', 'community_id', v_community.id, 'name', v_community.name);
  END IF;

  -- 사용자당 그룹 상한 (50개 - 관대한 제한, 운영 중 조정 가능)
  DECLARE
    v_user_group_count int;
  BEGIN
    SELECT COUNT(*) INTO v_user_group_count FROM community_members WHERE user_id = v_user_id;
    IF v_user_group_count >= 50 THEN
      RETURN json_build_object('status', 'too_many_groups');
    END IF;
  END;

  -- 승인 필요 그룹: 가입 요청 생성
  IF v_community.requires_approval THEN
    -- 이미 요청했는지 확인
    SELECT EXISTS (
      SELECT 1 FROM community_join_requests 
      WHERE community_id = v_community.id AND user_id = v_user_id
    ) INTO v_has_pending_request;
    
    IF v_has_pending_request THEN
      RETURN json_build_object('status', 'pending', 'community_id', v_community.id, 'name', v_community.name);
    END IF;
    
    -- 가입 요청 생성
    INSERT INTO community_join_requests (community_id, user_id, status)
    VALUES (v_community.id, v_user_id, 'pending');
    
    RETURN json_build_object('status', 'pending', 'community_id', v_community.id, 'name', v_community.name);
  END IF;

  -- 즉시 가입
  INSERT INTO community_members (community_id, user_id, role, joined_at)
  VALUES (v_community.id, v_user_id, 'member', now());

  RETURN json_build_object('status', 'success', 'community_id', v_community.id, 'name', v_community.name);
END;
$$;

REVOKE ALL ON FUNCTION join_by_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION join_by_invite(text) TO authenticated;

-- 6.4 leave_group: 그룹 나가기 (그룹장이면 소유권 이전)
CREATE OR REPLACE FUNCTION leave_group(p_community_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_owner_id uuid;
  v_new_owner_id uuid;
  v_remaining_count int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT owner_id INTO v_owner_id FROM communities WHERE id = p_community_id;
  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  -- 멤버가 아니면
  IF NOT EXISTS (SELECT 1 FROM community_members WHERE community_id = p_community_id AND user_id = v_user_id) THEN
    RETURN json_build_object('status', 'not_member');
  END IF;

  -- 그룹장이면 소유권 이전
  IF v_owner_id = v_user_id THEN
    -- 다른 멤버 중 가장 먼저 가입한 사람
    SELECT user_id INTO v_new_owner_id
    FROM community_members
    WHERE community_id = p_community_id AND user_id <> v_user_id
    ORDER BY joined_at ASC
    LIMIT 1;

    IF v_new_owner_id IS NOT NULL THEN
      -- 소유권 이전
      UPDATE communities SET owner_id = v_new_owner_id WHERE id = p_community_id;
      UPDATE community_members SET role = 'owner' WHERE community_id = p_community_id AND user_id = v_new_owner_id;
      UPDATE community_members SET role = 'member' WHERE community_id = p_community_id AND user_id = v_user_id;
    ELSE
      -- 마지막 멤버: 그룹 보관
      UPDATE communities SET archived_at = now() WHERE id = p_community_id;
    END IF;
  END IF;

  -- 나가기
  DELETE FROM community_members WHERE community_id = p_community_id AND user_id = v_user_id;

  RETURN json_build_object('status', 'success');
END;
$$;

REVOKE ALL ON FUNCTION leave_group(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION leave_group(text) TO authenticated;

-- 6.5 remove_member: 멤버 내보내기 (그룹장 또는 관리자)
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
  
  IF v_caller_role NOT IN ('owner', 'admin') AND NOT COALESCE(v_is_admin, false) THEN
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

-- 6.6 transfer_ownership: 소유권 이전 (그룹장만)
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

  IF v_owner_id <> v_caller_id THEN
    RETURN json_build_object('status', 'not_owner');
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

-- 6.7 rotate_invite_code: 초대 코드 재발급 (그룹장 또는 관리자)
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
  
  IF v_caller_role NOT IN ('owner', 'admin') THEN
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

-- 6.8 set_invite_expiry: 초대 만료 설정 (그룹장 또는 관리자)
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
  
  IF v_caller_role NOT IN ('owner', 'admin') THEN
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
--   SELECT id, name, invite_code, invite_expires_at, max_members, member_count, archived_at, visibility, owner_id FROM communities LIMIT 5;
--   SELECT * FROM community_members LIMIT 10;
--   SELECT * FROM community_bans LIMIT 5;
