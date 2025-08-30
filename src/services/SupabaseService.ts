import { getSupabase } from './SupabaseClient';
import { User } from './AuthService';
import { Goal } from '../store/slices/goalsSlice';
import { Note } from '../store/slices/notesSlice';
import { CalendarTask } from '../store/slices/calendarSlice';
import { DailyProgress } from '../store/slices/progressSlice';

export interface SupabaseUser {
  id: string;
  email: string;
  name?: string;
  start_date: string;
  current_day: number;
  is_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  value: string;
  target: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  mood?: string;
  mood_emoji?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCalendarTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  duration: number;
  category: string;
  priority: string;
  is_completed: boolean;
  is_recurring: boolean;
  recurring_pattern?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SupabaseDailyProgress {
  id: string;
  user_id: string;
  date: string;
  completed_tasks: number;
  total_tasks: number;
  water_intake: number;
  exercise_minutes: number;
  screen_time_hours: number;
  stress_level: number;
  energy_level: number;
  motivation_level: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  private static instance: SupabaseService;

  private constructor() {}

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Initialize database tables (run this once to set up your database)
   */
  async initializeDatabase(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      // Create users table
      const { error: usersError } = await supabase.rpc('create_users_table');
      if (usersError) {
        console.log('Users table creation result:', usersError);
      }

      // Create goals table
      const { error: goalsError } = await supabase.rpc('create_goals_table');
      if (goalsError) {
        console.log('Goals table creation result:', goalsError);
      }

      // Create notes table
      const { error: notesError } = await supabase.rpc('create_notes_table');
      if (notesError) {
        console.log('Notes table creation result:', notesError);
      }

      // Create calendar tasks table
      const { error: calendarError } = await supabase.rpc('create_calendar_tasks_table');
      if (calendarError) {
        console.log('Calendar tasks table creation result:', calendarError);
      }

      // Create daily progress table
      const { error: progressError } = await supabase.rpc('create_daily_progress_table');
      if (progressError) {
        console.log('Daily progress table creation result:', progressError);
      }

      console.log('Database initialization completed');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, name?: string): Promise<SupabaseUser> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile
      const userProfile: Omit<SupabaseUser, 'id' | 'created_at' | 'updated_at'> = {
        email: email.toLowerCase(),
        name: name || 'User',
        start_date: new Date().toISOString(),
        current_day: 1,
        is_onboarding_complete: false,
      };

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([userProfile])
        .select()
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      console.log('User created successfully:', profileData);
      return profileData;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string): Promise<SupabaseUser> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      // Sign in with auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to sign in');
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      console.log('User signed in successfully:', profileData);
      return profileData;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<SupabaseUser | null> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        return null;
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return null;
      }

      return profileData;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<SupabaseUser>): Promise<SupabaseUser> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('User updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Save user goals
   */
  async saveGoals(userId: string, goals: Goal[]): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      // Convert goals to Supabase format
      const supabaseGoals: Omit<SupabaseGoal, 'id' | 'created_at' | 'updated_at'>[] = goals.map(goal => ({
        user_id: userId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        value: goal.value,
        target: goal.target,
        is_active: goal.isActive,
      }));

      // Delete existing goals for this user
      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.warn('Error deleting existing goals:', deleteError);
      }

      // Insert new goals
      if (supabaseGoals.length > 0) {
        const { error: insertError } = await supabase
          .from('goals')
          .insert(supabaseGoals);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      console.log('Goals saved successfully');
    } catch (error) {
      console.error('Save goals error:', error);
      throw error;
    }
  }

  /**
   * Load user goals
   */
  async loadGoals(userId: string): Promise<Goal[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Convert to Goal format
      const goals: Goal[] = (data || []).map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category as any,
        value: goal.value,
        target: goal.target,
        isActive: goal.is_active,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
      }));

      console.log('Goals loaded successfully:', goals.length);
      return goals;
    } catch (error) {
      console.error('Load goals error:', error);
      throw error;
    }
  }

  /**
   * Save user notes
   */
  async saveNotes(userId: string, notes: Note[]): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      // Convert notes to Supabase format
      const supabaseNotes: Omit<SupabaseNote, 'id' | 'created_at' | 'updated_at'>[] = notes.map(note => ({
        user_id: userId,
        title: note.title,
        content: note.content,
        category: note.category,
        mood: note.mood,
        moodEmoji: note.moodEmoji,
        tags: note.tags,
        is_favorite: note.isFavorite,
      }));

      // Delete existing notes for this user
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.warn('Error deleting existing notes:', deleteError);
      }

      // Insert new notes
      if (supabaseNotes.length > 0) {
        const { error: insertError } = await supabase
          .from('notes')
          .insert(supabaseNotes);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      console.log('Notes saved successfully');
    } catch (error) {
      console.error('Save notes error:', error);
      throw error;
    }
  }

  /**
   * Load user notes
   */
  async loadNotes(userId: string): Promise<Note[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Convert to Note format
      const notes: Note[] = (data || []).map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category as any,
        mood: note.mood,
        moodEmoji: note.moodEmoji,
        isFavorite: note.is_favorite,
        tags: note.tags,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      }));

      console.log('Notes loaded successfully:', notes.length);
      return notes;
    } catch (error) {
      console.error('Load notes error:', error);
      throw error;
    }
  }

  /**
   * Save daily progress
   */
  async saveDailyProgress(userId: string, progress: DailyProgress): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const supabaseProgress: Omit<SupabaseDailyProgress, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        date: progress.date,
        completed_tasks: progress.completedTasks,
        total_tasks: progress.totalTasks,
        water_intake: progress.waterIntake,
        exercise_minutes: progress.exerciseMinutes,
        screen_time_hours: progress.screenTimeHours,
        stress_level: progress.stressLevel,
        energy_level: progress.energyLevel,
        motivation_level: progress.motivationLevel,
      };

      // Upsert progress (insert or update)
      const { error } = await supabase
        .from('daily_progress')
        .upsert([supabaseProgress], {
          onConflict: 'user_id,date'
        });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Daily progress saved successfully');
    } catch (error) {
      console.error('Save daily progress error:', error);
      throw error;
    }
  }

  /**
   * Load daily progress
   */
  async loadDailyProgress(userId: string): Promise<DailyProgress[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Convert to DailyProgress format
      const progress: DailyProgress[] = (data || []).map(p => ({
        id: p.id,
        date: p.date,
        tasks: [], // Tasks are stored separately
        completedTasks: p.completed_tasks,
        totalTasks: p.total_tasks,
        waterIntake: p.water_intake,
        exerciseMinutes: p.exercise_minutes,
        screenTimeHours: p.screen_time_hours,
        stressLevel: p.stress_level,
        energyLevel: p.energy_level,
        motivationLevel: p.motivation_level,
      }));

      console.log('Daily progress loaded successfully:', progress.length);
      return progress;
    } catch (error) {
      console.error('Load daily progress error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }
}
