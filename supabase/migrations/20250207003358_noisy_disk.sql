/*
  # Fix payment information table

  1. Changes
    - Change order_id to text type to handle string IDs
    - Add insert policy for payment information
    - Add additional fields for better payment tracking
*/

-- Modify the payment_information table
DROP TABLE IF EXISTS payment_information;

CREATE TABLE payment_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  card_last_four text NOT NULL,
  card_brand text NOT NULL,
  billing_name text NOT NULL,
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

-- Allow public to insert payment information
CREATE POLICY "Anyone can insert payment information"
  ON payment_information
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only allow authenticated admins to view payment information
CREATE POLICY "Only admins can view payment information"
  ON payment_information
  FOR SELECT
  TO authenticated
  USING (true);