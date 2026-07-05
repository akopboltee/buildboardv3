
CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  media_url text,
  tag text NOT NULL CHECK (tag IN ('Code', 'Design', 'Music', 'Art', 'Writing', 'Game', 'Other')),
  author_name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all_posts" ON posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_all_posts" ON posts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_all_posts" ON posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_all_posts" ON posts FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "select_all_comments" ON comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_all_comments" ON comments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_all_comments" ON comments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_all_comments" ON comments FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_tag ON posts(tag);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at ASC);
