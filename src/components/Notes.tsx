import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotesProps {
  onBack: () => void;
}

interface Note {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
}

const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedNotes = await AsyncStorage.getItem(`notes_${today}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`notes_${today}`, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const addNote = () => {
    if (newNoteText.trim().length === 0) {
      Alert.alert('Empty Note', 'Please enter some text for your note.');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      text: newNoteText.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
      priority: selectedPriority,
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setNewNoteText('');
    setSelectedPriority('medium');
  };

  const toggleNote = (noteId: string) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          isCompleted: !note.isCompleted,
          completedAt: !note.isCompleted ? new Date().toISOString() : undefined,
        };
      }
      return note;
    });
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedNotes = notes.filter(note => note.id !== noteId);
            setNotes(updatedNotes);
            saveNotes(updatedNotes);
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'flag';
      case 'medium': return 'flag-outline';
      case 'low': return 'remove';
      default: return 'remove';
    }
  };

  const filteredNotes = notes.filter(note => {
    switch (filter) {
      case 'active': return !note.isCompleted;
      case 'completed': return note.isCompleted;
      default: return true;
    }
  });

  const renderAddNoteSection = () => (
    <View style={[styles.addNoteSection, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Add New Note
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, { 
            color: theme.colors.text,
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border
          }]}
          placeholder="What do you want to accomplish today?"
          placeholderTextColor={theme.colors.textSecondary}
          value={newNoteText}
          onChangeText={setNewNoteText}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.priorityContainer}>
        <Text style={[styles.priorityLabel, { color: theme.colors.textSecondary }]}>
          Priority:
        </Text>
        {(['low', 'medium', 'high'] as const).map((priority) => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.priorityButton,
              {
                backgroundColor: selectedPriority === priority 
                  ? getPriorityColor(priority) 
                  : theme.colors.background,
                borderColor: getPriorityColor(priority),
              }
            ]}
            onPress={() => setSelectedPriority(priority)}
          >
            <Ionicons
              name={getPriorityIcon(priority)}
              size={16}
              color={selectedPriority === priority ? theme.colors.background : getPriorityColor(priority)}
            />
            <Text style={[
              styles.priorityText,
              { 
                color: selectedPriority === priority 
                  ? theme.colors.background 
                  : getPriorityColor(priority) 
              }
            ]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={addNote}
      >
        <Ionicons name="add" size={24} color={theme.colors.background} />
        <Text style={[styles.addButtonText, { color: theme.colors.background }]}>
          Add Note
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {(['all', 'active', 'completed'] as const).map((filterOption) => (
        <TouchableOpacity
          key={filterOption}
          style={[
            styles.filterButton,
            {
              backgroundColor: filter === filterOption 
                ? theme.colors.primary 
                : theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={() => setFilter(filterOption)}
        >
          <Text style={[
            styles.filterButtonText,
            { 
              color: filter === filterOption 
                ? theme.colors.background 
                : theme.colors.text 
            }
          ]}>
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderNote = (note: Note) => (
    <View key={note.id} style={[
      styles.noteItem,
      { 
        backgroundColor: theme.colors.surface,
        borderLeftColor: getPriorityColor(note.priority),
        opacity: note.isCompleted ? 0.6 : 1
      }
    ]}>
      <View style={styles.noteHeader}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleNote(note.id)}
        >
          <Ionicons
            name={note.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={note.isCompleted ? theme.colors.success : theme.colors.textSecondary}
          />
        </TouchableOpacity>
        
        <View style={styles.noteContent}>
          <Text style={[
            styles.noteText,
            { 
              color: theme.colors.text,
              textDecorationLine: note.isCompleted ? 'line-through' : 'none'
            }
          ]}>
            {note.text}
          </Text>
          
          <View style={styles.noteMeta}>
            <View style={styles.priorityBadge}>
              <Ionicons
                name={getPriorityIcon(note.priority)}
                size={12}
                color={getPriorityColor(note.priority)}
              />
              <Text style={[
                styles.priorityBadgeText,
                { color: getPriorityColor(note.priority) }
              ]}>
                {note.priority}
              </Text>
            </View>
            
            <Text style={[styles.noteTime, { color: theme.colors.textSecondary }]}>
              {new Date(note.createdAt).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNote(note.id)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => {
    const totalNotes = notes.length;
    const completedNotes = notes.filter(note => note.isCompleted).length;
    const activeNotes = totalNotes - completedNotes;
    const completionRate = totalNotes > 0 ? Math.round((completedNotes / totalNotes) * 100) : 0;

    return (
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
          Today's Progress
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {totalNotes}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.success }]}>
              {completedNotes}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Completed
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
              {activeNotes}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Active
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>
              {completionRate}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Done
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Daily Notes
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderAddNoteSection()}
        {renderStats()}
        {renderFilterButtons()}
        
        <View style={styles.notesContainer}>
          {filteredNotes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                {filter === 'all' 
                  ? 'No notes yet. Add your first note above!' 
                  : `No ${filter} notes.`
                }
              </Text>
            </View>
          ) : (
            filteredNotes.map(renderNote)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3D2A2A',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  addNoteSection: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  priorityLabel: {
    fontSize: 16,
    marginRight: 15,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noteItem: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  noteTime: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default Notes; 