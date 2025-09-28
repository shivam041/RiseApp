import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthBackend from './AuthBackend';
import { BackendAuthService } from './BackendAuthService';

export interface User {
  id: string;
  email: string;
  name?: string;
  startDate: string;
  currentDay: number;
  isOnboardingComplete: boolean;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private static instance: AuthService;
  private static readonly USER_KEY = 'rise_user';
  private static readonly TOKEN_KEY = 'rise_token';
  private static readonly CREDENTIALS_KEY = 'rise_credentials';
  private static readonly ONBOARDING_KEY_PREFIX = 'onboarding_complete_';
  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Persist a local onboarding-complete flag keyed by email as a robust fallback
   */
  private async setLocalOnboardingComplete(email: string, isComplete: boolean): Promise<void> {
    try {
      if (!email) return;
      const key = `${AuthService.ONBOARDING_KEY_PREFIX}${email.toLowerCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify({ isComplete }));
    } catch (error) {
      console.warn('AuthService: Failed setting local onboarding flag', error);
    }
  }

  private async getLocalOnboardingComplete(email: string): Promise<boolean> {
    try {
      if (!email) return false;
      const key = `${AuthService.ONBOARDING_KEY_PREFIX}${email.toLowerCase()}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return parsed?.isComplete === true;
    } catch (error) {
      console.warn('AuthService: Failed reading local onboarding flag', error);
      return false;
    }
  }

  /**
   * Compute effective onboarding status and day from local storage.
   * Treat onboarding as complete if the local flag is set OR any user-specific data exists.
   */
  private async getEffectiveLocalState(email: string): Promise<{ isOnboardingComplete: boolean; currentDay?: number }> {
    try {
      if (!email) return { isOnboardingComplete: false };
      const lower = email.toLowerCase();
      const onboarding = await this.getLocalOnboardingComplete(lower);
      const [q, dp, cd] = await Promise.all([
        AsyncStorage.getItem(`questionnaire_${lower}`),
        AsyncStorage.getItem(`dailyProgress_${lower}`),
        AsyncStorage.getItem(`currentDay_${lower}`),
      ]);
      const hasQuestionnaire = !!q;
      const daily = dp ? JSON.parse(dp) : null;
      const storedDay = cd ? parseInt(cd, 10) : undefined;
      let currentDay: number | undefined = storedDay;
      if (!currentDay && Array.isArray(daily) && daily.length > 0) {
        // Use length as a simple day indicator fallback
        currentDay = Math.max(1, Math.min(66, daily.length));
      }
      const isComplete = onboarding || hasQuestionnaire || (Array.isArray(daily) && daily.length > 0);
      return { isOnboardingComplete: isComplete, currentDay };
    } catch (e) {
      console.warn('AuthService: getEffectiveLocalState failed', e);
      return { isOnboardingComplete: false };
    }
  }

  // Simulate user database (in a real app, this would be an API call)
  private mockUsers: User[] = [
    {
      id: 'user-1',
      email: 'demo@rise.com',
      name: 'Demo User',
      startDate: new Date().toISOString(),
      currentDay: 1,
      isOnboardingComplete: false,
      isAuthenticated: false,
    },
    {
      id: 'user-2',
      email: 'test@rise.com',
      name: 'Test User',
      startDate: new Date().toISOString(),
      currentDay: 5,
      isOnboardingComplete: true,
      isAuthenticated: false,
    },
    {
      id: 'admin-1',
      email: 'admin@gmail.com',
      name: 'Admin User',
      startDate: new Date().toISOString(),
      currentDay: 1,
      isOnboardingComplete: true,
      isAuthenticated: false,
      isAdmin: true,
    },
  ];

  // Simulate password database (in a real app, this would be hashed and stored securely)
  private mockPasswords: { [email: string]: string } = {
    'demo@rise.com': 'Demo123!',
    'test@rise.com': 'Test123!',
    'admin@gmail.com': 'admin1234',
  };

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      console.log('AuthService: Login attempt for email:', email);
      

      // Try Django backend first
      try {
        const backendAuth = BackendAuthService.getInstance();
        const result = await backendAuth.loginUser({ email, password });
        
        if (result.success && result.user) {
          console.log('Django backend login successful:', result.user.email);
          
          // Store user data
          await this.storeUser(result.user);
          await this.storeToken(this.generateToken(result.user));
          await this.storeCredentials({ email, password });
          
          return result.user;
        } else {
          console.warn('Django backend login failed:', result.error);
        }
      } catch (backendError) {
        console.warn('Django backend auth failed, falling back to mock auth:', backendError);
        // If it's a network error, continue with local auth
        if (backendError instanceof TypeError && backendError.message.includes('Failed to fetch')) {
          console.warn('Network error during backend auth, using local auth only');
        }
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists and password matches
      const user = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      const storedPassword = this.mockPasswords[email.toLowerCase()];

      if (!user || storedPassword !== password) {
        // Check if user exists in storage (for users who completed questionnaire)
        const storedUser = await this.getCurrentUser();
        if (storedUser && storedUser.email.toLowerCase() === email.toLowerCase()) {
          // For now, allow login for any stored user (in real app, verify password)
          const authenticatedUser: User = {
            ...storedUser,
            isAuthenticated: true,
          };

          // Store user data and token
          await this.storeUser(authenticatedUser);
          await this.storeToken(this.generateToken(authenticatedUser));
          await this.storeCredentials({ email, password });

          return authenticatedUser;
        }
        
        throw new Error('Invalid email or password');
      }

      // Update user authentication status
      const authenticatedUser: User = {
        ...user,
        isAuthenticated: true,
      };

      // Merge effective local onboarding/day
      try {
        const effective = await this.getEffectiveLocalState(authenticatedUser.email);
        if (effective.isOnboardingComplete && !authenticatedUser.isOnboardingComplete) {
          authenticatedUser.isOnboardingComplete = true;
        }
        if (effective.currentDay && !authenticatedUser.currentDay) {
          authenticatedUser.currentDay = effective.currentDay;
        }
      } catch {}

      // Store user data and token
      await this.storeUser(authenticatedUser);
      await this.storeToken(this.generateToken(authenticatedUser));
      await this.storeCredentials({ email, password });

      return authenticatedUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string): Promise<User> {
    try {
      console.log('AuthService: Registration attempt for email:', email);
      

      // Try Django backend first
      try {
        const backendAuth = BackendAuthService.getInstance();
        const result = await backendAuth.registerUser({ email, password });
        
        if (result.success && result.user) {
          console.log('Django backend registration successful:', result.user.email);
          
          // Store user data
          await this.storeUser(result.user);
          await this.storeToken(this.generateToken(result.user));
          await this.storeCredentials({ email, password });
          
          return result.user;
        } else {
          console.warn('Django backend registration failed:', result.error);
        }
      } catch (backendError) {
        console.warn('Django backend registration failed, falling back to mock auth:', backendError);
        // Fall back to mock auth if backend fails
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        startDate: new Date().toISOString(),
        currentDay: 1,
        isOnboardingComplete: false,
        isAuthenticated: true,
      };

      // Add to mock database
      this.mockUsers.push(newUser);
      this.mockPasswords[email.toLowerCase()] = password;

      // Store user data and token
      await this.storeUser(newUser);
      await this.storeToken(this.generateToken(newUser));
      await this.storeCredentials({ email, password });

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Clear all user data from storage
   */
  async clearUserData(): Promise<void> {
    try {
      console.log('AuthService: clearUserData called');
      
      // Get current user before clearing to access email for user-specific keys
      const currentUser = await this.getCurrentUser();
      console.log('AuthService: Current user in clearUserData:', currentUser);
      
      // Clear basic auth keys
      const basicKeys = [AuthService.USER_KEY, AuthService.TOKEN_KEY, AuthService.CREDENTIALS_KEY];
      console.log('AuthService: Clearing basic auth keys:', basicKeys);
      await AsyncStorage.multiRemove(basicKeys);
      
      // If we have a current user, also clear user-specific data keys
      if (currentUser?.email) {
        const userSpecificKeys = [
          `goals_${currentUser.email}`,
          `notes_${currentUser.email}`,
          `calendarTasks_${currentUser.email}`,
          `currentDay_${currentUser.email}`,
          `lastMidnightCheck_${currentUser.email}`,
          `dailyProgress_${currentUser.email}`,
          `questionnaire_${currentUser.email}`,
        ];
        
        console.log('AuthService: Clearing user-specific keys:', userSpecificKeys);
        await AsyncStorage.multiRemove(userSpecificKeys);
      }
      
      console.log('AuthService: All user data cleared successfully');
    } catch (error) {
      console.error('Clear user data error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    console.log('AuthService: logout() called');
    try {
      
      if (AuthBackend.isEnabled()) {
        console.log('AuthService: Backend enabled, calling signOut');
        await AuthBackend.signOut();
      }
      
      console.log('AuthService: Clearing stored data');
      // Clear stored data (this now includes user-specific data)
      await this.clearUserData();
      
      console.log('AuthService: Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      
      // Try Django backend first
      try {
        const backendAuth = BackendAuthService.getInstance();
        const isAuthenticated = await backendAuth.isAuthenticated();
        
        if (isAuthenticated) {
          const currentUser = await backendAuth.getCurrentUser();
          if (currentUser) {
            await this.storeUser(currentUser);
            return true;
          }
        }
      } catch (backendError) {
        console.warn('Django backend auth check failed:', backendError);
        // Don't throw error, just continue with local auth
      }
      
      const user = await this.getCurrentUser();
      console.log('AuthService: Checking stored user for authentication:', user);
      
      // Check if we have a stored user with authentication status
      const isAuth = !!(user && user.isAuthenticated === true);
      console.log('AuthService: Authentication result from stored user:', isAuth);
      
      // If user exists but isAuthenticated is not explicitly true, return false
      if (user && user.isAuthenticated !== true) {
        console.log('User exists but is not authenticated, returning false');
        return false;
      }
      
      return isAuth;
    } catch (error) {
      console.error('Authentication check error:', error);
      // If there's a network error (like DNS resolution), return false and continue with local auth
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Network error during authentication check, using local auth only');
        return false;
      }
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      
      // Fallback to local storage
      const userData = await AsyncStorage.getItem(AuthService.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Get all registered users (combines mock users with local storage)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      // Get all mock users
      const allUsers = [...this.mockUsers];
      
      // Get current user from storage
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        // Check if current user is not already in mock users
        const existingUserIndex = allUsers.findIndex(u => u.email === currentUser.email);
        if (existingUserIndex >= 0) {
          // Update existing user with latest data
          allUsers[existingUserIndex] = currentUser;
        } else {
          // Add new user to the list
          allUsers.push(currentUser);
        }
      }
      
      return allUsers;
    } catch (error) {
      console.error('Get all users error:', error);
      return this.mockUsers; // Fallback to mock users only
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Get user by email error:', error);
      return null;
    }
  }

  /**
   * Get stored authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AuthService.TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * Store user data in AsyncStorage
   */
  public async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Store user error:', error);
      throw error;
    }
  }

  /**
   * Store authentication token in AsyncStorage
   */
  private async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AuthService.TOKEN_KEY, token);
    } catch (error) {
      console.error('Store token error:', error);
      throw error;
    }
  }

  /**
   * Store user credentials in AsyncStorage (for demo purposes)
   */
  private async storeCredentials(credentials: AuthCredentials): Promise<void> {
    try {
      await AsyncStorage.setItem(AuthService.CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Store credentials error:', error);
      throw error;
    }
  }

  /**
   * Get stored credentials
   */
  async getStoredCredentials(): Promise<AuthCredentials | null> {
    try {
      const credentialsData = await AsyncStorage.getItem(AuthService.CREDENTIALS_KEY);
      return credentialsData ? JSON.parse(credentialsData) : null;
    } catch (error) {
      console.error('Get stored credentials error:', error);
      return null;
    }
  }

  /**
   * Generate a mock authentication token
   */
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      timestamp: Date.now(),
    };
    return `mock_token_${btoa(JSON.stringify(payload))}`;
  }

  /**
   * Validate stored token (in a real app, this would verify with backend)
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Simulate token validation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, accept any token that starts with "mock_token_"
      return token.startsWith('mock_token_');
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return null;
      }

      const newToken = this.generateToken(user);
      await this.storeToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  /**
   * Change user password
   */
  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify old password
      const storedPassword = this.mockPasswords[email.toLowerCase()];
      if (storedPassword !== oldPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      this.mockPasswords[email.toLowerCase()] = newPassword;

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(email: string): Promise<boolean> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists
      const user = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new password (in real app, send email)
      const newPassword = `Reset${Date.now()}`;
      this.mockPasswords[email.toLowerCase()] = newPassword;

      console.log('Password reset successful. New password:', newPassword);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in mock database
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user
      this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...updates };

      // Update stored user if it's the current user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        await this.storeUser(updatedUser);
        return updatedUser;
      }

      return this.mockUsers[userIndex];
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<boolean> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove user from mock database
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const user = this.mockUsers[userIndex];
      
      // Remove password
      delete this.mockPasswords[user.email.toLowerCase()];
      
      // Remove user
      this.mockUsers.splice(userIndex, 1);

      // Clear stored data
      await this.clearUserData();

      return true;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  /**
   * Check if user is admin
   */
  async isUserAdmin(email: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      return user?.isAdmin === true;
    } catch (error) {
      console.error('Check admin status error:', error);
      return false;
    }
  }

  /**
   * Get remembered login credentials
   */
  async getRememberedLogin(): Promise<{ email: string; password: string } | null> {
    try {
      const rememberedData = await AsyncStorage.getItem('rise_remembered_login');
      return rememberedData ? JSON.parse(rememberedData) : null;
    } catch (error) {
      console.error('Get remembered login error:', error);
      return null;
    }
  }

  /**
   * Set remembered login credentials
   */
  async setRememberedLogin(email: string, password: string): Promise<void> {
    try {
      await AsyncStorage.setItem('rise_remembered_login', JSON.stringify({ email, password }));
    } catch (error) {
      console.error('Set remembered login error:', error);
      throw error;
    }
  }

  /**
   * Update user onboarding status
   */
  async updateUserOnboardingStatus(email: string, isComplete: boolean): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.email === email) {
        const updatedUser: User = {
          ...currentUser,
          isOnboardingComplete: isComplete,
        };
        await this.storeUser(updatedUser);
        if (AuthBackend.isEnabled()) {
          await AuthBackend.updateOnboardingComplete(updatedUser.id, isComplete);
        }
      }
    } catch (error) {
      console.error('Update onboarding status error:', error);
      throw error;
    }
  }

  /**
   * Clear remembered login credentials
   */
  async clearRememberedLogin(): Promise<void> {
    try {
      await AsyncStorage.removeItem('rise_remembered_login');
    } catch (error) {
      console.error('Clear remembered login error:', error);
      throw error;
    }
  }

  /**
   * Get demo credentials for testing
   */
  getDemoCredentials(): { email: string; password: string }[] {
    return [
      { email: 'demo@rise.com', password: 'Demo123!' },
      { email: 'test@rise.com', password: 'Test123!' },
      { email: 'admin@gmail.com', password: 'admin1234' },
    ];
  }

  /**
   * Export all users data (for admin purposes)
   */
  async exportAllUsersData(): Promise<{
    users: User[];
    totalUsers: number;
    mockUsers: number;
    registeredUsers: number;
    exportDate: string;
  }> {
    try {
      const allUsers = await this.getAllUsers();
      const mockUsersCount = this.mockUsers.length;
      const registeredUsersCount = allUsers.length - mockUsersCount;
      
      return {
        users: allUsers,
        totalUsers: allUsers.length,
        mockUsers: mockUsersCount,
        registeredUsers: registeredUsersCount,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Export users data error:', error);
      throw error;
    }
  }

  /**
   * Clear all user data (for testing/reset purposes)
   */
  async clearAllUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        AuthService.USER_KEY,
        AuthService.TOKEN_KEY,
        AuthService.CREDENTIALS_KEY,
      ]);
      console.log('All user data cleared');
    } catch (error) {
      console.error('Clear user data error:', error);
      throw error;
    }
  }
} 