-- 005_account_deletion.sql
-- WELLING 그룹 우선 재구성: 계정 삭제 (PR #2 수정 버전)
--
-- PR #2 (cursor/account-deletion-26f2)의 ACCOUNT_DELETION_MIGRATION.sql을 다음과 같이 수정:
--   1. follow_counts DELETE 제거 (뷰라서 오류 발생)
--   2. 소유 그룹 처리: 삭제 대신 소유권 이전
--   3. anon 권한 명시적으로 회수
--   4. Storage 파일 삭제는 클라이언트/Edge Function에서 처리 (TODO)
--   5. 신고 기록 보존 (reported_user_id를 NULL로)
--
-- ⚠️ 이 마이그레이션은 PR #2를 대체하며, PR #2는 이 PR에서 superseded로 표시됩니다.

-- ============================================================================
-- delete_account() 함수 (수정 버전)
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_id uuid;
BEGIN
  calling_user_id := auth.uid();

  IF calling_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ============================================================
  -- 1. 소유 그룹 처리: 다른 멤버에게 소유권 이전, 없으면 삭제
  -- ============================================================
  -- 다른 멤버가 있는 그룹: joined_at 순서로 소유권 이전
  UPDATE communities c
  SET owner_id = nxt.user_id
  FROM (
    SELECT DISTINCT ON (m.community_id) m.community_id, m.user_id
    FROM community_members m
    JOIN communities c2 ON c2.id = m.community_id
    WHERE c2.owner_id = calling_user_id
      AND m.user_id <> calling_user_id
    ORDER BY m.community_id, m.joined_at ASC
  ) nxt
  WHERE c.id = nxt.community_id;

  -- 새 소유자를 'owner' role로
  UPDATE community_members
  SET role = 'owner'
  WHERE (community_id, user_id) IN (
    SELECT id, owner_id FROM communities WHERE owner_id IS NOT NULL
  )
  AND role <> 'owner';

  -- 여전히 내가 소유자인 그룹 (= 다른 멤버 없음): 삭제
  DELETE FROM communities WHERE owner_id = calling_user_id;

  -- ============================================================
  -- 2. 내 멤버십 삭제 (트리거가 member_count 감소)
  -- ============================================================
  DELETE FROM community_members WHERE user_id = calling_user_id;

  -- ============================================================
  -- 3. 내 글에 달린 타인의 반응/댓글 삭제 (FK cascade 확인 필요)
  -- ============================================================
  -- FK가 CASCADE가 아니면 15번 posts 삭제에서 실패하므로 명시적으로 삭제
  DELETE FROM post_comments WHERE post_id IN (SELECT id FROM posts WHERE user_id = calling_user_id);
  DELETE FROM post_reactions WHERE post_id IN (SELECT id FROM posts WHERE user_id = calling_user_id);
  DELETE FROM post_likes WHERE post_id IN (SELECT id FROM posts WHERE user_id = calling_user_id);
  DELETE FROM post_reports WHERE post_id IN (SELECT id FROM posts WHERE user_id = calling_user_id);

  -- ============================================================
  -- 4. 타인의 글에 내가 남긴 반응/댓글
  -- ============================================================
  DELETE FROM post_comments WHERE user_id = calling_user_id;
  DELETE FROM post_reactions WHERE user_id = calling_user_id;
  DELETE FROM post_likes WHERE user_id = calling_user_id;

  -- ============================================================
  -- 5. 내 글 삭제
  -- ============================================================
  DELETE FROM posts WHERE user_id = calling_user_id;

  -- ============================================================
  -- 6. 신고 기록 처리
  -- ============================================================
  -- 내가 신고한 것: 삭제
  DELETE FROM post_reports WHERE reporter_id = calling_user_id;
  DELETE FROM reports WHERE reporter_id = calling_user_id;

  -- 남이 나를 신고한 것: 운영 기록 보존을 위해 reported_id를 NULL로
  UPDATE reports SET reported_id = NULL WHERE reported_id = calling_user_id;

  -- ============================================================
  -- 7. 알림
  -- ============================================================
  DELETE FROM notifications
  WHERE user_id = calling_user_id OR actor_id = calling_user_id;

  -- ============================================================
  -- 8. 루틴
  -- ============================================================
  DELETE FROM routine_privacy WHERE user_id = calling_user_id;

  DELETE FROM routine_items
  WHERE routine_group_id IN (SELECT id FROM routine_groups WHERE user_id = calling_user_id);

  DELETE FROM routine_groups WHERE user_id = calling_user_id;

  -- (Phase 3) routine_copies 추가 예정:
  -- DELETE FROM routine_copies WHERE copier_id = calling_user_id;
  -- UPDATE routine_copies SET source_user_id = NULL WHERE source_user_id = calling_user_id;

  -- ============================================================
  -- 9. 팔로우
  -- ============================================================
  DELETE FROM follows
  WHERE follower_id = calling_user_id OR followee_id = calling_user_id;

  -- follow_counts는 뷰이므로 자동 반영 (DELETE 불필요)

  -- ============================================================
  -- 10. 저녁 단상, 캘린더, 빠른버튼, 설정
  -- ============================================================
  DELETE FROM evening_reflections WHERE user_id = calling_user_id;
  DELETE FROM calendar_event_snapshots WHERE user_id = calling_user_id;
  DELETE FROM custom_quick_buttons WHERE user_id = calling_user_id;
  DELETE FROM notification_settings WHERE user_id = calling_user_id;

  -- ============================================================
  -- 11. 프로필
  -- ============================================================
  DELETE FROM profiles WHERE id = calling_user_id;

  -- ============================================================
  -- 12. auth.users (SECURITY DEFINER 필요)
  -- ============================================================
  DELETE FROM auth.users WHERE id = calling_user_id;

  -- ============================================================
  -- 13. Storage 파일 삭제 (TODO)
  -- ============================================================
  -- Supabase Storage의 post-images/{calling_user_id}/ 삭제는
  -- 클라이언트에서 deleteAccount() 호출 전 처리하거나
  -- Edge Function에서 service role로 처리 필요
  -- RPC 함수에서는 storage.objects에 직접 접근 불가

  RETURN json_build_object(
    'success', true,
    'message', 'Account successfully deleted',
    'user_id', calling_user_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Account deletion failed: %', SQLERRM;
END;
$$;

-- 권한: anon 명시적으로 회수
REVOKE ALL ON FUNCTION delete_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION delete_account() TO authenticated;

COMMENT ON FUNCTION delete_account IS
'계정 영구 삭제. 복구 불가. 소유 그룹은 다른 멤버에게 이전, 없으면 삭제.
Storage 파일은 클라이언트/Edge Function에서 별도 처리 필요.
PR #2 (cursor/account-deletion-26f2) 대체 버전.';

-- ============================================================================
-- 완료
-- ============================================================================

-- 테스트 쿼리 (운영 DB에서 절대 실행 금지):
--   SELECT delete_account(); -- 본인 계정 삭제
--   SELECT COUNT(*) FROM profiles WHERE id = 'test-user-id';
--   SELECT COUNT(*) FROM posts WHERE user_id = 'test-user-id';
