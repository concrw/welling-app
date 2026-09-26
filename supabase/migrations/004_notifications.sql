-- 004_notifications.sql
-- WELLING 그룹 우선 재구성: 알림 개선
--
-- 변경 사항:
--   • notifications.post_id, actor_count 컬럼 추가 (응원 묶음용)
--   • notifications.type에 'comment', 'copy', 'report', 'group_join' 추가
--   • notify_on_post_comment 트리거 신설
--   • notify_on_post_like 트리거 개선 (묶음 upsert, 문구 변경)

-- ============================================================================
-- 1. notifications 테이블 확장
-- ============================================================================

-- 컬럼 추가
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS actor_count int DEFAULT 1;

-- type check 제약 확장
-- PRE-RUN VERIFICATION: Run `SELECT DISTINCT type FROM notifications;` on live DB
-- to confirm no unknown types exist, as this constraint will fail on existing rows with other types.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'follow', 'comment', 'copy', 'report', 'group_join'));

-- 인덱스: post_id 기준 조회
CREATE INDEX IF NOT EXISTS notifications_post_id_idx ON notifications (post_id) WHERE post_id IS NOT NULL;

-- ============================================================================
-- 2. notify_on_post_like 트리거 개선 (응원 묶음)
-- ============================================================================

-- Step 2a: Dedupe existing unread like notifications (merge duplicates)
WITH dupes AS (
  SELECT user_id, post_id, type,
         ARRAY_AGG(id ORDER BY created_at) as ids,
         SUM(actor_count) as total_count,
         MIN(created_at) as earliest_created
  FROM notifications
  WHERE type = 'like' AND read = false AND post_id IS NOT NULL
  GROUP BY user_id, post_id, type
  HAVING COUNT(*) > 1
)
UPDATE notifications n
SET actor_count = d.total_count,
    created_at = d.earliest_created
FROM dupes d
WHERE n.id = d.ids[1];

-- Delete duplicate rows (keep first one per group)
WITH dupes AS (
  SELECT user_id, post_id, type,
         ARRAY_AGG(id ORDER BY created_at) as ids
  FROM notifications
  WHERE type = 'like' AND read = false AND post_id IS NOT NULL
  GROUP BY user_id, post_id, type
  HAVING COUNT(*) > 1
)
DELETE FROM notifications n
USING dupes d
WHERE n.id = ANY(d.ids[2:]);

-- Step 2b: Drop old index, create new scoped to likes only
DROP INDEX IF EXISTS notifications_unread_like_uniq;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_unread_like_uniq_v2
  ON notifications (user_id, post_id)
  WHERE type = 'like' AND read = false AND post_id IS NOT NULL;

-- Step 2c: Trigger function with matching ON CONFLICT predicate
CREATE OR REPLACE FUNCTION notify_on_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id uuid;
BEGIN
  -- 글 작성자 조회
  SELECT user_id INTO v_post_author_id FROM posts WHERE id = NEW.post_id;

  -- 본인 행동은 알림 안 함
  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- 같은 글에 대한 읽지 않은 응원 알림이 있으면 actor_count 증가 (upsert)
  INSERT INTO notifications (user_id, actor_id, type, text, related_id, post_id, read, actor_count, created_at)
  VALUES (
    v_post_author_id,
    NEW.user_id,
    'like',
    '님이 👏 응원했어요',
    NEW.post_id::text,
    NEW.post_id,
    false,
    1,
    now()
  )
  ON CONFLICT (user_id, post_id) WHERE type = 'like' AND read = false AND post_id IS NOT NULL
  DO UPDATE SET
    actor_count = notifications.actor_count + 1,
    actor_id = NEW.user_id, -- 가장 최근 응원한 사람
    created_at = now();

  RETURN NEW;
END;
$$;

-- 기존 트리거 재생성 (함수 변경 반영)
DROP TRIGGER IF EXISTS notify_on_post_like_trigger ON post_likes;
CREATE TRIGGER notify_on_post_like_trigger
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION notify_on_post_like();

-- 권한 회수
REVOKE ALL ON FUNCTION notify_on_post_like() FROM PUBLIC, anon;

COMMENT ON FUNCTION notify_on_post_like IS '응원(좋아요) 알림 트리거. 같은 글의 읽지 않은 알림은 묶음.';

-- ============================================================================
-- 3. notify_on_post_comment 트리거 신설
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_on_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id uuid;
BEGIN
  -- 글 작성자 조회
  SELECT user_id INTO v_post_author_id FROM posts WHERE id = NEW.post_id;

  -- 본인 댓글은 알림 안 함
  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- 글 작성자에게 알림
  INSERT INTO notifications (user_id, actor_id, type, text, related_id, post_id, read, created_at)
  VALUES (
    v_post_author_id,
    NEW.user_id,
    'comment',
    '님이 댓글을 남겼어요',
    NEW.post_id::text,
    NEW.post_id,
    false,
    now()
  );

  -- (선택) 같은 글에 댓글 단 다른 사람들에게도 알림 (본인과 글 작성자 제외)
  -- 현재는 생략, 필요시 추가

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_post_comment_trigger ON post_comments;
CREATE TRIGGER notify_on_post_comment_trigger
  AFTER INSERT ON post_comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_post_comment();

REVOKE ALL ON FUNCTION notify_on_post_comment() FROM PUBLIC, anon;

COMMENT ON FUNCTION notify_on_post_comment IS '댓글 알림 트리거. 글 작성자에게 알림.';

-- ============================================================================
-- 4. (선택) notify_on_routine_copy 트리거 (Phase 3)
-- ============================================================================

-- Phase 3에서 routine_copies 테이블과 함께 추가 예정
-- 여기서는 type만 확장해 둠

-- ============================================================================
-- 완료
-- ============================================================================

-- 확인 쿼리:
--   \d notifications
--   SELECT * FROM notifications WHERE type IN ('like', 'comment') ORDER BY created_at DESC LIMIT 10;
