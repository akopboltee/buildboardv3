-- Add guest_id column for anonymous posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS guest_id TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS guest_id TEXT;

-- Add pronouns and platform links to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_anonymous BOOLEAN DEFAULT false;

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_guest_id TEXT,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  reported_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'user')),
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'inappropriate', 'misinformation', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create banned_words table
CREATE TABLE IF NOT EXISTS banned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add flagged column to posts and comments for moderation
ALTER TABLE posts ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_words ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocks
CREATE POLICY "blocks_select_own" ON blocks FOR SELECT
  TO authenticated USING (auth.uid() = blocker_id);

CREATE POLICY "blocks_insert_own" ON blocks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "blocks_delete_own" ON blocks FOR DELETE
  TO authenticated USING (auth.uid() = blocker_id);

-- RLS policies for reports (only service role can manage)
CREATE POLICY "reports_deny_all" ON reports FOR ALL USING (false);

-- RLS policies for banned_words (only service role can manage)
CREATE POLICY "banned_words_deny_all" ON banned_words FOR ALL USING (false);

-- Create index for guest_id lookups
CREATE INDEX IF NOT EXISTS idx_posts_guest_id ON posts(guest_id);
CREATE INDEX IF NOT EXISTS idx_comments_guest_id ON comments(guest_id);

-- Pre-populate common banned words
INSERT INTO banned_words (word) VALUES
  ('fuck'), ('shit'), ('asshole'), ('bitch'), ('bastard'),
  ('damn'), ('crap'), ('douche'), ('idiot'), ('moron')
ON CONFLICT (word) DO NOTHING;
