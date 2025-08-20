import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateMoodLevels } from '../store/slices/progressSlice';

const { width, height } = Dimensions.get('window');

interface NotesProps {
  onBack: () => void;
}

interface JourneyEntry {
  id: string;
  date: string;
  title: string;
  mood: string;
  moodEmoji: string;
  text: string;
  hasVlog: boolean;
  hasPhoto: boolean;
}

const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');

  // Get progress data from Redux store
  const dailyProgress = useSelector((state: RootState) => state.progress.dailyProgress);
  const currentDay = useSelector((state: RootState) => state.progress.currentDay);

  const journeyEntries: JourneyEntry[] = [
    {
      id: '1',
      date: '5 Mar 2025',
      title: 'Day 1',
      mood: 'Happy',
      moodEmoji: '😊',
      text: "Today, I'm grateful for the little things that make me meaningful - fresh air in the morning, a warm cup of coffee, and the support of loved ones.",
      hasVlog: true,
      hasPhoto: true,
    },
    {
      id: '2',
      date: '8 Mar 2025',
      title: 'Day 2',
      mood: 'Motivated',
      moodEmoji: '💪',
      text: '',
      hasVlog: false,
      hasPhoto: false,
    },
    {
      id: '3',
      date: '9 Mar 2025',
      title: 'Day 3',
      mood: 'Focused',
      moodEmoji: '🎯',
      text: 'Another productive day. The routine is starting to feel natural.',
      hasVlog: false,
      hasPhoto: true,
    },
  ];

  const currentEntry = journeyEntries.find(entry => entry.id === selectedEntry);

  const moodOptions = [
    { emoji: '😊', label: 'Happy', value: 8 },
    { emoji: '😌', label: 'Calm', value: 7 },
    { emoji: '💪', label: 'Motivated', value: 9 },
    { emoji: '🎯', label: 'Focused', value: 8 },
    { emoji: '😴', label: 'Tired', value: 4 },
    { emoji: '😤', label: 'Frustrated', value: 3 },
    { emoji: '🤔', label: 'Thoughtful', value: 6 },
    { emoji: '😎', label: 'Confident', value: 9 },
  ];

  const handleMoodSelection = async (mood: string, value: number) => {
    setSelectedMood(mood);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      await dispatch(updateMoodLevels({ 
        date: today, 
        motivationLevel: value 
      })).unwrap();
      
      Alert.alert('Mood Saved', `Your mood "${mood}" has been recorded for today!`);
    } catch (error) {
      console.error('Failed to save mood:', error);
      Alert.alert('Error', 'Failed to save your mood. Please try again.');
    }
  };

  const handleSaveJournalEntry = async () => {
    if (!newText.trim()) {
      Alert.alert('Empty Entry', 'Please write something in your journal entry.');
      return;
    }

    try {
      // Here you would typically save the journal entry to your storage
      // For now, we'll just show a success message
      Alert.alert('Entry Saved', 'Your journal entry has been saved successfully!');
      setNewText('');
      setSelectedEntry(null);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    }
  };

  const renderMoodSelector = () => (
    <View style={styles.moodSection}>
      <Text style={[styles.moodTitle, { color: theme.colors.text }]}>
        How are you feeling today?
      </Text>
      <View style={styles.moodOptions}>
        {moodOptions.map((mood, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.moodOption,
              selectedMood === mood.label && styles.moodOptionSelected,
            ]}
            onPress={() => handleMoodSelection(mood.label, mood.value)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[
              styles.moodLabel,
              { color: selectedMood === mood.label ? 'white' : theme.colors.text }
            ]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTaskIcons = () => (
    <View style={styles.taskIconsSection}>
      <Text style={[styles.taskIconsTitle, { color: theme.colors.text }]}>
        Tasks
      </Text>
      <View style={styles.taskIcons}>
        {['🏃', '🏋️', '📚', '💧', '🛏️'].map((icon, index) => (
          <View key={index} style={styles.taskIcon}>
            <Text style={styles.taskIconText}>{icon}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTextInput = () => (
    <View style={styles.textInputSection}>
      <Text style={[styles.textInputTitle, { color: theme.colors.text }]}>
        Create a text
      </Text>
      <Text style={[styles.textInputSubtitle, { color: theme.colors.textSecondary }]}>
        Use details to describe what you're feeling grateful for.
      </Text>
      <View style={styles.textInputContainer}>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Write your thoughts here..."
          placeholderTextColor={theme.colors.textSecondary}
          value={newText}
          onChangeText={setNewText}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSaveJournalEntry}
        >
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderJourneyEntry = (entry: JourneyEntry) => (
    <TouchableOpacity
      key={entry.id}
      style={[
        styles.journeyEntry,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => setSelectedEntry(entry.id)}
    >
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: theme.colors.textSecondary }]}>
          {entry.date}
        </Text>
        <View style={styles.entryTitle}>
          <Text style={[styles.entryTitleText, { color: theme.colors.text }]}>
            {entry.title}
          </Text>
          <View style={styles.riseLogo}>
            <Ionicons name="sunny" size={16} color="#F59E0B" />
          </View>
        </View>
      </View>

      <View style={styles.moodSection}>
        <Text style={[styles.moodLabel, { color: theme.colors.textSecondary }]}>
          Today's Mood: {entry.mood} {entry.moodEmoji}
        </Text>
      </View>

      {entry.hasVlog && (
        <View style={styles.vlogCompletion}>
          <Text style={styles.vlogText}>
            Well done, Desmond! You've completed today's vlog.
          </Text>
          <View style={styles.vlogThumbnail}>
            <Ionicons name="videocam" size={24} color="#F59E0B" />
          </View>
        </View>
      )}

      <View style={styles.mediaSection}>
        <Text style={[styles.mediaTitle, { color: theme.colors.text }]}>
          Your media
        </Text>
        <View style={styles.mediaItems}>
          {entry.hasPhoto && (
            <View style={styles.mediaItem}>
              <Ionicons name="image" size={20} color="#F59E0B" />
              <Text style={[styles.mediaText, { color: theme.colors.textSecondary }]}>
                Photo
              </Text>
            </View>
          )}
          {entry.hasVlog && (
            <View style={styles.mediaItem}>
              <Ionicons name="videocam" size={20} color="#F59E0B" />
              <Text style={[styles.mediaText, { color: theme.colors.textSecondary }]}>
                Vlog
              </Text>
            </View>
          )}
        </View>
      </View>

      {entry.text && (
        <View style={styles.textSection}>
          <Text style={[styles.textSectionTitle, { color: theme.colors.text }]}>
            Your text journey
          </Text>
          <Text style={[styles.textContent, { color: theme.colors.textSecondary }]}>
            {entry.text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Journey
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Journey Entries */}
        {journeyEntries.map(renderJourneyEntry)}

        {/* New Entry Section */}
        {selectedEntry && (
          <View style={styles.newEntrySection}>
            <Text style={[styles.newEntryTitle, { color: theme.colors.text }]}>
              Add to your journey
            </Text>
            
            {renderMoodSelector()}
            {renderTaskIcons()}
            {renderTextInput()}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="stats-chart" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.riseLogo}>
            <Ionicons name="sunny" size={24} color="#F59E0B" />
          </View>
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Rise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="trophy" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Trophy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="grid" size={24} color={theme.colors.primary} />
          <Text style={[styles.navText, { color: theme.colors.primary }]}>More</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  journeyEntry: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  entryHeader: {
    marginBottom: 16,
  },
  entryDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  entryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  riseLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodSection: {
    marginBottom: 16,
  },
  moodLabel: {
    fontSize: 16,
  },
  vlogCompletion: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vlogText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  vlogThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  mediaItems: {
    flexDirection: 'row',
    gap: 16,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaText: {
    fontSize: 14,
  },
  textSection: {
    marginBottom: 16,
  },
  textSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  newEntrySection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D2A2A',
    backgroundColor: '#2D1B1B',
  },
  newEntryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#3D2A2A',
    minWidth: 80,
  },
  moodOptionSelected: {
    backgroundColor: '#F59E0B',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskIconsSection: {
    marginBottom: 20,
  },
  taskIconsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  taskIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  taskIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3D2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIconText: {
    fontSize: 20,
  },
  textInputSection: {
    marginBottom: 20,
  },
  textInputTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInputSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  riseLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Notes; 