/*
  # Create tables for media storage

  1. New Tables
    - product_media: For tracking product images
    - product_videos: For tracking product video URLs
    - site_assets: For tracking site logo and favicon URLs

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated write access
*/

-- Create tables for tracking media URLs
CREATE TABLE IF NOT EXISTS product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('logo', 'favicon')),
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for product_media
CREATE POLICY "Public can view product media"
  ON product_media
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert product media"
  ON product_media
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product media"
  ON product_media
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product media"
  ON product_media
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for product_videos
CREATE POLICY "Public can view product videos"
  ON product_videos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert product videos"
  ON product_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product videos"
  ON product_videos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product videos"
  ON product_videos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for site_assets
CREATE POLICY "Public can view site assets"
  ON site_assets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert site assets"
  ON site_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site assets"
  ON site_assets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site assets"
  ON site_assets
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_product_media_updated_at
  BEFORE UPDATE ON product_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_videos_updated_at
  BEFORE UPDATE ON product_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_assets_updated_at
  BEFORE UPDATE ON site_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();