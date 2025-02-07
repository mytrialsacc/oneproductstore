/*
  # Create products table and add initial data

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
      - `images` (jsonb)
      - `video_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for:
      - Public read access
      - Admin-only write access

  3. Initial Data
    - Add default product
*/

-- Create products table if it doesn't exist
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

-- Enable RLS
DO $$ 
BEGIN
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
  DROP POLICY IF EXISTS "Only admins can modify products" ON products;
  
  CREATE POLICY "Products are viewable by everyone"
    ON products
    FOR SELECT
    TO public
    USING (true);
    
  CREATE POLICY "Only admins can modify products"
    ON products
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
END $$;

-- Insert default product if no products exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (
      name,
      price,
      short_description,
      long_description,
      meta_title,
      meta_description,
      in_stock,
      images,
      video_url
    ) VALUES (
      'Premium Product',
      99.99,
      'A high-quality product that exceeds expectations.',
      'Experience unparalleled quality with our premium product. Crafted with attention to detail and designed for those who appreciate excellence.',
      'Premium Product - Best Quality Guaranteed',
      'Discover our premium product offering exceptional quality and outstanding performance. Perfect for those seeking excellence.',
      true,
      '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"]',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    );
  END IF;
END $$;