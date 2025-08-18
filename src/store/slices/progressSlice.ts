import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyProgress, Task, HabitStats, HabitCategory } from '../../types';

interface ProgressState {
  dailyProgress: DailyProgress[];
  currentDay: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  dailyProgress: [],
  currentDay: 1,
  isLoading: false,
  error: null,
};

export const loadDailyProgress = createAsyncThunk('progress/loadDailyProgress', async (_, { getState }) => {
  try {
    // Get current user from state to load their specific progress
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      console.log('No current user found, cannot load daily progress');
      return [];
    }
    
    const progressData = await AsyncStorage.getItem(`dailyProgress_${currentUser.email}`);
    console.log('Loading daily progress for user:', currentUser.email);
    return progressData ? JSON.parse(progressData) : [];
  } catch (error) {
    console.error('Failed to load daily progress:', error);
    throw new Error('Failed to load daily progress');
  }
});

export const saveDailyProgress = createAsyncThunk('progress/saveDailyProgress', async (dailyProgress: DailyProgress[], { getState }) => {
  try {
    // Get current user from state to save their specific progress
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      console.log('No current user found, cannot save daily progress');
      throw new Error('No current user found');
    }
    
    const storageKey = `dailyProgress_${currentUser.email}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(dailyProgress));
    console.log('Saved daily progress for user:', currentUser.email);
    return dailyProgress;
  } catch (error) {
    console.error('Failed to save daily progress:', error);
    throw new Error('Failed to save daily progress');
  }
});

export const completeTask = createAsyncThunk('progress/completeTask', async ({ day, taskId }: { day: number; taskId: string }, { getState }) => {
  try {
    // Get current user from state to access their specific progress
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      throw new Error('No current user found');
    }
    
    const progressData = await AsyncStorage.getItem(`dailyProgress_${currentUser.email}`);
    if (!progressData) throw new Error('No progress data found');
    
    const dailyProgress: DailyProgress[] = JSON.parse(progressData);
    const dayIndex = dailyProgress.findIndex(d => d.day === day);
    
    if (dayIndex === -1) throw new Error('Day not found');
    
    const taskIndex = dailyProgress[dayIndex].tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');
    
    // Mark task as completed
    dailyProgress[dayIndex].tasks[taskIndex].isCompleted = true;
    dailyProgress[dayIndex].tasks[taskIndex].completedAt = new Date().toISOString();
    
    // Update completed tasks count
    dailyProgress[dayIndex].completedTasks = dailyProgress[dayIndex].tasks.filter(t => t.isCompleted).length;
    
    // Calculate streak
    let streak = 0;
    for (let i = dayIndex; i >= 0; i--) {
      if (dailyProgress[i].completedTasks > 0) {
        streak++;
      } else {
        break;
      }
    }
    dailyProgress[dayIndex].streak = streak;
    
    await AsyncStorage.setItem(`dailyProgress_${currentUser.email}`, JSON.stringify(dailyProgress));
    return dailyProgress;
  } catch (error) {
    console.error('Failed to complete task:', error);
    throw new Error('Failed to complete task');
  }
});

export const uncompleteTask = createAsyncThunk('progress/uncompleteTask', async ({ day, taskId }: { day: number; taskId: string }, { getState }) => {
  try {
    // Get current user from state to access their specific progress
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      throw new Error('No current user found');
    }
    
    const progressData = await AsyncStorage.getItem(`dailyProgress_${currentUser.email}`);
    if (!progressData) throw new Error('No progress data found');
    
    const dailyProgress: DailyProgress[] = JSON.parse(progressData);
    const dayIndex = dailyProgress.findIndex(d => d.day === day);
    
    if (dayIndex === -1) throw new Error('Day not found');
    
    const taskIndex = dailyProgress[dayIndex].tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');
    
    // Mark task as uncompleted
    dailyProgress[dayIndex].tasks[taskIndex].isCompleted = false;
    delete dailyProgress[dayIndex].tasks[taskIndex].completedAt;
    
    // Update completed tasks count
    dailyProgress[dayIndex].completedTasks = dailyProgress[dayIndex].tasks.filter(t => t.isCompleted).length;
    
    await AsyncStorage.setItem(`dailyProgress_${currentUser.email}`, JSON.stringify(dailyProgress));
    return dailyProgress;
  } catch (error) {
    console.error('Failed to uncomplete task:', error);
    throw new Error('Failed to uncomplete task');
  }
});

export const calculateHabitStats = createAsyncThunk('progress/calculateHabitStats', async (_, { getState }) => {
  try {
    // Get current user from state to access their specific progress
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      console.log('No current user found, cannot calculate habit stats');
      return [];
    }
    
    const progressData = await AsyncStorage.getItem(`dailyProgress_${currentUser.email}`);
    if (!progressData) return [];
    
    const dailyProgress: DailyProgress[] = JSON.parse(progressData);
    const categories: HabitCategory[] = ['sleep', 'water', 'exercise', 'mind', 'screenTime', 'shower'];
    const stats: HabitStats[] = [];
    
    categories.forEach(category => {
      let totalCompleted = 0;
      let currentStreak = 0;
      let longestStreak = 0;
      let lastCompleted: string | undefined;
      
      // Calculate stats for this category
      dailyProgress.forEach(day => {
        const categoryTasks = day.tasks.filter(t => t.category === category);
        const completedTasks = categoryTasks.filter(t => t.isCompleted).length;
        
        if (completedTasks > 0) {
          totalCompleted += completedTasks;
          currentStreak++;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          lastCompleted = day.date;
        } else {
          currentStreak = 0;
        }
      });
      
      const totalTasks = dailyProgress.reduce((sum, day) => 
        sum + day.tasks.filter(t => t.category === category).length, 0
      );
      
      stats.push({
        category,
        totalCompleted,
        currentStreak,
        longestStreak,
        completionRate: totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0,
        lastCompleted,
      });
    });
    
    console.log('Calculated habit stats for user:', currentUser.email);
    return stats;
  } catch (error) {
    console.error('Failed to calculate habit stats:', error);
    throw new Error('Failed to calculate habit stats');
  }
});

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setCurrentDay: (state, action: PayloadAction<number>) => {
      state.currentDay = action.payload;
    },
    setDailyProgress: (state, action: PayloadAction<DailyProgress[]>) => {
      state.dailyProgress = action.payload;
    },
    addDailyProgress: (state, action: PayloadAction<DailyProgress>) => {
      state.dailyProgress.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDailyProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadDailyProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyProgress = action.payload;
      })
      .addCase(loadDailyProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load progress';
      })
      .addCase(saveDailyProgress.fulfilled, (state, action) => {
        state.dailyProgress = action.payload;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.dailyProgress = action.payload;
      })
      .addCase(uncompleteTask.fulfilled, (state, action) => {
        state.dailyProgress = action.payload;
      });
  },
});

export const { setCurrentDay, setDailyProgress, addDailyProgress } = progressSlice.actions;
export default progressSlice.reducer; 