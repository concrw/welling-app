-- 002_posts_visibility.sql
-- WELLING 그룹 우선 재구성: posts 공개 범위와 카테고리
--
-- 변경 사항:
--   • posts.visibility에 'group' 추가
--   • posts.category에 'exercise' 추가
--   • posts.visibility 기본값을 'group'으로 변경
--   • posts.hidden_at, hidden_by, routine_ref_group_id 컬럼 추가
--   • check 제약: visibility='group'이면 community_id 필수
--   • 인덱스 추가

-- ============================================================================
-- 1. posts.visibility 확장
-- ============================================================================

-- 기존 check 제약 제거 (있다면)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_visibility_check;

-- 새 check 제약 (group 추가)
ALTER TABLE posts
  ADD CONSTRAINT posts_visibility_check
  CHECK (visibility IN ('group', 'public', 'followers', 'private'));

-- group 글은 community_id 필수
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_group_has_community;
ALTER TABLE posts
  ADD CONSTRAINT posts_group_has_community
  CHECK (visibility <> 'group' OR community_id IS NOT NULL);

-- 기본값 변경: 'group' (신규 행만)
ALTER TABLE posts ALTER COLUMN visibility SET DEFAULT 'group';

-- ============================================================================
-- 2. posts.category 확장
-- ============================================================================

-- 기존 check 제약 제거 (있다면)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_check;

-- 새 check 제약 (exercise 추가)
ALTER TABLE posts
  ADD CONSTRAINT posts_category_check
  CHECK (category IN ('habit', 'diet', 'reflection', 'routine', 'exercise'));

-- ============================================================================
-- 3. 추가 컬럼
-- ============================================================================

-- 그룹장 숨김 처리
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS hidden_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 루틴 따라하기 알림 글의 원본 참조
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS routine_ref_group_id uuid;

-- ============================================================================
-- 4. 인덱스
-- ============================================================================

-- 그룹 피드 페이지네이션
CREATE INDEX IF NOT EXISTS posts_community_created_idx
  ON posts (community_id, created_at DESC, id DESC)
  WHERE community_id IS NOT NULL;

-- 사용자 글 (연속 기록, 개인 페이지)
CREATE INDEX IF NOT EXISTS posts_user_created_idx
  ON posts (user_id, created_at DESC);

-- 공개 피드 (L3 탐색)
CREATE INDEX IF NOT EXISTS posts_public_created_idx
  ON posts (created_at DESC)
  WHERE visibility = 'public';

-- ============================================================================
-- 기존 데이터 처리 (선택 사항)
-- ============================================================================

-- 기존 posts는 변경하지 않음 (소유자 결정 대기)
-- 만약 기존 public 글을 group으로 낮추려면:
--   UPDATE posts SET visibility = 'group' WHERE visibility = 'public' AND community_id IS NOT NULL;
-- 하지만 사용자 의도를 바꾸게 되므로 권장하지 않음

-- ============================================================================
-- 완료
-- ============================================================================

-- 확인 쿼리:
--   SELECT id, user_id, category, visibility, community_id, hidden_at, created_at FROM posts ORDER BY created_at DESC LIMIT 10;
--   \d posts
