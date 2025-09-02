import { DjangoService } from './DjangoService';
import { User } from './AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BackendUser {
  id: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  start_date: string;
  current_day: number;
  is_onboarding_complete: boolean;
  is_admin: boolean;
  date_joined: string;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  name?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export class BackendAuthService {
  private static instance: BackendAuthService;
  private static readonly USER_KEY = 'rise_backend_user';
  private static readonly TOKEN_KEY = 'rise_backend_token';
  private djangoService: DjangoService;

  private constructor() {
    this.djangoService = DjangoService.getInstance();
  }

  public static getInstance(): BackendAuthService {
    if (!BackendAuthService.instance) {
      BackendAuthService.instance = new BackendAuthService();
    }
    return BackendAuthService.instance;
  }

  /**
   * Register a new user
   */
  async registerUser(userData: UserRegistrationData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('BackendAuthService: Registering user with Django backend...');
      
      const registrationData = {
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        password: userData.password,
        password_confirm: userData.password,
      };

      const response = await this.djangoService.registerUser(registrationData);
      
      // Convert Django user to frontend User format
      const frontendUser: User = {
        id: response.user.id.toString(),
        email: response.user.email,
        name: response.user.name,
        startDate: response.user.start_date,
        currentDay: response.user.current_day,
        isOnboardingComplete: response.user.is_onboarding_complete,
        isAuthenticated: true,
        isAdmin: response.user.is_admin,
      };

      console.log('BackendAuthService: User registered successfully:', frontendUser.email);
      return { success: true, user: frontendUser };
    } catch (error: any) {
      console.error('BackendAuthService: Registration error:', error);
      return { success: false, error: error.message || 'Failed to create user account' };
    }
  }

  /**
   * Login user with email and password
   */
  async loginUser(credentials: UserLoginData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('BackendAuthService: Logging in user with Django backend...');
      
      const loginData = {
        email: credentials.email,
        password: credentials.password,
      };

      const response = await this.djangoService.loginUser(loginData);
      
      // Convert Django user to frontend User format
      const frontendUser: User = {
        id: response.user.id.toString(),
        email: response.user.email,
        name: response.user.name,
        startDate: response.user.start_date,
        currentDay: response.user.current_day,
        isOnboardingComplete: response.user.is_onboarding_complete,
        isAuthenticated: true,
        isAdmin: response.user.is_admin,
      };

      console.log('BackendAuthService: User logged in successfully:', frontendUser.email);
      return { success: true, user: frontendUser };
    } catch (error: any) {
      console.error('BackendAuthService: Login error:', error);
      return { success: false, error: error.message || 'Invalid email or password' };
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<{ success: boolean; users?: BackendUser[]; error?: string }> {
    try {
      const users = await this.djangoService.getAllUsers();
      
      // Convert Django users to BackendUser format
      const backendUsers: BackendUser[] = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        start_date: user.start_date,
        current_day: user.current_day,
        is_onboarding_complete: user.is_onboarding_complete,
        is_admin: user.is_admin,
        date_joined: user.date_joined,
      }));

      return { success: true, users: backendUsers };
    } catch (error: any) {
      console.error('BackendAuthService: Error fetching users:', error);
      return { success: false, error: error.message || 'Failed to fetch users' };
    }
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      await this.djangoService.toggleUserStatus(parseInt(userId));
      return { success: true };
    } catch (error: any) {
      console.error('BackendAuthService: Error updating user status:', error);
      return { success: false, error: error.message || 'Failed to update user status' };
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.djangoService.deleteUser(parseInt(userId));
      return { success: true };
    } catch (error: any) {
      console.error('BackendAuthService: Error deleting user:', error);
      return { success: false, error: error.message || 'Failed to delete user' };
    }
  }

  /**
   * Get current user from local storage
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(BackendAuthService.USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        return user.isAuthenticated ? user : null;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.djangoService.logout();
      await AsyncStorage.removeItem(BackendAuthService.USER_KEY);
      await AsyncStorage.removeItem(BackendAuthService.TOKEN_KEY);
      console.log('BackendAuthService: User logged out successfully');
    } catch (error) {
      console.error('BackendAuthService: Error during logout:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.djangoService.isAuthenticated();
  }

  /**
   * Store user data locally
   */
  private async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(BackendAuthService.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('BackendAuthService: Error storing user:', error);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<BackendUser>): Promise<{ success: boolean; error?: string }> {
    try {
      const djangoUpdates = {
        name: updates.name,
        first_name: updates.first_name,
        last_name: updates.last_name,
        current_day: updates.current_day,
        is_onboarding_complete: updates.is_onboarding_complete,
      };

      await this.djangoService.updateUserProfile(djangoUpdates);
      return { success: true };
    } catch (error: any) {
      console.error('BackendAuthService: Error updating user profile:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  }
}
