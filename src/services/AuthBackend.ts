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
    throw new Error('AuthBackend is disabled - use Django backend');
  }

  static async signIn(email: string, password: string): Promise<AppUser> {
    throw new Error('AuthBackend is disabled - use Django backend');
  }

  static async signOut(): Promise<void> {
    // No-op - AuthBackend is disabled
  }

  static async getSessionUser(): Promise<AppUser | null> {
    return null; // AuthBackend is disabled
  }

  static async upsertProfile(profile: Profile): Promise<void> {
    // No-op - AuthBackend is disabled
  }

  static async getOrCreateProfile(id: string, email: string): Promise<Profile> {
    throw new Error('AuthBackend is disabled - use Django backend');
  }

  static async updateOnboardingComplete(id: string, complete: boolean): Promise<void> {
    // No-op - AuthBackend is disabled
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


