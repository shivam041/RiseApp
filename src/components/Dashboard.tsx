import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadQuestionnaire } from '../store/slices/questionnaireSlice';

const { width, height } = Dimensions.get('window');

interface DashboardProps {
  onNavigateToStats: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotificationSettings: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToNotes: () => void;
}

interface Task {
  id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToStats,
  onNavigateToProfile,
  onNavigateToNotificationSettings,
  onNavigateToCalendar,
  onNavigateToNotes,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Get questionnaire data from Redux store
  const questionnaire = useSelector((state: RootState) => state.questionnaire.questionnaire);
  const isLoading = useSelector((state: RootState) => state.questionnaire.isLoading);
  
  // Create dynamic tasks based on user's actual goals
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load questionnaire data when component mounts
  useEffect(() => {
    console.log('Dashboard: Loading questionnaire data...');
    dispatch(loadQuestionnaire()).catch(error => {
      console.error('Dashboard: Failed to load questionnaire:', error);
    });
  }, [dispatch]);

  // Update tasks when questionnaire data changes
  useEffect(() => {
    console.log('Dashboard: Questionnaire data changed:', questionnaire);
    if (questionnaire) {
      console.log('Dashboard: Creating dynamic tasks with data:', questionnaire);
      const dynamicTasks: Task[] = [
        {
          id: '1',
          title: `Wake up at ${questionnaire.sleepGoal}`,
          category: 'sleep',
          isCompleted: false,
          difficulty: 'medium',
          estimatedTime: 1,
        },
        {
          id: '2',
          title: `Drink ${questionnaire.waterGoal} glasses of water`,
          category: 'water',
          isCompleted: false,
          difficulty: 'easy',
          estimatedTime: 5,
        },
        {
          id: '3',
          title: `Exercise for ${questionnaire.exerciseGoal} minutes`,
          category: 'exercise',
          isCompleted: false,
          difficulty: 'hard',
          estimatedTime: parseInt(questionnaire.exerciseGoal) || 30,
        },
        {
          id: '4',
          title: `Meditate for ${questionnaire.mindGoal} minutes`,
          category: 'mind',
          isCompleted: false,
          difficulty: 'medium',
          estimatedTime: parseInt(questionnaire.mindGoal) || 10,
        },
        {
          id: '5',
          title: `Limit screen time to ${questionnaire.screenTimeGoal} hours`,
          category: 'screenTime',
          isCompleted: false,
          difficulty: 'hard',
          estimatedTime: (parseInt(questionnaire.screenTimeGoal) || 2) * 60, // Convert hours to minutes
        },
        {
          id: '6',
          title: `Take a cold shower for ${questionnaire.showerGoal} minutes`,
          category: 'shower',
          isCompleted: false,
          difficulty: 'hard',
          estimatedTime: parseInt(questionnaire.showerGoal) || 5,
        },
      ];
      console.log('Dashboard: Setting dynamic tasks:', dynamicTasks);
      setTasks(dynamicTasks);
    } else if (!isLoading) {
      console.log('Dashboard: No questionnaire data, setting fallback tasks');
      // Fallback tasks when no questionnaire data is available
      const fallbackTasks: Task[] = [
        {
          id: '1',
          title: 'Wake up at your goal time',
          category: 'sleep',
          isCompleted: false,
          difficulty: 'medium',
          estimatedTime: 1,
        },
        {
          id: '2',
          title: 'Drink your daily water goal',
          category: 'water',
          isCompleted: false,
          difficulty: 'easy',
          estimatedTime: 5,
        },
        {
          id: '3',
          title: 'Complete your exercise goal',
          category: 'exercise',
          isCompleted: false,
          difficulty: 'hard',
          estimatedTime: 30,
        },
        {
          id: '4',
          title: 'Complete your meditation goal',
          category: 'mind',
          isCompleted: false,
          difficulty: 'medium',
          estimatedTime: 10,
        },
        {
          id: '5',
          title: 'Stay within your screen time limit',
          category: 'screenTime',
          isCompleted: false,
          difficulty: 'hard',
          estimatedTime: 120,
        },
        {
          id: '6',
          title: 'Take your cold shower',
          category: 'shower',
          isCompleted: false,
          difficulty: 'hard',
          estimatedTime: 5,
        },
      ];
      setTasks(fallbackTasks);
    }
  }, [questionnaire, isLoading]);

  const tabs = [
    { name: 'Today', icon: 'calendar' },
    { name: 'Progress', icon: 'trending-up' },
    { name: 'Goals', icon: 'flag' },
  ];

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return 'bed';
      case 'water':
        return 'water';
      case 'exercise':
        return 'fitness';
      case 'mind':
        return 'brain';
      case 'screenTime':
        return 'phone-portrait';
      case 'shower':
        return 'water';
      default:
        return 'checkmark-circle';
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return theme.colors.primary;
    }
  };

  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const renderTask = (task: Task, index: number) => (
    <TouchableOpacity
      key={task.id}
      style={[
        styles.taskCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => handleTaskToggle(task.id)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskLeft}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: getCategoryColor(task.category) },
            ]}
          >
            <Ionicons
              name={getCategoryIcon(task.category) as any}
              size={16}
              color="white"
            />
          </View>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
              {task.title}
            </Text>
            <View style={styles.taskMeta}>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(task.difficulty) },
                ]}
              >
                <Text style={styles.difficultyText}>{task.difficulty}</Text>
              </View>
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                {task.estimatedTime} min
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.checkbox,
            {
              borderColor: task.isCompleted ? theme.colors.primary : theme.colors.border,
              backgroundColor: task.isCompleted ? theme.colors.primary : 'transparent',
            },
          ]}
          onPress={() => handleTaskToggle(task.id)}
        >
          {task.isCompleted && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderProgressCard = () => (
    <View
      style={[
        styles.progressCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.progressHeader}>
        <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
          Today's Progress
        </Text>
        <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>
          {completedTasks} of {totalTasks} completed
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercentage}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressPercentage, { color: theme.colors.primary }]}>
        {Math.round(progressPercentage)}%
      </Text>
    </View>
  );

  const renderCharacter = () => (
    <View style={styles.characterContainer}>
      <View style={styles.characterPlatform}>
        <View style={styles.character}>
          <View style={styles.torch}>
            <View style={styles.flame} />
          </View>
        </View>
      </View>
      <Text style={[styles.characterText, { color: theme.colors.textSecondary }]}>
        Day 1 of your transformation
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Welcome back, Warrior
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Ready to conquer today's challenges?
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onNavigateToProfile}
        >
          <Ionicons name="person-circle" size={40} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Character Section */}
        {renderCharacter()}

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Access
          </Text>
          <View style={styles.quickAccessButtons}>
            <TouchableOpacity
              style={[styles.quickAccessButton, { backgroundColor: theme.colors.surface }]}
              onPress={onNavigateToCalendar}
            >
              <Ionicons name="calendar" size={32} color={theme.colors.primary} />
              <Text style={[styles.quickAccessButtonText, { color: theme.colors.text }]}>
                Calendar
              </Text>
              <Text style={[styles.quickAccessButtonSubtext, { color: theme.colors.textSecondary }]}>
                Track Progress
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAccessButton, { backgroundColor: theme.colors.surface }]}
              onPress={onNavigateToNotes}
            >
              <Ionicons name="document-text" size={32} color={theme.colors.primary} />
              <Text style={[styles.quickAccessButtonText, { color: theme.colors.text }]}>
                Notes
              </Text>
              <Text style={[styles.quickAccessButtonSubtext, { color: theme.colors.textSecondary }]}>
                Daily Tasks
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Card */}
        {renderProgressCard()}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab,
                selectedTab === index && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => setSelectedTab(index)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={selectedTab === index ? 'white' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedTab === index ? 'white' : theme.colors.textSecondary,
                  },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Today's Tasks
            </Text>
            <TouchableOpacity onPress={onNavigateToStats}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading your goals...
              </Text>
            </View>
          ) : (
            tasks.map(renderTask)
          )}
        </View>
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
          <Ionicons name="home" size={24} color={theme.colors.primary} />
          <Text style={[styles.navText, { color: theme.colors.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateToStats}>
          <Ionicons name="stats-chart" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateToCalendar}>
          <Ionicons name="calendar" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateToNotes}>
          <Ionicons name="document-text" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateToNotificationSettings}>
          <Ionicons name="notifications" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateToProfile}>
          <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Profile</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  profileButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  characterContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  characterPlatform: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 16,
  },
  character: {
    width: 80,
    height: 80,
    backgroundColor: '#1F2937',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  torch: {
    width: 20,
    height: 30,
    backgroundColor: '#92400E',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flame: {
    width: 16,
    height: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  characterText: {
    fontSize: 14,
    textAlign: 'center',
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3D2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#2D1B1B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  tasksSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  quickAccessButton: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '45%',
  },
  quickAccessButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  quickAccessButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Dashboard; 