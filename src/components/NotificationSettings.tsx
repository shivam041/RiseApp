import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { OneSignalService } from '../services/OneSignalService';
import { MotivationalQuotesService } from '../services/MotivationalQuotesService';

interface NotificationSettingsProps {
  onBack: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    reminders: true,
    motivation: true,
    water: true,
    exercise: true,
    sleep: true,
  });

  const [oneSignalService] = useState(() => OneSignalService.getInstance());
  const [quotesService] = useState(() => MotivationalQuotesService.getInstance());

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await oneSignalService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof typeof preferences, value: boolean) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      
      await oneSignalService.updatePreferences(newPreferences);
      console.log(`Updated ${key} preference to: ${value}`);
    } catch (error) {
      console.error(`Failed to update ${key} preference:`, error);
      // Revert the change if update failed
      setPreferences(preferences);
      Alert.alert('Error', 'Failed to update notification preference. Please try again.');
    }
  };

  const testNotification = async () => {
    try {
      await oneSignalService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent! Check your device.');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert('Error', 'Failed to send test notification. Please check your notification permissions.');
    }
  };

  const testMotivationalQuote = async () => {
    try {
      const quote = quotesService.getQuoteByTimeOfDay();
      await oneSignalService.sendMotivationalQuote({
        id: quote.id,
        quote: quote.quote,
        author: quote.author,
        category: quote.category,
      });
      Alert.alert('Success', 'Motivational quote notification sent!');
    } catch (error) {
      console.error('Failed to send motivational quote:', error);
      Alert.alert('Error', 'Failed to send motivational quote notification.');
    }
  };

  const scheduleDailyReminders = async () => {
    try {
      setIsLoading(true);
      await oneSignalService.scheduleDailyReminders();
      Alert.alert('Success', 'Daily reminders scheduled successfully!');
    } catch (error) {
      console.error('Failed to schedule daily reminders:', error);
      Alert.alert('Error', 'Failed to schedule daily reminders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon?: string
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingContent}>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={value ? theme.colors.primary : theme.colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderActionButton = (
    title: string,
    onPress: () => void,
    color: string = theme.colors.primary,
    disabled: boolean = false
  ) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: color, opacity: disabled ? 0.6 : 1 }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notification Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Types Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notification Types
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Choose what types of notifications you want to receive
          </Text>

          {renderSettingItem(
            'Daily Reminders',
            'Get reminded about your daily goals and tasks',
            preferences.reminders,
            (value) => updatePreference('reminders', value)
          )}

          {renderSettingItem(
            'Motivational Quotes',
            'Receive inspiring quotes throughout the day',
            preferences.motivation,
            (value) => updatePreference('motivation', value)
          )}

          {renderSettingItem(
            'Water Reminders',
            'Get reminded to stay hydrated',
            preferences.water,
            (value) => updatePreference('water', value)
          )}

          {renderSettingItem(
            'Exercise Reminders',
            'Get motivated to stay active',
            preferences.exercise,
            (value) => updatePreference('exercise', value)
          )}

          {renderSettingItem(
            'Sleep Reminders',
            'Get reminded to prepare for bed',
            preferences.sleep,
            (value) => updatePreference('sleep', value)
          )}
        </View>

        {/* Test Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Test Notifications
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Test your notification setup to make sure everything is working
          </Text>

          <View style={styles.buttonRow}>
            {renderActionButton(
              'Test Basic Notification',
              testNotification,
              theme.colors.primary
            )}
            {renderActionButton(
              'Test Motivational Quote',
              testMotivationalQuote,
              theme.colors.secondary
            )}
          </View>

          {renderActionButton(
            'Schedule Daily Reminders',
            scheduleDailyReminders,
            theme.colors.success,
            isLoading
          )}
        </View>

        {/* Daily Schedule Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Daily Notification Schedule
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Your notifications will be sent at these times throughout the day
          </Text>

          <View style={styles.scheduleGrid}>
            {[
              { time: '8:00 AM', title: 'Morning Motivation', emoji: '🌅' },
              { time: '10:00 AM', title: 'Morning Check-in', emoji: '☀️' },
              { time: '12:00 PM', title: 'Lunch Reminder', emoji: '🍽️' },
              { time: '3:00 PM', title: 'Afternoon Boost', emoji: '💪' },
              { time: '6:00 PM', title: 'Evening Reflection', emoji: '🌙' },
              { time: '9:00 PM', title: 'Bedtime Prep', emoji: '😴' },
            ].map((item, index) => (
              <View key={index} style={[styles.scheduleItem, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.scheduleTime, { color: theme.colors.primary }]}>
                  {item.time}
                </Text>
                <Text style={[styles.scheduleTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text style={styles.scheduleEmoji}>{item.emoji}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tips for Best Experience
          </Text>
          <View style={styles.tipsContainer}>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Make sure notifications are enabled in your device settings
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Keep the app open occasionally to maintain connection
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Add the app to your home screen for better performance
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Check your notification permissions in browser settings
            </Text>
          </View>
        </View>

        {/* Platform-specific info */}
        {Platform.OS === 'web' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Web Notifications
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
              For the best experience on mobile web, add this app to your home screen and enable notifications in your browser settings.
            </Text>
          </View>
        )}
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
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  settingItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '48%',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scheduleItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  scheduleEmoji: {
    fontSize: 24,
  },
  tipsContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default NotificationSettings; 