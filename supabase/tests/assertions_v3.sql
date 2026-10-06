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


-- ============================================================================
-- V3 additions: live FK ground truth (NO ACTION except 5 CASCADEs), exact live RLS set, live-like seed data
-- ============================================================================
CREATE OR REPLACE FUNCTION val.rows_as(u uuid, q text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE n bigint; r text;
BEGIN
  PERFORM val.as_user(u);
  BEGIN EXECUTE q; GET DIAGNOSTICS n = ROW_COUNT; r := n::text; EXCEPTION WHEN OTHERS THEN r := 'ERR: '||SQLERRM; END;
  EXECUTE 'RESET ROLE'; RETURN r;
END $$;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA val TO PUBLIC;

-- y1: 001-007 applied cleanly on live-like seed (7 communities / 6 ownerless / 5 empty / 2 members / 143 posts / 5 follow notifs)
DO $$ DECLARE nn int; dup int; mc_bad text; empties text; roles text; nposts int; npl int; nnotif int; badtype int; ncomm int; nullable text; BEGIN
  SELECT count(*) INTO ncomm FROM communities WHERE id LIKE 'comm-17590000000%';
  SELECT count(*) INTO nn FROM communities WHERE invite_code IS NULL;
  SELECT count(*) INTO dup FROM (SELECT invite_code FROM communities GROUP BY 1 HAVING count(*)>1) d;
  SELECT string_agg(id||':'||member_count||'/'||(SELECT count(*) FROM community_members m WHERE m.community_id=c.id), ', ' ORDER BY id)
    INTO mc_bad FROM communities c WHERE id LIKE 'comm-17590000000%' AND member_count <> (SELECT count(*) FROM community_members m WHERE m.community_id=c.id);
  SELECT string_agg(id||'='||member_count, ',' ORDER BY id) INTO empties FROM communities c
    WHERE id LIKE 'comm-17590000000%' AND owner_id IS NULL AND NOT EXISTS (SELECT 1 FROM community_members m WHERE m.community_id=c.id);
  SELECT string_agg(right(user_id::text,2)||'='||role, ',' ORDER BY community_id) INTO roles FROM community_members WHERE community_id LIKE 'comm-17590000000%';
  SELECT count(*) INTO nposts FROM posts WHERE id::text LIKE '10000000-%';
  SELECT count(*) INTO npl FROM posts WHERE id::text LIKE '10000000-%' AND community_id IS NOT NULL AND visibility='public'
     AND NOT EXISTS (SELECT 1 FROM community_members m WHERE m.community_id=posts.community_id AND m.user_id=posts.user_id);
  SELECT count(*) INTO nnotif FROM notifications WHERE text='followed you' AND type='follow';
  SELECT count(*) INTO badtype FROM notifications WHERE type NOT IN ('like','follow','comment','copy','report','group_join');
  SELECT is_nullable INTO nullable FROM information_schema.columns WHERE table_name='communities' AND column_name='invite_code';
  PERFORM val.rec('y1.migrations_on_live_like_seed_data',
    ncomm=7 AND nn=0 AND dup=0 AND mc_bad IS NULL
    AND empties = 'comm-1759000000003=0,comm-1759000000004=0,comm-1759000000005=0,comm-1759000000006=0,comm-1759000000007=0'
    AND roles = '01=owner,02=member' AND nposts=143 AND npl>100 AND nnotif=5 AND badtype=0 AND nullable='NO',
    format('seed communities=%s invite_code_nulls=%s dup_codes=%s member_count_mismatches=%s | ownerless+empty member_count: %s | roles(user suffix): %s | seed_posts=%s legacy_public_group_posts_by_nonmembers=%s | follow_notifs=%s bad_types=%s invite_code_nullable=%s', ncomm,nn,dup,coalesce(mc_bad,'none'),empties,roles,nposts,npl,nnotif,badtype,nullable));
END $$;

-- y2: FK delete actions on the pre-existing (live) tables == live ground truth: exactly 5 CASCADEs, everything else NO ACTION
DO $$ DECLARE casc text; other text; nfk int; BEGIN
  WITH fk AS (
    SELECT k.conrelid::regclass::text||'.'||a.attname AS col, k.confdeltype d
    FROM pg_constraint k JOIN pg_attribute a ON a.attrelid=k.conrelid AND a.attnum=k.conkey[1]
    WHERE k.contype='f' AND k.connamespace='public'::regnamespace
      AND k.conrelid::regclass::text NOT IN ('community_bans','community_join_requests')        -- tables created by 001
      AND (k.conrelid::regclass::text, a.attname) NOT IN (('posts','hidden_by'),('notifications','post_id'))  -- columns added by 002/004
  )
  SELECT string_agg(col, ', ' ORDER BY col) FILTER (WHERE d='c'),
         string_agg(col||'='||d::text, ', ' ORDER BY col) FILTER (WHERE d NOT IN ('a','c')),
         count(*) INTO casc, other, nfk FROM fk;
  PERFORM val.rec('y2.fk_actions_match_live',
    casc = 'post_comments.post_id, post_likes.post_id, post_reactions.post_id, routine_items.group_id, routine_privacy.item_id' AND other IS NULL
    AND (SELECT confdeltype FROM pg_constraint WHERE conrelid='posts'::regclass AND conname='posts_community_id_fkey')='a'
    AND (SELECT confdeltype FROM pg_constraint WHERE conrelid='notifications'::regclass AND confrelid='posts'::regclass)='c',
    format('cascade FKs=[%s] non-(NO ACTION/CASCADE) FKs=%s total_checked=%s posts.community_id=NO ACTION notifications.post_id=CASCADE', casc, coalesce(other,'none'), nfk));
END $$;

-- y3: exact policy set after 001-007 (live permissive policies on reactions/reports/likes/comments/posts/communities/members gone, only intended ones remain)
DO $$ DECLARE t text; got text; exp text; bad text := ''; BEGIN
  FOR t, exp IN VALUES
    ('post_reactions','post_reactions_delete,post_reactions_insert,post_reactions_select'),
    ('post_reports','admins can update post reports,post_reports_delete,post_reports_insert,post_reports_select'),
    ('post_likes','post_likes_delete,post_likes_insert,post_likes_select'),
    ('post_comments','post_comments_delete,post_comments_insert,post_comments_select,post_comments_update'),
    ('posts','posts_delete,posts_insert,posts_select,posts_select_anon_public,posts_update'),
    ('communities','communities_delete,communities_insert,communities_select,communities_update'),
    ('community_members','community_members_delete,community_members_insert,community_members_select,community_members_update'),
    ('notifications','users can select their own notifications,users can update their own notifications'),
    ('profiles','profiles are publicly readable,users can update own profile')
  LOOP
    SELECT string_agg(polname, ',' ORDER BY polname) INTO got FROM pg_policy WHERE polrelid=('public.'||t)::regclass;
    IF got IS DISTINCT FROM exp THEN bad := bad || format(' [%s got=%s]', t, got); END IF;
  END LOOP;
  PERFORM val.rec('y3.exact_policy_set_after_migrations', bad='', CASE WHEN bad='' THEN 'policy names match expected set on 9 tables (live "admins can update post reports", notifications+profiles policies kept)' ELSE bad END);
END $$;

-- y4: group-only post: non-viewer cannot see likes/comments/reactions, cannot insert reaction/like/comment/report; member can
DO $$ DECLARE g text := (SELECT v FROM val.ctx WHERE k='g1'); pg uuid := gen_random_uuid(); NV uuid := val.u(7); MB uuid := val.u(2); AU uuid := val.u(1);
  r_nv int; l_nv int; c_nv int; r_mb int; l_mb int; c_mb int; ins_r text; ins_l text; ins_c text; ins_rep text; ok_r text; ok_rep text; BEGIN
  INSERT INTO posts(id,user_id,content,community_id,category,visibility) VALUES (pg,AU,'group-only y4',g,'habit','group');
  INSERT INTO post_reactions(post_id,user_id,reaction_type) VALUES (pg,AU,'clap');
  INSERT INTO post_likes(post_id,user_id) VALUES (pg,AU);
  INSERT INTO post_comments(post_id,user_id,text) VALUES (pg,AU,'sekret');
  r_nv := val.cnt_as(NV, format('select 1 from post_reactions where post_id=%L', pg));
  l_nv := val.cnt_as(NV, format('select 1 from post_likes where post_id=%L', pg));
  c_nv := val.cnt_as(NV, format('select 1 from post_comments where post_id=%L', pg));
  r_mb := val.cnt_as(MB, format('select 1 from post_reactions where post_id=%L', pg));
  l_mb := val.cnt_as(MB, format('select 1 from post_likes where post_id=%L', pg));
  c_mb := val.cnt_as(MB, format('select 1 from post_comments where post_id=%L', pg));
  ins_r  := val.try_as(NV, format('insert into post_reactions(post_id,user_id,reaction_type) values (%L,%L,%L)', pg, NV, 'fire'));
  ins_l  := val.try_as(NV, format('insert into post_likes(post_id,user_id) values (%L,%L)', pg, NV));
  ins_c  := val.try_as(NV, format('insert into post_comments(post_id,user_id,text) values (%L,%L,%L)', pg, NV, 'x'));
  ins_rep:= val.try_as(NV, format('insert into post_reports(post_id,reporter_id,reason) values (%L,%L,%L)', pg, NV, 'x'));
  ok_r   := val.try_as(MB, format('insert into post_reactions(post_id,user_id,reaction_type) values (%L,%L,%L)', pg, MB, 'fire'));
  ok_rep := val.try_as(MB, format('insert into post_reports(post_id,reporter_id,reason) values (%L,%L,%L)', pg, MB, 'member report'));
  PERFORM val.rec('y4.group_only_post_reactions_likes_comments_hidden_from_nonviewer',
    r_nv=0 AND l_nv=0 AND c_nv=0 AND r_mb=1 AND l_mb=1 AND c_mb=1
    AND ins_r ILIKE 'ERR%row-level security%' AND ins_l ILIKE 'ERR%row-level security%' AND ins_c ILIKE 'ERR%row-level security%' AND ins_rep ILIKE 'ERR%row-level security%'
    AND ok_r='OK' AND ok_rep='OK',
    format('non-viewer sees reactions/likes/comments=%s/%s/%s | member sees=%s/%s/%s | non-viewer insert reaction=%s like=%s comment=%s report=%s | member insert reaction=%s report=%s', r_nv,l_nv,c_nv,r_mb,l_mb,c_mb,left(ins_r,60),left(ins_l,40),left(ins_c,40),left(ins_rep,40),ok_r,ok_rep));
END $$;

-- y5: post_reports: admin can still UPDATE and SEE all; reporter sees own; unrelated user sees none & cannot update; group owner sees
DO $$ DECLARE g text := (SELECT v FROM val.ctx WHERE k='g1'); p uuid := gen_random_uuid(); AD uuid := val.u(180); RP uuid := val.u(181); OT uuid := val.u(182); OWN uuid := val.u(1); AU uuid := val.u(2);
  rid uuid; s_ad int; s_rp int; s_ot int; s_own int; up_ad text; up_rp text; up_ot text; st text; BEGIN
  PERFORM val.mkuser(180,'admin180'); PERFORM val.mkuser(181,'rep181'); PERFORM val.mkuser(182,'other182');
  UPDATE profiles SET is_admin=true WHERE id=AD;
  INSERT INTO posts(id,user_id,content,community_id,category,visibility) VALUES (p,AU,'reported y5',g,'habit','group');
  INSERT INTO community_members(user_id,community_id) VALUES (RP,g);   -- reporter must be able to view the group post
  INSERT INTO post_reports(id,post_id,reporter_id,reason) VALUES (gen_random_uuid(),p,RP,'y5 reason') RETURNING id INTO rid;
  s_ad  := val.cnt_as(AD,  format('select 1 from post_reports where id=%L', rid));
  s_rp  := val.cnt_as(RP,  format('select 1 from post_reports where id=%L', rid));
  s_ot  := val.cnt_as(OT,  format('select 1 from post_reports where id=%L', rid));
  s_own := val.cnt_as(OWN, format('select 1 from post_reports where id=%L', rid));
  up_ot := val.rows_as(OT, format('update post_reports set status=%L where id=%L', 'dismissed', rid));
  up_rp := val.rows_as(RP, format('update post_reports set status=%L where id=%L', 'dismissed', rid));
  SELECT status INTO st FROM post_reports WHERE id=rid;
  up_ad := val.rows_as(AD, format('update post_reports set status=%L where id=%L', 'dismissed', rid));
  PERFORM val.rec('y5.post_reports_admin_update_and_visibility',
    s_ad=1 AND s_rp=1 AND s_ot=0 AND s_own=1 AND up_ot='0' AND up_rp='0' AND st='open' AND up_ad='1' AND (SELECT status FROM post_reports WHERE id=rid)='dismissed',
    format('select: admin=%s reporter=%s unrelated=%s group_owner=%s | update rows: unrelated=%s reporter=%s (status stays %s) admin=%s -> now %s', s_ad,s_rp,s_ot,s_own,up_ot,up_rp,st,up_ad,(SELECT status FROM post_reports WHERE id=rid)));
END $$;

-- y6: triggers/functions: on_post_like_notify gone, nothing depends on it, only one trigger uses notify_on_post_like(); other live objects intact
DO $$ DECLARE fn oid := 'public.notify_on_post_like()'::regprocedure; ntrg int; dep_other int; trgs text; lst text; BEGIN
  SELECT count(*) INTO ntrg FROM pg_trigger WHERE tgfoid=fn AND NOT tgisinternal;
  SELECT string_agg(tgname,',') INTO trgs FROM pg_trigger WHERE tgfoid=fn AND NOT tgisinternal;
  SELECT count(*) INTO dep_other FROM pg_depend d WHERE d.refobjid=fn AND d.deptype='n' AND d.classid <> 'pg_trigger'::regclass;
  SELECT string_agg(p.oid::regprocedure::text, ', ' ORDER BY p.oid::regprocedure::text) INTO lst FROM pg_proc p WHERE pronamespace='public'::regnamespace
    AND proname IN ('can_view_profile','get_routine_suggestions_for_keyword','notify_on_follow');
  PERFORM val.rec('y6.old_like_trigger_dropped_nothing_depends_on_it',
    NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_post_like_notify')
    AND ntrg=1 AND trgs='notify_on_post_like_trigger' AND dep_other=0
    AND EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_follow_notify' AND tgrelid='follows'::regclass AND NOT tgisinternal)
    AND lst = 'can_view_profile(uuid), get_routine_suggestions_for_keyword(text,integer), notify_on_follow()'
    AND (SELECT count(*) FROM pg_trigger WHERE tgrelid IN ('follows'::regclass,'post_likes'::regclass,'post_comments'::regclass) AND NOT tgisinternal)=3,
    format('on_post_like_notify exists=%s | triggers using notify_on_post_like()=%s(%s) | non-trigger dependents on that function=%s | on_follow_notify kept=%s | untouched live fns: %s',
      EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_post_like_notify'), ntrg, trgs, dep_other, EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_follow_notify'), lst));
END $$;

-- y7: leave_group / transfer_ownership still fine with NO ACTION FKs; sole-owner leave archives group; then transfer + old owner delete_account
DO $$ DECLARE r json; r2 json; g text; code text; g2 text; err text; own uuid; a_at timestamptz; BEGIN
  PERFORM val.mkuser(210,'y7a'); PERFORM val.mkuser(211,'y7b'); PERFORM val.mkuser(212,'y7c');
  PERFORM val.as_user(val.u(210)); r := create_group('Y7 A',''); g := r->>'community_id';
  r2 := leave_group(g);                               -- sole member leaves -> archived
  EXECUTE 'RESET ROLE';
  SELECT archived_at INTO a_at FROM communities WHERE id=g;
  PERFORM val.as_user(val.u(211)); r := create_group('Y7 B',''); g2 := r->>'community_id'; code := r->>'invite_code';
  PERFORM val.as_user(val.u(212)); PERFORM join_by_invite(code);
  PERFORM val.as_user(val.u(211)); r := transfer_ownership(g2, val.u(212));
  EXECUTE 'RESET ROLE';
  err := val.try_as(val.u(211), 'select delete_account()');
  SELECT owner_id INTO own FROM communities WHERE id=g2;
  PERFORM val.rec('y7.leave_transfer_then_delete_old_owner',
    r2->>'status'='success' AND a_at IS NOT NULL AND r->>'status'='success' AND err='OK' AND own=val.u(212)
    AND (SELECT role FROM community_members WHERE community_id=g2 AND user_id=val.u(212))='owner' AND (SELECT member_count FROM communities WHERE id=g2)=1
    AND (SELECT member_count FROM communities WHERE id=g)=0,
    format('sole leave=%s archived=%s | transfer=%s | old owner delete_account=%s | new owner ok=%s member_count(g2)=%s member_count(archived g)=%s', r2, a_at IS NOT NULL, r, err, own=val.u(212), (SELECT member_count FROM communities WHERE id=g2),(SELECT member_count FROM communities WHERE id=g)));
END $$;

-- y8: SOLE-OWNER group containing OTHER users' legacy posts (authors NOT members) with comments/likes/reactions/post_reports/like-notifications:
--     delete_account must remove all of it; unrelated groups/posts of the same authors survive; other tables do not block.
DO $$ DECLARE U uuid := val.u(220); A1 uuid := val.u(221); A2 uuid := val.u(222); RP uuid := val.u(223); g text; r json; err text;
  p1 uuid := gen_random_uuid(); p2 uuid := gen_random_uuid(); p3 uuid := gen_random_uuid(); pkeep uuid := gen_random_uuid(); pown uuid := gen_random_uuid();
  nn_before int; left_txt text; BEGIN
  PERFORM val.mkuser(220,'y8owner'); PERFORM val.mkuser(221,'y8a1'); PERFORM val.mkuser(222,'y8a2'); PERFORM val.mkuser(223,'y8rp');
  PERFORM val.as_user(U); r := create_group('Y8 Solo',''); g := r->>'community_id';
  EXECUTE 'RESET ROLE';
  -- legacy public posts of non-members pointing at the group + U's own group post
  INSERT INTO posts(id,user_id,content,community_id,category,visibility) VALUES
    (p1,A1,'legacy1',g,'habit','public'),(p2,A2,'legacy2',g,'diet','public'),(p3,A1,'legacy3',g,'habit','private'),(pown,U,'own',g,'habit','group'),
    (pkeep,A1,'unrelated keep',NULL,'habit','public');
  INSERT INTO post_comments(post_id,user_id,text) VALUES (p1,A2,'c1'),(p1,RP,'c2'),(p2,A1,'c3'),(pkeep,A2,'ckeep');
  INSERT INTO post_reactions(post_id,user_id,reaction_type) VALUES (p1,A2,'clap'),(p2,A1,'fire'),(pkeep,A2,'clap');
  INSERT INTO post_likes(post_id,user_id) VALUES (p1,A2),(p2,A1),(pkeep,A2);          -- trigger creates like notifications for p1,p2,pkeep
  INSERT INTO post_comments(post_id,user_id,text) VALUES (p2,A2,'c4');               -- trigger creates comment notification
  INSERT INTO post_reports(post_id,reporter_id,reason) VALUES (p1,RP,'r1'),(p2,RP,'r2'),(p3,A2,'r3'),(pkeep,RP,'rkeep');
  INSERT INTO notifications(user_id,actor_id,type,text,post_id) VALUES (A1,U,'report','n-on-p1',p1),(U,A1,'comment','n-on-pown',pown);
  SELECT count(*) INTO nn_before FROM notifications WHERE post_id IN (p1,p2,p3,pown);
  err := val.try_as(U, 'select delete_account()');
  SELECT format('group=%s posts_in_group=%s legacy_posts=%s comments=%s reactions=%s likes=%s reports=%s notifs=%s | kept: pkeep=%s ckeep=%s rkeep=%s nkeep=%s | profile=%s',
     (SELECT count(*) FROM communities WHERE id=g), (SELECT count(*) FROM posts WHERE community_id=g), (SELECT count(*) FROM posts WHERE id IN (p1,p2,p3,pown)),
     (SELECT count(*) FROM post_comments WHERE post_id IN (p1,p2,p3,pown)), (SELECT count(*) FROM post_reactions WHERE post_id IN (p1,p2,p3,pown)),
     (SELECT count(*) FROM post_likes WHERE post_id IN (p1,p2,p3,pown)), (SELECT count(*) FROM post_reports WHERE post_id IN (p1,p2,p3,pown)),
     (SELECT count(*) FROM notifications WHERE post_id IN (p1,p2,p3,pown)),
     (SELECT count(*) FROM posts WHERE id=pkeep),(SELECT count(*) FROM post_comments WHERE post_id=pkeep),(SELECT count(*) FROM post_reports WHERE post_id=pkeep),
     (SELECT count(*) FROM notifications WHERE post_id=pkeep), (SELECT count(*) FROM profiles WHERE id=U)) INTO left_txt;
  PERFORM val.rec('y8.delete_account_sole_owner_group_with_other_users_legacy_posts',
    err='OK' AND nn_before>=5 AND left_txt = 'group=0 posts_in_group=0 legacy_posts=0 comments=0 reactions=0 likes=0 reports=0 notifs=0 | kept: pkeep=1 ckeep=1 rkeep=1 nkeep=2 | profile=0',
    format('call=%s notifs_referencing_group_posts_before=%s | %s', err, nn_before, left_txt));
END $$;

-- y9: on the live-like SEED: seed owner (user ...01, sole member/owner of comm-1759000000001 which holds ~20 legacy posts by non-members, with live-like
--     comments/likes/reactions/post_reports) deletes the account -> succeeds, group + all its posts gone, ownerless groups untouched.
DO $$ DECLARE U uuid := '00000000-0000-0000-0000-000000000001'; g text := 'comm-1759000000001'; n_posts int; n_nonmember int; err text; extra text; BEGIN
  SELECT count(*) INTO n_posts FROM posts WHERE community_id=g;
  SELECT count(*) INTO n_nonmember FROM posts WHERE community_id=g AND user_id <> U;
  -- add a like notification on a legacy post (trigger path) so notifications.post_id rows exist for the cascade
  PERFORM val.try_as('00000000-0000-0000-0000-00000000000b', format('insert into post_likes(post_id,user_id) values (%L,%L) on conflict do nothing', (SELECT id FROM posts WHERE community_id=g AND user_id NOT IN (U,'00000000-0000-0000-0000-00000000000b') LIMIT 1), '00000000-0000-0000-0000-00000000000b'));
  err := val.try_as(U, 'select delete_account()');
  SELECT format('ownerless_groups_left=%s total_groups_with_seed_prefix=%s posts_in_deleted_group=%s orphan_comments=%s orphan_reports=%s orphan_notifs=%s',
     (SELECT count(*) FROM communities WHERE id LIKE 'comm-17590000000%' AND owner_id IS NULL), (SELECT count(*) FROM communities WHERE id LIKE 'comm-17590000000%'),
     (SELECT count(*) FROM posts WHERE community_id=g),
     (SELECT count(*) FROM post_comments c WHERE NOT EXISTS (SELECT 1 FROM posts p WHERE p.id=c.post_id)),
     (SELECT count(*) FROM post_reports c WHERE NOT EXISTS (SELECT 1 FROM posts p WHERE p.id=c.post_id)),
     (SELECT count(*) FROM notifications c WHERE c.post_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.id=c.post_id))) INTO extra;
  PERFORM val.rec('y9.seed_owner_delete_account_removes_group_and_nonmember_legacy_posts',
    err='OK' AND n_nonmember>=10 AND NOT EXISTS (SELECT 1 FROM communities WHERE id=g) AND NOT EXISTS (SELECT 1 FROM posts WHERE community_id=g)
    AND NOT EXISTS (SELECT 1 FROM profiles WHERE id=U) AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id=U)
    AND (SELECT count(*) FROM communities WHERE id LIKE 'comm-17590000000%')=6 AND (SELECT count(*) FROM posts WHERE community_id LIKE 'comm-17590000000%')>100
    AND NOT EXISTS (SELECT 1 FROM post_comments c WHERE NOT EXISTS (SELECT 1 FROM posts p WHERE p.id=c.post_id)),
    format('call=%s | posts in group before=%s (by non-members=%s) | %s', err, n_posts, n_nonmember, extra));
END $$;


-- y10: user who hid someone else's post (posts.hidden_by -> profiles, ON DELETE SET NULL) and who owns a group with a member deletes the account
DO $$ DECLARE H uuid := val.u(230); M uuid := val.u(231); A uuid := val.u(232); g text; r json; p uuid := gen_random_uuid(); err text; hb uuid; BEGIN
  PERFORM val.mkuser(230,'y10hider'); PERFORM val.mkuser(231,'y10m'); PERFORM val.mkuser(232,'y10author');
  PERFORM val.as_user(H); r := create_group('Y10',''); g := r->>'community_id';
  PERFORM val.as_user(M); PERFORM join_by_invite(r->>'invite_code');
  EXECUTE 'RESET ROLE';
  INSERT INTO posts(id,user_id,content,community_id,category,visibility,hidden_at,hidden_by) VALUES (p,A,'hidden one',g,'habit','public',now(),H);
  err := val.try_as(H, 'select delete_account()');
  SELECT hidden_by INTO hb FROM posts WHERE id=p;
  PERFORM val.rec('y10.delete_account_user_who_hid_a_post', err='OK' AND hb IS NULL AND EXISTS(SELECT 1 FROM posts WHERE id=p) AND (SELECT owner_id FROM communities WHERE id=g)=M,
    format('call=%s hidden_by_after=%s post_kept=%s new_owner_is_member=%s', err, coalesce(hb::text,'NULL'), EXISTS(SELECT 1 FROM posts WHERE id=p), (SELECT owner_id FROM communities WHERE id=g)=M));
END $$;

\echo ==== RESULTS ====
SELECT seq, id, CASE WHEN ok THEN 'PASS' ELSE 'FAIL' END AS result, detail FROM val.res ORDER BY seq;
