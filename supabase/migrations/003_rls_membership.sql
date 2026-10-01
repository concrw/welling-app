-- 003_rls_membership.sql
-- WELLING 그룹 우선 재구성: 멤버십 기반 RLS 정책
--
-- ⚠️ 주의: 기존 RLS 정책을 모두 drop하고 재생성합니다.
--          적용 전에 기존 정책을 백업해 두세요.
--          이 파일은 000_baseline.sql의 확인 사항 검증 후에만 적용해야 합니다.
--
-- 변경 사항:
--   • communities: 멤버십 기반 조회
--   • community_members: 같은 그룹 멤버만 조회, 비공개 그룹 직접 insert 금지
--   • posts: visibility + 멤버십 조합
--   • post_likes, post_reactions, post_comments: 글 조회 권한 기반
--   • post_reactions / post_reports: live 정책("post reactions are publicly readable" 등)을 drop하고 can_view_post 기반으로 교체
--     (post_reports의 live "admins can update post reports"는 유지)
--   • (profiles, notifications 등은 기존 정책 유지)

-- ============================================================================
-- 헬퍼: 글 조회 권한 판정 (RLS용)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_view_post(p_post_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = p_post_id AND (
      -- 내 글
      p.user_id = auth.uid()
      -- 공개 글
      OR p.visibility = 'public'
      -- 그룹 글 (내가 멤버)
      OR (p.visibility = 'group' AND p.community_id IS NOT NULL AND public.is_member(p.community_id))
      -- 친구 공개 글 (내가 팔로우)
      OR (p.visibility = 'followers' AND EXISTS (
        SELECT 1 FROM follows f WHERE f.follower_id = auth.uid() AND f.followee_id = p.user_id
      ))
    )
  );
$$;

REVOKE ALL ON FUNCTION public.can_view_post(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_post(uuid) TO authenticated;

COMMENT ON FUNCTION public.can_view_post IS 'RLS 헬퍼: 현재 사용자가 지정 글을 볼 수 있는지 판정';

-- ============================================================================
-- communities 정책
-- ============================================================================

-- 기존 정책 제거 (LIVE policy names)
DROP POLICY IF EXISTS "communities are readable by visibility" ON communities;
DROP POLICY IF EXISTS "authenticated users can create communities" ON communities;
DROP POLICY IF EXISTS "owners or admins can update communities" ON communities;
DROP POLICY IF EXISTS communities_select ON communities;
DROP POLICY IF EXISTS communities_insert ON communities;
DROP POLICY IF EXISTS communities_update ON communities;
DROP POLICY IF EXISTS communities_delete ON communities;

-- SELECT: 공개 커뮤니티, 내가 소유, 내가 멤버
CREATE POLICY communities_select ON communities
  FOR SELECT TO authenticated
  USING (
    visibility = 'public'
    OR owner_id = auth.uid()
    OR public.is_member(id)
  );

-- INSERT: 로그인한 사용자 누구나 (owner는 본인)
-- 실제 생성은 create_group() RPC 권장
CREATE POLICY communities_insert ON communities
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- UPDATE: 그룹장 또는 관리자
CREATE POLICY communities_update ON communities
  FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- DELETE: RPC로만 (보관 처리)
-- 직접 DELETE 금지
CREATE POLICY communities_delete ON communities
  FOR DELETE TO authenticated
  USING (false);

-- ============================================================================
-- community_members 정책
-- ============================================================================

-- 기존 정책 제거 (LIVE policy names)
DROP POLICY IF EXISTS "community members are publicly readable" ON community_members;
DROP POLICY IF EXISTS "users can join/leave communities themselves" ON community_members;
DROP POLICY IF EXISTS "users can leave communities themselves" ON community_members;
DROP POLICY IF EXISTS community_members_select ON community_members;
DROP POLICY IF EXISTS community_members_insert ON community_members;
DROP POLICY IF EXISTS community_members_update ON community_members;
DROP POLICY IF EXISTS community_members_delete ON community_members;

-- SELECT: 내 멤버십 또는 같은 그룹 멤버
CREATE POLICY community_members_select ON community_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_member(community_id)
  );

-- INSERT: 공개 커뮤니티에 본인만 추가 가능
-- 비공개 그룹은 join_by_invite() RPC로만
CREATE POLICY community_members_insert ON community_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_id AND c.visibility = 'public'
    )
  );

-- UPDATE: 금지 (role 변경은 RPC로만)
CREATE POLICY community_members_update ON community_members
  FOR UPDATE TO authenticated
  USING (false);

-- DELETE: 본인 멤버십만 (그룹장은 leave_group RPC)
CREATE POLICY community_members_delete ON community_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND role <> 'owner');

-- ============================================================================
-- posts 정책
-- ============================================================================

-- 기존 정책 제거 (LIVE policy names)
DROP POLICY IF EXISTS "posts_select_by_visibility" ON posts;
DROP POLICY IF EXISTS "users can insert own posts" ON posts;
DROP POLICY IF EXISTS "users can update own posts" ON posts;
DROP POLICY IF EXISTS "users can delete own posts" ON posts;
-- live names as captured in the verified live schema ("their own"): must be dropped too, otherwise these permissive
-- policies survive alongside posts_insert/update/delete (e.g. allow inserting a group post without membership)
DROP POLICY IF EXISTS "users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "users can update their own posts" ON posts;
DROP POLICY IF EXISTS "users can delete their own posts" ON posts;
DROP POLICY IF EXISTS posts_select ON posts;
DROP POLICY IF EXISTS posts_insert ON posts;
DROP POLICY IF EXISTS posts_update ON posts;
DROP POLICY IF EXISTS posts_delete ON posts;

-- SELECT: visibility + 멤버십 조합 (성능을 위해 인라인)
CREATE POLICY posts_select ON posts
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR visibility = 'public'
    OR (visibility = 'group' AND community_id IS NOT NULL AND public.is_member(community_id))
    OR (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM follows f WHERE f.follower_id = auth.uid() AND f.followee_id = user_id
    ))
  );

-- anon: live policy had no role restriction, so anon could read public posts. Preserve that.
-- (separate policy: anon cannot EXECUTE is_member(), so it must not be evaluated for anon)
DROP POLICY IF EXISTS posts_select_anon_public ON posts;
CREATE POLICY posts_select_anon_public ON posts
  FOR SELECT TO anon
  USING (visibility = 'public');

-- INSERT: 본인만, community_id가 있으면 멤버 확인
CREATE POLICY posts_insert ON posts
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (community_id IS NULL OR public.is_member(community_id))
    AND (visibility <> 'group' OR community_id IS NOT NULL)
  );

-- UPDATE: 본인만
CREATE POLICY posts_update ON posts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: 본인만
CREATE POLICY posts_delete ON posts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- post_likes 정책
-- ============================================================================

-- 기존 정책 제거 (LIVE policy names)
DROP POLICY IF EXISTS "users manage own data" ON post_likes;
-- live names: permissive USING(true) SELECT policies would otherwise survive and bypass can_view_post()
DROP POLICY IF EXISTS "post likes are publicly readable" ON post_likes;
DROP POLICY IF EXISTS "users can like posts themselves" ON post_likes;
DROP POLICY IF EXISTS "users can unlike posts themselves" ON post_likes;
DROP POLICY IF EXISTS post_likes_select ON post_likes;
DROP POLICY IF EXISTS post_likes_insert ON post_likes;
DROP POLICY IF EXISTS post_likes_delete ON post_likes;

CREATE POLICY post_likes_select ON post_likes
  FOR SELECT TO authenticated
  USING (public.can_view_post(post_id));

CREATE POLICY post_likes_insert ON post_likes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_view_post(post_id)
  );

CREATE POLICY post_likes_delete ON post_likes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- post_reactions 정책
-- ============================================================================

-- 기존 정책 제거 (LIVE policy names)
DROP POLICY IF EXISTS "users manage own data" ON post_reactions;
-- live names (verified read-only on live): the permissive USING(true) SELECT policy would otherwise survive and bypass
-- can_view_post() for private/group posts, and the live INSERT policy lets users react to posts they cannot see.
DROP POLICY IF EXISTS "post reactions are publicly readable" ON post_reactions;
DROP POLICY IF EXISTS "users can react to posts themselves" ON post_reactions;
DROP POLICY IF EXISTS "users can remove their own reactions" ON post_reactions;
DROP POLICY IF EXISTS post_reactions_select ON post_reactions;
DROP POLICY IF EXISTS post_reactions_insert ON post_reactions;
DROP POLICY IF EXISTS post_reactions_delete ON post_reactions;

CREATE POLICY post_reactions_select ON post_reactions
  FOR SELECT TO authenticated
  USING (public.can_view_post(post_id));

CREATE POLICY post_reactions_insert ON post_reactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_view_post(post_id)
  );

CREATE POLICY post_reactions_delete ON post_reactions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- post_comments 정책
-- ============================================================================

-- 기존 정책 제거 (LIVE policy names)
DROP POLICY IF EXISTS "users manage own data" ON post_comments;
-- live names: permissive USING(true) SELECT policy would otherwise survive and bypass can_view_post()
DROP POLICY IF EXISTS "post comments are publicly readable" ON post_comments;
DROP POLICY IF EXISTS "users can comment themselves" ON post_comments;
DROP POLICY IF EXISTS post_comments_select ON post_comments;
DROP POLICY IF EXISTS post_comments_insert ON post_comments;
DROP POLICY IF EXISTS post_comments_update ON post_comments;
DROP POLICY IF EXISTS post_comments_delete ON post_comments;

CREATE POLICY post_comments_select ON post_comments
  FOR SELECT TO authenticated
  USING (public.can_view_post(post_id));

CREATE POLICY post_comments_insert ON post_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_view_post(post_id)
  );

CREATE POLICY post_comments_update ON post_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY post_comments_delete ON post_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- post_reports 정책
-- ============================================================================

-- 기존 정책 제거 (LIVE policy names)
DROP POLICY IF EXISTS "users manage own data" ON post_reports;
-- live names (verified read-only on live). Replaced by post_reports_select / post_reports_insert below
-- (post_reports_select already covers reporter, admin and group owner; insert additionally requires can_view_post()).
DROP POLICY IF EXISTS "users can report posts themselves" ON post_reports;
DROP POLICY IF EXISTS "users can view their own reports" ON post_reports;
DROP POLICY IF EXISTS "admins can view all post reports" ON post_reports;
-- NOTE: live "admins can update post reports" (UPDATE) is intentionally KEPT: no replacement UPDATE policy is created.
DROP POLICY IF EXISTS post_reports_select ON post_reports;
DROP POLICY IF EXISTS post_reports_insert ON post_reports;
DROP POLICY IF EXISTS post_reports_delete ON post_reports;

-- SELECT: 관리자 또는 그룹장 (신고된 글이 속한 그룹의 소유자)
CREATE POLICY post_reports_select ON post_reports
  FOR SELECT TO authenticated
  USING (
    reporter_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR EXISTS (
      SELECT 1 FROM posts p
      JOIN communities c ON p.community_id = c.id
      WHERE p.id = post_reports.post_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY post_reports_insert ON post_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()
    AND public.can_view_post(post_id)
  );

-- DELETE: 관리자만
CREATE POLICY post_reports_delete ON post_reports
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================================
-- 기타 테이블 정책은 기존 유지 (필요시 별도 마이그레이션)
-- ============================================================================

-- profiles, notifications, follows, routine_groups, routine_items, 등은
-- 기존 정책을 유지하거나, 000_baseline.sql 검증 후 필요시 수정

-- ============================================================================
-- 완료
-- ============================================================================

-- 확인 쿼리:
--   SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE tablename IN ('communities', 'community_members', 'posts', 'post_likes') ORDER BY tablename, policyname;
--   SELECT public.is_member('test-community-id'); -- true/false
--   SELECT public.can_view_post('test-post-uuid'::uuid); -- true/false
