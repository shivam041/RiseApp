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
    return true; // Enable Supabase authentication
  }

  static async signUp(email: string, password: string): Promise<AppUser> {
    // For now, fall back to mock authentication since Supabase isn't fully configured
    console.log('AuthBackend: signUp called, falling back to mock auth');
    throw new Error('Supabase not configured - use local authentication');
  }

  static async signIn(email: string, password: string): Promise<AppUser> {
    // For now, fall back to mock authentication since Supabase isn't fully configured
    console.log('AuthBackend: signIn called, falling back to mock auth');
    throw new Error('Supabase not configured - use local authentication');
  }

  static async signOut(): Promise<void> {
    console.log('AuthBackend: signOut called');
    // No-op for now
  }

  static async getSessionUser(): Promise<AppUser | null> {
    console.log('AuthBackend: getSessionUser called');
    return null; // No active session
  }

  static async upsertProfile(profile: Profile): Promise<void> {
    console.log('AuthBackend: upsertProfile called');
    // No-op for now
  }

  static async getOrCreateProfile(id: string, email: string): Promise<Profile> {
    console.log('AuthBackend: getOrCreateProfile called');
    throw new Error('Supabase not configured - use local authentication');
  }

  static async updateOnboardingComplete(id: string, complete: boolean): Promise<void> {
    console.log('AuthBackend: updateOnboardingComplete called');
    // No-op for now
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


