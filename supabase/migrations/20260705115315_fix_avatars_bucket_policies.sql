-- Drop old avatar policies
DROP POLICY IF EXISTS avatars_upload ON storage.objects;
DROP POLICY IF EXISTS avatars_read ON storage.objects;
DROP POLICY IF EXISTS avatars_delete ON storage.objects;

-- Create proper avatar policies with path-based ownership
-- Users can only upload to avatars/avatars/{user_id}/
CREATE POLICY "avatars_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users can read their own avatars
CREATE POLICY "avatars_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Anyone can view avatars (for profile display)
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

-- Users can delete their own avatars
CREATE POLICY "avatars_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Grant storage access to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;