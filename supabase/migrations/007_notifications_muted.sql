-- 007_notifications_muted.sql
-- WELLING: Per-group notification mute (server-side)
--
-- 변경 사항:
--   • community_members.notifications_muted 컬럼 추가
--   • toggle_community_notifications RPC (본인 설정만 변경 가능)
--   • 그룹 알림 팬아웃 시 muted 멤버 제외

-- ============================================================================
-- 1. community_members 테이블 확장
-- ============================================================================

ALTER TABLE community_members
  ADD COLUMN IF NOT EXISTS notifications_muted boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN community_members.notifications_muted IS '이 멤버가 해당 그룹의 알림을 음소거했는지 여부';

-- 인덱스: 알림 팬아웃 시 muted=false 멤버만 조회
CREATE INDEX IF NOT EXISTS community_members_not_muted_idx
  ON community_members (community_id)
  WHERE notifications_muted = false;

-- ============================================================================
-- 2. toggle_community_notifications RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION toggle_community_notifications(
  p_community_id uuid,
  p_muted boolean
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  -- 인증 확인
  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 'unauthorized');
  END IF;

  -- 멤버십 확인 및 업데이트
  UPDATE community_members
  SET notifications_muted = p_muted
  WHERE community_id = p_community_id
    AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_member');
  END IF;

  RETURN json_build_object('status', 'success', 'muted', p_muted);
END;
$$;

REVOKE ALL ON FUNCTION toggle_community_notifications FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION toggle_community_notifications TO authenticated;

COMMENT ON FUNCTION toggle_community_notifications IS 'Toggle notification mute for current user in a community';

-- ============================================================================
-- 3. 알림 팬아웃 시 muted 멤버 제외 (예시)
-- ============================================================================

-- 향후 group_join, new_post 등의 알림 트리거를 구현할 때
-- muted 멤버를 제외하는 쿼리 패턴:
--
-- INSERT INTO notifications (user_id, ...)
-- SELECT cm.user_id, ...
-- FROM community_members cm
-- WHERE cm.community_id = <group_id>
--   AND cm.notifications_muted = false  -- muted 멤버 제외
--   AND cm.user_id != <actor_id>;       -- 본인 제외

-- 현재 구현된 알림 (post_likes, post_comments)는 그룹 기반이 아니므로
-- 이 마이그레이션에서는 변경하지 않음

-- ============================================================================
-- 완료
-- ============================================================================

-- 확인 쿼리:
--   \d community_members
--   SELECT * FROM community_members WHERE notifications_muted = true;
