# Supabase Setup Guide for Rise App

## 1. Create Environment Variables

Create a `.env` file in your project root with your Supabase credentials:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Example:**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. Set Up Your Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `SUPABASE_SCHEMA.sql`
4. Run the SQL script to create all tables and policies

**Note:** The JWT secret is automatically managed by Supabase, so you don't need to set it manually.

## 3. Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Paste them in your `.env` file

## 4. Test the Connection

The app will automatically use Supabase when the environment variables are set. You can test by:

1. Starting the app
2. Going to Profile > Admin Panel (if you're an admin)
3. Checking the console for Supabase connection logs

## 5. Database Schema Overview

The schema creates these tables:

- **users**: User profiles and authentication status
- **goals**: User-defined goals and habits
- **notes**: Personal notes and journal entries
- **calendar_tasks**: Personal calendar and tasks
- **daily_progress**: Daily tracking and progress data

## 6. Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- JWT-based authentication
- Automatic user isolation

## 7. Migration from AsyncStorage

Once Supabase is configured:

1. Your existing AsyncStorage data will be preserved
2. New data will be saved to Supabase
3. You can gradually migrate existing data
4. The app will automatically sync between local and remote storage

## 8. Troubleshooting

**Common Issues:**

1. **Environment variables not loaded**: Restart your development server
2. **Database connection failed**: Check your Supabase URL and key
3. **Tables not created**: Run the SQL schema in Supabase SQL Editor
4. **Authentication errors**: Check RLS policies and user permissions

**Debug Steps:**

1. Check console for Supabase connection logs
2. Verify environment variables are loaded
3. Test database connection in Supabase dashboard
4. Check RLS policies are properly set

## 9. Benefits of Supabase

- **Persistent**: Data survives app restarts and device changes
- **Secure**: Row-level security and JWT authentication
- **Scalable**: Handles multiple users and large datasets
- **Real-time**: Can add real-time updates later
- **Backup**: Automatic database backups and versioning

## 10. Next Steps

After setup:

1. Test user registration and login
2. Verify goals are saved to database
3. Check that logout/login preserves data
4. Test data persistence across sessions

Your Rise app will now have enterprise-grade data persistence with Supabase!
