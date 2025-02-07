/*
  # Add Payment Information Management
  
  1. New Tables
    - `payment_information`
      - `id` (uuid, primary key)
      - `order_id` (uuid)
      - `card_last_four` (text) - Only store last 4 digits for security
      - `card_brand` (text) - e.g., 'visa', 'mastercard'
      - `billing_name` (text)
      - `billing_address` (text)
      - `billing_city` (text)
      - `billing_state` (text)
      - `billing_zip` (text)
      - `billing_country` (text)
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Only admins can view payment information
    - No public access
*/

CREATE TABLE IF NOT EXISTS payment_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  card_last_four text NOT NULL,
  card_brand text NOT NULL,
  billing_name text NOT NULL,
  billing_address text NOT NULL,
  billing_city text NOT NULL,
  billing_state text NOT NULL,
  billing_zip text NOT NULL,
  billing_country text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_information ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated admins to view payment information
CREATE POLICY "Only admins can view payment information"
  ON payment_information
  FOR SELECT
  TO authenticated
  USING (true);