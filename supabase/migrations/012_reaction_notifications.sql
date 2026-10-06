-- Notify a post author when another user adds a post reaction.

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
BEGIN
  SELECT user_id INTO v_post_author_id FROM posts WHERE id = NEW.post_id;

  IF v_post_author_id IS NULL OR v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, actor_id, type, text, related_id, post_id, read, actor_count, created_at)
  VALUES (v_post_author_id, NEW.user_id, 'reaction', ' reacted to your post', NEW.post_id::text, NEW.post_id, false, 1, now())
  ON CONFLICT (user_id, post_id) WHERE type = 'reaction' AND read = false AND post_id IS NOT NULL
  DO UPDATE SET
    actor_count = notifications.actor_count + 1,
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

REVOKE ALL ON FUNCTION notify_on_post_reaction() FROM PUBLIC, anon;

COMMENT ON FUNCTION notify_on_post_reaction IS 'Post reaction notification trigger. Unread reactions on the same post are grouped.';
