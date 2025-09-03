export interface User {
  id: string;
  name?: string;
  email?: string;
  startDate: string;
  currentDay: number;
  isOnboardingComplete: boolean;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

export interface QuestionnaireResponse {
  sleepGoal: string;
  waterGoal: string;
  exerciseGoal: string;
  mindGoal: string;
  screenTimeGoal: string;
  showerGoal: string;
  wakeUpTime: string;
  bedTime: string;
  currentWaterIntake: number;
  currentExerciseMinutes: number;
  currentScreenTimeHours: number;
  stressLevel: number; // 1-10
  energyLevel: number; // 1-10
  motivationLevel: number; // 1-10
  extraTasks?: string[]; // Extra tasks selected during onboarding
}

export type HabitCategory = 'sleep' | 'water' | 'exercise' | 'mind' | 'screenTime' | 'shower';

export interface Task {
  id: string;
  day: number;
  category: HabitCategory;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  tips: string[];
}

export interface DailyProgress {
  day: number;
  date: string;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  streak: number;
  notes?: string;
}

export interface HabitStats {
  category: HabitCategory;
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  lastCompleted?: string;
}

export interface AppState {
  user: User | null;
  questionnaire: QuestionnaireResponse | null;
  currentDay: number;
  dailyProgress: DailyProgress[];
  habitStats: HabitStats[];
  isLoading: boolean;
  error: string | null;
}

export interface TaskTemplate {
  category: HabitCategory;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  tips: string[];
  dayRange: {
    start: number;
    end: number;
  };
} 