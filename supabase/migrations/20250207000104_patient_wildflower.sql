/*
  # Add contact info to site settings

  1. Changes
    - Add JSONB column `contact_info` to `site_settings` table with default empty object
    - Set default values for contact info fields

  2. Security
    - Inherits existing RLS policies from site_settings table
*/

-- Add contact_info column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_settings' AND column_name = 'contact_info'
  ) THEN
    ALTER TABLE site_settings 
    ADD COLUMN contact_info jsonb DEFAULT '{
      "email": "",
      "phone": "",
      "address": ""
    }'::jsonb;
  END IF;
END $$;