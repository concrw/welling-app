-- Notify a post author when another user adds a post reaction.
-- Unread reaction notifications on the same post are grouped into one row;
-- actor_count = number of DISTINCT reactors since the author last read a
-- reaction notification for that post (toggling a reaction off/on or adding a
-- second reaction type does not inflate the count).

-- Type list is unchanged from live (like, follow, comment, copy, report,
-- group_join) plus 'reaction'.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'follow', 'comment', 'copy', 'report', 'group_join', 'reaction'));

CREATE UNIQUE INDEX IF NOT EXISTS notifications_unread_reaction_uniq
  ON notifications (user_id, post_id)
  WHERE type = 'reaction' AND read = false AND post_id IS NOT NULL;

CREATE OR REPLACE FUNCTION notify_on_post_reaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id uuid;
  v_since timestamptz;
  v_actor_count int;
BEGIN
  SELECT user_id INTO v_post_author_id FROM posts WHERE id = NEW.post_id;

  IF v_post_author_id IS NULL OR v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Serialize per post so concurrent reactions see each other's committed rows
  -- (each following statement takes a fresh snapshot under READ COMMITTED).
  PERFORM pg_advisory_xact_lock(hashtextextended('notify_on_post_reaction:' || NEW.post_id::text, 0));

  -- Start of the current unread group = last reaction notification the author has read.
  SELECT max(created_at) INTO v_since
  FROM notifications
  WHERE user_id = v_post_author_id AND post_id = NEW.post_id AND type = 'reaction' AND read = true;

  SELECT count(DISTINCT pr.user_id) INTO v_actor_count
  FROM post_reactions pr
  WHERE pr.post_id = NEW.post_id
    AND pr.user_id <> v_post_author_id
    AND (v_since IS NULL OR pr.created_at > v_since);

  v_actor_count := GREATEST(v_actor_count, 1);

  INSERT INTO notifications (user_id, actor_id, type, text, related_id, post_id, read, actor_count, created_at)
  VALUES (v_post_author_id, NEW.user_id, 'reaction', ' reacted to your post', NEW.post_id::text, NEW.post_id, false, v_actor_count, now())
  ON CONFLICT (user_id, post_id) WHERE type = 'reaction' AND read = false AND post_id IS NOT NULL
  DO UPDATE SET
    actor_count = GREATEST(EXCLUDED.actor_count, notifications.actor_count),
    actor_id = NEW.user_id,
    created_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_post_reaction_notify ON post_reactions;
DROP TRIGGER IF EXISTS notify_on_post_reaction_trigger ON post_reactions;
CREATE TRIGGER notify_on_post_reaction_trigger
  AFTER INSERT ON post_reactions
  FOR EACH ROW EXECUTE FUNCTION notify_on_post_reaction();

-- Trigger-only function: no client role needs EXECUTE (Supabase default
-- privileges grant it to anon/authenticated on create).
REVOKE ALL ON FUNCTION notify_on_post_reaction() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION notify_on_post_reaction() IS 'Post reaction notification trigger. Unread reactions on the same post are grouped; actor_count counts distinct reactors.';
