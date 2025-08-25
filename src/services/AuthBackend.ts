import { getSupabase } from './SupabaseClient';
import { User as AppUser } from './AuthService';

export interface Profile {
  id: string; // UUID from Supabase auth
  email: string;
  name?: string;
  start_date?: string;
  current_day?: number;
  is_onboarding_complete?: boolean;
  is_admin?: boolean;
}

export class AuthBackend {
  static isEnabled(): boolean {
    return !!getSupabase();
  }

  static async signUp(email: string, password: string): Promise<AppUser> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Backend not configured');

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) throw error || new Error('Signup failed');

    const profile: Profile = {
      id: data.user.id,
      email,
      start_date: new Date().toISOString(),
      current_day: 1,
      is_onboarding_complete: false,
      is_admin: false,
    };
    await this.upsertProfile(profile);

    return this.mapProfileToAppUser(profile, true);
  }

  static async signIn(email: string, password: string): Promise<AppUser> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Backend not configured');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error || new Error('Login failed');

    const profile = await this.getOrCreateProfile(data.user.id, email);
    return this.mapProfileToAppUser(profile, true);
  }

  static async signOut(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  static async getSessionUser(): Promise<AppUser | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const profile = await this.getOrCreateProfile(data.user.id, data.user.email || '');
    return this.mapProfileToAppUser(profile, true);
  }

  static async upsertProfile(profile: Profile): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Backend not configured');
    const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
    if (error) throw error;
  }

  static async getOrCreateProfile(id: string, email: string): Promise<Profile> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Backend not configured');
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error; // not found is ok
    if (data) return data as Profile;
    const profile: Profile = {
      id,
      email,
      start_date: new Date().toISOString(),
      current_day: 1,
      is_onboarding_complete: false,
      is_admin: false,
    };
    await this.upsertProfile(profile);
    return profile;
  }

  static async updateOnboardingComplete(id: string, complete: boolean): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase
      .from('profiles')
      .update({ is_onboarding_complete: complete })
      .eq('id', id);
    if (error) throw error;
  }

  private static mapProfileToAppUser(p: Profile, isAuthenticated: boolean): AppUser {
    return {
      id: p.id,
      email: p.email,
      name: p.name,
      startDate: p.start_date || new Date().toISOString(),
      currentDay: p.current_day || 1,
      isOnboardingComplete: !!p.is_onboarding_complete,
      isAuthenticated,
      isAdmin: !!p.is_admin,
    };
  }
}

export default AuthBackend;


