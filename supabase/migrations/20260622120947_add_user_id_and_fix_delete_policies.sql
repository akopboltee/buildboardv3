
-- Add user_id to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop old permissive delete policies
DROP POLICY IF EXISTS "delete_all_posts" ON posts;
DROP POLICY IF EXISTS "delete_all_comments" ON comments;

-- New delete policies: only the owning authenticated user can delete
CREATE POLICY "delete_own_posts" ON posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "delete_own_comments" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Update insert policies to capture user_id for authenticated users
DROP POLICY IF EXISTS "insert_all_posts" ON posts;
DROP POLICY IF EXISTS "insert_all_comments" ON comments;

CREATE POLICY "insert_all_posts" ON posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "insert_all_comments" ON comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
