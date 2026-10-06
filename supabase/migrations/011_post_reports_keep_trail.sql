-- 011_post_reports_keep_trail.sql
-- Keep moderation trail when an author deletes a reported post
-- Make post_reports.post_id nullable, add post_snapshot, trigger on posts DELETE

-- Make post_id nullable
ALTER TABLE post_reports
ALTER COLUMN post_id DROP NOT NULL;

-- Add post_snapshot column to store deleted post content
ALTER TABLE post_reports
ADD COLUMN IF NOT EXISTS post_snapshot jsonb;

-- Add index on post_id for efficient FK and trigger lookups
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);

-- Revoke INSERT and UPDATE on post_snapshot from authenticated and anon
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_reports' AND column_name = 'post_snapshot') THEN
    EXECUTE 'REVOKE INSERT(post_snapshot), UPDATE(post_snapshot) ON post_reports FROM authenticated, anon';
  END IF;
END $$;

-- Create BEFORE INSERT trigger to null out user-supplied post_snapshot
CREATE OR REPLACE FUNCTION nullify_post_snapshot_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.post_snapshot := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nullify_post_snapshot_on_insert_trigger ON post_reports;
CREATE TRIGGER nullify_post_snapshot_on_insert_trigger
BEFORE INSERT ON post_reports
FOR EACH ROW
EXECUTE FUNCTION nullify_post_snapshot_on_insert();

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
REVOKE EXECUTE ON FUNCTION nullify_post_snapshot_on_insert() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION nullify_post_snapshot_on_insert() FROM anon;

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
