-- Rise App Database Schema
-- Run this in your Supabase SQL Editor
-- 
-- This schema is safe to run multiple times - it will update existing tables
-- and policies without errors. All DROP IF EXISTS statements ensure no conflicts.

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_day INTEGER DEFAULT 1,
  is_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  target TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  mood TEXT,
  mood_emoji TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar tasks table
CREATE TABLE IF NOT EXISTS calendar_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  duration INTEGER DEFAULT 30,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  is_completed BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily progress table
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_tasks INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  water_intake INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  screen_time_hours DECIMAL(4,2) DEFAULT 0,
  stress_level INTEGER DEFAULT 5,
  energy_level INTEGER DEFAULT 5,
  motivation_level INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_user_id ON calendar_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_id ON daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Notes policies
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Calendar tasks policies
DROP POLICY IF EXISTS "Users can view own calendar tasks" ON calendar_tasks;
CREATE POLICY "Users can view own calendar tasks" ON calendar_tasks
  FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own calendar tasks" ON calendar_tasks;
CREATE POLICY "Users can insert own calendar tasks" ON calendar_tasks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own calendar tasks" ON calendar_tasks;
CREATE POLICY "Users can update own calendar tasks" ON calendar_tasks
  FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own calendar tasks" ON calendar_tasks;
CREATE POLICY "Users can delete own calendar tasks" ON calendar_tasks
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Daily progress policies
DROP POLICY IF EXISTS "Users can view own daily progress" ON daily_progress;
CREATE POLICY "Users can view own daily progress" ON daily_progress
  FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own daily progress" ON daily_progress;
CREATE POLICY "Users can insert own daily progress" ON daily_progress
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own daily progress" ON daily_progress;
CREATE POLICY "Users can update own daily progress" ON daily_progress
  FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own daily progress" ON daily_progress;
CREATE POLICY "Users can delete own daily progress" ON daily_progress
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_tasks_updated_at ON calendar_tasks;
CREATE TRIGGER update_calendar_tasks_updated_at BEFORE UPDATE ON calendar_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_progress_updated_at ON daily_progress;
CREATE TRIGGER update_daily_progress_updated_at BEFORE UPDATE ON daily_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
