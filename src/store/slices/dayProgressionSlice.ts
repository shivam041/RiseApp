import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DayProgressionState {
  currentDay: number;
  lastMidnightCheck: string; // ISO string of last midnight check
  isNewDay: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: DayProgressionState = {
  currentDay: 1,
  lastMidnightCheck: new Date().toISOString(),
  isNewDay: false,
  isLoading: false,
  error: null,
};

// Check if it's a new day (past midnight)
export const checkNewDay = createAsyncThunk('dayProgression/checkNewDay', async (_, { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      return { isNewDay: false, currentDay: 1 };
    }
    
    const now = new Date();
    const lastCheck = new Date(state.dayProgression.lastMidnightCheck);
    
    // Check if we've crossed midnight since last check
    const isNewDay = now.getDate() !== lastCheck.getDate() || 
                     now.getMonth() !== lastCheck.getMonth() || 
                     now.getFullYear() !== lastCheck.getFullYear();
    
    if (isNewDay) {
      // Get the stored current day
      const storedCurrentDay = await AsyncStorage.getItem(`currentDay_${currentUser.email}`);
      const currentDay = storedCurrentDay ? parseInt(storedCurrentDay) : 1;
      const nextDay = currentDay + 1;
      
      // Update the stored current day
      await AsyncStorage.setItem(`currentDay_${currentUser.email}`, nextDay.toString());
      
      // Update last midnight check
      await AsyncStorage.setItem(`lastMidnightCheck_${currentUser.email}`, now.toISOString());
      
      return { isNewDay: true, currentDay: nextDay };
    }
    
    return { isNewDay: false, currentDay: state.dayProgression.currentDay };
  } catch (error) {
    console.error('Failed to check new day:', error);
    return { isNewDay: false, currentDay: 1 };
  }
});

// Load day progression data from AsyncStorage
export const loadDayProgression = createAsyncThunk('dayProgression/loadDayProgression', async (_, { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      return { currentDay: 1, lastMidnightCheck: new Date().toISOString() };
    }
    
    const [currentDayData, lastMidnightCheckData] = await Promise.all([
      AsyncStorage.getItem(`currentDay_${currentUser.email}`),
      AsyncStorage.getItem(`lastMidnightCheck_${currentUser.email}`)
    ]);
    
    const currentDay = currentDayData ? parseInt(currentDayData) : 1;
    const lastMidnightCheck = lastMidnightCheckData || new Date().toISOString();
    
    return { currentDay, lastMidnightCheck };
  } catch (error) {
    console.error('Failed to load day progression:', error);
    return { currentDay: 1, lastMidnightCheck: new Date().toISOString() };
  }
});

// Save day progression data to AsyncStorage
export const saveDayProgression = createAsyncThunk('dayProgression/saveDayProgression', async (data: { currentDay: number; lastMidnightCheck: string }, { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      throw new Error('No current user found');
    }
    
    await Promise.all([
      AsyncStorage.setItem(`currentDay_${currentUser.email}`, data.currentDay.toString()),
      AsyncStorage.setItem(`lastMidnightCheck_${currentUser.email}`, data.lastMidnightCheck)
    ]);
    
    return data;
  } catch (error) {
    console.error('Failed to save day progression:', error);
    throw new Error('Failed to save day progression');
  }
});

// Manually advance to next day
export const advanceToNextDay = createAsyncThunk('dayProgression/advanceToNextDay', async (_, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      throw new Error('No current user found');
    }
    
    const currentDay = state.dayProgression.currentDay;
    const nextDay = currentDay + 1;
    const now = new Date();
    
    // Update the stored current day
    await AsyncStorage.setItem(`currentDay_${currentUser.email}`, nextDay.toString());
    
    // Update last midnight check
    await AsyncStorage.setItem(`lastMidnightCheck_${currentUser.email}`, now.toISOString());
    
    return { currentDay: nextDay, lastMidnightCheck: now.toISOString() };
  } catch (error) {
    console.error('Failed to advance to next day:', error);
    throw new Error('Failed to advance to next day');
  }
});

// Reset day progression (for testing or user reset)
export const resetDayProgression = createAsyncThunk('dayProgression/resetDayProgression', async (_, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      throw new Error('No current user found');
    }
    
    const now = new Date();
    
    await Promise.all([
      AsyncStorage.setItem(`currentDay_${currentUser.email}`, '1'),
      AsyncStorage.setItem(`lastMidnightCheck_${currentUser.email}`, now.toISOString())
    ]);
    
    return { currentDay: 1, lastMidnightCheck: now.toISOString() };
  } catch (error) {
    console.error('Failed to reset day progression:', error);
    throw new Error('Failed to reset day progression');
  }
});

const dayProgressionSlice = createSlice({
  name: 'dayProgression',
  initialState,
  reducers: {
    setCurrentDay: (state, action: PayloadAction<number>) => {
      state.currentDay = action.payload;
    },
    setLastMidnightCheck: (state, action: PayloadAction<string>) => {
      state.lastMidnightCheck = action.payload;
    },
    setIsNewDay: (state, action: PayloadAction<boolean>) => {
      state.isNewDay = action.payload;
    },
    clearDayProgression: (state) => {
      state.currentDay = 1;
      state.lastMidnightCheck = new Date().toISOString();
      state.isNewDay = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkNewDay.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkNewDay.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isNewDay = action.payload.isNewDay;
        if (action.payload.isNewDay) {
          state.currentDay = action.payload.currentDay;
          state.lastMidnightCheck = new Date().toISOString();
        }
      })
      .addCase(checkNewDay.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to check new day';
      })
      .addCase(loadDayProgression.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadDayProgression.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDay = action.payload.currentDay;
        state.lastMidnightCheck = action.payload.lastMidnightCheck;
      })
      .addCase(loadDayProgression.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load day progression';
      })
      .addCase(saveDayProgression.fulfilled, (state, action) => {
        state.currentDay = action.payload.currentDay;
        state.lastMidnightCheck = action.payload.lastMidnightCheck;
      })
      .addCase(advanceToNextDay.fulfilled, (state, action) => {
        state.currentDay = action.payload.currentDay;
        state.lastMidnightCheck = action.payload.lastMidnightCheck;
        state.isNewDay = true;
      })
      .addCase(resetDayProgression.fulfilled, (state, action) => {
        state.currentDay = action.payload.currentDay;
        state.lastMidnightCheck = action.payload.lastMidnightCheck;
        state.isNewDay = false;
      });
  },
});

export const { 
  setCurrentDay, 
  setLastMidnightCheck, 
  setIsNewDay, 
  clearDayProgression 
} = dayProgressionSlice.actions;

export default dayProgressionSlice.reducer;
