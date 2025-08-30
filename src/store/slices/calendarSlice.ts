import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CalendarTask {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time?: string; // HH:MM format
  duration: number; // in minutes
  category: 'work' | 'personal' | 'health' | 'learning' | 'social' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface CalendarState {
  tasks: CalendarTask[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  tasks: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,
};

// Load calendar tasks from AsyncStorage
export const loadCalendarTasks = createAsyncThunk('calendar/loadCalendarTasks', async (_, { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      return [];
    }
    
    const tasksData = await AsyncStorage.getItem(`calendarTasks_${currentUser.email}`);
    return tasksData ? JSON.parse(tasksData) : [];
  } catch (error) {
    console.error('Failed to load calendar tasks:', error);
    return [];
  }
});

// Save calendar tasks to AsyncStorage
export const saveCalendarTasks = createAsyncThunk('calendar/saveCalendarTasks', async (tasks: CalendarTask[], { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      throw new Error('No current user found');
    }
    
    const storageKey = `calendarTasks_${currentUser.email}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(tasks));
    return tasks;
  } catch (error) {
    console.error('Failed to save calendar tasks:', error);
    throw new Error('Failed to save calendar tasks');
  }
});

// Add a new calendar task
export const addCalendarTask = createAsyncThunk('calendar/addCalendarTask', async (task: Omit<CalendarTask, 'id' | 'createdAt' | 'updatedAt'>, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentTasks = state.calendar.tasks;
    
    const newTask: CalendarTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedTasks = [...currentTasks, newTask];
    await dispatch(saveCalendarTasks(updatedTasks)).unwrap();
    
    return newTask;
  } catch (error) {
    console.error('Failed to add calendar task:', error);
    throw new Error('Failed to add calendar task');
  }
});

// Update an existing calendar task
export const updateCalendarTask = createAsyncThunk('calendar/updateCalendarTask', async (updatedTask: CalendarTask, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentTasks = state.calendar.tasks;
    
    const updatedTasks = currentTasks.map(task => 
      task.id === updatedTask.id 
        ? { ...updatedTask, updatedAt: new Date().toISOString() }
        : task
    );
    
    await dispatch(saveCalendarTasks(updatedTasks)).unwrap();
    
    return updatedTask;
  } catch (error) {
    console.error('Failed to update calendar task:', error);
    throw new Error('Failed to update calendar task');
  }
});

// Delete a calendar task
export const deleteCalendarTask = createAsyncThunk('calendar/deleteCalendarTask', async (taskId: string, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentTasks = state.calendar.tasks;
    
    const updatedTasks = currentTasks.filter(task => task.id !== taskId);
    await dispatch(saveCalendarTasks(updatedTasks)).unwrap();
    
    return taskId;
  } catch (error) {
    console.error('Failed to delete calendar task:', error);
    throw new Error('Failed to delete calendar task');
  }
});

// Toggle task completion status
export const toggleTaskCompletion = createAsyncThunk('calendar/toggleTaskCompletion', async (taskId: string, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentTasks = state.calendar.tasks;
    
    const updatedTasks = currentTasks.map(task => 
      task.id === taskId 
        ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date().toISOString() }
        : task
    );
    
    await dispatch(saveCalendarTasks(updatedTasks)).unwrap();
    
    return { taskId, isCompleted: !currentTasks.find(t => t.id === taskId)?.isCompleted };
  } catch (error) {
    console.error('Failed to toggle task completion:', error);
    throw new Error('Failed to toggle task completion');
  }
});

// Get tasks for a specific date
export const getTasksForDate = createAsyncThunk('calendar/getTasksForDate', async (date: string, { getState }) => {
  try {
    const state = getState() as any;
    const currentTasks = state.calendar.tasks;
    
    const tasksForDate = currentTasks.filter(task => task.date === date);
    return { date, tasks: tasksForDate };
  } catch (error) {
    console.error('Failed to get tasks for date:', error);
    return { date, tasks: [] };
  }
});

// Get upcoming tasks
export const getUpcomingTasks = createAsyncThunk('calendar/getUpcomingTasks', async (days: number = 7, { getState }) => {
  try {
    const state = getState() as any;
    const currentTasks = state.calendar.tasks;
    
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    const upcomingTasks = currentTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= today && taskDate <= endDate && !task.isCompleted;
    });
    
    // Sort by date and priority
    upcomingTasks.sort((a, b) => {
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    return upcomingTasks;
  } catch (error) {
    console.error('Failed to get upcoming tasks:', error);
    return [];
  }
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setCalendarTasks: (state, action: PayloadAction<CalendarTask[]>) => {
      state.tasks = action.payload;
    },
    clearCalendarTasks: (state) => {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCalendarTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCalendarTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(loadCalendarTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load calendar tasks';
      })
      .addCase(saveCalendarTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
      })
      .addCase(addCalendarTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateCalendarTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteCalendarTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload.taskId);
        if (task) {
          task.isCompleted = action.payload.isCompleted;
          task.updatedAt = new Date().toISOString();
        }
      });
  },
});

export const { setSelectedDate, setCalendarTasks, clearCalendarTasks } = calendarSlice.actions;
export default calendarSlice.reducer;
