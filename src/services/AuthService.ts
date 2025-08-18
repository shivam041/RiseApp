import AsyncStorage from '@react-native-async-storage/async-storage';

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

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
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
      await AsyncStorage.multiRemove([
        AuthService.USER_KEY,
        AuthService.TOKEN_KEY,
        AuthService.CREDENTIALS_KEY,
      ]);
    } catch (error) {
      console.error('Clear user data error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Clear stored data
      await this.clearUserData();
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
      const user = await this.getCurrentUser();
      console.log('AuthService.isAuthenticated - user:', user);
      // Check if we have a stored user with authentication status
      const isAuth = !!(user && user.isAuthenticated);
      console.log('AuthService.isAuthenticated - result:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
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

      // Update stored credentials
      await this.storeCredentials({ email, password: newPassword });

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Reset password (in a real app, this would send an email)
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

      // In a real app, this would send a password reset email
      console.log(`Password reset email sent to ${email}`);

      return true;
    } catch (error) {
      console.error('Reset password error:', error);
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
   * Get stored authentication credentials
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

export default AuthService; 