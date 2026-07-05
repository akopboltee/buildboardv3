-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Update bucket restrictions
UPDATE storage.buckets 
SET 
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'avatars';

-- Drop existing policies
DROP POLICY IF EXISTS allow_authenticated_upload ON storage.objects;
DROP POLICY IF EXISTS allow_authenticated_read ON storage.objects;
DROP POLICY IF EXISTS allow_owner_delete ON storage.objects;
DROP POLICY IF EXISTS allow_owner_update ON storage.objects;

-- Media bucket policies - allow both authenticated and anon
CREATE POLICY "media_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media-media');

CREATE POLICY "media_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media-media');

CREATE POLICY "media_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'media-media');

-- Avatars bucket policies
CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');
