-- Account Deletion Migration for WELLING
-- This SQL function must be deployed to Supabase to enable account deletion
-- Deploy via: Supabase Dashboard → SQL Editor → Run this script

-- Create the delete_account RPC function
-- SECURITY DEFINER allows this function to delete auth.users (requires service role)
CREATE OR REPLACE FUNCTION delete_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_id uuid;
  deleted_count json;
BEGIN
  -- Get the authenticated user's ID
  calling_user_id := auth.uid();
  
  -- Security check: ensure user is authenticated
  IF calling_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Start transaction (implicit in function)
  
  -- 1. Delete storage files from post-images bucket
  -- Note: This assumes RLS policies allow user to delete their own images
  -- Storage deletion happens via triggers or must be handled separately
  
  -- 2. Delete user's custom quick buttons
  DELETE FROM custom_quick_buttons WHERE user_id = calling_user_id;
  
  -- 3. Delete user's notification settings
  DELETE FROM notification_settings WHERE user_id = calling_user_id;
  
  -- 4. Delete calendar event snapshots
  DELETE FROM calendar_event_snapshots WHERE user_id = calling_user_id;
  
  -- 5. Delete evening reflections
  DELETE FROM evening_reflections WHERE user_id = calling_user_id;
  
  -- 6. Delete routine privacy settings (via routine_items)
  DELETE FROM routine_privacy 
  WHERE item_id IN (
    SELECT ri.id FROM routine_items ri
    JOIN routine_groups rg ON ri.group_id = rg.id
    WHERE rg.user_id = calling_user_id
  );
  
  -- 7. Delete routine items (will cascade from routine_groups)
  DELETE FROM routine_items 
  WHERE group_id IN (
    SELECT id FROM routine_groups WHERE user_id = calling_user_id
  );
  
  -- 8. Delete routine groups
  DELETE FROM routine_groups WHERE user_id = calling_user_id;
  
  -- 9. Delete notifications where user is actor or recipient
  DELETE FROM notifications 
  WHERE user_id = calling_user_id OR actor_id = calling_user_id;
  
  -- 10. Delete post reports filed by user
  DELETE FROM post_reports WHERE reporter_id = calling_user_id;
  
  -- 11. Delete reports filed by or against user
  DELETE FROM reports 
  WHERE reporter_id = calling_user_id OR reported_user_id = calling_user_id;
  
  -- 12. Delete post comments by user
  DELETE FROM post_comments WHERE user_id = calling_user_id;
  
  -- 13. Delete post reactions by user
  DELETE FROM post_reactions WHERE user_id = calling_user_id;
  
  -- 14. Delete post likes by user
  DELETE FROM post_likes WHERE user_id = calling_user_id;
  
  -- 15. Delete posts by user (and their associated comments/likes/reactions via cascade)
  DELETE FROM posts WHERE user_id = calling_user_id;
  
  -- 16. Delete community memberships
  DELETE FROM community_members WHERE user_id = calling_user_id;
  
  -- 17. Handle communities owned by user (transfer ownership or delete)
  -- For now, we'll delete communities owned by the user
  -- Alternative: UPDATE communities SET owner_id = NULL WHERE owner_id = calling_user_id;
  DELETE FROM communities WHERE owner_id = calling_user_id;
  
  -- 18. Delete follow relationships (as follower or followee)
  DELETE FROM follows 
  WHERE follower_id = calling_user_id OR followee_id = calling_user_id;
  
  -- 19. Delete follow counts
  DELETE FROM follow_counts WHERE user_id = calling_user_id;
  
  -- 20. Delete profile
  DELETE FROM profiles WHERE id = calling_user_id;
  
  -- 21. Delete auth user (this is the critical step that requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = calling_user_id;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Account successfully deleted',
    'user_id', calling_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE EXCEPTION 'Account deletion failed: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_account() TO authenticated;

-- Comment on function
COMMENT ON FUNCTION delete_account() IS 
'Permanently deletes the calling user''s account and all associated data. 
This operation is irreversible. Deletes:
- Profile data
- Posts, comments, likes, reactions
- Routine data and history
- Community memberships and owned communities
- Follow relationships
- Notifications
- Reports
- Settings
- Auth user
SECURITY DEFINER allows deletion of auth.users table.';
