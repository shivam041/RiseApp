import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  loadGoals, 
  addGoal, 
  updateGoal, 
  deleteGoal, 
  toggleGoalStatus,
  Goal 
} from '../store/slices/goalsSlice';

const { width, height } = Dimensions.get('window');

interface ProfileProps {
  onBack: () => void;
  onNavigateToNotificationSettings: () => void;
  onLogout: () => void;
  onNavigateToAdminPanel?: () => void;
}

interface GoalFormData {
  title: string;
  description: string;
  category: Goal['category'];
  value: string;
  target: string;
}

const Profile: React.FC<ProfileProps> = ({ onBack, onNavigateToNotificationSettings, onLogout, onNavigateToAdminPanel }) => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalFormData, setGoalFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    category: 'custom',
    value: '',
    target: '',
  });
  
  // Debug: Check if onLogout prop is received
  console.log('Profile: Component rendered with onLogout:', !!onLogout);
  console.log('Profile: onLogout function:', onLogout);
  
  const user = useSelector((state: RootState) => state.user.user);
  const questionnaire = useSelector((state: RootState) => state.questionnaire.questionnaire);
  const { goals, isLoading } = useSelector((state: RootState) => state.goals);

  // Load goals when component mounts
  useEffect(() => {
    dispatch(loadGoals());
  }, [dispatch]);

  // Create default goals based on user's questionnaire responses
  const defaultGoals: Goal[] = [
    {
      id: 'sleep',
      title: 'Sleep Goal',
      description: 'Your wake-up time goal',
      category: 'sleep',
      value: questionnaire?.wakeUpTime || '6:00 AM',
      target: 'Wake up early every day',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'hydration',
      title: 'Hydration Goal',
      description: 'Your daily water intake goal',
      category: 'water',
      value: `${questionnaire?.waterGoal || '8'} glasses`,
      target: 'Stay hydrated throughout the day',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exercise',
      title: 'Exercise Goal',
      description: 'Your fitness and activity goals',
      category: 'exercise',
      value: `${questionnaire?.exerciseGoal || '30'} minutes`,
      target: 'Build strength and endurance',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mind',
      title: 'Mind Goal',
      description: 'Your mental wellness goals',
      category: 'mind',
      value: `${questionnaire?.mindGoal || '10'} minutes`,
      target: 'Find inner peace and focus',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'screenTime',
      title: 'Screen Time Goal',
      description: 'Your digital wellness goals',
      category: 'screenTime',
      value: `${questionnaire?.screenTimeGoal || '2'} hours`,
      target: 'Limit digital consumption',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'shower',
      title: 'Shower Goal',
      description: 'Your shower and hygiene goals',
      category: 'shower',
      value: `${questionnaire?.showerGoal || '2'} minutes`,
      target: 'Build mental toughness',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Initialize default goals if none exist
  useEffect(() => {
    if (goals.length === 0 && !isLoading) {
      defaultGoals.forEach(goal => {
        dispatch(addGoal({
          title: goal.title,
          description: goal.description,
          category: goal.category,
          value: goal.value,
          target: goal.target,
          isActive: goal.isActive,
        }));
      });
    }
  }, [goals.length, isLoading, dispatch]);

  const handleGoalEdit = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditingValue(goal.value);
  };

  const handleGoalSave = async (goal: Goal) => {
    if (!editingValue.trim()) {
      Alert.alert('Error', 'Goal value cannot be empty');
      return;
    }

    try {
      const updatedGoal = { ...goal, value: editingValue };
      await dispatch(updateGoal(updatedGoal)).unwrap();
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

  const handleAddGoal = () => {
    setGoalFormData({
      title: '',
      description: '',
      category: 'custom',
      value: '',
      target: '',
    });
    setShowAddGoalModal(true);
  };

  const handleSaveNewGoal = async () => {
    if (!goalFormData.title.trim() || !goalFormData.value.trim()) {
      Alert.alert('Error', 'Title and value are required');
      return;
    }

    try {
              await dispatch(addGoal({
          title: goalFormData.title,
          description: goalFormData.description,
          category: goalFormData.category,
          value: goalFormData.value,
          target: goalFormData.target,
          isActive: true,
        })).unwrap();
      
      Alert.alert('Success', 'New goal added successfully!');
      setShowAddGoalModal(false);
      setGoalFormData({
        title: '',
        description: '',
        category: 'custom',
        value: '',
        target: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (goal: Goal) => {
    if (goal.category !== 'custom') {
      Alert.alert('Cannot Delete', 'Default goals cannot be deleted. You can only edit their values.');
      return;
    }

    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteGoal(goal.id)).unwrap();
              Alert.alert('Success', 'Goal deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleGoalStatus = async (goal: Goal) => {
    try {
      await dispatch(toggleGoalStatus(goal)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle goal status. Please try again.');
    }
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
    console.log('Profile: Logout button clicked');
    
    // For web compatibility, use window.confirm instead of Alert
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        console.log('Profile: User confirmed logout via window.confirm, calling onLogout');
        onLogout();
      } else {
        console.log('Profile: User cancelled logout via window.confirm');
      }
    } else {
      // Fallback to Alert for mobile
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
              console.log('Profile: User confirmed logout via Alert, calling onLogout');
              onLogout();
            },
          },
        ]
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return 'moon';
      case 'water':
        return 'water';
      case 'exercise':
        return 'fitness';
      case 'mind':
        return 'book';
      case 'screenTime':
        return 'phone-portrait';
      case 'shower':
        return 'water';
      default:
        return 'star';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep':
        return '#8B5CF6';
      case 'water':
        return '#06B6D4';
      case 'exercise':
        return '#10B981';
      case 'mind':
        return '#F59E0B';
      case 'screenTime':
        return '#EF4444';
      case 'shower':
        return '#3B82F6';
      default:
        return theme.colors.primary;
    }
  };

  const renderGoalCard = (goal: Goal) => (
    <View
      key={goal.id}
      style={[
        styles.goalCard,
        { 
          backgroundColor: theme.colors.surface, 
          borderColor: theme.colors.border,
          opacity: goal.isActive ? 1 : 0.6,
        }
      ]}
    >
      <View style={styles.goalHeader}>
        <View style={[styles.goalIconContainer, { backgroundColor: `${getCategoryColor(goal.category)}20` }]}>
          <Ionicons name={getCategoryIcon(goal.category) as any} size={24} color={getCategoryColor(goal.category)} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
            {goal.title}
          </Text>
          <Text style={[styles.goalDescription, { color: theme.colors.textSecondary }]}>
            {goal.description}
          </Text>
        </View>
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleGoalStatus(goal)}
          >
            <Ionicons 
              name={goal.isActive ? "eye" : "eye-off"} 
              size={20} 
              color={goal.isActive ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleGoalEdit(goal)}
          >
            <Ionicons name="create" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          {goal.category === 'custom' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteGoal(goal)}
            >
              <Ionicons name="trash" size={20} color={theme.colors.error || '#EF4444'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {editingGoal === goal.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, { 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }]}
            value={editingValue}
            onChangeText={setEditingValue}
            placeholder="Enter new value..."
            placeholderTextColor={theme.colors.textSecondary}
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editActionButton, { backgroundColor: theme.colors.error || '#EF4444' }]}
              onPress={handleGoalCancel}
            >
              <Text style={styles.editActionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editActionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleGoalSave(goal)}
            >
              <Text style={styles.editActionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.goalContent}>
          <Text style={[styles.goalValue, { color: theme.colors.primary }]}>
            {goal.value}
          </Text>
          <Text style={[styles.goalTarget, { color: theme.colors.textSecondary }]}>
            {goal.target}
          </Text>
        </View>
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
  ) => {
    console.log(`Profile: renderSettingItem called for "${title}" with onPress:`, !!onPress);
    return (
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          console.log(`Profile: Setting item "${title}" pressed`);
          if (onPress) {
            console.log(`Profile: Calling onPress for "${title}"`);
            onPress();
          } else {
            console.log(`Profile: No onPress handler for "${title}"`);
          }
        }}
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
  };

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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Goals</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading goals...
            </Text>
          ) : (
            goals.map(renderGoalCard)
          )}
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
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
            Debug: onLogout prop received: {typeof onLogout === 'function' ? 'YES' : 'NO'}
          </Text>
          
          {/* Temporary test button */}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              console.log('Profile: Test logout button pressed');
              handleLogout();
            }}
          >
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              TEST LOGOUT (Direct)
            </Text>
          </TouchableOpacity>
          
          
          {renderSettingItem(
            'Logout',
            'Sign out of your account',
            'log-out',
            () => {
              console.log('Profile: Logout button pressed via renderSettingItem');
              handleLogout();
            }
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

      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add New Goal</Text>
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Goal title"
              placeholderTextColor={theme.colors.textSecondary}
              value={goalFormData.title}
              onChangeText={(text) => setGoalFormData({ ...goalFormData, title: text })}
            />
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Description"
              placeholderTextColor={theme.colors.textSecondary}
              value={goalFormData.description}
              onChangeText={(text) => setGoalFormData({ ...goalFormData, description: text })}
            />
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Goal value (e.g., 30 minutes)"
              placeholderTextColor={theme.colors.textSecondary}
              value={goalFormData.value}
              onChangeText={(text) => setGoalFormData({ ...goalFormData, value: text })}
            />
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Target description"
              placeholderTextColor={theme.colors.textSecondary}
              value={goalFormData.target}
              onChangeText={(text) => setGoalFormData({ ...goalFormData, target: text })}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.error || '#EF4444' }]}
                onPress={() => setShowAddGoalModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveNewGoal}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  goalContent: {
    alignItems: 'center',
  },
  goalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  goalTarget: {
    fontSize: 14,
    textAlign: 'center',
  },
  editContainer: {
    alignItems: 'center',
  },
  editInput: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
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
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile; 