-- 000_baseline.sql
-- WELLING 그룹 우선 재구성: 기준선(Baseline) 문서
-- 
-- 이 파일은 실행하지 않습니다. 현재 운영 DB 상태에 대한 가정과 확인 사항을 기록합니다.
-- 마이그레이션 001~ 를 적용하기 전에 이 내용을 검증해야 합니다.
--
-- 작성일: 2026-09-26
-- 대상: welling.today 운영 Supabase 프로젝트
--
-- ⚠️ 주의: 실제 RLS 정책, 함수, 트리거는 저장소에 없고 Supabase 대시보드에만 존재합니다.
--          2026-07-22 DB 리셋 이후 기억에 의존해 재생성했다는 기록이 있습니다.
--          따라서 아래 내용은 코드와 문서로부터 추정한 것이며, 적용 전에 실제 스키마를 확인해야 합니다.

-- ============================================================================
-- 1. 테이블 구조 확인 필요
-- ============================================================================

-- communities: id, name, initial, color, members, focus, desc, visibility, owner_id, created_at
--   • id 타입: text (클라이언트에서 'comm-{timestamp}' 생성)
--   • visibility: 'public' | 'private' (기본값 확인 필요)
--   • owner_id: uuid, nullable
--   • members 컬럼: 생성 시점 값, 갱신되지 않음 (코드 주석 확인)
--   ✓ 확인: invite_code, invite_expires_at, max_members, member_count, archived_at, role 컬럼 없음
--   ✓ 확인: owner_id에 FK 제약 있는지, ON DELETE 동작

-- community_members: community_id, user_id, created_at(?)
--   ✓ 확인: PK 또는 unique (community_id, user_id) 제약 있는지
--   ✓ 확인: role 컬럼 없음
--   ✓ 확인: joined_at 또는 created_at 컬럼명

-- posts: id, user_id, content, community_id, created_at, category, visibility, has_img, img_url, has_insta, insta_url
--   • visibility 타입: check 제약 확인 ('public', 'followers', 'private' 만)
--   • category 타입: check 제약 확인 ('habit', 'diet', 'reflection', 'routine' 만)
--   ✓ 확인: 'group' visibility 값 없음
--   ✓ 확인: 'exercise' category 값 없음
--   ✓ 확인: hidden_at, hidden_by, routine_ref_group_id 컬럼 없음
--   ✓ 확인: community_id FK의 ON DELETE 동작 (CASCADE? RESTRICT?)

-- post_likes: post_id, user_id, created_at
-- post_reactions: post_id, user_id, reaction_type, created_at
-- post_comments: post_id, user_id, text, created_at
-- post_reports: id, post_id, reporter_id, reason, created_at
--   ✓ 확인: 모든 post_id FK의 ON DELETE 동작

-- routine_groups: id, user_id, name, sort_order, is_current, is_public, created_at
--   • is_public 기본값: 확인 필요 (코드는 insert 시 true 하드코딩)
--   ✓ 확인: copied_from_group_id, copied_from_user_id 컬럼 없음

-- routine_items: id, group_id, name, time, desc, img_url, sort_order, created_at
--   ✓ 확인: group_id FK의 ON DELETE 동작 (CASCADE?)

-- routine_privacy: item_id, is_public, created_at
--   ✓ 확인: 이것이 테이블인지 뷰인지 (SESSION_H에 "routine_privacy 뷰"라는 언급 있음)
--   ✓ 확인: item_id FK의 ON DELETE 동작

-- notifications: id, user_id, actor_id, type, text, related_id, read, created_at
--   • type check: 확인 필요 ('like', 'follow' 외)
--   ✓ 확인: post_id, actor_count 컬럼 없음

-- follows: follower_id, followee_id, created_at
-- follow_counts: 뷰 (SESSION_H 기록상, 코드에서 DELETE 시도 → 오류)
-- profiles: id, nickname, bio, is_admin, suspended, profile_visibility, created_at
-- custom_quick_buttons: id, user_id, label, sort_order, created_at
-- evening_reflections: id, user_id, content, created_at
-- calendar_event_snapshots: id, user_id, events_json, created_at
-- notification_settings: user_id, key, value, created_at
-- reports: id, reporter_id, reported_user_id, reason, created_at

-- ✓ 확인: routine_copies, community_bans, feature_events 테이블 없음

-- ============================================================================
-- 2. RLS 정책 확인 필요
-- ============================================================================

-- 현재 RLS 정책 SQL을 추출해 저장소에 커밋:
--   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;

-- 특히 확인:
--   • communities: 비공개 그룹(visibility='private')의 select, insert 제한
--   • community_members: 직접 insert가 공개 커뮤니티에만 가능한지
--   • posts: visibility별 조회 정책, 그룹 글 작성 시 멤버십 확인
--   • post_likes, post_reactions, post_comments: 글 조회 권한 기반 정책
--   • profiles: is_admin, suspended 컬럼 노출 제한

-- ============================================================================
-- 3. 함수와 트리거 확인 필요
-- ============================================================================

-- 현재 존재하는 함수:
--   • can_view_profile(uuid) - OtherProfile에서 사용
--   • get_routine_suggestions_for_keyword(...) - Insights에서 사용
--   • (기타 확인)

-- 현재 존재하는 트리거 (SESSION_H 기록상):
--   • notify_on_post_like (post_likes insert → notifications)
--   • notify_on_follow (follows insert → notifications)
--   ✓ 확인: notify_on_post_comment 없음
--   ✓ 확인: community_members 카운트 트리거 없음

-- 권한 확인:
--   • 함수 EXECUTE 권한이 anon에 자동 부여되는 문제 (SESSION_H 교훈)
--   • 모든 신규 함수에 명시적으로 REVOKE ALL FROM PUBLIC, anon; GRANT EXECUTE TO authenticated;

-- ============================================================================
-- 4. 인덱스 확인 필요
-- ============================================================================

-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- 예상 필요 인덱스 (없으면 001~에서 생성):
--   • posts (community_id, created_at desc, id desc)
--   • posts (user_id, created_at desc)
--   • posts (created_at desc) WHERE visibility = 'public'
--   • community_members (user_id)
--   • community_members PK/unique (community_id, user_id)
--   • communities (invite_code) unique (001에서 추가)
--   • post_likes (post_id), post_reactions (post_id), post_comments (post_id, created_at)
--   • notifications (user_id, read, created_at desc)
--   • follows (followee_id), follows (follower_id)

-- ============================================================================
-- 5. Storage 버킷 확인 필요
-- ============================================================================

-- post-images 버킷:
--   • 현재 공개(public) 설정인지
--   • RLS 정책 (SELECT, INSERT, DELETE)
--   • 파일 경로 구조 (예: {userId}/{filename})

-- ============================================================================
-- 6. 적용 전 체크리스트
-- ============================================================================

-- [ ] 위 모든 확인 사항을 Supabase 대시보드 또는 SQL 쿼리로 검증
-- [ ] 현재 RLS 정책을 SQL 파일로 추출해 저장소에 커밋 (롤백 대비)
-- [ ] 현재 함수와 트리거 정의를 SQL 파일로 추출
-- [ ] 스테이징/개발 프로젝트에서 001~ 마이그레이션 먼저 테스트
-- [ ] 운영 데이터 백업 (Supabase 자동 백업 외)
-- [ ] 점검 시간대에 순차 적용, 각 단계 후 롤백 가능 여부 확인

-- ============================================================================
-- 마이그레이션 적용 순서
-- ============================================================================

-- 1. 000_baseline.sql (이 파일): 확인만, 실행 안 함
-- 2. 001_groups.sql: communities/community_members 컬럼, 백필, 헬퍼, RPC
-- 3. 002_posts_visibility.sql: posts check 제약, 기본값, 인덱스
-- 4. 003_rls_membership.sql: 새 RLS 정책 (기존 정책 drop + 재생성)
-- 5. 004_notifications.sql: 댓글 트리거, 응원 묶음
-- 6. 005_account_deletion.sql: 수정된 delete_account (PR #2 대체)

-- 각 마이그레이션은:
--   • 멱등성 (IF EXISTS / IF NOT EXISTS 사용)
--   • 트랜잭션 경계 명확
--   • 실패 시 롤백 가능
--   • 적용 후 검증 쿼리 포함

-- ============================================================================
-- 데이터 마이그레이션 참고
-- ============================================================================

-- 기존 데이터 처리 원칙 (소유자 결정):
--   • 기존 커뮤니티: visibility, invite_code 백필, owner_id는 있는 대로 유지
--   • 기존 posts: visibility, category 값 그대로 (변경 안 함)
--   • 기존 routine_groups: is_public 기본값 변경하지만 기존 행은 유지 (또는 false로 일괄 변경)
--   • 기존 community_members: role 백필 (owner_id 기준으로 'owner', 나머지 'member')

-- ============================================================================
