import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DjangoUser {
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

export interface DjangoGoal {
  id: number;
  title: string;
  description: string;
  category: string;
  value: string;
  target: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DjangoNote {
  id: number;
  title: string;
  content: string;
  category: string;
  mood: string;
  mood_emoji: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DjangoTask {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: string;
  status: string;
  is_completed: boolean;
  is_recurring: boolean;
  recurring_pattern: string;
  created_at: string;
  updated_at: string;
}

export interface DjangoDailyProgress {
  id: number;
  date: string;
  completed_tasks: number;
  total_tasks: number;
  stress_level: number;
  energy_level: number;
  motivation_level: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: DjangoUser;
  token: string;
  message: string;
}

export interface RegistrationData {
  email: string;
  name: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class DjangoService {
  private static instance: DjangoService;
  private static readonly BASE_URL = (process.env.EXPO_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api');
  private static readonly TOKEN_KEY = 'django_token';
  private static readonly USER_KEY = 'django_user';

  private constructor() {}

  public static getInstance(): DjangoService {
    if (!DjangoService.instance) {
      DjangoService.instance = new DjangoService();
    }
    return DjangoService.instance;
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem(DjangoService.TOKEN_KEY);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    return headers;
  }

  /**
   * Make API request (optionally authenticated)
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}, includeAuth: boolean = true): Promise<any> {
    const url = `${DjangoService.BASE_URL}${endpoint}`;
    const headers = includeAuth ? await this.getAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try to parse JSON error, else fall back to text for better diagnostics
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}));
        const message = (errorData && (errorData.error || errorData.detail)) || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      } else {
        const text = await response.text().catch(() => '');
        const message = text || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }
    }

    return response.json();
  }

  /**
   * Register a new user
   */
  async registerUser(userData: RegistrationData): Promise<AuthResponse> {
    const response = await this.makeRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);

    // Store token and user data
    await AsyncStorage.setItem(DjangoService.TOKEN_KEY, response.token);
    await AsyncStorage.setItem(DjangoService.USER_KEY, JSON.stringify(response.user));

    return response;
  }

  /**
   * Login user
   */
  async loginUser(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.makeRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);

    // Store token and user data
    await AsyncStorage.setItem(DjangoService.TOKEN_KEY, response.token);
    await AsyncStorage.setItem(DjangoService.USER_KEY, JSON.stringify(response.user));

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout/', {
        method: 'POST',
      });
    } catch (error) {
      console.log('Logout request failed:', error);
    } finally {
      // Clear local storage regardless
      await AsyncStorage.removeItem(DjangoService.TOKEN_KEY);
      await AsyncStorage.removeItem(DjangoService.USER_KEY);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<DjangoUser | null> {
    try {
      const userData = await AsyncStorage.getItem(DjangoService.USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(DjangoService.TOKEN_KEY);
    return !!token;
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<DjangoUser> {
    return this.makeRequest('/auth/profile/');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<DjangoUser>): Promise<DjangoUser> {
    const response = await this.makeRequest('/auth/update/', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    // Update stored user data
    await AsyncStorage.setItem(DjangoService.USER_KEY, JSON.stringify(response));

    return response;
  }

  // Goals API
  async getGoals(): Promise<DjangoGoal[]> {
    const response = await this.makeRequest('/goals/');
    return response.results || response;
  }

  async createGoal(goalData: Omit<DjangoGoal, 'id' | 'created_at' | 'updated_at'>): Promise<DjangoGoal> {
    return this.makeRequest('/goals/', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(goalId: number, updates: Partial<DjangoGoal>): Promise<DjangoGoal> {
    return this.makeRequest(`/goals/${goalId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteGoal(goalId: number): Promise<void> {
    await this.makeRequest(`/goals/${goalId}/`, {
      method: 'DELETE',
    });
  }

  async toggleGoalStatus(goalId: number): Promise<{ message: string; is_active: boolean }> {
    return this.makeRequest(`/goals/toggle-status/${goalId}/`, {
      method: 'POST',
    });
  }

  // Notes API
  async getNotes(): Promise<DjangoNote[]> {
    const response = await this.makeRequest('/notes/');
    return response.results || response;
  }

  async createNote(noteData: Omit<DjangoNote, 'id' | 'created_at' | 'updated_at'>): Promise<DjangoNote> {
    return this.makeRequest('/notes/', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(noteId: number, updates: Partial<DjangoNote>): Promise<DjangoNote> {
    return this.makeRequest(`/notes/${noteId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteNote(noteId: number): Promise<void> {
    await this.makeRequest(`/notes/${noteId}/`, {
      method: 'DELETE',
    });
  }

  async searchNotes(query: string): Promise<DjangoNote[]> {
    const response = await this.makeRequest(`/notes/search/?q=${encodeURIComponent(query)}`);
    return response.notes || [];
  }

  async toggleFavorite(noteId: number): Promise<{ message: string; is_favorite: boolean }> {
    return this.makeRequest(`/notes/toggle-favorite/${noteId}/`, {
      method: 'POST',
    });
  }

  // Tasks API
  async getTasks(): Promise<DjangoTask[]> {
    const response = await this.makeRequest('/tasks/');
    return response.results || response;
  }

  async createTask(taskData: Omit<DjangoTask, 'id' | 'created_at' | 'updated_at'>): Promise<DjangoTask> {
    return this.makeRequest('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: number, updates: Partial<DjangoTask>): Promise<DjangoTask> {
    return this.makeRequest(`/tasks/${taskId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: number): Promise<void> {
    await this.makeRequest(`/tasks/${taskId}/`, {
      method: 'DELETE',
    });
  }

  async getTasksByDate(date: string): Promise<DjangoTask[]> {
    return this.makeRequest(`/tasks/date/${date}/`);
  }

  async getUpcomingTasks(): Promise<DjangoTask[]> {
    return this.makeRequest('/tasks/upcoming/');
  }

  async toggleTaskCompletion(taskId: number): Promise<{ message: string; is_completed: boolean }> {
    return this.makeRequest(`/tasks/toggle-completion/${taskId}/`, {
      method: 'POST',
    });
  }

  // Daily Progress API
  async getDailyProgress(): Promise<DjangoDailyProgress[]> {
    const response = await this.makeRequest('/tasks/progress/');
    return response.results || response;
  }

  async createDailyProgress(progressData: Omit<DjangoDailyProgress, 'id' | 'created_at' | 'updated_at'>): Promise<DjangoDailyProgress> {
    return this.makeRequest('/tasks/progress/', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  }

  async updateDailyProgress(progressId: number, updates: Partial<DjangoDailyProgress>): Promise<DjangoDailyProgress> {
    return this.makeRequest(`/tasks/progress/${progressId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getProgressByDate(date: string): Promise<DjangoDailyProgress | null> {
    try {
      return await this.makeRequest(`/tasks/progress/date/${date}/`);
    } catch (error) {
      return null;
    }
  }

  // Admin API
  async getAllUsers(): Promise<DjangoUser[]> {
    return this.makeRequest('/auth/all/');
  }

  async toggleUserStatus(userId: number): Promise<{ message: string; is_active: boolean }> {
    return this.makeRequest(`/auth/toggle-status/${userId}/`, {
      method: 'POST',
    });
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    return this.makeRequest(`/auth/delete/${userId}/`, {
      method: 'DELETE',
    });
  }
}
