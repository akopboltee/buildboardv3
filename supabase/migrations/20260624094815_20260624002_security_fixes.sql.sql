-- Security fixes from Supabase audit

-- Fix handle_new_user function with search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate RLS policies for posts with proper auth.uid() checks
DROP POLICY IF EXISTS select_posts ON posts;
DROP POLICY IF EXISTS insert_posts ON posts;
DROP POLICY IF EXISTS update_posts ON posts;
DROP POLICY IF EXISTS delete_posts ON posts;
DROP POLICY IF EXISTS public_select_posts ON posts;
DROP POLICY IF EXISTS anon_no_insert_posts ON posts;
DROP POLICY IF EXISTS anon_no_update_posts ON posts;
DROP POLICY IF EXISTS anon_no_delete_posts ON posts;

CREATE POLICY "select_posts" ON posts FOR SELECT
  USING (true);

CREATE POLICY "insert_posts" ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "update_posts" ON posts FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_posts" ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Fix RLS policies for comments with proper auth.uid() checks
DROP POLICY IF EXISTS select_comments ON comments;
DROP POLICY IF EXISTS insert_comments ON comments;
DROP POLICY IF EXISTS update_comments ON comments;
DROP POLICY IF EXISTS delete_comments ON comments;
DROP POLICY IF EXISTS public_select_comments ON comments;
DROP POLICY IF EXISTS anon_no_insert_comments ON comments;
DROP POLICY IF EXISTS anon_no_update_comments ON comments;
DROP POLICY IF EXISTS anon_no_delete_comments ON comments;

CREATE POLICY "select_comments" ON comments FOR SELECT
  USING (true);

CREATE POLICY "insert_comments" ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "update_comments" ON comments FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_comments" ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Revoke EXECUTE on functions from anon and authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
