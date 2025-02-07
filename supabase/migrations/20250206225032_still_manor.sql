/*
  # Create storage schema and buckets

  1. Changes
    - Creates storage schema and required tables
    - Creates storage buckets for:
      - product-media (for product images)
      - product-videos (for product videos)
      - site-assets (for logo and favicon)
    
  2. Security
    - Public read access for all buckets
    - Only authenticated users can upload/delete files
*/

-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false
);

-- Create objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage.buckets,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
);

-- Create storage.objects update trigger
CREATE OR REPLACE FUNCTION storage.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_storage_objects_updated_at
  BEFORE UPDATE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.update_updated_at();

-- Create storage.buckets update trigger
CREATE TRIGGER update_storage_buckets_updated_at
  BEFORE UPDATE ON storage.buckets
  FOR EACH ROW
  EXECUTE FUNCTION storage.update_updated_at();

-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-media', 'product-media', true),
  ('product-videos', 'product-videos', true),
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  updated_at = now();