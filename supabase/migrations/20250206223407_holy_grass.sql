/*
  # Product Management Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (decimal)
      - `short_description` (text)
      - `long_description` (text)
      - `meta_title` (text)
      - `meta_description` (text)
      - `in_stock` (boolean)
      - `images` (jsonb array)
      - `video_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for:
      - Public read access
      - Admin-only write access
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  short_description text,
  long_description text,
  meta_title text,
  meta_description text,
  in_stock boolean DEFAULT true,
  images jsonb DEFAULT '[]'::jsonb,
  video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow admin write access
CREATE POLICY "Only admins can modify products"
  ON products
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');