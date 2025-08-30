import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import questionnaireReducer from './slices/questionnaireSlice';
import progressReducer from './slices/progressSlice';
import goalsReducer from './slices/goalsSlice';
import notesReducer from './slices/notesSlice';
import calendarReducer from './slices/calendarSlice';
import dayProgressionReducer from './slices/dayProgressionSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    questionnaire: questionnaireReducer,
    progress: progressReducer,
    goals: goalsReducer,
    notes: notesReducer,
    calendar: calendarReducer,
    dayProgression: dayProgressionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 