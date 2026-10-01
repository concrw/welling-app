-- Behavioral assertions. Run as postgres superuser; switches to authenticated/anon via SET LOCAL ROLE.
\set ON_ERROR_STOP off
\pset pager off
DROP SCHEMA IF EXISTS val CASCADE;
CREATE SCHEMA val;
CREATE TABLE val.res(seq serial, id text, ok boolean, detail text);
CREATE TABLE val.ctx(k text primary key, v text);
CREATE OR REPLACE FUNCTION val.as_user(u uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM set_config('request.jwt.claim.sub', u::text, true); EXECUTE 'SET LOCAL ROLE authenticated'; END $$;
CREATE OR REPLACE FUNCTION val.as_anon() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM set_config('request.jwt.claim.sub', '', true); EXECUTE 'SET LOCAL ROLE anon'; END $$;
CREATE OR REPLACE FUNCTION val.rec(i text, ok boolean, d text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN EXECUTE 'RESET ROLE'; INSERT INTO val.res(id,ok,detail) VALUES(i,ok,d); END $$;
CREATE OR REPLACE FUNCTION val.u(n int) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$ select ('99000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid $$;
CREATE OR REPLACE FUNCTION val.mkuser(n int, nick text, vis text default 'public') RETURNS void LANGUAGE sql AS $$
  INSERT INTO auth.users(id) VALUES (val.u(n)) ON CONFLICT DO NOTHING;
  INSERT INTO public.profiles(id,nickname,bio,profile_visibility) VALUES (val.u(n),nick,'',vis) ON CONFLICT DO NOTHING; $$;
GRANT USAGE ON SCHEMA val TO PUBLIC; GRANT ALL ON ALL TABLES IN SCHEMA val TO PUBLIC; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA val TO PUBLIC;

-- users 1..8 core, 100..140 for cap test
SELECT val.mkuser(g, 'u'||g) FROM generate_series(1,8) g;
SELECT val.mkuser(g, 'cap'||g) FROM generate_series(100,140) g;

-- (a) create_group + no cap
DO $$ DECLARE r json; gid text; cnt int; st text; ok_all boolean := true; fails int := 0; mc int; has_max boolean; BEGIN
  PERFORM val.as_user(val.u(1));
  r := create_group('Group One','desc');
  PERFORM val.rec('a.create_group', (r->>'success')::boolean AND length(r->>'invite_code')=8, r::text);
  gid := r->>'community_id';
  INSERT INTO val.ctx VALUES ('g1',gid),('g1code',r->>'invite_code') ON CONFLICT DO NOTHING;
  FOR i IN 100..140 LOOP
    PERFORM val.as_user(val.u(i));
    BEGIN r := join_by_invite((SELECT v FROM val.ctx WHERE k='g1code')); IF r->>'status' <> 'success' THEN fails := fails+1; END IF;
    EXCEPTION WHEN OTHERS THEN fails := fails+1; END;
    PERFORM val.rec('tmp',true,'');
  END LOOP;
  DELETE FROM val.res WHERE id='tmp';
  SELECT member_count INTO mc FROM communities WHERE id=gid;
  SELECT count(*) INTO cnt FROM community_members WHERE community_id=gid;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='communities' AND column_name='max_members') INTO has_max;
  PERFORM val.rec('a.no_member_cap', fails=0 AND cnt=42 AND mc=42 AND NOT has_max, format('members=%s member_count=%s join_failures=%s max_members_col=%s', cnt, mc, fails, has_max));
END $$;

-- (b) join_by_invite normal + approval
DO $$ DECLARE r json; r2 json; g2 text; code2 text; n_mem int; n_req int; st text; BEGIN
  PERFORM val.as_user(val.u(2));
  r := join_by_invite((SELECT v FROM val.ctx WHERE k='g1code'));
  PERFORM val.rec('b.join_normal', r->>'status'='success' AND EXISTS(SELECT 1 FROM community_members WHERE community_id=(SELECT v FROM val.ctx WHERE k='g1') AND user_id=val.u(2)), r::text);
  PERFORM val.as_user(val.u(1));
  r := create_group('Approval Group','d');
  g2 := r->>'community_id'; code2 := r->>'invite_code';
  INSERT INTO val.ctx VALUES ('g2',g2),('g2code',code2);
  BEGIN UPDATE communities SET requires_approval=true WHERE id=g2; EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'owner update failed %', SQLERRM; END;
  PERFORM val.rec('tmp',true,'');
  PERFORM val.as_user(val.u(3));
  r2 := join_by_invite(code2);
  PERFORM val.as_user(val.u(3));
  r2 := join_by_invite(code2); -- second attempt still pending
  PERFORM val.rec('tmp',true,'');
  DELETE FROM val.res WHERE id='tmp';
  SELECT count(*) INTO n_mem FROM community_members WHERE community_id=g2 AND user_id=val.u(3);
  SELECT count(*), max(status) INTO n_req, st FROM community_join_requests WHERE community_id=g2 AND user_id=val.u(3);
  PERFORM val.rec('b.join_requires_approval', (SELECT requires_approval FROM communities WHERE id=g2) AND r2->>'status'='pending' AND n_mem=0 AND n_req=1 AND st='pending', format('requires_approval=%s status=%s member_rows=%s request_rows=%s request_status=%s', (SELECT requires_approval FROM communities WHERE id=g2), r2->>'status', n_mem, n_req, st));
END $$;


-- helper: run SQL as user, return 'OK' or error text
CREATE OR REPLACE FUNCTION val.try_as(u uuid, q text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE r text;
BEGIN
  PERFORM val.as_user(u);
  BEGIN EXECUTE q; r := 'OK'; EXCEPTION WHEN OTHERS THEN r := 'ERR: '||SQLERRM; END;
  EXECUTE 'RESET ROLE'; RETURN r;
END $$;
CREATE OR REPLACE FUNCTION val.cnt_as(u uuid, q text) RETURNS int LANGUAGE plpgsql AS $$
DECLARE r int;
BEGIN
  PERFORM val.as_user(u);
  BEGIN EXECUTE 'select count(*) from ('||q||') s' INTO r; EXCEPTION WHEN OTHERS THEN r := -1; END;
  EXECUTE 'RESET ROLE'; RETURN r;
END $$;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA val TO PUBLIC;

-- (c) like notifications
DO $$ DECLARE p1 uuid := gen_random_uuid(); p2 uuid := gen_random_uuid(); e1 text; e2 text; e3 text; n1 int; n2 int; ac int; ntrig int; trg text; BEGIN
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (p1,val.u(1),'c1','habit','public'),(p2,val.u(1),'c2','habit','public');
  INSERT INTO val.ctx VALUES ('pc1',p1::text),('pc2',p2::text);
  SELECT count(*), string_agg(tgname,',') INTO ntrig, trg FROM pg_trigger WHERE tgrelid='post_likes'::regclass AND NOT tgisinternal;
  e1 := val.try_as(val.u(2), format('insert into post_likes(post_id,user_id) values (%L,%L)', p1, val.u(2)));
  SELECT count(*) INTO n1 FROM notifications WHERE post_id=p1 AND type='like';
  PERFORM val.rec('c.single_like_one_row', e1='OK' AND n1=1 AND ntrig=1, format('insert=%s notif_rows=%s triggers_on_post_likes=%s(%s)', e1, n1, ntrig, trg));
  e2 := val.try_as(val.u(2), format('insert into post_likes(post_id,user_id) values (%L,%L)', p2, val.u(2)));
  e3 := val.try_as(val.u(3), format('insert into post_likes(post_id,user_id) values (%L,%L)', p2, val.u(3)));
  SELECT count(*), max(actor_count) INTO n2, ac FROM notifications WHERE post_id=p2 AND type='like';
  PERFORM val.rec('c.two_likes_one_row_count2', e2='OK' AND e3='OK' AND n2=1 AND ac=2, format('inserts=%s/%s notif_rows=%s actor_count=%s', e2,e3,n2,ac));
END $$;

-- (d) comments
DO $$ DECLARE p uuid := gen_random_uuid(); e1 text; e2 text; n int; BEGIN
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (p,val.u(1),'cm','habit','public');
  e1 := val.try_as(val.u(2), format('insert into post_comments(post_id,user_id,text) values (%L,%L,%L)', p, val.u(2), 'hi'));
  e2 := val.try_as(val.u(3), format('insert into post_comments(post_id,user_id,text) values (%L,%L,%L)', p, val.u(3), 'yo'));
  SELECT count(*) INTO n FROM notifications WHERE post_id=p AND type='comment';
  PERFORM val.rec('d.two_comments_two_rows', e1='OK' AND e2='OK' AND n=2, format('c1=%s c2=%s comment_notif_rows=%s', e1,e2,n));
END $$;

-- (e) RLS visibility
DO $$ DECLARE g text := (SELECT v FROM val.ctx WHERE k='g1'); pg uuid := gen_random_uuid(); pp uuid := gen_random_uuid(); pf uuid := gen_random_uuid(); pv uuid := gen_random_uuid(); ins text;
 nm int; mm int; au int;  pub_u7 int; pub_u3 int; fol_u3 int; fol_u7 int; fol_u2 int; priv_u1 int; priv_u3 int; BEGIN
  ins := val.try_as(val.u(1), format('insert into posts(id,user_id,content,community_id,category,visibility) values (%L,%L,%L,%L,%L,%L)', pg, val.u(1), 'grp', g, 'habit','group'));
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (pp,val.u(1),'pub','habit','public'),(pf,val.u(1),'fol','habit','followers'),(pv,val.u(1),'priv','habit','private');
  INSERT INTO follows(follower_id,followee_id) VALUES (val.u(3),val.u(1));
  nm := val.cnt_as(val.u(7), format('select 1 from posts where id=%L', pg));
  mm := val.cnt_as(val.u(2), format('select 1 from posts where id=%L', pg));
  au := val.cnt_as(val.u(1), format('select 1 from posts where id=%L', pg));
  PERFORM val.rec('e.group_post_member_vs_nonmember', ins='OK' AND nm=0 AND mm=1 AND au=1, format('insert_as_member=%s nonmember_sees=%s member_sees=%s author_sees=%s', ins,nm,mm,au));
  pub_u7 := val.cnt_as(val.u(7), format('select 1 from posts where id=%L', pp));
  pub_u3 := val.cnt_as(val.u(3), format('select 1 from posts where id=%L', pp));
  PERFORM val.rec('e.public_readable_by_all', pub_u7=1 AND pub_u3=1, format('nonmember=%s follower=%s', pub_u7,pub_u3));
  fol_u3 := val.cnt_as(val.u(3), format('select 1 from posts where id=%L', pf));
  fol_u7 := val.cnt_as(val.u(7), format('select 1 from posts where id=%L', pf));
  fol_u2 := val.cnt_as(val.u(2), format('select 1 from posts where id=%L', pf));
  priv_u1 := val.cnt_as(val.u(1), format('select 1 from posts where id=%L', pv));
  priv_u3 := val.cnt_as(val.u(3), format('select 1 from posts where id=%L', pv));
  PERFORM val.rec('e.followers_private_semantics', fol_u3=1 AND fol_u7=0 AND fol_u2=0 AND priv_u1=1 AND priv_u3=0, format('followers: follower=%s nonfollower=%s groupmember-nonfollower=%s | private: author=%s other=%s', fol_u3,fol_u7,fol_u2,priv_u1,priv_u3));
END $$;

-- (f) leave_group by owner
DO $$ DECLARE r json; g text; code text; newowner uuid; oldrole text; nrole text; still int; BEGIN
  PERFORM val.as_user(val.u(4)); r := create_group('Leave Group',''); g := r->>'community_id'; code := r->>'invite_code';
  PERFORM val.as_user(val.u(5)); PERFORM join_by_invite(code);
  PERFORM val.as_user(val.u(6)); PERFORM join_by_invite(code);
  PERFORM val.as_user(val.u(4)); r := leave_group(g);
  EXECUTE 'RESET ROLE';
  SELECT owner_id INTO newowner FROM communities WHERE id=g;
  SELECT role INTO nrole FROM community_members WHERE community_id=g AND user_id=newowner;
  SELECT count(*) INTO still FROM community_members WHERE community_id=g AND user_id=val.u(4);
  PERFORM val.rec('f.leave_group_owner_transfer', r->>'status'='success' AND newowner IN (val.u(5),val.u(6)) AND nrole='owner' AND still=0, format('result=%s new_owner=%s new_owner_role=%s old_owner_rows=%s member_count=%s', r, newowner, nrole, still, (SELECT member_count FROM communities WHERE id=g)));
END $$;

-- (g) delete_account: owner w/ members, and member-only
DO $$ DECLARE r json; g text; code text; newowner uuid; err text; gexists int; p uuid := gen_random_uuid(); BEGIN
  -- u7 owns group with u8 as member; has data
  PERFORM val.as_user(val.u(7)); r := create_group('Del Owner Group',''); g := r->>'community_id'; code := r->>'invite_code';
  PERFORM val.as_user(val.u(8)); PERFORM join_by_invite(code);
  EXECUTE 'RESET ROLE';
  INSERT INTO val.ctx VALUES ('gdel',g);
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (p,val.u(7),'x','habit','public');
  err := val.try_as(val.u(7), 'select delete_account()');
  SELECT owner_id INTO newowner FROM communities WHERE id=g;
  SELECT count(*) INTO gexists FROM communities WHERE id=g;
  PERFORM val.rec('g.delete_account_owner', err='OK' AND gexists=1 AND newowner=val.u(8) AND NOT EXISTS(SELECT 1 FROM profiles WHERE id=val.u(7)) AND NOT EXISTS(SELECT 1 FROM auth.users WHERE id=val.u(7)), format('call=%s group_exists=%s new_owner_is_u8=%s profile_gone=%s', err, gexists, newowner=val.u(8), NOT EXISTS(SELECT 1 FROM profiles WHERE id=val.u(7))));
END $$;
DO $$ DECLARE err text; p uuid := gen_random_uuid(); g text := (SELECT v FROM val.ctx WHERE k='g1'); left_rows text; BEGIN
  -- member-only user u100 (member of g1): data across tables
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (p,val.u(100),'mine','habit','public');
  INSERT INTO post_comments(post_id,user_id,text) VALUES (p,val.u(2),'c on mine');
  INSERT INTO post_likes(post_id,user_id) VALUES (p,val.u(2)), ((SELECT v::uuid FROM val.ctx WHERE k='pc1'),val.u(100));
  INSERT INTO follows VALUES (val.u(100),val.u(1)),(val.u(1),val.u(100));
  INSERT INTO notification_settings(user_id) VALUES (val.u(100));
  INSERT INTO routine_groups(id,user_id,name) VALUES ('20000000-0000-0000-0000-0000000000f1',val.u(100),'rg');
  INSERT INTO routine_items(id,group_id,name) VALUES ('30000000-0000-0000-0000-0000000000f1','20000000-0000-0000-0000-0000000000f1','ri');
  INSERT INTO routine_privacy(item_id,is_public) VALUES ('30000000-0000-0000-0000-0000000000f1',true);
  INSERT INTO evening_reflections(user_id,content) VALUES (val.u(100),'r');
  INSERT INTO reports(reported_user_id,content,reason) VALUES (val.u(100),'c','spam');
  err := val.try_as(val.u(100), 'select delete_account()');
  SELECT string_agg(t||'='||c, ' ') INTO left_rows FROM (
    SELECT 'profiles' t,(SELECT count(*) FROM profiles WHERE id=val.u(100)) c UNION ALL
    SELECT 'auth.users',(SELECT count(*) FROM auth.users WHERE id=val.u(100)) UNION ALL
    SELECT 'members',(SELECT count(*) FROM community_members WHERE user_id=val.u(100)) UNION ALL
    SELECT 'posts',(SELECT count(*) FROM posts WHERE user_id=val.u(100)) UNION ALL
    SELECT 'follows',(SELECT count(*) FROM follows WHERE follower_id=val.u(100) OR followee_id=val.u(100)) UNION ALL
    SELECT 'likes',(SELECT count(*) FROM post_likes WHERE user_id=val.u(100)) ) x;
  PERFORM val.rec('g.delete_account_member_only', err='OK' AND NOT EXISTS(SELECT 1 FROM profiles WHERE id=val.u(100)) AND NOT EXISTS(SELECT 1 FROM community_members WHERE user_id=val.u(100)), format('call=%s remaining: %s | member_count g1=%s actual=%s', err, left_rows, (SELECT member_count FROM communities WHERE id=g), (SELECT count(*) FROM community_members WHERE community_id=g)));
END $$;

-- (h) search_profiles
DO $$ DECLARE n_def int; n_big int; n_priv int; n_priv_mut int; n_null int; err text; BEGIN
  PERFORM val.mkuser(150,'capsecret','private'); PERFORM val.mkuser(151,'capfollowme','private'); PERFORM val.mkuser(152,'capnull',NULL);
  UPDATE profiles SET profile_visibility=NULL WHERE id=val.u(152);
  INSERT INTO follows VALUES (val.u(151),val.u(1)); -- 151 follows searcher
  PERFORM val.as_user(val.u(1));
  BEGIN SELECT count(*) INTO n_def FROM search_profiles('cap'); EXCEPTION WHEN OTHERS THEN err := SQLERRM; n_def := -1; END;
  EXECUTE 'RESET ROLE';
  PERFORM val.rec('h.search_default_max20', n_def=20, format('rows=%s err=%s', n_def, coalesce(err,'-')));
  err := NULL; PERFORM val.as_user(val.u(1));
  BEGIN SELECT count(*) INTO n_big FROM search_profiles('cap', 1000); EXCEPTION WHEN OTHERS THEN err := SQLERRM; n_big := -1; END;
  EXECUTE 'RESET ROLE';
  PERFORM val.rec('h.search_cap_enforced_vs_p_limit', err IS NULL AND n_big<=20, format('search_profiles(''cap'',1000) rows=%s err=%s', n_big, coalesce(err,'-')));
  err := NULL; PERFORM val.as_user(val.u(1));
  BEGIN SELECT count(*) INTO n_priv FROM search_profiles('capsecret'); SELECT count(*) INTO n_priv_mut FROM search_profiles('capfollowme'); SELECT count(*) INTO n_null FROM search_profiles('capnull', 5);
  EXCEPTION WHEN OTHERS THEN err := SQLERRM; END;
  EXECUTE 'RESET ROLE';
  PERFORM val.rec('h.search_hides_private_nonmutual', err IS NULL AND n_priv=0 AND n_priv_mut=1, format('private_nonmutual=%s private_who_follows_me=%s NULL_visibility_profile_rows=%s err=%s', n_priv,n_priv_mut,n_null,coalesce(err,'-')));
END $$;

-- (i) toggle_community_notifications
DO $$ DECLARE g text := (SELECT v FROM val.ctx WHERE k='g1'); r json; r2 json; m2 boolean; others int; BEGIN
  PERFORM val.as_user(val.u(2)); r := toggle_community_notifications(g, true);
  PERFORM val.as_user(val.u(7)); r2 := toggle_community_notifications(g, true); -- non-member
  EXECUTE 'RESET ROLE';
  SELECT notifications_muted INTO m2 FROM community_members WHERE community_id=g AND user_id=val.u(2);
  SELECT count(*) INTO others FROM community_members WHERE community_id=g AND user_id<>val.u(2) AND notifications_muted;
  PERFORM val.rec('i.toggle_only_caller_row', m2 AND others=0 AND r->>'status'='success' AND r2->>'status'='not_member', format('caller_row_muted=%s other_rows_muted=%s caller=%s nonmember=%s', m2, others, r, r2));
END $$;

-- (j) anon
DO $$ DECLARE e1 text; e2 text; e3 text; pr text; BEGIN
  SELECT string_agg(p.proname||'(anon='||has_function_privilege('anon',p.oid,'EXECUTE')||')', ', ' ORDER BY p.proname) INTO pr FROM pg_proc p WHERE pronamespace='public'::regnamespace AND proname IN ('create_group','join_by_invite','delete_account');
  PERFORM val.as_anon();
  BEGIN PERFORM create_group('x'); e1:='ALLOWED'; EXCEPTION WHEN OTHERS THEN e1:=SQLERRM; END;
  BEGIN PERFORM join_by_invite('ABCDEFGH'); e2:='ALLOWED'; EXCEPTION WHEN OTHERS THEN e2:=SQLERRM; END;
  BEGIN PERFORM delete_account(); e3:='ALLOWED'; EXCEPTION WHEN OTHERS THEN e3:=SQLERRM; END;
  PERFORM val.rec('j.anon_cannot_execute', e1 ILIKE '%permission denied%' AND e2 ILIKE '%permission denied%' AND e3 ILIKE '%permission denied%', format('%s | create_group: %s | join_by_invite: %s | delete_account: %s', pr, e1,e2,e3));
END $$;


-- EXTRA edge cases (beyond a-j)
DO $$ DECLARE pub uuid := (SELECT id FROM posts WHERE content='pub' LIMIT 1); n_anon int; n_g int; BEGIN
  PERFORM val.as_anon(); SELECT count(*) INTO n_anon FROM posts WHERE visibility='public';
  EXECUTE 'RESET ROLE';
  PERFORM val.rec('x1.anon_can_read_public_posts', n_anon>0, format('anon sees %s public posts (total public=%s)', n_anon, (SELECT count(*) FROM posts WHERE visibility='public')));
END $$;
-- x2 (v2): live post_likes HAS PK(user_id,post_id) -> a duplicate like is rejected by the PK itself (no 008 needed); notif actor_count stays 1
DO $$ DECLARE p uuid := gen_random_uuid(); n int; ac int; r1 text; r2 text; BEGIN
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (p,val.u(1),'dl','habit','public');
  r1 := val.try_as(val.u(2), format('insert into post_likes(post_id,user_id) values (%L,%L)',p,val.u(2)));
  r2 := val.try_as(val.u(2), format('insert into post_likes(post_id,user_id) values (%L,%L)',p,val.u(2)));
  SELECT count(*), max(actor_count) INTO n, ac FROM notifications WHERE post_id=p AND type='like';
  PERFORM val.rec('x2.same_user_double_like_rejected_by_live_pk', r1='OK' AND r2 ILIKE '%duplicate key%' AND ac=1 AND n=1 AND (SELECT count(*) FROM post_likes WHERE post_id=p)=1, format('1st=%s 2nd=%s like_rows=%s notif_rows=%s actor_count=%s', r1, left(r2,90), (SELECT count(*) FROM post_likes WHERE post_id=p), n, ac));
END $$;
DO $$ DECLARE p uuid := gen_random_uuid(); n int; BEGIN
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (p,val.u(1),'rd','habit','public');
  PERFORM val.try_as(val.u(2), format('insert into post_likes(post_id,user_id) values (%L,%L)',p,val.u(2)));
  PERFORM val.try_as(val.u(1), format('update notifications set read=true where post_id=%L',p));
  PERFORM val.try_as(val.u(3), format('insert into post_likes(post_id,user_id) values (%L,%L)',p,val.u(3)));
  SELECT count(*) INTO n FROM notifications WHERE post_id=p AND type='like';
  PERFORM val.rec('x3.like_after_read_new_row', n=2, format('like notif rows after read+new like=%s (expect 2)', n));
END $$;
-- delete_account for a user who banned someone / reviewed a join request
DO $$ DECLARE r json; g text; code text; err text; BEGIN
  PERFORM val.mkuser(160,'banner'); PERFORM val.mkuser(161,'bannee'); PERFORM val.mkuser(162,'joiner');
  PERFORM val.as_user(val.u(160)); r := create_group('Ban Group',''); g := r->>'community_id';
  PERFORM val.as_user(val.u(161)); PERFORM join_by_invite(r->>'invite_code');
  PERFORM val.as_user(val.u(160)); PERFORM remove_member(g, val.u(161), true);
  EXECUTE 'RESET ROLE';
  INSERT INTO community_join_requests(community_id,user_id,status,reviewed_by) VALUES (g,val.u(162),'approved',val.u(160));
  err := val.try_as(val.u(160), 'select delete_account()');
  PERFORM val.rec('x4.delete_account_group_owner_who_banned_and_reviewed', err='OK', format('call=%s', err));
END $$;
DO $$ DECLARE r json; g text; err text; BEGIN
  PERFORM val.mkuser(170,'solo');
  PERFORM val.as_user(val.u(170)); r := create_group('Solo Group',''); g := r->>'community_id';
  err := val.try_as(val.u(170), 'select delete_account()');
  PERFORM val.rec('x5.delete_account_sole_owner_group_removed', err='OK' AND NOT EXISTS(SELECT 1 FROM communities WHERE id=g), format('call=%s group_exists=%s', err, EXISTS(SELECT 1 FROM communities WHERE id=g)));
END $$;


-- x6: delete_account for a user with EVERYTHING (live-shaped data)
DO $$ DECLARE
  U uuid := val.u(190); O uuid := val.u(191); M uuid := val.u(192); B uuid := val.u(193); J uuid := val.u(194); RP uuid := val.u(195);
  r json; g text; code text; err text; pO uuid := gen_random_uuid(); pU1 uuid := gen_random_uuid(); pU2 uuid := gen_random_uuid(); pGrp uuid := gen_random_uuid();
  rg1 uuid := gen_random_uuid(); rg2 uuid := gen_random_uuid(); ri1 uuid := gen_random_uuid(); ri2 uuid := gen_random_uuid(); ri3 uuid := gen_random_uuid(); rgO uuid := gen_random_uuid(); riO uuid := gen_random_uuid();
  leftover text; bb text; rv text; own text; oth text; 
BEGIN
  PERFORM val.mkuser(190,'delme'); PERFORM val.mkuser(191,'other'); PERFORM val.mkuser(192,'member'); PERFORM val.mkuser(193,'banned'); PERFORM val.mkuser(194,'joiner'); PERFORM val.mkuser(195,'reporter');
  -- U owns a group with M as member; U bans B; U reviewed J's join request
  PERFORM val.as_user(U); r := create_group('Full Del Group',''); g := r->>'community_id'; code := r->>'invite_code';
  PERFORM val.as_user(M); PERFORM join_by_invite(code);
  PERFORM val.as_user(B); PERFORM join_by_invite(code);
  PERFORM val.as_user(U); PERFORM remove_member(g, B, true);
  EXECUTE 'RESET ROLE';
  INSERT INTO community_join_requests(community_id,user_id,status,reviewed_by,reviewed_at) VALUES (g,J,'approved',U,now());
  -- other's post (O) that U interacts with
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (pO,O,'o post','habit','public');
  INSERT INTO post_comments(post_id,user_id,text) VALUES (pO,U,'U comment on O');
  INSERT INTO post_likes(post_id,user_id) VALUES (pO,U);
  INSERT INTO post_reactions(post_id,user_id,reaction_type) VALUES (pO,U,'clap');
  INSERT INTO post_reports(post_id,reporter_id,reason) VALUES (pO,U,'U reports O post');
  -- U's posts, with comments/likes/reactions from others and post_reports against them
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (pU1,U,'u1','habit','public'),(pU2,U,'u2','diet','followers');
  INSERT INTO post_comments(post_id,user_id,text) VALUES (pU1,O,'O on U'),(pU1,M,'M on U');
  INSERT INTO post_likes(post_id,user_id) VALUES (pU1,O),(pU1,M),(pU2,O);
  INSERT INTO post_reactions(post_id,user_id,reaction_type) VALUES (pU1,O,'clap'),(pU1,O,'fire');
  INSERT INTO post_reports(post_id,reporter_id,reason) VALUES (pU1,RP,'report on U post 1'),(pU1,O,'report 2'),(pU2,RP,'report on U post 2');
  -- another user's post INSIDE U's group (cascade-deleted with the group? no: group is transferred to M, so it stays) + one in U-sole group case is covered by x7
  INSERT INTO posts(id,user_id,content,community_id,category,visibility) VALUES (pGrp,M,'M group post',g,'habit','group');
  INSERT INTO post_reports(post_id,reporter_id,reason) VALUES (pGrp,RP,'report on M group post');
  -- reports against U (profile-level reports)
  INSERT INTO reports(reported_user_id,content,reason) VALUES (U,'c1','spam'),(U,'c2','abuse');
  INSERT INTO reports(reported_user_id,content,reason) VALUES (O,'c-other','keepme');
  -- routine groups + items + privacy for U; and for O (must survive)
  INSERT INTO routine_groups(id,user_id,name) VALUES (rg1,U,'rg1'),(rg2,U,'rg2'),(rgO,O,'rgO');
  INSERT INTO routine_items(id,group_id,name) VALUES (ri1,rg1,'i1'),(ri2,rg1,'i2'),(ri3,rg2,'i3'),(riO,rgO,'iO');
  INSERT INTO routine_privacy(item_id,is_public) VALUES (ri1,true),(ri2,false),(ri3,true),(riO,true);
  -- follows, notifications, settings
  INSERT INTO follows(follower_id,followee_id) VALUES (U,O),(O,U);
  INSERT INTO notification_settings(user_id) VALUES (U);
  INSERT INTO evening_reflections(user_id,content) VALUES (U,'refl');
  err := val.try_as(U, 'select delete_account()');
  -- generic scan: any public/auth table row still referencing U in a uuid column?
  SELECT string_agg(t||'.'||c||'='||n, ', ') INTO leftover FROM (
    SELECT table_name t, column_name c,
           (xpath('/row/n/text()', query_to_xml(format('select count(*) as n from public.%I where %I = %L', table_name, column_name, U), false, true, '')))[1]::text::int n
    FROM information_schema.columns WHERE table_schema='public' AND data_type='uuid'
      AND table_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
  ) z WHERE n>0 AND NOT (t='communities' AND c='id');
  SELECT format('owner=%s role=%s', owner_id=M, (SELECT role FROM community_members WHERE community_id=g AND user_id=M)) INTO own FROM communities WHERE id=g;
  SELECT format('ban_row=%s banned_by_null=%s', count(*), bool_and(banned_by IS NULL)) INTO bb FROM community_bans WHERE community_id=g AND user_id=B;
  SELECT format('review_row=%s reviewed_by_null=%s', count(*), bool_and(reviewed_by IS NULL)) INTO rv FROM community_join_requests WHERE community_id=g AND user_id=J;
  oth := format('O_posts=%s O_reports=%s O_routine_groups=%s O_items=%s O_privacy=%s M_group_post=%s M_post_reports=%s',
    (SELECT count(*) FROM posts WHERE user_id=O), (SELECT count(*) FROM reports WHERE reported_user_id=O), (SELECT count(*) FROM routine_groups WHERE user_id=O),
    (SELECT count(*) FROM routine_items WHERE id=riO), (SELECT count(*) FROM routine_privacy WHERE item_id=riO), (SELECT count(*) FROM posts WHERE id=pGrp), (SELECT count(*) FROM post_reports WHERE post_id=pGrp));
  PERFORM val.rec('x6.delete_account_full_data_user',
    err='OK' AND leftover IS NULL AND NOT EXISTS(SELECT 1 FROM profiles WHERE id=U) AND NOT EXISTS(SELECT 1 FROM auth.users WHERE id=U)
    AND own='owner=t role=owner' AND bb='ban_row=1 banned_by_null=t' AND rv='review_row=1 reviewed_by_null=t'
    AND (SELECT count(*) FROM routine_groups WHERE id IN (rg1,rg2))=0 AND (SELECT count(*) FROM routine_items WHERE id IN (ri1,ri2,ri3))=0 AND (SELECT count(*) FROM routine_privacy WHERE item_id IN (ri1,ri2,ri3))=0
    AND (SELECT count(*) FROM posts WHERE id IN (pU1,pU2))=0 AND (SELECT count(*) FROM post_reports WHERE post_id IN (pU1,pU2))=0
    AND (SELECT count(*) FROM post_comments WHERE post_id=pO AND user_id=U)=0 AND (SELECT count(*) FROM post_reports WHERE post_id=pO AND reporter_id=U)=0
    AND oth='O_posts=1 O_reports=1 O_routine_groups=1 O_items=1 O_privacy=1 M_group_post=1 M_post_reports=1',
    format('call=%s | leftover_refs_to_U=%s | group: %s | %s | %s | %s', err, coalesce(leftover,'none'), own, bb, rv, oth));
END $$;

-- x7: sole owner of a group that contains OTHER users' posts which have post_reports (live post_reports FK has no cascade)
DO $$ DECLARE U uuid := val.u(200); O uuid := val.u(201); RP uuid := val.u(202); g text; r json; pO uuid := gen_random_uuid(); err text; BEGIN
  PERFORM val.mkuser(200,'solo2'); PERFORM val.mkuser(201,'visitor'); PERFORM val.mkuser(202,'rep2');
  PERFORM val.as_user(U); r := create_group('Solo With Posts',''); g := r->>'community_id';
  EXECUTE 'RESET ROLE';
  -- O posts into U's group without being a member (superuser insert; simulates a former member's remaining post)
  INSERT INTO posts(id,user_id,content,community_id,category,visibility) VALUES (pO,O,'stray',g,'habit','group');
  INSERT INTO post_reports(post_id,reporter_id,reason) VALUES (pO,RP,'rep');
  err := val.try_as(U, 'select delete_account()');
  PERFORM val.rec('x7.delete_account_sole_owner_group_with_reported_posts', err='OK' AND NOT EXISTS(SELECT 1 FROM communities WHERE id=g) AND NOT EXISTS(SELECT 1 FROM posts WHERE id=pO) AND NOT EXISTS(SELECT 1 FROM post_reports WHERE post_id=pO), format('call=%s group_gone=%s post_gone=%s report_gone=%s', err, NOT EXISTS(SELECT 1 FROM communities WHERE id=g), NOT EXISTS(SELECT 1 FROM posts WHERE id=pO), NOT EXISTS(SELECT 1 FROM post_reports WHERE post_id=pO)));
END $$;

-- x8: 003 must neutralise live permissive policies: comments/likes on a private post are invisible to others; non-member cannot insert a group post
DO $$ DECLARE pv uuid := gen_random_uuid(); g text := (SELECT v FROM val.ctx WHERE k='g1'); c_o int; l_o int; c_a int; ins text; ins2 text; BEGIN
  INSERT INTO posts(id,user_id,content,category,visibility) VALUES (pv,val.u(1),'privx','habit','private');
  INSERT INTO post_comments(post_id,user_id,text) VALUES (pv,val.u(1),'secret');
  INSERT INTO post_likes(post_id,user_id) VALUES (pv,val.u(1));
  c_o := val.cnt_as(val.u(3), format('select 1 from post_comments where post_id=%L', pv));
  l_o := val.cnt_as(val.u(3), format('select 1 from post_likes where post_id=%L', pv));
  c_a := val.cnt_as(val.u(1), format('select 1 from post_comments where post_id=%L', pv));
  ins := val.try_as(val.u(7), format('insert into posts(user_id,content,community_id,category,visibility) values (%L,%L,%L,%L,%L)', val.u(7), 'x', g, 'habit', 'group'));
  ins2 := val.try_as(val.u(7), format('insert into post_comments(post_id,user_id,text) values (%L,%L,%L)', pv, val.u(7), 'x'));
  PERFORM val.rec('x8.rls_live_permissive_policies_removed', c_o=0 AND l_o=0 AND c_a=1 AND ins ILIKE 'ERR%' AND ins2 ILIKE 'ERR%', format('other_sees_comments=%s other_sees_likes=%s author_sees_comments=%s nonmember_group_insert=%s | comment_on_invisible_post=%s', c_o,l_o,c_a,left(ins,70),left(ins2,70)));
END $$;

-- x9: search_profiles does not reference nonexistent profiles.avatar_url and returns NULL avatar
DO $$ DECLARE a text; BEGIN
  PERFORM val.as_user(val.u(1)); SELECT avatar_url INTO a FROM search_profiles('cap',1) LIMIT 1; EXECUTE 'RESET ROLE';
  PERFORM val.rec('x9.search_profiles_runs_without_avatar_column', NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') AND a IS NULL, format('profiles.avatar_url exists=%s returned avatar_url=%s', EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url'), coalesce(a,'NULL')));
END $$;

-- x10: like notification text/like trigger after 004: single trigger, 'comment' type allowed, post owner NULL guard
DO $$ DECLARE trg text; n int; BEGIN
  SELECT string_agg(tgname,',' ORDER BY tgname) INTO trg FROM pg_trigger WHERE tgrelid IN ('post_likes'::regclass,'post_comments'::regclass) AND NOT tgisinternal;
  SELECT count(*) INTO n FROM pg_constraint WHERE conrelid='notifications'::regclass AND conname='notifications_type_check';
  PERFORM val.rec('x10.triggers_and_type_check', trg='notify_on_post_comment_trigger,notify_on_post_like_trigger' AND n=1 AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_post_like_notify'), format('triggers=%s type_check=%s old_live_trigger_present=%s', trg, n, EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_post_like_notify')));
END $$;

\echo ==== RESULTS ====
SELECT seq, id, CASE WHEN ok THEN 'PASS' ELSE 'FAIL' END AS result, detail FROM val.res ORDER BY seq;
