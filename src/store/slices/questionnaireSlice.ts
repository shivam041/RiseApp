import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionnaireResponse, Task, DailyProgress } from '../../types';
import { taskTemplates } from '../../data/taskTemplates';

interface QuestionnaireState {
  questionnaire: QuestionnaireResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuestionnaireState = {
  questionnaire: null,
  isLoading: false,
  error: null,
};

export const loadQuestionnaire = createAsyncThunk('questionnaire/loadQuestionnaire', async (_, { getState }) => {
  try {
    // Get current user from state to load their specific questionnaire
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      console.log('No current user found, cannot load questionnaire');
      return null;
    }
    
    const questionnaireData = await AsyncStorage.getItem(`questionnaire_${currentUser.email}`);
    console.log('Loading questionnaire for user:', currentUser.email, 'Data:', questionnaireData);
    return questionnaireData ? JSON.parse(questionnaireData) : null;
  } catch (error) {
    console.error('Failed to load questionnaire data:', error);
    throw new Error('Failed to load questionnaire data');
  }
});

export const saveQuestionnaire = createAsyncThunk('questionnaire/saveQuestionnaire', async (questionnaire: QuestionnaireResponse, { getState }) => {
  try {
    // Get current user from state to save their specific questionnaire
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      console.log('No current user found, cannot save questionnaire');
      throw new Error('No current user found');
    }
    
    const storageKey = `questionnaire_${currentUser.email}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(questionnaire));
    console.log('Saved questionnaire for user:', currentUser.email, 'Key:', storageKey);
    return questionnaire;
  } catch (error) {
    console.error('Failed to save questionnaire data:', error);
    throw new Error('Failed to save questionnaire data');
  }
});

export const generate66DayProgram = createAsyncThunk('questionnaire/generate66DayProgram', async (questionnaire: QuestionnaireResponse, { getState }) => {
  try {
    // Get current user from state to save their specific data
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      console.log('No current user found, cannot generate program');
      throw new Error('No current user found');
    }
    
    // Save questionnaire with user-specific key
    const questionnaireKey = `questionnaire_${currentUser.email}`;
    await AsyncStorage.setItem(questionnaireKey, JSON.stringify(questionnaire));
    
    // Generate tasks for each day
    const dailyProgress: DailyProgress[] = [];
    
    for (let day = 1; day <= 66; day++) {
      const dayTasks: Task[] = [];
      
      // Get tasks for this day from templates
      taskTemplates.forEach(template => {
        if (day >= template.dayRange.start && day <= template.dayRange.end) {
          dayTasks.push({
            id: `${template.category}-${day}`,
            day,
            category: template.category,
            title: template.title,
            description: template.description,
            isCompleted: false,
            difficulty: template.difficulty,
            estimatedTime: template.estimatedTime,
            tips: template.tips,
          });
        }
      });
      
      dailyProgress.push({
        day,
        date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tasks: dayTasks,
        completedTasks: 0,
        totalTasks: dayTasks.length,
        streak: 0,
      });
    }
    
    // Save daily progress with user-specific key
    const progressKey = `dailyProgress_${currentUser.email}`;
    await AsyncStorage.setItem(progressKey, JSON.stringify(dailyProgress));
    
    console.log('Generated 66-day program for user:', currentUser.email);
    return { questionnaire, dailyProgress };
  } catch (error) {
    console.error('Failed to generate 66-day program:', error);
    throw new Error('Failed to generate 66-day program');
  }
});

const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    setQuestionnaire: (state, action: PayloadAction<QuestionnaireResponse>) => {
      state.questionnaire = action.payload;
    },
    clearQuestionnaire: (state) => {
      state.questionnaire = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadQuestionnaire.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadQuestionnaire.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questionnaire = action.payload;
      })
      .addCase(loadQuestionnaire.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load questionnaire';
      })
      .addCase(saveQuestionnaire.fulfilled, (state, action) => {
        state.questionnaire = action.payload;
      })
      .addCase(generate66DayProgram.fulfilled, (state, action) => {
        state.questionnaire = action.payload.questionnaire;
      });
  },
});

export const { setQuestionnaire, clearQuestionnaire } = questionnaireSlice.actions;
export default questionnaireSlice.reducer; 