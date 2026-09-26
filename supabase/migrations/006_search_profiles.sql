-- 006_search_profiles.sql
-- Server-side profile search RPC (privacy: avoid exposing all profiles to client)

CREATE OR REPLACE FUNCTION search_profiles(p_query text, p_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  nickname text,
  bio text,
  avatar_url text,
  followed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  -- Require authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Search by nickname (case-insensitive, prefix or contains)
  RETURN QUERY
  SELECT 
    p.id,
    p.nickname,
    COALESCE(p.bio, '') as bio,
    p.avatar_url,
    EXISTS(SELECT 1 FROM follows WHERE follower_id = v_user_id AND following_id = p.id) as followed
  FROM profiles p
  WHERE 
    p.id != v_user_id
    AND (
      p.nickname ILIKE '%' || p_query || '%'
      OR p.bio ILIKE '%' || p_query || '%'
    )
    AND (
      -- Public profiles
      p.profile_visibility = 'public'
      -- OR followers-only if already following
      OR (p.profile_visibility = 'followers' AND EXISTS(SELECT 1 FROM follows WHERE follower_id = v_user_id AND following_id = p.id))
      -- OR already following each other
      OR EXISTS(SELECT 1 FROM follows WHERE follower_id = p.id AND following_id = v_user_id)
    )
  ORDER BY 
    -- Exact match first, then prefix, then contains
    CASE 
      WHEN LOWER(p.nickname) = LOWER(p_query) THEN 0
      WHEN LOWER(p.nickname) LIKE LOWER(p_query) || '%' THEN 1
      ELSE 2
    END,
    p.nickname
  LIMIT p_limit;
END;
$$;

-- Grant to authenticated users only
REVOKE ALL ON FUNCTION search_profiles(text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION search_profiles(text, int) TO authenticated;

COMMENT ON FUNCTION search_profiles IS 'Server-side profile search with privacy controls. Respects profile_visibility settings.';
