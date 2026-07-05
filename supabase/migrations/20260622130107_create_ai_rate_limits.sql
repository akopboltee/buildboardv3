CREATE TABLE IF NOT EXISTS ai_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_rate_limits_identifier_window_idx
  ON ai_rate_limits (identifier, window_start);

ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "service_role_all_rate_limits" ON ai_rate_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Auto-clean records older than 2 hours
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM ai_rate_limits WHERE window_start < now() - interval '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
