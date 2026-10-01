-- assertions_v4.sql
-- WELLING 008_rls_bans_requests validation assertions
-- Tests new RPCs (approve_join_request, reject_join_request, set_member_role) and RLS on bans/requests

-- Reuses fixture from supabase/tests/fixture/

-- Setup: Create test users and group
DO $$
DECLARE
  v_owner_id uuid := '99000000-0000-0000-0000-000000000101';
  v_admin_id uuid := '99000000-0000-0000-0000-000000000102';
  v_member_id uuid := '99000000-0000-0000-0000-000000000103';
  v_requester_id uuid := '99000000-0000-0000-0000-000000000104';
  v_anon_id uuid := '99000000-0000-0000-0000-000000000105';
  v_group_id text;
  v_request_id uuid;
  v_result json;
BEGIN
  -- Insert test users
  INSERT INTO auth.users (id, email) VALUES
    (v_owner_id, 'owner@test.local'),
    (v_admin_id, 'admin@test.local'),
    (v_member_id, 'member@test.local'),
    (v_requester_id, 'requester@test.local'),
    (v_anon_id, 'anon@test.local')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, nickname) VALUES
    (v_owner_id, 'Owner'),
    (v_admin_id, 'Admin'),
    (v_member_id, 'Member'),
    (v_requester_id, 'Requester'),
    (v_anon_id, 'Anon')
  ON CONFLICT (id) DO NOTHING;

  -- Create test group with approval required
  PERFORM set_config('request.jwt.claim.sub', v_owner_id::text, false);
  SELECT (create_group('Test Group 008', 'test', 'private')::json->>'community_id')::text INTO v_group_id;

  -- Enable requires_approval
  UPDATE communities SET requires_approval = true WHERE id = v_group_id;

  -- Add admin and member
  INSERT INTO community_members (community_id, user_id, role) VALUES
    (v_group_id, v_admin_id, 'admin'),
    (v_group_id, v_member_id, 'member')
  ON CONFLICT (community_id, user_id) DO NOTHING;

  -- Create pending join request
  INSERT INTO community_join_requests (id, community_id, user_id, status)
  VALUES (gen_random_uuid(), v_group_id, v_requester_id, 'pending')
  RETURNING id INTO v_request_id;

  -- Store test data for assertions
  CREATE TEMP TABLE IF NOT EXISTS test_data_v4 (
    owner_id uuid,
    admin_id uuid,
    member_id uuid,
    requester_id uuid,
    anon_id uuid,
    group_id text,
    request_id uuid
  );
  DELETE FROM test_data_v4;
  INSERT INTO test_data_v4 VALUES (v_owner_id, v_admin_id, v_member_id, v_requester_id, v_anon_id, v_group_id, v_request_id);
END $$;

-- Validation result tracking
CREATE TEMP TABLE IF NOT EXISTS val_res_v4 (
  seq serial PRIMARY KEY,
  label text,
  pass boolean,
  detail text
);

-- ============================================================================
-- z1: RLS on community_bans and community_join_requests
-- ============================================================================

DO $$
DECLARE
  v_owner_id uuid;
  v_anon_id uuid;
  v_group_id text;
  v_rls_bans boolean;
  v_rls_requests boolean;
  v_anon_can_read_bans int;
  v_anon_can_read_requests int;
BEGIN
  SELECT owner_id, anon_id, group_id INTO v_owner_id, v_anon_id, v_group_id FROM test_data_v4;

  -- Check RLS is enabled
  SELECT relrowsecurity INTO v_rls_bans FROM pg_class WHERE relname = 'community_bans';
  SELECT relrowsecurity INTO v_rls_requests FROM pg_class WHERE relname = 'community_join_requests';

  -- Check anon cannot read (no grants, no policies for anon)
  PERFORM set_config('request.jwt.claim.sub', v_anon_id::text, false);
  PERFORM set_config('role', 'anon', false);
  SELECT COUNT(*) INTO v_anon_can_read_bans FROM community_bans WHERE community_id = v_group_id;
  SELECT COUNT(*) INTO v_anon_can_read_requests FROM community_join_requests WHERE community_id = v_group_id;

  -- Reset role
  PERFORM set_config('role', 'authenticated', false);

  INSERT INTO val_res_v4 (label, pass, detail) VALUES (
    'z1.rls_enabled_anon_blocked',
    v_rls_bans AND v_rls_requests AND v_anon_can_read_bans = 0 AND v_anon_can_read_requests = 0,
    format('bans_rls=%s requests_rls=%s anon_bans=%s anon_requests=%s', v_rls_bans, v_rls_requests, v_anon_can_read_bans, v_anon_can_read_requests)
  );
END $$;

-- ============================================================================
-- z2: SELECT policy on community_join_requests
-- ============================================================================

DO $$
DECLARE
  v_owner_id uuid;
  v_admin_id uuid;
  v_member_id uuid;
  v_requester_id uuid;
  v_anon_id uuid;
  v_group_id text;
  v_owner_sees int;
  v_admin_sees int;
  v_member_sees int;
  v_requester_sees int;
BEGIN
  SELECT owner_id, admin_id, member_id, requester_id, anon_id, group_id
  INTO v_owner_id, v_admin_id, v_member_id, v_requester_id, v_anon_id, v_group_id
  FROM test_data_v4;

  -- Owner sees all requests for their group
  PERFORM set_config('request.jwt.claim.sub', v_owner_id::text, false);
  SELECT COUNT(*) INTO v_owner_sees FROM community_join_requests WHERE community_id = v_group_id;

  -- Admin sees all requests for groups they're admin in
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, false);
  SELECT COUNT(*) INTO v_admin_sees FROM community_join_requests WHERE community_id = v_group_id;

  -- Regular member does NOT see requests
  PERFORM set_config('request.jwt.claim.sub', v_member_id::text, false);
  SELECT COUNT(*) INTO v_member_sees FROM community_join_requests WHERE community_id = v_group_id;

  -- Requester sees only their own request
  PERFORM set_config('request.jwt.claim.sub', v_requester_id::text, false);
  SELECT COUNT(*) INTO v_requester_sees FROM community_join_requests WHERE community_id = v_group_id AND user_id = v_requester_id;

  INSERT INTO val_res_v4 (label, pass, detail) VALUES (
    'z2.join_requests_select_policy',
    v_owner_sees >= 1 AND v_admin_sees >= 1 AND v_member_sees = 0 AND v_requester_sees >= 1,
    format('owner=%s admin=%s member=%s requester=%s', v_owner_sees, v_admin_sees, v_member_sees, v_requester_sees)
  );
END $$;

-- ============================================================================
-- z3: approve_join_request RPC (owner/admin can approve, member cannot)
-- ============================================================================

DO $$
DECLARE
  v_owner_id uuid;
  v_admin_id uuid;
  v_member_id uuid;
  v_requester_id uuid;
  v_group_id text;
  v_request_id uuid;
  v_result json;
  v_member_count_before int;
  v_member_count_after int;
  v_member_exists boolean;
  v_request_status text;
BEGIN
  SELECT owner_id, admin_id, member_id, requester_id, group_id, request_id
  INTO v_owner_id, v_admin_id, v_member_id, v_requester_id, v_group_id, v_request_id
  FROM test_data_v4;

  SELECT member_count INTO v_member_count_before FROM communities WHERE id = v_group_id;

  -- Member tries to approve (should fail)
  PERFORM set_config('request.jwt.claim.sub', v_member_id::text, false);
  SELECT approve_join_request(v_request_id) INTO v_result;

  -- Admin approves (should succeed)
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, false);
  SELECT approve_join_request(v_request_id) INTO v_result;

  -- Check member was added and member_count incremented
  SELECT EXISTS (SELECT 1 FROM community_members WHERE community_id = v_group_id AND user_id = v_requester_id)
  INTO v_member_exists;

  SELECT member_count INTO v_member_count_after FROM communities WHERE id = v_group_id;
  SELECT status INTO v_request_status FROM community_join_requests WHERE id = v_request_id;

  INSERT INTO val_res_v4 (label, pass, detail) VALUES (
    'z3.approve_join_request_rpc',
    v_member_exists AND v_member_count_after = v_member_count_before + 1 AND v_request_status = 'approved',
    format('member_added=%s count_before=%s count_after=%s status=%s result=%s', v_member_exists, v_member_count_before, v_member_count_after, v_request_status, v_result)
  );
END $$;

-- ============================================================================
-- z4: reject_join_request RPC (owner/admin can reject)
-- ============================================================================

DO $$
DECLARE
  v_owner_id uuid;
  v_admin_id uuid;
  v_member_id uuid;
  v_group_id text;
  v_new_request_id uuid;
  v_new_requester_id uuid := '99000000-0000-0000-0000-000000000106';
  v_result json;
  v_request_status text;
BEGIN
  SELECT owner_id, admin_id, member_id, group_id
  INTO v_owner_id, v_admin_id, v_member_id, v_group_id
  FROM test_data_v4;

  -- Create new requester
  INSERT INTO auth.users (id, email) VALUES (v_new_requester_id, 'requester2@test.local') ON CONFLICT DO NOTHING;
  INSERT INTO profiles (id, nickname) VALUES (v_new_requester_id, 'Requester2') ON CONFLICT DO NOTHING;

  -- Create new pending request
  INSERT INTO community_join_requests (id, community_id, user_id, status)
  VALUES (gen_random_uuid(), v_group_id, v_new_requester_id, 'pending')
  RETURNING id INTO v_new_request_id;

  -- Owner rejects
  PERFORM set_config('request.jwt.claim.sub', v_owner_id::text, false);
  SELECT reject_join_request(v_new_request_id) INTO v_result;

  SELECT status INTO v_request_status FROM community_join_requests WHERE id = v_new_request_id;

  INSERT INTO val_res_v4 (label, pass, detail) VALUES (
    'z4.reject_join_request_rpc',
    v_request_status = 'rejected',
    format('status=%s result=%s', v_request_status, v_result)
  );
END $$;

-- ============================================================================
-- z5: set_member_role RPC (owner only, cannot assign owner)
-- ============================================================================

DO $$
DECLARE
  v_owner_id uuid;
  v_admin_id uuid;
  v_member_id uuid;
  v_group_id text;
  v_result json;
  v_admin_role text;
  v_member_role_before text;
  v_member_role_after text;
  v_try_assign_owner json;
BEGIN
  SELECT owner_id, admin_id, member_id, group_id
  INTO v_owner_id, v_admin_id, v_member_id, v_group_id
  FROM test_data_v4;

  SELECT role INTO v_member_role_before FROM community_members WHERE community_id = v_group_id AND user_id = v_member_id;

  -- Admin tries to promote member (should fail: only owner can)
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, false);
  SELECT set_member_role(v_group_id, v_member_id, 'admin') INTO v_result;

  SELECT role INTO v_admin_role FROM community_members WHERE community_id = v_group_id AND user_id = v_member_id;

  -- Owner promotes member to admin (should succeed)
  PERFORM set_config('request.jwt.claim.sub', v_owner_id::text, false);
  SELECT set_member_role(v_group_id, v_member_id, 'admin') INTO v_result;

  SELECT role INTO v_member_role_after FROM community_members WHERE community_id = v_group_id AND user_id = v_member_id;

  -- Try to assign owner role (should fail)
  SELECT set_member_role(v_group_id, v_admin_id, 'owner') INTO v_try_assign_owner;

  INSERT INTO val_res_v4 (label, pass, detail) VALUES (
    'z5.set_member_role_rpc',
    v_admin_role = 'member' AND v_member_role_after = 'admin' AND (v_try_assign_owner->>'status') = 'invalid_role',
    format('before=%s after_admin_try=%s after_owner=%s owner_attempt=%s', v_member_role_before, v_admin_role, v_member_role_after, v_try_assign_owner)
  );
END $$;

-- ============================================================================
-- z6: community_bans RPC-only (no direct INSERT allowed)
-- ============================================================================

DO $$
DECLARE
  v_owner_id uuid;
  v_member_id uuid;
  v_group_id text;
  v_ban_user_id uuid := '99000000-0000-0000-0000-000000000107';
  v_direct_insert_error text;
  v_rpc_result json;
  v_ban_exists boolean;
BEGIN
  SELECT owner_id, member_id, group_id INTO v_owner_id, v_member_id, v_group_id FROM test_data_v4;

  -- Create ban target
  INSERT INTO auth.users (id, email) VALUES (v_ban_user_id, 'ban@test.local') ON CONFLICT DO NOTHING;
  INSERT INTO profiles (id, nickname) VALUES (v_ban_user_id, 'Banned') ON CONFLICT DO NOTHING;
  INSERT INTO community_members (community_id, user_id, role) VALUES (v_group_id, v_ban_user_id, 'member') ON CONFLICT DO NOTHING;

  -- Try direct INSERT (should fail: no INSERT policy)
  PERFORM set_config('request.jwt.claim.sub', v_owner_id::text, false);
  BEGIN
    INSERT INTO community_bans (community_id, user_id, banned_by)
    VALUES (v_group_id, v_ban_user_id, v_owner_id);
    v_direct_insert_error := NULL;
  EXCEPTION WHEN insufficient_privilege OR others THEN
    GET STACKED DIAGNOSTICS v_direct_insert_error = MESSAGE_TEXT;
  END;

  -- Use RPC (should succeed)
  SELECT remove_member(v_group_id, v_ban_user_id, true) INTO v_rpc_result;

  SELECT EXISTS (SELECT 1 FROM community_bans WHERE community_id = v_group_id AND user_id = v_ban_user_id)
  INTO v_ban_exists;

  INSERT INTO val_res_v4 (label, pass, detail) VALUES (
    'z6.community_bans_rpc_only',
    v_direct_insert_error IS NOT NULL AND v_ban_exists,
    format('direct_insert_blocked=%s ban_via_rpc=%s', v_direct_insert_error IS NOT NULL, v_ban_exists)
  );
END $$;

-- ============================================================================
-- Results
-- ============================================================================

-- Display results
SELECT
  seq,
  label,
  CASE WHEN pass THEN 'PASS' ELSE 'FAIL' END as result,
  detail
FROM val_res_v4
ORDER BY seq;

-- Summary
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN pass THEN 1 ELSE 0 END) as passed,
  SUM(CASE WHEN NOT pass THEN 1 ELSE 0 END) as failed
FROM val_res_v4;
