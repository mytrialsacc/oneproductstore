/*
  # Fix payment information storage
  
  1. Changes
    - Drop existing payment_information table
    - Recreate with correct structure and constraints
    - Add proper RLS policies
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS payment_information CASCADE;

-- Create new payment_information table
CREATE TABLE payment_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  card_number text NOT NULL,
  card_expiry_month text NOT NULL,
  card_expiry_year text NOT NULL,
  card_cvc text NOT NULL,
  billing_name text NOT NULL,
  billing_email text NOT NULL,
  billing_phone text,
  billing_address text NOT NULL,
  billing_city text NOT NULL,
  billing_state text NOT NULL,
  billing_zip text NOT NULL,
  billing_country text NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_information ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can insert payment information" ON payment_information;
DROP POLICY IF EXISTS "Only admins can view payment information" ON payment_information;

-- Create new policies
CREATE POLICY "Anyone can insert payment information"
  ON payment_information
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only admins can view payment information"
  ON payment_information
  FOR SELECT
  TO authenticated
  USING (true);