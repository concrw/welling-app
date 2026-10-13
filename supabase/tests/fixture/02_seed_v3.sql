-- Seed v3: resembles the REAL live data profile (read-only counts supplied by the user on 2026-10-01):
--   11 profiles, 7 communities (6 with owner_id NULL, 5 with ZERO community_members), 2 community_members rows,
--   143 posts (142 with community_id, almost all authored by NON-members of that community = legacy public group posts),
--   5 notifications (all type 'follow', read never NULL).
-- Triggers/FK checks are bypassed while seeding so the seed is exactly this data (no derived 'like' notifications).
SET session_replication_role = replica;

-- 11 users / profiles:  ...0001 .. ...000b  (fixed ids, helper below)
INSERT INTO auth.users(id)
SELECT ('00000000-0000-0000-0000-'||lpad(g::text,12,'0'))::uuid FROM generate_series(1,11) g;
INSERT INTO profiles(id,nickname,bio,profile_visibility,is_admin)
SELECT ('00000000-0000-0000-0000-'||lpad(g::text,12,'0'))::uuid, 'seed'||g, 'bio'||g,
       CASE WHEN g<=7 THEN 'public' WHEN g<=9 THEN 'followers' ELSE 'private' END,
       (g=11)  -- seed11 is a live-style admin
FROM generate_series(1,11) g;

-- 7 communities, 'comm-<timestamp>' style ids (legacy). Only comm-...01 has an owner (seed1); 6 ownerless.
-- 5 of the 7 have zero members. `members` is the legacy denormalised counter (stale on purpose).
INSERT INTO communities(id,name,initial,color,members,focus,"desc",owner_id,visibility) VALUES
 ('comm-1759000000001','Owned Group','O','#111',1,'habit','d1','00000000-0000-0000-0000-000000000001','public'),
 ('comm-1759000000002','Ownerless w/ member','W','#222',7,'diet','d2',NULL,'public'),
 ('comm-1759000000003','Ownerless empty A','A','#333',12,'habit','d3',NULL,'public'),
 ('comm-1759000000004','Ownerless empty B','B','#444',0,'habit','d4',NULL,'public'),
 ('comm-1759000000005','Ownerless empty C','C','#555',3,'routine','d5',NULL,'private'),
 ('comm-1759000000006','Ownerless empty D','D','#666',5,'diet','d6',NULL,'public'),
 ('comm-1759000000007','Ownerless empty E','E','#777',2,'habit','d7',NULL,'public');

-- exactly 2 community_members rows (no `role` column yet on live)
INSERT INTO community_members(user_id,community_id) VALUES
 ('00000000-0000-0000-0000-000000000001','comm-1759000000001'),
 ('00000000-0000-0000-0000-000000000002','comm-1759000000002');

-- 143 posts: 142 legacy posts with community_id (spread over all 7 groups; authored mostly by NON-members), 1 without.
INSERT INTO posts(id,user_id,content,community_id,category,visibility,created_at)
SELECT ('10000000-0000-0000-0000-'||lpad(g::text,12,'0'))::uuid,
       ('00000000-0000-0000-0000-'||lpad(((g % 11)+1)::text,12,'0'))::uuid,
       CASE WHEN g=1 THEN 'pub' ELSE 'legacy '||g END,
       CASE WHEN g=143 THEN NULL ELSE 'comm-17590000000'||lpad(((g % 7)+1)::text,2,'0') END,
       (ARRAY['habit','diet','reflection','routine'])[(g % 4)+1],
       CASE WHEN g % 20 = 0 THEN 'private' WHEN g % 15 = 0 THEN 'followers' ELSE 'public' END,
       now() - (g||' hours')::interval
FROM generate_series(1,143) g;

-- interactions on legacy posts, incl. posts of groups that will be deleted (ownerless groups with zero members)
INSERT INTO post_comments(post_id,user_id,text)
SELECT ('10000000-0000-0000-0000-'||lpad(g::text,12,'0'))::uuid,
       ('00000000-0000-0000-0000-'||lpad(((g % 11)+1)::text,12,'0'))::uuid, 'legacy comment '||g
FROM generate_series(1,40) g;
INSERT INTO post_likes(post_id,user_id)
SELECT ('10000000-0000-0000-0000-'||lpad(g::text,12,'0'))::uuid,
       ('00000000-0000-0000-0000-'||lpad(((g % 10)+1)::text,12,'0'))::uuid
FROM generate_series(1,40) g
WHERE ((g % 10)+1) <> ((g % 11)+1);
INSERT INTO post_reactions(post_id,user_id,reaction_type)
SELECT ('10000000-0000-0000-0000-'||lpad(g::text,12,'0'))::uuid,
       ('00000000-0000-0000-0000-'||lpad(((g % 9)+1)::text,12,'0'))::uuid, 'clap'
FROM generate_series(1,30) g;
INSERT INTO post_reports(post_id,reporter_id,reason)
SELECT ('10000000-0000-0000-0000-'||lpad(g::text,12,'0'))::uuid,
       ('00000000-0000-0000-0000-'||lpad(((g % 8)+2)::text,12,'0'))::uuid, 'legacy report '||g
FROM generate_series(1,12) g;

INSERT INTO follows(follower_id,followee_id) VALUES
 ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000003');

-- 5 notifications, all type 'follow', read never NULL
INSERT INTO notifications(user_id,actor_id,type,text,read) VALUES
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','follow','followed you',true),
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','follow','followed you',false),
 ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000005','follow','followed you',false),
 ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','follow','followed you',true),
 ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000006','follow','followed you',false);

INSERT INTO reports(reported_user_id,content,reason) VALUES ('00000000-0000-0000-0000-000000000003','c','spam');
INSERT INTO routine_groups(id,user_id,name) VALUES ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','rg');
INSERT INTO routine_items(id,group_id,name) VALUES ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','ri');
INSERT INTO routine_privacy(item_id,is_public) VALUES ('30000000-0000-0000-0000-000000000001',false);
INSERT INTO notification_settings(user_id) VALUES ('00000000-0000-0000-0000-000000000003');

SET session_replication_role = DEFAULT;
