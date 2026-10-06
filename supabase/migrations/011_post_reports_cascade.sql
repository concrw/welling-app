-- 011_post_reports_cascade.sql: Make post_reports.post_id FK CASCADE on delete
-- This allows deleting posts that have been reported without FK violation errors

ALTER TABLE post_reports
DROP CONSTRAINT IF EXISTS post_reports_post_id_fkey;

ALTER TABLE post_reports
ADD CONSTRAINT post_reports_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;
