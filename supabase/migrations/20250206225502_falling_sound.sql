/*
  # Storage Policies Setup

  1. Changes
    - Add RLS policies for storage buckets and objects
    - Enable secure access to storage buckets
    - Set up proper permissions for file management

  2. Security
    - Public read access for stored files
    - Authenticated users can manage files
    - Policies applied per bucket
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Bucket policies
  DROP POLICY IF EXISTS "Public buckets are viewable by everyone" ON storage.buckets;
  DROP POLICY IF EXISTS "Authenticated users can create buckets" ON storage.buckets;
  DROP POLICY IF EXISTS "Authenticated users can update buckets" ON storage.buckets;
  
  -- Object policies
  DROP POLICY IF EXISTS "Public objects are viewable by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_object THEN null;
END $$;

-- Create bucket policies
DO $$ 
BEGIN
  -- Public access policy
  CREATE POLICY "Public buckets are viewable by everyone"
    ON storage.buckets FOR SELECT
    USING ( public = true );

  -- Admin bucket management policies
  CREATE POLICY "Authenticated users can create buckets"
    ON storage.buckets FOR INSERT
    TO authenticated
    WITH CHECK ( true );

  CREATE POLICY "Authenticated users can update buckets"
    ON storage.buckets FOR UPDATE
    TO authenticated
    USING ( true );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create object policies
DO $$ 
BEGIN
  -- Public access policy
  CREATE POLICY "Public objects are viewable by everyone"
    ON storage.objects FOR SELECT
    USING ( bucket_id IN ( 
      SELECT id FROM storage.buckets WHERE public = true 
    ) );

  -- Admin object management policies
  CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK ( bucket_id IN ( 
      SELECT id FROM storage.buckets WHERE public = true 
    ) );

  CREATE POLICY "Authenticated users can update files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING ( bucket_id IN ( 
      SELECT id FROM storage.buckets WHERE public = true 
    ) );

  CREATE POLICY "Authenticated users can delete files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING ( bucket_id IN ( 
      SELECT id FROM storage.buckets WHERE public = true 
    ) );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;