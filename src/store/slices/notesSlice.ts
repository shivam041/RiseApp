import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'journal' | 'gratitude' | 'reflection' | 'goal' | 'general';
  mood?: string;
  moodEmoji?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  isLoading: false,
  error: null,
};

// Load notes from AsyncStorage
export const loadNotes = createAsyncThunk('notes/loadNotes', async (_, { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      return [];
    }
    
    const notesData = await AsyncStorage.getItem(`notes_${currentUser.email}`);
    return notesData ? JSON.parse(notesData) : [];
  } catch (error) {
    console.error('Failed to load notes:', error);
    return [];
  }
});

// Save notes to AsyncStorage
export const saveNotes = createAsyncThunk('notes/saveNotes', async (notes: Note[], { getState }) => {
  try {
    const state = getState() as any;
    const currentUser = state.user?.user;
    
    if (!currentUser?.email) {
      throw new Error('No current user found');
    }
    
    const storageKey = `notes_${currentUser.email}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(notes));
    return notes;
  } catch (error) {
    console.error('Failed to save notes:', error);
    throw new Error('Failed to save notes');
  }
});

// Add a new note
export const addNote = createAsyncThunk('notes/addNote', async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentNotes = state.notes.notes;
    
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedNotes = [...currentNotes, newNote];
    await dispatch(saveNotes(updatedNotes)).unwrap();
    
    return newNote;
  } catch (error) {
    console.error('Failed to add note:', error);
    throw new Error('Failed to add note');
  }
});

// Update an existing note
export const updateNote = createAsyncThunk('notes/updateNote', async (updatedNote: Note, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentNotes = state.notes.notes;
    
    const updatedNotes = currentNotes.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: new Date().toISOString() }
        : note
    );
    
    await dispatch(saveNotes(updatedNotes)).unwrap();
    
    return updatedNote;
  } catch (error) {
    console.error('Failed to update note:', error);
    throw new Error('Failed to update note');
  }
});

// Delete a note
export const deleteNote = createAsyncThunk('notes/deleteNote', async (noteId: string, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentNotes = state.notes.notes;
    
    const updatedNotes = currentNotes.filter(note => note.id !== noteId);
    await dispatch(saveNotes(updatedNotes)).unwrap();
    
    return noteId;
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw new Error('Failed to delete note');
  }
});

// Toggle note favorite status
export const toggleNoteFavorite = createAsyncThunk('notes/toggleNoteFavorite', async (noteId: string, { getState, dispatch }) => {
  try {
    const state = getState() as any;
    const currentNotes = state.notes.notes;
    
    const updatedNotes = currentNotes.map(note => 
      note.id === noteId 
        ? { ...note, isFavorite: !note.isFavorite, updatedAt: new Date().toISOString() }
        : note
    );
    
    await dispatch(saveNotes(updatedNotes)).unwrap();
    
    return { noteId, isFavorite: !currentNotes.find(n => n.id === noteId)?.isFavorite };
  } catch (error) {
    console.error('Failed to toggle note favorite:', error);
    throw new Error('Failed to toggle note favorite');
  }
});

// Search notes by text
export const searchNotes = createAsyncThunk('notes/searchNotes', async (searchTerm: string, { getState }) => {
  try {
    const state = getState() as any;
    const currentNotes = state.notes.notes;
    
    if (!searchTerm.trim()) {
      return currentNotes;
    }
    
    const filteredNotes = currentNotes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return filteredNotes;
  } catch (error) {
    console.error('Failed to search notes:', error);
    return [];
  }
});

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
    },
    clearNotes: (state) => {
      state.notes = [];
    },
    clearSearch: (state) => {
      // This will trigger a reload of all notes
      state.notes = state.notes;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(loadNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load notes';
      })
      .addCase(saveNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.notes.push(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(note => note.id !== action.payload);
      })
      .addCase(toggleNoteFavorite.fulfilled, (state, action) => {
        const note = state.notes.find(n => n.id === action.payload.noteId);
        if (note) {
          note.isFavorite = action.payload.isFavorite;
          note.updatedAt = new Date().toISOString();
        }
      })
      .addCase(searchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
      });
  },
});

export const { setNotes, clearNotes, clearSearch } = notesSlice.actions;
export default notesSlice.reducer;
