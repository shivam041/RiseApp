-- Add Missing Columns Script
-- Run this FIRST before creating admin users
-- This adds the missing columns to your existing users table

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update existing users to have default values
UPDATE users 
SET 
  password_hash = encode(digest('temp_password_' || id, 'sha256'), 'hex'),
  is_active = true,
  is_admin = false
WHERE password_hash IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Missing columns added successfully! You can now run CREATE_ADMIN_USER.sql' as message;
