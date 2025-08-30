import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseService } from '../../services/SupabaseService';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'sleep' | 'water' | 'exercise' | 'mind' | 'screenTime' | 'shower' | 'custom';
  value: string;
  target: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  isLoading: false,
  error: null,
};

// Load goals from Supabase or AsyncStorage fallback
export const loadGoals = createAsyncThunk('goals/loadGoals', async (_, { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      console.log('No current user, loading from AsyncStorage fallback');
      // Fallback to AsyncStorage
      const storedGoals = await AsyncStorage.getItem('goals');
      return storedGoals ? JSON.parse(storedGoals) : [];
    }

    console.log('Loading goals from Supabase for user:', currentUser.email);
    
    try {
      // Try Supabase first
      const supabaseService = SupabaseService.getInstance();
      const goals = await supabaseService.loadGoals(currentUser.id);
      console.log('Goals loaded from Supabase:', goals.length);
      return goals;
    } catch (supabaseError) {
      console.warn('Supabase failed, falling back to AsyncStorage:', supabaseError);
      // Fallback to AsyncStorage
      const storedGoals = await AsyncStorage.getItem(`goals_${currentUser.email}`);
      return storedGoals ? JSON.parse(storedGoals) : [];
    }
  } catch (error) {
    console.error('Failed to load goals:', error);
    return [];
  }
});

// Save goals to Supabase and AsyncStorage
export const saveGoals = createAsyncThunk('goals/saveGoals', async (goals: Goal[], { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      throw new Error('No current user found');
    }

    console.log('Saving goals for user:', currentUser.email);
    
    // Save to AsyncStorage as backup
    await AsyncStorage.setItem(`goals_${currentUser.email}`, JSON.stringify(goals));
    
    try {
      // Try to save to Supabase
      const supabaseService = SupabaseService.getInstance();
      await supabaseService.saveGoals(currentUser.id, goals);
      console.log('Goals saved to Supabase successfully');
    } catch (supabaseError) {
      console.warn('Supabase save failed, but AsyncStorage backup saved:', supabaseError);
    }
    
    return goals;
  } catch (error) {
    console.error('Failed to save goals:', error);
    throw new Error('Failed to save goals');
  }
});

// Add a new goal
export const addGoal = createAsyncThunk('goals/addGoal', async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>, { getState, dispatch }) => {
  try {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to local state first
    const state = getState() as any;
    const currentGoals = state.goals.goals;
    const updatedGoals = [...currentGoals, newGoal];

    // Save to storage
    await dispatch(saveGoals(updatedGoals)).unwrap();
    
    return newGoal;
  } catch (error) {
    console.error('Failed to add goal:', error);
    throw new Error('Failed to add goal');
  }
});

// Update an existing goal
export const updateGoal = createAsyncThunk('goals/updateGoal', async (updatedGoal: Goal, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentGoals = state.goals.goals;
    const updatedGoals = currentGoals.map(goal => 
      goal.id === updatedGoal.id ? { ...updatedGoal, updatedAt: new Date().toISOString() } : goal
    );

    // Save to storage
    await dispatch(saveGoals(updatedGoals)).unwrap();
    
    return updatedGoal;
  } catch (error) {
    console.error('Failed to update goal:', error);
    throw new Error('Failed to update goal');
  }
});

// Delete a goal
export const deleteGoal = createAsyncThunk('goals/deleteGoal', async (goalId: string, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentGoals = state.goals.goals;
    const updatedGoals = currentGoals.filter(goal => goal.id !== goalId);

    // Save to storage
    await dispatch(saveGoals(updatedGoals)).unwrap();
    
    return goalId;
  } catch (error) {
    console.error('Failed to delete goal:', error);
    throw new Error('Failed to delete goal');
  }
});

// Toggle goal active status
export const toggleGoalStatus = createAsyncThunk('goals/toggleGoalStatus', async (goal: Goal, { getState, dispatch }) => {
  try {
    const updatedGoal = { ...goal, isActive: !goal.isActive, updatedAt: new Date().toISOString() };
    
    // Update in storage
    await dispatch(updateGoal(updatedGoal)).unwrap();
    
    return updatedGoal;
  } catch (error) {
    console.error('Failed to toggle goal status:', error);
    throw new Error('Failed to toggle goal status');
  }
});

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setGoals: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload;
    },
    clearGoals: (state) => {
      state.goals = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = action.payload;
      })
      .addCase(loadGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load goals';
      })
      .addCase(saveGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
      })
      .addCase(addGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter(goal => goal.id !== action.payload);
      })
      .addCase(toggleGoalStatus.fulfilled, (state, action) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      });
  },
});

export const { setGoals, clearGoals } = goalsSlice.actions;
export default goalsSlice.reducer;
