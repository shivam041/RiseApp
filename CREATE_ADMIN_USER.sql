-- Create Admin User Script
-- Run this AFTER running the main SUPABASE_SCHEMA.sql
-- This creates your first admin user for the backend authentication system

-- First, let's create a simple password hashing function
-- (In production, use proper bcrypt or similar)
CREATE OR REPLACE FUNCTION simple_hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple hash for demo purposes - in production use proper hashing
  RETURN encode(digest(password || 'rise_salt_2024', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create your first admin user
-- Replace 'admin@rise.com' with your desired admin email
-- Replace 'admin123' with your desired password
INSERT INTO users (
  email, 
  name, 
  password_hash, 
  is_active, 
  is_admin, 
  start_date, 
  current_day, 
  is_onboarding_complete
) VALUES (
  'admin@rise.com',                    -- Your admin email
  'Admin User',                        -- Admin name
  simple_hash_password('admin123'),    -- Your admin password (will be hashed)
  true,                               -- Active user
  true,                               -- Admin privileges
  NOW(),                              -- Start date
  1,                                  -- Current day
  true                                -- Onboarding complete
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- Verify the admin user was created
SELECT 
  email, 
  name, 
  is_active, 
  is_admin, 
  created_at 
FROM users 
WHERE email = 'admin@rise.com';

-- Clean up the temporary function
DROP FUNCTION IF EXISTS simple_hash_password(TEXT);

-- Success message
SELECT 'Admin user created successfully! You can now login with admin@rise.com' as message;
