-- Add full-text search indexes for posts and profiles
CREATE INDEX IF NOT EXISTS posts_title_search_idx ON posts USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS profiles_display_name_search_idx ON profiles USING GIN (to_tsvector('english', COALESCE(display_name, '')));
