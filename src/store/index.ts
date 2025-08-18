import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import questionnaireReducer from './slices/questionnaireSlice';
import progressReducer from './slices/progressSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    questionnaire: questionnaireReducer,
    progress: progressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 