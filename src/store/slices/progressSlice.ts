import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyProgress {
  id: string;
  date: string;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  waterIntake: number;
  exerciseMinutes: number;
  screenTimeHours: number;
  stressLevel: number;
  energyLevel: number;
  motivationLevel: number;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  difficulty: number;
  streak: number;
  repeat: string;
  description: string;
}

interface ProgressState {
  dailyProgress: DailyProgress[];
  currentDay: number;
  totalDays: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  dailyProgress: [],
  currentDay: 1,
  totalDays: 66,
  isLoading: false,
  error: null,
};

// Async thunk to load progress from AsyncStorage
export const loadDailyProgress = createAsyncThunk(
  'progress/loadDailyProgress',
  async () => {
    try {
      const storedProgress = await AsyncStorage.getItem('dailyProgress');
      const storedCurrentDay = await AsyncStorage.getItem('currentDay');
      
      if (storedProgress) {
        const dailyProgress = JSON.parse(storedProgress);
        const currentDay = storedCurrentDay ? parseInt(storedCurrentDay) : 1;
        
        return { dailyProgress, currentDay };
      }
      
      return { dailyProgress: [], currentDay: 1 };
    } catch (error) {
      console.error('Failed to load progress:', error);
      return { dailyProgress: [], currentDay: 1 };
    }
  }
);

// Async thunk to save progress to AsyncStorage
export const saveDailyProgress = createAsyncThunk(
  'progress/saveDailyProgress',
  async (progress: DailyProgress) => {
    try {
      const storedProgress = await AsyncStorage.getItem('dailyProgress');
      let dailyProgress = storedProgress ? JSON.parse(storedProgress) : [];
      
      // Update or add the progress
      const existingIndex = dailyProgress.findIndex((p: DailyProgress) => p.date === progress.date);
      if (existingIndex >= 0) {
        dailyProgress[existingIndex] = progress;
      } else {
        dailyProgress.push(progress);
      }
      
      await AsyncStorage.setItem('dailyProgress', JSON.stringify(dailyProgress));
      return progress;
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  }
);

// Async thunk to update current day
export const updateCurrentDay = createAsyncThunk(
  'progress/updateCurrentDay',
  async (day: number) => {
    try {
      await AsyncStorage.setItem('currentDay', day.toString());
      return day;
    } catch (error) {
      console.error('Failed to update current day:', error);
      throw error;
    }
  }
);

// Async thunk to complete a task
export const completeTask = createAsyncThunk(
  'progress/completeTask',
  async ({ date, taskId }: { date: string; taskId: string }) => {
    try {
      const storedProgress = await AsyncStorage.getItem('dailyProgress');
      let dailyProgress = storedProgress ? JSON.parse(storedProgress) : [];
      
      const progressIndex = dailyProgress.findIndex((p: DailyProgress) => p.date === date);
      if (progressIndex >= 0) {
        const taskIndex = dailyProgress[progressIndex].tasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
          dailyProgress[progressIndex].tasks[taskIndex].isCompleted = true;
          dailyProgress[progressIndex].completedTasks = dailyProgress[progressIndex].tasks.filter(t => t.isCompleted).length;
          
          await AsyncStorage.setItem('dailyProgress', JSON.stringify(dailyProgress));
          return dailyProgress[progressIndex];
        }
      }
      
      throw new Error('Task or progress not found');
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error;
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setCurrentDay: (state, action: PayloadAction<number>) => {
      state.currentDay = action.payload;
    },
    addDailyProgress: (state, action: PayloadAction<DailyProgress>) => {
      const existingIndex = state.dailyProgress.findIndex(p => p.date === action.payload.date);
      if (existingIndex >= 0) {
        state.dailyProgress[existingIndex] = action.payload;
      } else {
        state.dailyProgress.push(action.payload);
      }
    },
    updateTaskCompletion: (state, action: PayloadAction<{ date: string; taskId: string; isCompleted: boolean }>) => {
      const { date, taskId, isCompleted } = action.payload;
      const progress = state.dailyProgress.find(p => p.date === date);
      if (progress) {
        const task = progress.tasks.find(t => t.id === taskId);
        if (task) {
          task.isCompleted = isCompleted;
          progress.completedTasks = progress.tasks.filter(t => t.isCompleted).length;
        }
      }
    },
    updateWaterIntake: (state, action: PayloadAction<{ date: string; intake: number }>) => {
      const { date, intake } = action.payload;
      const progress = state.dailyProgress.find(p => p.date === date);
      if (progress) {
        progress.waterIntake = intake;
      }
    },
    updateExerciseMinutes: (state, action: PayloadAction<{ date: string; minutes: number }>) => {
      const { date, minutes } = action.payload;
      const progress = state.dailyProgress.find(p => p.date === date);
      if (progress) {
        progress.exerciseMinutes = minutes;
      }
    },
    updateScreenTime: (state, action: PayloadAction<{ date: string; hours: number }>) => {
      const { date, hours } = action.payload;
      const progress = state.dailyProgress.find(p => p.date === date);
      if (progress) {
        progress.screenTimeHours = hours;
      }
    },
    updateMoodLevels: (state, action: PayloadAction<{ 
      date: string; 
      stressLevel?: number; 
      energyLevel?: number; 
      motivationLevel?: number; 
    }>) => {
      const { date, stressLevel, energyLevel, motivationLevel } = action.payload;
      const progress = state.dailyProgress.find(p => p.date === date);
      if (progress) {
        if (stressLevel !== undefined) progress.stressLevel = stressLevel;
        if (energyLevel !== undefined) progress.energyLevel = energyLevel;
        if (motivationLevel !== undefined) progress.motivationLevel = motivationLevel;
      }
    },
    clearProgress: (state) => {
      state.dailyProgress = [];
      state.currentDay = 1;
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
        state.dailyProgress = action.payload.dailyProgress;
        state.currentDay = action.payload.currentDay;
      })
      .addCase(loadDailyProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load progress';
      })
      .addCase(saveDailyProgress.fulfilled, (state, action) => {
        const existingIndex = state.dailyProgress.findIndex(p => p.date === action.payload.date);
        if (existingIndex >= 0) {
          state.dailyProgress[existingIndex] = action.payload;
        } else {
          state.dailyProgress.push(action.payload);
        }
      })
      .addCase(updateCurrentDay.fulfilled, (state, action) => {
        state.currentDay = action.payload;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        const existingIndex = state.dailyProgress.findIndex(p => p.date === action.payload.date);
        if (existingIndex >= 0) {
          state.dailyProgress[existingIndex] = action.payload;
        }
      });
  },
});

export const {
  setCurrentDay,
  addDailyProgress,
  updateTaskCompletion,
  updateWaterIntake,
  updateExerciseMinutes,
  updateScreenTime,
  updateMoodLevels,
  clearProgress,
} = progressSlice.actions;

export default progressSlice.reducer; 