-- assertions_v4.sql  --  behavioural + security assertions for 008_rls_bans_requests (and the NULL-role authorization pattern in 001-008)
-- Run AFTER 001..008 on a scratch DB as the postgres superuser (it switches to anon/authenticated with SET LOCAL ROLE
-- and simulates auth.uid() through the request.jwt.claim.sub GUC, exactly like assertions_v3.sql). NEVER run against a real Supabase DB.
-- Self-contained: uses its own schema val4 (does not touch val.*). Results: SELECT * FROM val4.res ORDER BY seq;
\set ON_ERROR_STOP off
\pset pager off
DROP SCHEMA IF EXISTS val4 CASCADE;
CREATE SCHEMA val4;
CREATE TABLE val4.res(seq serial, id text, ok boolean, detail text);
CREATE TABLE val4.ctx(k text primary key, v text);
GRANT USAGE ON SCHEMA val4 TO PUBLIC;

CREATE FUNCTION val4.u(n int) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$ select ('97000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid $$;
CREATE FUNCTION val4.c(k text) RETURNS text LANGUAGE sql STABLE AS $$ select v from val4.ctx where ctx.k=c.k $$;
CREATE FUNCTION val4.rec(i text, ok boolean, d text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN EXECUTE 'RESET ROLE'; INSERT INTO val4.res(id,ok,detail) VALUES(i, coalesce(ok,false), d); END $$;   -- NULL result counts as FAIL
CREATE FUNCTION val4.mkuser(n int, nick text) RETURNS void LANGUAGE sql AS $$
  INSERT INTO auth.users(id) VALUES (val4.u(n)) ON CONFLICT DO NOTHING;
  INSERT INTO public.profiles(id,nickname,bio,profile_visibility) VALUES (val4.u(n),nick,'','public') ON CONFLICT DO NOTHING; $$;
-- run a scalar query (returns text) as authenticated user u (NULL = authenticated role without a uid); returns 'ERR: ..' on exception
CREATE FUNCTION val4.call_as(u uuid, q text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE r text;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', coalesce(u::text,''), true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  BEGIN EXECUTE q INTO r; EXCEPTION WHEN OTHERS THEN r := 'ERR: '||SQLERRM; END;
  EXECUTE 'RESET ROLE'; PERFORM set_config('request.jwt.claim.sub','',true); RETURN r;
END $$;
CREATE FUNCTION val4.anon_call(q text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE r text;
BEGIN
  PERFORM set_config('request.jwt.claim.sub','',true);
  EXECUTE 'SET LOCAL ROLE anon';
  BEGIN EXECUTE q INTO r; EXCEPTION WHEN OTHERS THEN r := 'ERR: '||SQLERRM; END;
  EXECUTE 'RESET ROLE'; RETURN r;
END $$;
-- json status of an RPC call (or the ERR text)
CREATE FUNCTION val4.st(u uuid, q text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE r text;
BEGIN r := val4.call_as(u, q); IF r IS NULL THEN RETURN 'NULL'; END IF; IF r LIKE 'ERR:%' THEN RETURN r; END IF; RETURN coalesce((r::json)->>'status','?'); END $$;
CREATE FUNCTION val4.cnt(u uuid, q text) RETURNS int LANGUAGE plpgsql AS $$
DECLARE r text; BEGIN r := val4.call_as(u, 'select count(*)::text from ('||q||') s'); IF r LIKE 'ERR:%' THEN RETURN -1; END IF; RETURN r::int; END $$;
CREATE FUNCTION val4.role_of(g text, u uuid) RETURNS text LANGUAGE sql STABLE AS $$ select coalesce((select role from community_members where community_id=g and user_id=u),'<none>') $$;
CREATE FUNCTION val4.mc(g text) RETURNS text LANGUAGE sql STABLE AS $$ select member_count||'/'||(select count(*) from community_members where community_id=g) from communities where id=g $$;
CREATE FUNCTION val4.rq(id uuid) RETURNS text LANGUAGE sql STABLE AS $$ select status||'/rev='||coalesce(right(reviewed_by::text,3),'null') from community_join_requests where community_join_requests.id=rq.id $$;
CREATE FUNCTION val4.rpc(fn text, VARIADIC a text[]) RETURNS text LANGUAGE sql IMMUTABLE AS $$ select 'select '||fn||'('||(select string_agg(quote_literal(x),',') from unnest(a) x)||')::text' $$;
GRANT ALL ON ALL TABLES IN SCHEMA val4 TO PUBLIC; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA val4 TO PUBLIC;

-- ============================================================================ SETUP
-- cast of users: O owner, A admin, M member, T member2, X outsider (member of nothing), Y owner of a second group (cross-group attacker),
-- A2 second admin, R1..R7 requesters, Z ghost user for the missing-profile test, S platform admin (profiles.is_admin)
DO $$ DECLARE r json; g text; g2 text; g0 text; code text; i int; rid uuid; BEGIN
  FOR i IN 1..30 LOOP PERFORM val4.mkuser(i, 'v4u'||i); END LOOP;
  UPDATE profiles SET is_admin=true WHERE id=val4.u(9);
  -- main group g (requires approval), owner O=1
  PERFORM val4.call_as(val4.u(1), $q$select 1::text$q$);
  r := (val4.call_as(val4.u(1), $q$select create_group('V4 Group','d','private')::text$q$))::json;
  g := r->>'community_id'; code := r->>'invite_code';
  INSERT INTO val4.ctx VALUES ('g',g),('code',code);
  UPDATE communities SET requires_approval=true WHERE id=g;
  INSERT INTO community_members(community_id,user_id,role) VALUES (g,val4.u(2),'admin'),(g,val4.u(3),'member'),(g,val4.u(6),'member'),(g,val4.u(7),'member'),(g,val4.u(8),'admin');
  -- second group g2 owned by Y=5 (attacker is a legit owner elsewhere)
  r := (val4.call_as(val4.u(5), $q$select create_group('V4 Other','d','private')::text$q$))::json;
  g2 := r->>'community_id'; INSERT INTO val4.ctx VALUES ('g2',g2);
  -- ownerless legacy group g0 with one member (like live: owner_id NULL)
  g0 := 'comm-v4-ownerless';
  INSERT INTO communities(id,name,initial,color,members,focus,"desc",owner_id,visibility,invite_code) VALUES (g0,'Ownerless','O','#000',0,'habit','d',NULL,'public','V4OWNRLS');
  INSERT INTO community_members(community_id,user_id) VALUES (g0,val4.u(10));
  INSERT INTO val4.ctx VALUES ('g0',g0);
  -- pending join requests through the real RPC
  FOR i IN 11..16 LOOP
    PERFORM val4.call_as(val4.u(i), format('select join_by_invite(%L)::text', code));
    SELECT id INTO rid FROM community_join_requests WHERE community_id=g AND user_id=val4.u(i);
    INSERT INTO val4.ctx VALUES ('r'||(i-10), rid::text);
  END LOOP;
  -- r7: requester who is already a member (member row exists, request still pending)
  INSERT INTO community_join_requests(community_id,user_id,status) VALUES (g,val4.u(7),'pending') RETURNING id INTO rid;
  INSERT INTO val4.ctx VALUES ('r7', rid::text);
  -- r8: request of a user who has no profile any more (FK bypassed with replica role, simulates orphaned data)
  SET session_replication_role = replica;
  DELETE FROM profiles WHERE id=val4.u(29); DELETE FROM auth.users WHERE id=val4.u(29);
  INSERT INTO community_join_requests(community_id,user_id,status) VALUES (g,val4.u(29),'pending') RETURNING id INTO rid;
  SET session_replication_role = DEFAULT;
  INSERT INTO val4.ctx VALUES ('r8', rid::text);
  -- request in the other group (for cross-group attack)
  PERFORM val4.call_as(val4.u(20), format('select join_by_invite(%L)::text', r->>'invite_code'));
  UPDATE communities SET requires_approval=true WHERE id=g2;
  DELETE FROM community_join_requests WHERE community_id=g2;
  INSERT INTO community_join_requests(community_id,user_id,status) VALUES (g2,val4.u(20),'pending') RETURNING id INTO rid;
  INSERT INTO val4.ctx VALUES ('r_g2', rid::text);
  RAISE NOTICE 'setup done g=% g2=% g0=%', g, g2, g0;
END $$;
SELECT 'setup' AS stage, (SELECT count(*) FROM community_join_requests) AS requests, val4.mc(val4.c('g')) AS g_member_count_vs_rows;

-- ============================================================================ z1: RLS enabled + anon locked out
DO $$ DECLARE rls text; a1 text; a2 text; a3 text; a4 text; BEGIN
  SELECT string_agg(relname||'='||relrowsecurity, ',' ORDER BY relname) INTO rls FROM pg_class WHERE relname IN ('community_bans','community_join_requests') AND relnamespace='public'::regnamespace;
  PERFORM val4.rec('z1.rls_enabled_on_both_tables', rls='community_bans=true,community_join_requests=true', rls);
  a1 := val4.anon_call('select count(*)::text from community_bans');
  a2 := val4.anon_call('select count(*)::text from community_join_requests');
  PERFORM val4.rec('z1.anon_cannot_select', a1 ILIKE '%permission denied%' AND a2 ILIKE '%permission denied%', format('bans: %s | join_requests: %s', a1, a2));
  a3 := val4.anon_call(format('insert into community_bans(community_id,user_id) values (%L,%L) returning 1::text', val4.c('g'), val4.u(12)));
  a4 := val4.anon_call(format('insert into community_join_requests(community_id,user_id) values (%L,%L) returning 1::text', val4.c('g'), val4.u(12)));
  PERFORM val4.rec('z1.anon_cannot_insert', a3 ILIKE '%permission denied%' AND a4 ILIKE '%permission denied%'
     AND NOT EXISTS (SELECT 1 FROM community_bans WHERE user_id=val4.u(12)), format('bans: %s | join_requests: %s', a3, a4));
END $$;

-- ============================================================================ z2: community_join_requests SELECT policy visibility
DO $$ DECLARE g text := val4.c('g'); q1 text := format('select 1 from community_join_requests where id=%L', val4.c('r1'));
  vr int; vo int; va int; vm int; vx int; vr2 int; vy int; r1_all int; o_all int; tot int; pol text; w1 text; w2 text; w3 text; BEGIN
  vr := val4.cnt(val4.u(11), q1); vo := val4.cnt(val4.u(1), q1); va := val4.cnt(val4.u(2), q1);
  vm := val4.cnt(val4.u(3), q1); vx := val4.cnt(val4.u(4), q1); vr2 := val4.cnt(val4.u(12), q1); vy := val4.cnt(val4.u(5), q1);
  PERFORM val4.rec('z2.requester_owner_admin_see_request', vr=1 AND vo=1 AND va=1, format('requester=%s owner=%s admin=%s', vr,vo,va));
  PERFORM val4.rec('z2.plain_member_and_outsider_do_not_see', vm=0 AND vx=0 AND vr2=0 AND vy=0, format('plain_member=%s outsider=%s other_requester=%s owner_of_other_group=%s', vm,vx,vr2,vy));
  r1_all := val4.cnt(val4.u(11), format('select 1 from community_join_requests where community_id=%L', g));
  o_all := val4.cnt(val4.u(1), format('select 1 from community_join_requests where community_id=%L', g));
  SELECT count(*) INTO tot FROM community_join_requests WHERE community_id=g;
  PERFORM val4.rec('z2.requester_sees_only_own_owner_sees_all_of_group', r1_all=1 AND o_all=tot AND tot>=8, format('requester sees %s of %s; owner sees %s; owner of g does not see g2 requests: %s', r1_all, tot, o_all, val4.cnt(val4.u(1), format('select 1 from community_join_requests where id=%L', val4.c('r_g2')))));
  SELECT string_agg(policyname||':'||cmd||':'||roles::text, ',') INTO pol FROM pg_policies WHERE tablename='community_join_requests';
  w1 := coalesce(val4.call_as(val4.u(11), format('insert into community_join_requests(community_id,user_id,status) values (%L,%L,%L) returning 1::text', val4.c('g2'), val4.u(11), 'pending')),'0 rows');
  w2 := coalesce(val4.call_as(val4.u(1), format('update community_join_requests set status=%L where id=%L returning 1::text','approved', val4.c('r1'))),'0 rows');
  w3 := coalesce(val4.call_as(val4.u(1), format('delete from community_join_requests where id=%L returning 1::text', val4.c('r1'))),'0 rows');
  PERFORM val4.rec('z2.authenticated_no_direct_insert_update_delete_on_requests',
    (w1 LIKE 'ERR:%' OR w1='0 rows') AND (w2 LIKE 'ERR:%' OR w2='0 rows') AND (w3 LIKE 'ERR:%' OR w3='0 rows')
    AND NOT EXISTS (SELECT 1 FROM community_join_requests WHERE community_id=val4.c('g2') AND user_id=val4.u(11))
    AND val4.rq(val4.c('r1')::uuid) = 'pending/rev=null',
    format('policies=[%s] | insert=%s | update=%s | delete=%s | r1 still %s (error or 0 rows both = denied)', pol, left(w1,70), left(w2,70), left(w3,70), val4.rq(val4.c('r1')::uuid)));
END $$;

-- ============================================================================ z3: approve_join_request
DO $$ DECLARE g text := val4.c('g'); r1 text := val4.c('r1'); r3 text := val4.c('r3'); rg2 text := val4.c('r_g2');
  s_x text; s_m text; s_y text; s_nul text; s_a text; s_a2 text; s_nf text; s_x2 text; mem_before int; mc_before text; mc_after text; n_mem int; role_new text; BEGIN
  mc_before := val4.mc(g);
  -- THE BYPASS TEST: outsider (not a member of g at all) must NOT be authorized
  s_x := val4.st(val4.u(4), val4.rpc('approve_join_request', r1));
  s_y := val4.st(val4.u(5), val4.rpc('approve_join_request', r1));   -- owner of a DIFFERENT group
  PERFORM val4.rec('z3.outsider_NOT_authorized_to_approve', s_x='not_authorized' AND s_y='not_authorized' AND val4.rq(r1::uuid) LIKE 'pending/rev=null'
     AND NOT EXISTS (SELECT 1 FROM community_members WHERE community_id=g AND user_id=val4.u(11)),
     format('outsider=%s owner_of_other_group=%s | request=%s requester_is_member=%s', s_x, s_y, val4.rq(r1::uuid), EXISTS (SELECT 1 FROM community_members WHERE community_id=g AND user_id=val4.u(11))));
  s_m := val4.st(val4.u(3), val4.rpc('approve_join_request', r1));
  PERFORM val4.rec('z3.plain_member_NOT_authorized_to_approve', s_m='not_authorized' AND val4.rq(r1::uuid) LIKE 'pending/rev=null', format('member=%s request=%s', s_m, val4.rq(r1::uuid)));
  s_a2 := val4.st(val4.u(2), val4.rpc('approve_join_request', rg2));   -- admin of g tries to approve a request of g2
  PERFORM val4.rec('z3.admin_of_other_group_NOT_authorized_cross_group', s_a2='not_authorized' AND val4.rq(rg2::uuid) LIKE 'pending/rev=null', format('admin_of_g on request of g2=%s request=%s', s_a2, val4.rq(rg2::uuid)));
  s_nul := val4.st(NULL, val4.rpc('approve_join_request', r1));
  PERFORM val4.rec('z3.authenticated_role_without_uid_rejected', s_nul ILIKE '%Not authenticated%', s_nul);
  s_nf := val4.st(val4.u(1), val4.rpc('approve_join_request', gen_random_uuid()::text));
  PERFORM val4.rec('z3.unknown_request_id_not_found', s_nf='not_found', s_nf);
  -- admin succeeds
  s_a := val4.st(val4.u(2), val4.rpc('approve_join_request', r1));
  mc_after := val4.mc(g);
  SELECT count(*), max(role) INTO n_mem, role_new FROM community_members WHERE community_id=g AND user_id=val4.u(11);
  PERFORM val4.rec('z3.admin_approves_success_member_row_and_count', s_a='success' AND n_mem=1 AND role_new='member' AND val4.rq(r1::uuid)=('approved/rev='||right(val4.u(2)::text,3))
     AND (split_part(mc_after,'/',1)::int = split_part(mc_before,'/',1)::int + 1) AND split_part(mc_after,'/',1)=split_part(mc_after,'/',2),
     format('admin=%s member_rows=%s role=%s request=%s member_count(before)=%s member_count/rows(after)=%s', s_a, n_mem, role_new, val4.rq(r1::uuid), mc_before, mc_after));
  -- second call: already_processed, no second insert / count change
  s_a2 := val4.st(val4.u(2), val4.rpc('approve_join_request', r1));
  PERFORM val4.rec('z3.second_call_already_processed', s_a2='already_processed' AND val4.mc(g)=mc_after, format('2nd approve=%s member_count/rows=%s', s_a2, val4.mc(g)));
  -- outsider cannot learn that the request is processed (authorization is checked before the status)
  s_x2 := val4.st(val4.u(4), val4.rpc('approve_join_request', r1));
  PERFORM val4.rec('z3.outsider_gets_not_authorized_even_for_processed_request', s_x2='not_authorized', s_x2);
  -- owner succeeds too
  mc_before := val4.mc(g);
  s_a := val4.st(val4.u(1), val4.rpc('approve_join_request', r3));
  PERFORM val4.rec('z3.owner_approves_success', s_a='success' AND val4.role_of(g, val4.u(13))='member' AND val4.rq(r3::uuid)=('approved/rev='||right(val4.u(1)::text,3)) AND split_part(val4.mc(g),'/',1)::int=split_part(mc_before,'/',1)::int+1 AND split_part(val4.mc(g),'/',1)=split_part(val4.mc(g),'/',2), format('owner=%s role=%s request=%s member_count/rows=%s', s_a, val4.role_of(g,val4.u(13)), val4.rq(r3::uuid), val4.mc(g)));
  -- requester already a member (legacy/dup): no second row, request closed
  mc_before := val4.mc(g);
  s_a := val4.st(val4.u(1), val4.rpc('approve_join_request', val4.c('r7')));
  PERFORM val4.rec('z3.already_member_no_duplicate_row', s_a='already_member' AND val4.mc(g)=mc_before AND val4.rq(val4.c('r7')::uuid) LIKE 'approved/%', format('%s | member_count/rows=%s | request=%s', s_a, val4.mc(g), val4.rq(val4.c('r7')::uuid)));
END $$;

-- ============================================================================ z4: reject_join_request
DO $$ DECLARE g text := val4.c('g'); r2 text := val4.c('r2'); s_x text; s_y text; s_m text; s_a text; s_a2 text; s_ap text; s_x2 text; s_nf text; BEGIN
  s_x := val4.st(val4.u(4), val4.rpc('reject_join_request', r2));
  s_y := val4.st(val4.u(5), val4.rpc('reject_join_request', r2));
  PERFORM val4.rec('z4.outsider_NOT_authorized_to_reject', s_x='not_authorized' AND s_y='not_authorized' AND val4.rq(r2::uuid)='pending/rev=null',
     format('outsider=%s owner_of_other_group=%s request=%s', s_x, s_y, val4.rq(r2::uuid)));
  s_m := val4.st(val4.u(3), val4.rpc('reject_join_request', r2));
  PERFORM val4.rec('z4.plain_member_NOT_authorized_to_reject', s_m='not_authorized' AND val4.rq(r2::uuid)='pending/rev=null', format('member=%s request=%s', s_m, val4.rq(r2::uuid)));
  s_nf := val4.st(val4.u(1), val4.rpc('reject_join_request', gen_random_uuid()::text));
  PERFORM val4.rec('z4.unknown_request_id_not_found', s_nf='not_found', s_nf);
  s_a := val4.st(val4.u(2), val4.rpc('reject_join_request', r2));
  PERFORM val4.rec('z4.admin_rejects_success', s_a='success' AND val4.rq(r2::uuid)=('rejected/rev='||right(val4.u(2)::text,3)) AND val4.role_of(g, val4.u(12))='<none>',
     format('admin=%s request=%s requester_role=%s', s_a, val4.rq(r2::uuid), val4.role_of(g, val4.u(12))));
  s_a2 := val4.st(val4.u(2), val4.rpc('reject_join_request', r2));
  s_ap := val4.st(val4.u(1), val4.rpc('approve_join_request', r2));
  PERFORM val4.rec('z4.second_reject_and_later_approve_already_processed', s_a2='already_processed' AND s_ap='already_processed' AND val4.role_of(g, val4.u(12))='<none>', format('2nd reject=%s approve-after-reject=%s requester_role=%s', s_a2, s_ap, val4.role_of(g, val4.u(12))));
  s_x2 := val4.st(val4.u(4), val4.rpc('reject_join_request', r2));
  PERFORM val4.rec('z4.outsider_gets_not_authorized_even_for_processed_request', s_x2='not_authorized', s_x2);
  -- owner can reject too (r4 is used later for the ban test -> use a fresh one: r5)
  s_a := val4.st(val4.u(1), val4.rpc('reject_join_request', val4.c('r5')));
  PERFORM val4.rec('z4.owner_rejects_success', s_a='success' AND val4.rq(val4.c('r5')::uuid)=('rejected/rev='||right(val4.u(1)::text,3)), format('owner=%s request=%s', s_a, val4.rq(val4.c('r5')::uuid)));
  PERFORM val4.rec('z4.reject_without_uid_rejected', val4.st(NULL, val4.rpc('reject_join_request', val4.c('r6'))) ILIKE '%Not authenticated%', val4.st(NULL, val4.rpc('reject_join_request', val4.c('r6'))));
END $$;

-- ============================================================================ z5: set_member_role
DO $$ DECLARE g text := val4.c('g'); o uuid := val4.u(1); a uuid := val4.u(2); m uuid := val4.u(3); t uuid := val4.u(6); x uuid := val4.u(4); t2 uuid := val4.u(8);
  s1 text; s2 text; s3 text; s4 text; s5 text; s6 text; s7 text; s8 text; s9 text; s10 text; BEGIN
  s1 := val4.st(x, val4.rpc('set_member_role', g, m::text, 'admin'));
  s2 := val4.st(x, val4.rpc('set_member_role', g, x::text, 'admin'));          -- outsider promotes ITSELF into the group
  s3 := val4.st(x, val4.rpc('set_member_role', g, o::text, 'member'));         -- outsider demotes the owner
  s4 := val4.st(val4.u(5), val4.rpc('set_member_role', g, m::text, 'admin'));  -- owner of another group
  PERFORM val4.rec('z5.outsider_NOT_authorized_to_set_role', s1='not_authorized' AND s2='not_authorized' AND s3='not_authorized' AND s4='not_authorized'
     AND val4.role_of(g,m)='member' AND val4.role_of(g,x)='<none>' AND val4.role_of(g,o)='owner',
     format('outsider->member=%s outsider->self=%s outsider->owner=%s owner_of_other_group->member=%s | roles now member=%s outsider=%s owner=%s', s1,s2,s3,s4, val4.role_of(g,m), val4.role_of(g,x), val4.role_of(g,o)));
  s5 := val4.st(x, val4.rpc('set_member_role', g, m::text, 'superuser'));
  s6 := val4.st(x, format('select set_member_role(%L,%L,NULL)::text', g, m));
  PERFORM val4.rec('z5.outsider_gets_not_authorized_before_role_validation', s5='not_authorized' AND s6='not_authorized', format('bad role=%s NULL role=%s', s5, s6));
  s1 := val4.st(m, val4.rpc('set_member_role', g, t::text, 'admin'));
  s2 := val4.st(m, val4.rpc('set_member_role', g, m::text, 'admin'));
  PERFORM val4.rec('z5.plain_member_NOT_authorized_to_set_role', s1='not_authorized' AND s2='not_authorized' AND val4.role_of(g,t)='member' AND val4.role_of(g,m)='member', format('member->other=%s member->self=%s roles t=%s m=%s', s1,s2,val4.role_of(g,t),val4.role_of(g,m)));
  s1 := val4.st(a, val4.rpc('set_member_role', g, m::text, 'admin'));
  s2 := val4.st(a, val4.rpc('set_member_role', g, o::text, 'member'));
  s3 := val4.st(a, val4.rpc('set_member_role', g, a::text, 'member'));
  s4 := val4.st(a, val4.rpc('set_member_role', g, t2::text, 'member'));  -- another admin
  PERFORM val4.rec('z5.admin_NOT_authorized_to_set_role', s1='not_authorized' AND s2='not_authorized' AND s3='not_authorized' AND s4='not_authorized'
     AND val4.role_of(g,m)='member' AND val4.role_of(g,o)='owner' AND val4.role_of(g,a)='admin' AND val4.role_of(g,t2)='admin',
     format('admin->member=%s admin->owner=%s admin->self=%s admin->other admin=%s | roles m=%s o=%s a=%s a2=%s', s1,s2,s3,s4,val4.role_of(g,m),val4.role_of(g,o),val4.role_of(g,a),val4.role_of(g,t2)));
  s1 := val4.st(o, val4.rpc('set_member_role', g, m::text, 'admin'));
  s2 := val4.role_of(g,m);
  s3 := val4.st(o, val4.rpc('set_member_role', g, m::text, 'member'));
  PERFORM val4.rec('z5.owner_succeeds_member_to_admin_and_back', s1='success' AND s2='admin' AND s3='success' AND val4.role_of(g,m)='member', format('promote=%s role=%s demote=%s role=%s', s1,s2,s3,val4.role_of(g,m)));
  s1 := val4.st(o, val4.rpc('set_member_role', g, t::text, 'owner'));
  PERFORM val4.rec('z5.cannot_assign_owner_role', s1='invalid_role' AND val4.role_of(g,t)='member' AND (SELECT count(*) FROM community_members WHERE community_id=g AND role='owner')=1, format('assign owner=%s target role=%s owners in group=%s', s1, val4.role_of(g,t), (SELECT count(*) FROM community_members WHERE community_id=g AND role='owner')));
  s1 := val4.st(o, val4.rpc('set_member_role', g, o::text, 'admin'));
  s2 := val4.st(o, val4.rpc('set_member_role', g, o::text, 'member'));
  PERFORM val4.rec('z5.cannot_change_own_role', s1='cannot_change_own_role' AND s2='cannot_change_own_role' AND val4.role_of(g,o)='owner', format('owner->self admin=%s owner->self member=%s role=%s', s1,s2,val4.role_of(g,o)));
  s1 := val4.st(o, val4.rpc('set_member_role', g, t::text, 'superuser'));
  s2 := val4.st(o, format('select set_member_role(%L,%L,NULL)::text', g, t));
  s3 := val4.st(o, val4.rpc('set_member_role', g, t::text, ''));
  s4 := val4.st(o, val4.rpc('set_member_role', g, t::text, 'ADMIN'));
  PERFORM val4.rec('z5.bad_role_rejected', s1='invalid_role' AND s2='invalid_role' AND s3='invalid_role' AND s4='invalid_role' AND val4.role_of(g,t)='member', format('''superuser''=%s NULL=%s ''''=%s ''ADMIN''=%s role=%s', s1,s2,s3,s4,val4.role_of(g,t)));
  s1 := val4.st(o, val4.rpc('set_member_role', g, x::text, 'admin'));
  s2 := val4.st(o, format('select set_member_role(%L,NULL,%L)::text', g, 'admin'));
  PERFORM val4.rec('z5.target_not_member_or_null_rejected', s1='not_member' AND val4.role_of(g,x)='<none>' AND s2='cannot_change_own_role', format('non-member target=%s NULL target=%s', s1, s2));
  -- legacy second owner row: cannot be demoted through set_member_role
  UPDATE community_members SET role='owner' WHERE community_id=g AND user_id=val4.u(7);
  s1 := val4.st(o, val4.rpc('set_member_role', g, val4.u(7)::text, 'member'));
  PERFORM val4.rec('z5.cannot_change_other_owner_row', s1='cannot_change_owner' AND val4.role_of(g,val4.u(7))='owner', format('%s role=%s', s1, val4.role_of(g,val4.u(7))));
  UPDATE community_members SET role='member' WHERE community_id=g AND user_id=val4.u(7);
  -- ownerless legacy group: no owner at all -> outsider and member must not become authorized
  s1 := val4.st(x, val4.rpc('set_member_role', val4.c('g0'), val4.u(10)::text, 'admin'));
  s2 := val4.st(val4.u(10), val4.rpc('set_member_role', val4.c('g0'), val4.u(10)::text, 'admin'));
  PERFORM val4.rec('z5.ownerless_group_nobody_authorized', s1='not_authorized' AND s2='not_authorized' AND val4.role_of(val4.c('g0'), val4.u(10))='member', format('outsider=%s sole member=%s role=%s', s1,s2,val4.role_of(val4.c('g0'), val4.u(10))));
  PERFORM val4.rec('z5.set_role_without_uid_rejected', val4.st(NULL, val4.rpc('set_member_role', g, t::text, 'admin')) ILIKE '%Not authenticated%', val4.st(NULL, val4.rpc('set_member_role', g, t::text, 'admin')));
END $$;

-- ============================================================================ z6: community_bans has no direct access for authenticated
DO $$ DECLARE g text := val4.c('g'); o uuid := val4.u(1); b uuid := val4.u(14); sel_o text; sel_b text; sel_m text; ins_o text; ins_x text; upd text; del text; nb int; s text; BEGIN
  -- precondition: a ban row exists (made through the real RPC)
  s := val4.st(o, val4.rpc('remove_member', g, b::text, 'true'));   -- b = requester r4: not a member, only banned
  SELECT count(*) INTO nb FROM community_bans WHERE community_id=g AND user_id=b;
  PERFORM val4.rec('z6.precondition_ban_row_created_via_remove_member_rpc', s='success' AND nb=1, format('remove_member(ban)=%s ban_rows=%s', s, nb));
  sel_o := val4.call_as(o, 'select count(*)::text from community_bans');
  sel_b := val4.call_as(b, 'select count(*)::text from community_bans');
  sel_m := val4.call_as(val4.u(3), 'select count(*)::text from community_bans');
  PERFORM val4.rec('z6.authenticated_cannot_select_bans', (sel_o LIKE 'ERR:%' OR sel_o='0') AND (sel_b LIKE 'ERR:%' OR sel_b='0') AND (sel_m LIKE 'ERR:%' OR sel_m='0'), format('owner=%s banned user=%s member=%s (error or 0 rows both = no access)', sel_o, sel_b, sel_m));
  ins_o := val4.call_as(o, format('insert into community_bans(community_id,user_id,banned_by) values (%L,%L,%L) returning 1::text', g, val4.u(15), o));
  ins_x := val4.call_as(val4.u(4), format('insert into community_bans(community_id,user_id,banned_by) values (%L,%L,%L) returning 1::text', g, val4.u(3), val4.u(4)));
  PERFORM val4.rec('z6.authenticated_cannot_insert_bans', ins_o LIKE 'ERR:%' AND ins_x LIKE 'ERR:%' AND NOT EXISTS (SELECT 1 FROM community_bans WHERE user_id IN (val4.u(15), val4.u(3))), format('owner insert=%s | outsider insert=%s', left(ins_o,80), left(ins_x,80)));
  upd := val4.call_as(o, format('with u as (update community_bans set banned_by=NULL where community_id=%L returning 1) select count(*)::text from u', g));
  del := val4.call_as(b, format('with d as (delete from community_bans where user_id=%L returning 1) select count(*)::text from d', b));
  SELECT count(*) INTO nb FROM community_bans WHERE community_id=g AND user_id=b AND banned_by=o;
  PERFORM val4.rec('z6.authenticated_cannot_update_or_delete_bans', (upd LIKE 'ERR:%' OR upd='0') AND (del LIKE 'ERR:%' OR del='0') AND nb=1, format('update=%s delete=%s ban row intact=%s', left(upd,60), left(del,60), nb));
  PERFORM val4.rec('z6.authenticated_has_no_table_privileges_on_bans_and_only_select_on_requests',
    NOT has_table_privilege('authenticated','community_bans','SELECT,INSERT,UPDATE,DELETE,TRUNCATE')
    AND has_table_privilege('authenticated','community_join_requests','SELECT')
    AND NOT has_table_privilege('authenticated','community_join_requests','INSERT') AND NOT has_table_privilege('authenticated','community_join_requests','UPDATE') AND NOT has_table_privilege('authenticated','community_join_requests','DELETE') AND NOT has_table_privilege('authenticated','community_join_requests','TRUNCATE'),
    format('bans(S/I/U/D/T)=%s/%s/%s/%s/%s requests(S/I/U/D/T)=%s/%s/%s/%s/%s', has_table_privilege('authenticated','community_bans','SELECT'),has_table_privilege('authenticated','community_bans','INSERT'),has_table_privilege('authenticated','community_bans','UPDATE'),has_table_privilege('authenticated','community_bans','DELETE'),has_table_privilege('authenticated','community_bans','TRUNCATE'),
      has_table_privilege('authenticated','community_join_requests','SELECT'),has_table_privilege('authenticated','community_join_requests','INSERT'),has_table_privilege('authenticated','community_join_requests','UPDATE'),has_table_privilege('authenticated','community_join_requests','DELETE'),has_table_privilege('authenticated','community_join_requests','TRUNCATE')));
END $$;

-- ============================================================================ z7: banned user / missing profile / delete_account
DO $$ DECLARE g text := val4.c('g'); r4 text := val4.c('r4'); r8 text := val4.c('r8'); s text; s2 text; mc text; jb text; BEGIN
  -- r4 belongs to u14 who was banned in z6 while their request was still pending
  mc := val4.mc(g);
  s := val4.st(val4.u(1), val4.rpc('approve_join_request', r4));
  PERFORM val4.rec('z7.banned_user_cannot_be_approved_owner', s='banned' AND val4.role_of(g, val4.u(14))='<none>' AND val4.rq(r4::uuid) LIKE 'rejected/%' AND val4.mc(g)=mc,
     format('approve=%s requester_role=%s request=%s member_count/rows=%s (before %s)', s, val4.role_of(g,val4.u(14)), val4.rq(r4::uuid), val4.mc(g), mc));
  -- ... also for an admin, on a freshly created pending request of a freshly banned user (u16 never used before except r6 -> use new user 21)
  PERFORM val4.call_as(val4.u(21), format('select join_by_invite(%L)::text', val4.c('code')));
  PERFORM val4.call_as(val4.u(1), format('select remove_member(%L,%L,true)::text', g, val4.u(21)));
  s := val4.st(val4.u(2), format('select approve_join_request(id)::text from community_join_requests where community_id=%L and user_id=%L', g, val4.u(21)));
  PERFORM val4.rec('z7.banned_user_cannot_be_approved_admin', s='banned' AND val4.role_of(g, val4.u(21))='<none>', format('admin approve=%s role=%s request=%s', s, val4.role_of(g,val4.u(21)), (SELECT status FROM community_join_requests WHERE community_id=g AND user_id=val4.u(21))));
  jb := val4.st(val4.u(14), val4.rpc('join_by_invite', val4.c('code')));
  PERFORM val4.rec('z7.banned_user_cannot_rejoin_via_invite', jb='banned', jb);
  s := val4.st(val4.u(1), val4.rpc('approve_join_request', r8));
  PERFORM val4.rec('z7.request_of_user_without_profile_not_approved', s='user_not_found' AND val4.role_of(g, val4.u(29))='<none>' AND val4.rq(r8::uuid) LIKE 'rejected/%', format('approve=%s member_row=%s request=%s', s, val4.role_of(g,val4.u(29)), val4.rq(r8::uuid)));
END $$;
DO $$ DECLARE g text := val4.c('g'); d text; n_req int; n_prof int; d2 text; n_after int; ok2 boolean; BEGIN
  -- requester with a pending request deletes their account: FK ON DELETE CASCADE removes the request, delete_account succeeds
  SELECT count(*) INTO n_req FROM community_join_requests WHERE user_id=val4.u(16);
  d := val4.call_as(val4.u(16), 'select delete_account()::text');
  SELECT count(*) INTO n_after FROM community_join_requests WHERE user_id=val4.u(16);
  SELECT count(*) INTO n_prof FROM profiles WHERE id=val4.u(16);
  PERFORM val4.rec('z7.delete_account_of_requester_not_blocked_by_request_row', n_req=1 AND n_after=0 AND n_prof=0 AND d NOT LIKE 'ERR:%', format('pending requests before=%s after=%s profile rows=%s call=%s', n_req, n_after, n_prof, left(d,70)));
  -- banned user deletes account: ban row cascades
  d := val4.call_as(val4.u(14), 'select delete_account()::text');
  PERFORM val4.rec('z7.delete_account_of_banned_user_removes_ban_row', d NOT LIKE 'ERR:%' AND NOT EXISTS (SELECT 1 FROM community_bans WHERE user_id=val4.u(14)) AND NOT EXISTS (SELECT 1 FROM community_join_requests WHERE user_id=val4.u(14)), format('call=%s ban rows=%s request rows=%s', left(d,60), (SELECT count(*) FROM community_bans WHERE user_id=val4.u(14)), (SELECT count(*) FROM community_join_requests WHERE user_id=val4.u(14))));
  -- reviewer (admin A2=u8, has reviewed nothing; use the admin u2 who approved/rejected requests + banned nobody) deletes account: reviewed_by SET NULL
  d2 := val4.call_as(val4.u(2), 'select delete_account()::text');
  PERFORM val4.rec('z7.delete_account_of_reviewer_sets_reviewed_by_null', d2 NOT LIKE 'ERR:%' AND NOT EXISTS (SELECT 1 FROM community_join_requests WHERE reviewed_by=val4.u(2)) AND (SELECT count(*) FROM community_join_requests WHERE id IN (val4.c('r1')::uuid, val4.c('r2')::uuid) AND reviewed_by IS NULL AND status<>'pending')=2, format('call=%s requests reviewed by u2 left=%s; r1/r2 rows kept with reviewed_by NULL=%s', left(d2,60), (SELECT count(*) FROM community_join_requests WHERE reviewed_by=val4.u(2)), (SELECT count(*) FROM community_join_requests WHERE id IN (val4.c('r1')::uuid, val4.c('r2')::uuid) AND reviewed_by IS NULL)));
  -- owner with pending requests + bans deletes account: group (sole owner? no: members exist -> ownership transfers) must not be blocked
  d := val4.call_as(val4.u(1), 'select delete_account()::text');
  PERFORM val4.rec('z7.delete_account_of_group_owner_with_pending_requests_and_bans', d NOT LIKE 'ERR:%' AND EXISTS (SELECT 1 FROM communities WHERE id=g AND owner_id IS NOT NULL AND owner_id<>val4.u(1)) AND (SELECT count(*) FROM community_bans WHERE community_id=g)>=1, format('call=%s new_owner_set=%s bans kept=%s pending kept=%s', left(d,60), (SELECT owner_id IS NOT NULL AND owner_id<>val4.u(1) FROM communities WHERE id=g), (SELECT count(*) FROM community_bans WHERE community_id=g), (SELECT count(*) FROM community_join_requests WHERE community_id=g AND status='pending')));
END $$;

-- ============================================================================ z8: anon cannot execute the RPCs
DO $$ DECLARE a1 text; a2 text; a3 text; a4 text; pr text; BEGIN
  SELECT string_agg(p.proname||'(anon='||has_function_privilege('anon',p.oid,'EXECUTE')||',auth='||has_function_privilege('authenticated',p.oid,'EXECUTE')||',public='||has_function_privilege('public',p.oid,'EXECUTE')||')', ', ' ORDER BY p.proname) INTO pr
    FROM pg_proc p WHERE pronamespace='public'::regnamespace AND proname IN ('approve_join_request','reject_join_request','set_member_role');
  a1 := val4.anon_call(format('select approve_join_request(%L)::text', val4.c('r6')));
  a2 := val4.anon_call(format('select reject_join_request(%L)::text', val4.c('r6')));
  a3 := val4.anon_call(format('select set_member_role(%L,%L,%L)::text', val4.c('g'), val4.u(3), 'admin'));
  PERFORM val4.rec('z8.anon_cannot_execute_the_three_rpcs', a1 ILIKE '%permission denied%' AND a2 ILIKE '%permission denied%' AND a3 ILIKE '%permission denied%'
     AND (SELECT bool_and(NOT has_function_privilege('anon',p.oid,'EXECUTE') AND has_function_privilege('authenticated',p.oid,'EXECUTE')) FROM pg_proc p WHERE pronamespace='public'::regnamespace AND proname IN ('approve_join_request','reject_join_request','set_member_role')),
     format('%s | approve: %s | reject: %s | set_role: %s', pr, left(a1,60), left(a2,60), left(a3,60)));
END $$;

-- ============================================================================ z9: same NULL-role / NULL-owner pattern in the 001/005/007 RPCs
DO $$ DECLARE r json; gg text; code text; o uuid := val4.u(22); a uuid := val4.u(23); a2 uuid := val4.u(24); m uuid := val4.u(25); x uuid := val4.u(26); pa uuid := val4.u(9); n uuid := val4.u(27);
  c0 text; c1 text; s1 text; s2 text; s3 text; s4 text; s5 text; exp0 timestamptz; g0 text := val4.c('g0'); BEGIN
  PERFORM val4.mkuser(27,'nullrole');
  r := (val4.call_as(o, $q$select create_group('V4 Rot','d','private')::text$q$))::json; gg := r->>'community_id'; code := r->>'invite_code';
  INSERT INTO community_members(community_id,user_id,role) VALUES (gg,a,'admin'),(gg,a2,'admin'),(gg,m,'member'),(gg,n,'member');
  UPDATE community_members SET role=NULL WHERE community_id=gg AND user_id=n;   -- legacy-style row with NULL role (column is nullable)
  INSERT INTO val4.ctx VALUES ('gg',gg);
  -- rotate_invite_code
  SELECT invite_code INTO c0 FROM communities WHERE id=gg;
  s1 := val4.st(x, val4.rpc('rotate_invite_code', gg)); s2 := val4.st(m, val4.rpc('rotate_invite_code', gg)); s3 := val4.st(n, val4.rpc('rotate_invite_code', gg)); s4 := val4.st(x, val4.rpc('rotate_invite_code', g0));
  SELECT invite_code INTO c1 FROM communities WHERE id=gg;
  PERFORM val4.rec('z9.rotate_invite_code_outsider_member_nullrole_not_authorized', s1='not_authorized' AND s2='not_authorized' AND s3='not_authorized' AND s4='not_authorized' AND c0=c1, format('outsider=%s member=%s member_with_NULL_role=%s outsider_on_ownerless_group=%s | code unchanged=%s', s1,s2,s3,s4,c0=c1));
  s1 := val4.st(a, val4.rpc('rotate_invite_code', gg)); s2 := val4.st(o, val4.rpc('rotate_invite_code', gg));
  PERFORM val4.rec('z9.rotate_invite_code_admin_and_owner_succeed', s1='success' AND s2='success', format('admin=%s owner=%s', s1, s2));
  -- set_invite_expiry
  exp0 := (SELECT invite_expires_at FROM communities WHERE id=gg);
  s1 := val4.st(x, format('select set_invite_expiry(%L, now()+interval ''1 day'')::text', gg)); s2 := val4.st(m, format('select set_invite_expiry(%L, now()+interval ''1 day'')::text', gg)); s3 := val4.st(n, format('select set_invite_expiry(%L, now()+interval ''1 day'')::text', gg));
  PERFORM val4.rec('z9.set_invite_expiry_outsider_member_nullrole_not_authorized', s1='not_authorized' AND s2='not_authorized' AND s3='not_authorized' AND (SELECT invite_expires_at IS NOT DISTINCT FROM exp0 FROM communities WHERE id=gg), format('outsider=%s member=%s NULL-role member=%s expiry unchanged=%s', s1,s2,s3,(SELECT invite_expires_at IS NOT DISTINCT FROM exp0 FROM communities WHERE id=gg)));
  s1 := val4.st(a, format('select set_invite_expiry(%L, now()+interval ''1 day'')::text', gg));
  PERFORM val4.rec('z9.set_invite_expiry_admin_succeeds', s1='success' AND (SELECT invite_expires_at IS NOT NULL FROM communities WHERE id=gg), s1);
  -- remove_member
  s1 := val4.st(x, val4.rpc('remove_member', gg, m::text, 'true')); s2 := val4.st(m, val4.rpc('remove_member', gg, n::text, 'false')); s3 := val4.st(n, val4.rpc('remove_member', gg, m::text, 'false')); s4 := val4.st(x, val4.rpc('remove_member', gg, o::text, 'true'));
  PERFORM val4.rec('z9.remove_member_outsider_member_nullrole_not_authorized', s1='not_authorized' AND s2='not_authorized' AND s3='not_authorized' AND s4='not_authorized' AND val4.role_of(gg,m)='member' AND val4.role_of(gg,o)='owner' AND NOT EXISTS (SELECT 1 FROM community_bans WHERE community_id=gg),
     format('outsider->member=%s member->NULLrole=%s NULLrole->member=%s outsider->owner=%s | bans=%s', s1,s2,s3,s4,(SELECT count(*) FROM community_bans WHERE community_id=gg)));
  s1 := val4.st(a, val4.rpc('remove_member', gg, o::text, 'false')); s2 := val4.st(a, val4.rpc('remove_member', gg, a2::text, 'true')); s3 := val4.st(a, val4.rpc('remove_member', gg, a::text, 'false'));
  PERFORM val4.rec('z9.remove_member_admin_cannot_remove_owner_other_admin_or_self', s1='cannot_remove_owner_or_admin' AND s2='cannot_remove_owner_or_admin' AND s3='cannot_remove_self' AND val4.role_of(gg,o)='owner' AND val4.role_of(gg,a2)='admin', format('admin->owner=%s admin->admin=%s admin->self=%s', s1,s2,s3));
  s1 := val4.st(a, val4.rpc('remove_member', gg, m::text, 'false')); s2 := val4.st(o, val4.rpc('remove_member', gg, a2::text, 'true'));
  PERFORM val4.rec('z9.remove_member_admin_removes_member_owner_removes_admin', s1='success' AND s2='success' AND val4.role_of(gg,m)='<none>' AND val4.role_of(gg,a2)='<none>' AND EXISTS (SELECT 1 FROM community_bans WHERE community_id=gg AND user_id=a2), format('admin->member=%s owner->admin(ban)=%s ban row=%s', s1, s2, EXISTS (SELECT 1 FROM community_bans WHERE community_id=gg AND user_id=a2)));
  -- transfer_ownership
  s1 := val4.st(x, val4.rpc('transfer_ownership', gg, x::text)); s2 := val4.st(a, val4.rpc('transfer_ownership', gg, a::text)); s3 := val4.st(x, val4.rpc('transfer_ownership', g0, x::text)); s4 := val4.st(val4.u(10), val4.rpc('transfer_ownership', g0, val4.u(10)::text));
  PERFORM val4.rec('z9.transfer_ownership_outsider_admin_and_ownerless_group_not_owner', s1='not_owner' AND s2='not_owner' AND s3='not_owner' AND s4='not_owner' AND (SELECT owner_id FROM communities WHERE id=gg)=o AND (SELECT owner_id FROM communities WHERE id=g0) IS NULL,
     format('outsider=%s admin->self=%s outsider on ownerless group (owner_id NULL)=%s member of ownerless group->self=%s | gg owner unchanged=%s, ownerless group still ownerless=%s', s1,s2,s3,s4,(SELECT owner_id FROM communities WHERE id=gg)=o,(SELECT owner_id FROM communities WHERE id=g0) IS NULL));
  s1 := val4.st(o, val4.rpc('transfer_ownership', gg, o::text)); s2 := val4.st(o, val4.rpc('transfer_ownership', gg, x::text));
  PERFORM val4.rec('z9.transfer_ownership_to_self_or_nonmember_refused', s1='invalid_target' AND s2='not_member' AND val4.role_of(gg,o)='owner', format('owner->self=%s owner->non-member=%s owner role=%s', s1,s2,val4.role_of(gg,o)));
  s1 := val4.st(o, val4.rpc('transfer_ownership', gg, a::text));
  PERFORM val4.rec('z9.transfer_ownership_owner_succeeds_roles_swapped', s1='success' AND val4.role_of(gg,a)='owner' AND val4.role_of(gg,o)='member' AND (SELECT owner_id FROM communities WHERE id=gg)=a, format('%s new owner role=%s old owner role=%s owner_id ok=%s', s1, val4.role_of(gg,a), val4.role_of(gg,o), (SELECT owner_id FROM communities WHERE id=gg)=a));
  -- leave_group / toggle_community_notifications by outsider
  s1 := val4.st(x, val4.rpc('leave_group', gg)); s2 := val4.st(x, format('select toggle_community_notifications(%L,true)::text', gg)); s3 := val4.st(x, val4.rpc('leave_group', g0));
  PERFORM val4.rec('z9.leave_group_and_toggle_notifications_outsider_not_member', s1='not_member' AND s2='not_member' AND s3='not_member', format('leave=%s toggle=%s leave(ownerless)=%s', s1,s2,s3));
  -- platform admin (profiles.is_admin, NOT a member): existing remove_member behaviour, must still work and must be NULL-safe
  s1 := val4.st(pa, val4.rpc('remove_member', gg, n::text, 'false'));
  PERFORM val4.rec('z9.platform_admin_nonmember_can_still_remove_member', s1='success' AND val4.role_of(gg,n)='<none>', format('platform admin (is_admin=true, not a member) remove_member=%s', s1));
  -- anon cannot execute any of them
  PERFORM val4.rec('z9.anon_cannot_execute_rotate_expiry_remove_transfer', (SELECT bool_and(NOT has_function_privilege('anon',p.oid,'EXECUTE')) FROM pg_proc p WHERE pronamespace='public'::regnamespace AND proname IN ('rotate_invite_code','set_invite_expiry','remove_member','transfer_ownership','leave_group','toggle_community_notifications','delete_account','join_by_invite','create_group')), 'anon EXECUTE revoked on 9 RPCs');
END $$;

-- ============================================================================ meta: every expected assertion id must have produced a row (a DO block that errors rolls back all its rows silently)
DO $$ DECLARE exp text[] := ARRAY[
 'z1.rls_enabled_on_both_tables','z1.anon_cannot_select','z1.anon_cannot_insert',
 'z2.requester_owner_admin_see_request','z2.plain_member_and_outsider_do_not_see','z2.requester_sees_only_own_owner_sees_all_of_group','z2.authenticated_no_direct_insert_update_delete_on_requests',
 'z3.outsider_NOT_authorized_to_approve','z3.plain_member_NOT_authorized_to_approve','z3.admin_of_other_group_NOT_authorized_cross_group','z3.authenticated_role_without_uid_rejected','z3.unknown_request_id_not_found','z3.admin_approves_success_member_row_and_count','z3.second_call_already_processed','z3.outsider_gets_not_authorized_even_for_processed_request','z3.owner_approves_success','z3.already_member_no_duplicate_row',
 'z4.outsider_NOT_authorized_to_reject','z4.plain_member_NOT_authorized_to_reject','z4.unknown_request_id_not_found','z4.admin_rejects_success','z4.second_reject_and_later_approve_already_processed','z4.outsider_gets_not_authorized_even_for_processed_request','z4.owner_rejects_success','z4.reject_without_uid_rejected',
 'z5.outsider_NOT_authorized_to_set_role','z5.outsider_gets_not_authorized_before_role_validation','z5.plain_member_NOT_authorized_to_set_role','z5.admin_NOT_authorized_to_set_role','z5.owner_succeeds_member_to_admin_and_back','z5.cannot_assign_owner_role','z5.cannot_change_own_role','z5.bad_role_rejected','z5.target_not_member_or_null_rejected','z5.cannot_change_other_owner_row','z5.ownerless_group_nobody_authorized','z5.set_role_without_uid_rejected',
 'z6.precondition_ban_row_created_via_remove_member_rpc','z6.authenticated_cannot_select_bans','z6.authenticated_cannot_insert_bans','z6.authenticated_cannot_update_or_delete_bans','z6.authenticated_has_no_table_privileges_on_bans_and_only_select_on_requests',
 'z7.banned_user_cannot_be_approved_owner','z7.banned_user_cannot_be_approved_admin','z7.banned_user_cannot_rejoin_via_invite','z7.request_of_user_without_profile_not_approved','z7.delete_account_of_requester_not_blocked_by_request_row','z7.delete_account_of_banned_user_removes_ban_row','z7.delete_account_of_reviewer_sets_reviewed_by_null','z7.delete_account_of_group_owner_with_pending_requests_and_bans',
 'z8.anon_cannot_execute_the_three_rpcs',
 'z9.rotate_invite_code_outsider_member_nullrole_not_authorized','z9.rotate_invite_code_admin_and_owner_succeed','z9.set_invite_expiry_outsider_member_nullrole_not_authorized','z9.set_invite_expiry_admin_succeeds','z9.remove_member_outsider_member_nullrole_not_authorized','z9.remove_member_admin_cannot_remove_owner_other_admin_or_self','z9.remove_member_admin_removes_member_owner_removes_admin','z9.transfer_ownership_outsider_admin_and_ownerless_group_not_owner','z9.transfer_ownership_to_self_or_nonmember_refused','z9.transfer_ownership_owner_succeeds_roles_swapped','z9.leave_group_and_toggle_notifications_outsider_not_member','z9.platform_admin_nonmember_can_still_remove_member','z9.anon_cannot_execute_rotate_expiry_remove_transfer'];
 miss text; BEGIN
  SELECT string_agg(e, ', ') INTO miss FROM unnest(exp) e WHERE NOT EXISTS (SELECT 1 FROM val4.res WHERE id=e);
  PERFORM val4.rec('meta.all_expected_assertions_produced_a_row', miss IS NULL AND (SELECT count(*) FROM val4.res WHERE id<>'meta.all_expected_assertions_produced_a_row')=cardinality(exp), format('expected=%s got=%s missing=%s', cardinality(exp), (SELECT count(*) FROM val4.res WHERE id<>'meta.all_expected_assertions_produced_a_row'), coalesce(miss,'none')));
END $$;
