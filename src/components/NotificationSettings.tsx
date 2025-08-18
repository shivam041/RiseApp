import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationService from '../services/NotificationService';

interface NotificationSettingsProps {
  onBack: () => void;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'morning',
      title: 'Morning Reminders',
      description: 'Get notified when it\'s time to start your day',
      icon: 'sunny',
      enabled: true,
    },
    {
      id: 'task',
      title: 'Task Reminders',
      description: 'Receive reminders for your daily tasks',
      icon: 'checkmark-circle',
      enabled: true,
    },
    {
      id: 'water',
      title: 'Hydration Reminders',
      description: 'Get reminded to drink water throughout the day',
      icon: 'water',
      enabled: true,
    },
    {
      id: 'evening',
      title: 'Evening Reflection',
      description: 'Reminder to reflect on your daily progress',
      icon: 'moon',
      enabled: true,
    },
    {
      id: 'weekly',
      title: 'Weekly Progress',
      description: 'Weekly progress check and celebration',
      icon: 'stats-chart',
      enabled: true,
    },
    {
      id: 'motivational',
      title: 'Motivational Messages',
      description: 'Receive encouraging messages throughout the day',
      icon: 'heart',
      enabled: true,
    },
  ]);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const notificationService = NotificationService.getInstance();
    const hasPermission = await notificationService.requestPermissions();
    setPermissionGranted(hasPermission);
  };

  const handleSettingToggle = async (settingId: string, value: boolean) => {
    if (!permissionGranted) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => checkNotificationPermissions() },
        ]
      );
      return;
    }

    setSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: value }
          : setting
      )
    );

    // Here you would typically save the setting to storage
    // and update the notification schedule accordingly
  };

  const handleTestNotification = async () => {
    if (!permissionGranted) {
      Alert.alert('Permission Required', 'Please enable notifications first.');
      return;
    }

    setIsLoading(true);
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.sendImmediateNotification(
        '🧪 Test Notification',
        'This is a test notification from Rise!'
      );
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Here you would save settings to storage and update notification schedules
      Alert.alert('Success', 'Notification settings saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSetting = (setting: NotificationSetting) => (
    <View key={setting.id} style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <View style={styles.settingIcon}>
          <Ionicons name={setting.icon} size={24} color="#007AFF" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{setting.title}</Text>
          <Text style={styles.settingDescription}>{setting.description}</Text>
        </View>
        <Switch
          value={setting.enabled}
          onValueChange={(value) => handleSettingToggle(setting.id, value)}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor={setting.enabled ? '#FFFFFF' : '#FFFFFF'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <Ionicons 
              name={permissionGranted ? "checkmark-circle" : "alert-circle"} 
              size={24} 
              color={permissionGranted ? "#34C759" : "#FF9500"} 
            />
            <Text style={styles.permissionTitle}>
              {permissionGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
            </Text>
          </View>
          <Text style={styles.permissionDescription}>
            {permissionGranted 
              ? 'You\'ll receive helpful reminders throughout your day.'
              : 'Enable notifications to get the most out of Rise.'
            }
          </Text>
          {!permissionGranted && (
            <TouchableOpacity 
              style={styles.enableButton}
              onPress={checkNotificationPermissions}
            >
              <Text style={styles.enableButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          {settings.map(renderSetting)}
        </View>

        {/* Test Notification */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Test Notifications</Text>
          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.testButtonDisabled]}
            onPress={handleTestNotification}
            disabled={isLoading}
          >
            <Ionicons name="notifications" size={20} color="white" />
            <Text style={styles.testButtonText}>
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveSettings}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  enableButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  enableButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  testSection: {
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  testButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationSettings; 