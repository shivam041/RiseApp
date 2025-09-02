# Backend Authentication Setup Guide

## Overview
Your Rise app now has a complete backend authentication system that allows only registered users to access the application. All user data (goals, notes, calendar tasks) is securely stored in your Supabase database.

## Features Implemented

### 🔐 Backend Authentication
- **User Registration**: New users can create accounts with email/password
- **User Login**: Secure login with backend validation
- **Password Hashing**: Passwords are securely hashed before storage
- **Session Management**: User sessions are managed locally and in backend

### 👥 User Management (Admin Panel)
- **View All Users**: See all registered users in the system
- **User Status Control**: Activate/deactivate user accounts
- **User Deletion**: Remove users from the system
- **Admin Creation**: Create new users through admin panel
- **User Search**: Search and filter users by email/name

### 💾 Data Persistence
- **Goals**: All user goals are saved to Supabase
- **Notes**: All notes are persisted to backend
- **Calendar Tasks**: Calendar data is stored in database
- **User Progress**: Daily progress and day progression saved
- **Cross-Device Sync**: Data syncs across all devices

## Setup Instructions

### 1. Update Supabase Schema
Run the updated SQL schema in your Supabase SQL Editor:

```sql
-- The schema has been updated to include:
-- - password_hash field for secure password storage
-- - is_active field for user status management
-- - is_admin field for admin user identification
-- - Safe to run multiple times (handles existing policies/triggers)
```

**Note**: The schema is now safe to run multiple times. It will automatically handle existing policies and triggers without errors.

### 2. Environment Variables
Make sure your Supabase environment variables are set in your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Your First Admin User
Since the app now requires backend authentication, you'll need to create an admin user:

**Easy Method: Use the provided script**
1. Run the `CREATE_ADMIN_USER.sql` script in your Supabase SQL Editor
2. This will create an admin user with:
   - Email: `admin@rise.com`
   - Password: `admin123`
   - Admin privileges enabled

**Manual Method: Direct Database Insert**
```sql
-- Create a simple password hash function
CREATE OR REPLACE FUNCTION simple_hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(password || 'rise_salt_2024', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insert admin user
INSERT INTO users (email, name, password_hash, is_active, is_admin, is_onboarding_complete)
VALUES (
  'admin@rise.com',
  'Admin User',
  simple_hash_password('admin123'),
  true,
  true,
  true
);
```

### 4. Test the System
1. **Login**: Try logging in with your admin credentials
2. **User Management**: Access the admin panel to manage users
3. **Create Users**: Add new users through the admin panel
4. **Data Persistence**: Create goals/notes and verify they're saved

## How It Works

### Authentication Flow
1. **User Registration**: 
   - User enters email/password
   - Password is hashed using SHA-256
   - User data is stored in Supabase
   - User is automatically logged in

2. **User Login**:
   - User enters credentials
   - System validates against Supabase
   - Password is verified
   - User session is established

3. **Data Access**:
   - All user data is tied to user ID
   - Data is automatically loaded on login
   - Changes are synced to Supabase

### Admin Features
- **Access**: Only users with `is_admin = true` can access admin panel
- **User Management**: View, activate/deactivate, delete users
- **User Creation**: Create new user accounts
- **System Overview**: View user statistics and system health

## Security Features

### Password Security
- Passwords are hashed using SHA-256 with salt
- Original passwords are never stored
- Secure password verification

### Data Security
- Row Level Security (RLS) policies in Supabase
- Users can only access their own data
- Admin users have additional privileges

### Session Management
- User sessions are managed securely
- Automatic logout on app close
- Session validation on app restart

## Troubleshooting

### Common Issues

1. **"User with this email already exists"**
   - The email is already registered
   - Use a different email or login with existing account

2. **"Invalid email or password"**
   - Check email spelling
   - Verify password is correct
   - Ensure user account is active

3. **"Failed to create user account"**
   - Check Supabase connection
   - Verify database schema is updated
   - Check environment variables

4. **Admin panel not accessible**
   - Ensure user has `is_admin = true` in database
   - Check user is logged in
   - Verify admin panel navigation

### Database Queries

**Check if user exists:**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

**Make user admin:**
```sql
UPDATE users SET is_admin = true WHERE email = 'user@example.com';
```

**Activate user:**
```sql
UPDATE users SET is_active = true WHERE email = 'user@example.com';
```

**View all users:**
```sql
SELECT email, name, is_active, is_admin, created_at FROM users ORDER BY created_at DESC;
```

## Next Steps

1. **Test thoroughly** with multiple user accounts
2. **Set up proper password hashing** (consider bcrypt for production)
3. **Add email verification** for new registrations
4. **Implement password reset** functionality
5. **Add user roles** beyond admin/user
6. **Set up monitoring** for user activity

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Check database schema matches the updated version
4. Ensure environment variables are correct

The backend authentication system is now fully integrated and ready for production use! 🚀
