import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const loadUser = createAsyncThunk('user/loadUser', async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    throw new Error('Failed to load user data');
  }
});

export const saveUser = createAsyncThunk('user/saveUser', async (user: User) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('Failed to save user data');
  }
});

export const createUser = createAsyncThunk('user/createUser', async (userData: Partial<User>) => {
  try {
    const user: User = {
      id: Date.now().toString(),
      name: userData.name || 'User',
      email: userData.email,
      startDate: new Date().toISOString(),
      currentDay: 1,
      isOnboardingComplete: false,
    };
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('Failed to create user');
  }
});

export const updateUserDay = createAsyncThunk('user/updateUserDay', async (day: number) => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = { ...user, currentDay: day };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error('No user data found');
  } catch (error) {
    throw new Error('Failed to update user day');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setOnboardingComplete: (state) => {
      if (state.user) {
        state.user.isOnboardingComplete = true;
      }
    },
    setAuthenticationStatus: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isAuthenticated = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load user';
      })
      .addCase(saveUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserDay.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setUser, clearUser, setOnboardingComplete, setAuthenticationStatus } = userSlice.actions;
export default userSlice.reducer; 