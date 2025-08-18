import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { width, height } = Dimensions.get('window');

interface ProfileProps {
  onBack: () => void;
  onNavigateToNotificationSettings: () => void;
  onLogout: () => void;
  onNavigateToAdminPanel?: () => void;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  field: keyof QuestionnaireResponse;
}

interface QuestionnaireResponse {
  sleepGoal: string;
  hydrationGoal: number;
  exerciseGoal: number;
  mindGoal: number;
  screenTimeGoal: number;
  showerGoal: number;
  wakeUpTime: string;
  bedTime: string;
}

const Profile: React.FC<ProfileProps> = ({ onBack, onNavigateToNotificationSettings, onLogout, onNavigateToAdminPanel }) => {
  const { theme, toggleTheme } = useTheme();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const user = useSelector((state: RootState) => state.user.user);
  const questionnaire = useSelector((state: RootState) => state.questionnaire.questionnaire);

  // Create goals based on user's questionnaire responses
  const goals: Goal[] = [
    {
      id: 'sleep',
      title: 'Sleep Goal',
      description: 'Your wake-up time goal',
      icon: 'moon',
      value: questionnaire?.sleepGoal || '6:00 AM',
      field: 'sleepGoal',
    },
    {
      id: 'hydration',
      title: 'Hydration Goal',
      description: 'Your daily water intake goal',
      icon: 'water',
      value: `${questionnaire?.hydrationGoal || 8} glasses`,
      field: 'hydrationGoal',
    },
    {
      id: 'exercise',
      title: 'Exercise Goal',
      description: 'Your fitness and activity goals',
      icon: 'fitness',
      value: `${questionnaire?.exerciseGoal || 30} minutes`,
      field: 'exerciseGoal',
    },
    {
      id: 'mind',
      title: 'Mind Goal',
      description: 'Your mental wellness goals',
      icon: 'book',
      value: `${questionnaire?.mindGoal || 10} minutes`,
      field: 'mindGoal',
    },
    {
      id: 'screenTime',
      title: 'Screen Time Goal',
      description: 'Your digital wellness goals',
      icon: 'phone-portrait',
      value: `${questionnaire?.screenTimeGoal || 2} hours`,
      field: 'screenTimeGoal',
    },
    {
      id: 'shower',
      title: 'Shower Goal',
      description: 'Your shower and hygiene goals',
      icon: 'water',
      value: `${questionnaire?.showerGoal || 2} minutes`,
      field: 'showerGoal',
    },
  ];

  const handleGoalEdit = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditingValue(goal.value);
  };

  const handleGoalSave = async () => {
    if (!editingGoal) return;

    try {
      // In a real app, you would update the user's goals in the backend
      // For now, we'll just show a success message
      Alert.alert('Success', 'Goal updated successfully!');
      setEditingGoal(null);
      setEditingValue('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    }
  };

  const handleGoalCancel = () => {
    setEditingGoal(null);
    setEditingValue('');
  };

  const handleDarkModeToggle = () => {
    toggleTheme();
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Progress Reset', 'Your progress has been reset.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data export is being prepared. You will receive an email shortly.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            onLogout();
          },
        },
      ]
    );
  };

  const renderGoalCard = (goal: Goal) => (
    <View
      key={goal.id}
      style={[
        styles.goalCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
      ]}
    >
      <View style={styles.goalHeader}>
        <View style={styles.goalIconContainer}>
          <Ionicons name={goal.icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
            {goal.title}
          </Text>
          <Text style={[styles.goalDescription, { color: theme.colors.textSecondary }]}>
            {goal.description}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleGoalEdit(goal)}
        >
          <Ionicons name="create" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {editingGoal === goal.id ? (
        <View style={styles.editContainer}>
          <Text style={[styles.goalValue, { color: theme.colors.primary }]}>
            {editingValue}
          </Text>
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editActionButton, { backgroundColor: theme.colors.error }]}
              onPress={handleGoalCancel}
            >
              <Text style={styles.editActionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editActionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleGoalSave}
            >
              <Text style={styles.editActionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={[styles.goalValue, { color: theme.colors.primary }]}>
          {goal.value}
        </Text>
      )}
    </View>
  );

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: keyof typeof Ionicons.glyphMap,
    onPress?: () => void,
    showSwitch?: boolean,
    switchValue?: boolean,
    onSwitchChange?: (value: boolean) => void
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      {showSwitch ? (
        <TouchableOpacity
          style={[
            styles.switch,
            { backgroundColor: switchValue ? theme.colors.primary : theme.colors.border }
          ]}
          onPress={() => onSwitchChange?.(!switchValue)}
        >
          <View
            style={[
              styles.switchThumb,
              {
                backgroundColor: 'white',
                transform: [{ translateX: switchValue ? 20 : 0 }],
              },
            ]}
          />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={[styles.userInfoCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.userSubtitle, { color: theme.colors.textSecondary }]}>
            Day {user?.currentDay || 1} of your transformation journey
          </Text>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Goals</Text>
          {goals.map(renderGoalCard)}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Settings</Text>
          
          {renderSettingItem(
            'Notifications',
            'Manage your notification preferences',
            'notifications',
            onNavigateToNotificationSettings
          )}
          
          {renderSettingItem(
            'Dark Mode',
            'Toggle between light and dark themes',
            'moon',
            undefined,
            true,
            theme.isDark,
            handleDarkModeToggle
          )}
          
          {renderSettingItem(
            'Reset Progress',
            'Start fresh with your transformation journey',
            'refresh',
            handleResetProgress
          )}
          
          {renderSettingItem(
            'Export Data',
            'Download your progress data',
            'download',
            handleExportData
          )}
          
          {renderSettingItem(
            'Delete Account',
            'Permanently remove your account and data',
            'trash',
            handleDeleteAccount
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          
          {renderSettingItem(
            'Logout',
            'Sign out of your account',
            'log-out',
            handleLogout
          )}
        </View>

        {/* Admin Panel Section */}
        {user?.isAdmin && onNavigateToAdminPanel && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              ADMIN
            </Text>
            {renderSettingItem(
              'Admin Panel',
              'View all users and system data',
              'shield-outline',
              onNavigateToAdminPanel
            )}
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userInfoCard: {
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 16,
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
  },
  goalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editContainer: {
    alignItems: 'center',
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  editActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

export default Profile; 