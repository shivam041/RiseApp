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
    console.log('userSlice: loadUser called, checking AsyncStorage for rise_user');
    const userData = await AsyncStorage.getItem('rise_user');
    console.log('userSlice: AsyncStorage data for rise_user:', userData);
    const user = userData ? JSON.parse(userData) : null;
    console.log('userSlice: Parsed user data:', user);
    console.log('userSlice: User onboarding status:', user?.isOnboardingComplete);
    return user;
  } catch (error) {
    console.error('userSlice: loadUser error:', error);
    throw new Error('Failed to load user data');
  }
});

export const saveUser = createAsyncThunk('user/saveUser', async (user: User) => {
  try {
    console.log('userSlice: saveUser called, saving user:', user);
    console.log('userSlice: User onboarding status being saved:', user.isOnboardingComplete);
    await AsyncStorage.setItem('rise_user', JSON.stringify(user));
    console.log('userSlice: User saved successfully to AsyncStorage');
    return user;
  } catch (error) {
    console.error('userSlice: saveUser error:', error);
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
    await AsyncStorage.setItem('rise_user', JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('Failed to create user data');
  }
});

export const updateUserDay = createAsyncThunk('user/updateUserDay', async (day: number) => {
  try {
    const userData = await AsyncStorage.getItem('rise_user');
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = { ...user, currentDay: day };
      await AsyncStorage.setItem('rise_user', JSON.stringify(updatedUser));
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
      console.log('userSlice: clearUser called, clearing user state');
      console.log('userSlice: User state before clearing:', state.user);
      state.user = null;
      console.log('userSlice: user state cleared, current state:', state);
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