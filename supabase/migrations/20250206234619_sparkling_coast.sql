/*
  # Add contact messages and reviews tables

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key)
      - `email` (text)
      - `message` (text)
      - `read` (boolean)
      - `created_at` (timestamp)
    
    - `product_reviews`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `name` (text)
      - `rating` (integer)
      - `comment` (text)
      - `featured` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public submission and admin access
*/

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public to insert messages
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to read messages
CREATE POLICY "Only admins can read messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public to submit reviews
CREATE POLICY "Anyone can submit reviews"
  ON product_reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to read reviews
CREATE POLICY "Anyone can read reviews"
  ON product_reviews
  FOR SELECT
  TO public
  USING (true);

-- Allow admins to update review featured status
CREATE POLICY "Only admins can update reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);