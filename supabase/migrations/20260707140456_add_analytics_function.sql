-- Create function for daily post counts (for analytics)
CREATE OR REPLACE FUNCTION get_daily_post_counts()
RETURNS TABLE(date text, count bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(created_at::date, 'YYYY-MM-DD') as date,
    COUNT(*)::bigint as count
  FROM posts
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY created_at::date
  ORDER BY created_at::date DESC;
END;
$$;

-- Add is_active column to banned_words if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'banned_words' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE banned_words ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add index for moderation_logs queries
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action_type ON moderation_logs(action_type);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_daily_post_counts() TO authenticated;