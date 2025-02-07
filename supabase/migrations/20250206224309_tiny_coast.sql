/*
  # Add site settings table
  
  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `site_name` (text)
      - `logo_url` (text)
      - `favicon_url` (text)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `site_settings` table
    - Add policies for authenticated users to manage settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'MyBae',
  logo_url text,
  favicon_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow admin write access
CREATE POLICY "Only admins can modify site settings"
  ON site_settings
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings if none exist
INSERT INTO site_settings (site_name)
SELECT 'MyBae'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);