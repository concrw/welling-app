-- 011_post_reports_keep_trail.sql
-- Keep moderation trail when an author deletes a reported post
-- Make post_reports.post_id nullable, add post_snapshot, trigger on posts DELETE

-- Make post_id nullable
ALTER TABLE post_reports
ALTER COLUMN post_id DROP NOT NULL;

-- Add post_snapshot column to store deleted post content
ALTER TABLE post_reports
ADD COLUMN IF NOT EXISTS post_snapshot jsonb;

-- Create trigger function to snapshot post data before deletion
CREATE OR REPLACE FUNCTION snapshot_reported_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE post_reports
  SET post_snapshot = to_jsonb(OLD)
  WHERE post_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Revoke execute from public and anon
REVOKE EXECUTE ON FUNCTION snapshot_reported_post() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION snapshot_reported_post() FROM anon;

-- Create trigger on posts BEFORE DELETE
DROP TRIGGER IF EXISTS snapshot_reported_post_trigger ON posts;
CREATE TRIGGER snapshot_reported_post_trigger
BEFORE DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION snapshot_reported_post();

-- Recreate FK with ON DELETE SET NULL
ALTER TABLE post_reports
DROP CONSTRAINT IF EXISTS post_reports_post_id_fkey;

ALTER TABLE post_reports
ADD CONSTRAINT post_reports_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE SET NULL;
