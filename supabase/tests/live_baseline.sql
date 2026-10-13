-- LIVE PRODUCTION BASELINE SCHEMA (ejgfqpcqpvsvnnwyzrrp)
-- Captured 2026-10-01 for migration validation
-- This recreates the ACTUAL live state before migrations 001-007

-- Drop existing if rerunning
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES (in dependency order)
-- ============================================================================

-- profiles (11 rows live)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text,
  created_at timestamptz DEFAULT now(),
  bio text,
  is_admin boolean DEFAULT false,
  suspended boolean DEFAULT false,
  profile_visibility text
);

-- communities (7 rows live)
CREATE TABLE communities (
  id text PRIMARY KEY,
  name text NOT NULL,
  initial text,
  color text,
  members integer DEFAULT 0,
  focus text,
  "desc" text, -- reserved word, must be quoted
  created_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES profiles(id),
  visibility text CHECK (visibility IN ('public', 'private'))
);

-- community_members (2 rows live)
-- PK (user_id, community_id), NO created_at, NO role
CREATE TABLE community_members (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id text REFERENCES communities(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, community_id)
);

-- posts (143 rows live)
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  community_id text REFERENCES communities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  has_img boolean DEFAULT false,
  img_url text,
  has_insta boolean DEFAULT false,
  insta_url text,
  category text CHECK (category IN ('habit', 'diet', 'reflection', 'routine')),
  visibility text CHECK (visibility IN ('public', 'followers', 'private'))
);

-- follows
CREATE TABLE follows (
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  followee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);

-- notifications (5 rows live)
-- NO related_id, NO post_id
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text CHECK (type IN ('like', 'follow', 'comment')),
  text text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- post_comments
CREATE TABLE post_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- post_likes (PK-less per user report)
CREATE TABLE post_likes (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- post_reactions
CREATE TABLE post_reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reaction text,
  created_at timestamptz DEFAULT now()
);

-- post_reports (separate from reports)
CREATE TABLE post_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- reports (separate table)
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- routine_groups
CREATE TABLE routine_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text,
  created_at timestamptz DEFAULT now()
);

-- routine_items
CREATE TABLE routine_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_group_id uuid REFERENCES routine_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now()
);

-- routine_privacy
CREATE TABLE routine_privacy (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_private boolean DEFAULT false
);

-- evening_reflections
CREATE TABLE evening_reflections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  date date,
  created_at timestamptz DEFAULT now()
);

-- custom_quick_buttons
CREATE TABLE custom_quick_buttons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  label text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- calendar_event_snapshots
CREATE TABLE calendar_event_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_date date,
  snapshot_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- notification_settings
CREATE TABLE notification_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  follow boolean DEFAULT true,
  like boolean DEFAULT true,
  comment boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW follow_counts AS
SELECT
  followee_id as user_id,
  COUNT(*) as follower_count
FROM follows
GROUP BY followee_id;

-- ============================================================================
-- FUNCTIONS (live)
-- ============================================================================

CREATE OR REPLACE FUNCTION can_view_profile(profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN true; -- stub
END;
$$;

CREATE OR REPLACE FUNCTION get_routine_suggestions_for_keyword(keyword text)
RETURNS TABLE(suggestion text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT 'stub'::text;
END;
$$;

CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- stub
  RETURN NEW;
END;
$$;

-- Live notify_on_post_like (exists live)
CREATE OR REPLACE FUNCTION notify_on_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- stub
  RETURN NEW;
END;
$$;

-- ============================================================================
-- TRIGGERS (live)
-- ============================================================================

CREATE TRIGGER on_follow_notify
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

CREATE TRIGGER on_post_like_notify
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION notify_on_post_like();

-- NO trigger on post_comments live

-- ============================================================================
-- RLS POLICIES (live policy names)
-- ============================================================================

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE evening_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_quick_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- communities
CREATE POLICY "communities are readable by visibility" ON communities FOR SELECT
  USING (visibility = 'public' OR owner_id = auth.uid());

CREATE POLICY "authenticated users can create communities" ON communities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "owners or admins can update communities" ON communities FOR UPDATE
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- community_members
CREATE POLICY "community members are publicly readable" ON community_members FOR SELECT
  USING (true);

CREATE POLICY "users can join/leave communities themselves" ON community_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can leave communities themselves" ON community_members FOR DELETE
  USING (user_id = auth.uid());

-- posts (live policy name: posts_select_by_visibility)
CREATE POLICY "posts_select_by_visibility" ON posts FOR SELECT
  USING (
    visibility = 'public'
    OR (visibility = 'followers' AND EXISTS (SELECT 1 FROM follows WHERE followee_id = posts.user_id AND follower_id = auth.uid()))
    OR (visibility = 'private' AND user_id = auth.uid())
  );

CREATE POLICY "users can insert own posts" ON posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can update own posts" ON posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "users can delete own posts" ON posts FOR DELETE
  USING (user_id = auth.uid());

-- notifications
CREATE POLICY "users can view own notifications" ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- profiles
CREATE POLICY "profiles are publicly readable" ON profiles FOR SELECT
  USING (true);

CREATE POLICY "users can update own profile" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Add minimal policies for other tables (not relevant to migration testing)
CREATE POLICY "users manage own data" ON follows FOR ALL USING (follower_id = auth.uid());
CREATE POLICY "users manage own data" ON post_comments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON post_likes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON post_reactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON post_reports FOR ALL USING (reporter_id = auth.uid());
CREATE POLICY "users manage own data" ON reports FOR ALL USING (reporter_id = auth.uid());
CREATE POLICY "users manage own data" ON routine_groups FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON routine_items FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON routine_privacy FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON evening_reflections FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON custom_quick_buttons FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON calendar_event_snapshots FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users manage own data" ON notification_settings FOR ALL USING (user_id = auth.uid());
