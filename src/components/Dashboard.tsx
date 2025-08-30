import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadQuestionnaire } from '../store/slices/questionnaireSlice';
import { loadGoals } from '../store/slices/goalsSlice';
import { useClock } from '../hooks/useClock';
import { 
  loadDailyProgress, 
  saveDailyProgress, 
  updateCurrentDay,
  DailyProgress,
  Task as ProgressTask 
} from '../store/slices/progressSlice';

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
  difficulty: number;
  streak: number;
  repeat: string;
  description: string;
  image?: string;
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
  
  // Get progress data from Redux store
  const progress = useSelector((state: RootState) => state.progress);
  const { dailyProgress, totalDays } = progress;
  
  // Get goals data from Redux store
  const { goals } = useSelector((state: RootState) => state.goals);
  
  // Use the clock hook for automatic day progression
  const { 
    currentDay, 
    isNewDay, 
    getCurrentTime, 
    getCurrentDate, 
    getFormattedTimeUntilMidnight,
    isCurrentlyMidnight 
  } = useClock();
  
  // Create dynamic tasks based on user's actual goals
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(getFormattedTimeUntilMidnight());

  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setTimeUntilMidnight(getFormattedTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [getCurrentTime, getFormattedTimeUntilMidnight]);

  // Load questionnaire data when component mounts
  useEffect(() => {
    console.log('Dashboard: Loading questionnaire data...');
    dispatch(loadQuestionnaire()).catch(error => {
      console.error('Dashboard: Failed to load questionnaire:', error);
    });
  }, [dispatch]);

  // Load goals data when component mounts
  useEffect(() => {
    console.log('Dashboard: Loading goals data...');
    dispatch(loadGoals()).catch(error => {
      console.error('Dashboard: Failed to load goals:', error);
    });
  }, [dispatch]);

  // Load progress data when component mounts
  useEffect(() => {
    console.log('Dashboard: Loading progress data...');
    dispatch(loadDailyProgress()).catch(error => {
      console.error('Dashboard: Failed to load progress:', error);
    });
  }, [dispatch]);

  // Handle new day celebration
  useEffect(() => {
    if (isNewDay) {
      console.log('New day detected! Day', currentDay);
      
      // Reset tasks for the new day
      setTasks(prevTasks => 
        prevTasks.map(task => ({ ...task, isCompleted: false }))
      );
      
      // Show celebration
      setShowCelebration(true);
      
      // Hide celebration after 5 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isNewDay, currentDay]);

  // Update tasks when goals data changes
  useEffect(() => {
    console.log('Dashboard: Goals data changed:', goals);
    if (goals && goals.length > 0) {
      console.log('Dashboard: Creating dynamic tasks with goals:', goals);
      const dynamicTasks: Task[] = goals
        .filter(goal => goal.isActive)
        .map((goal, index) => ({
          id: goal.id,
          title: goal.title,
          category: goal.category,
          isCompleted: false,
          difficulty: 3, // Default difficulty
          streak: 0,
          repeat: 'Everyday',
          description: goal.description,
          image: getCategoryImage(goal.category),
        }));
      
      console.log('Dashboard: Setting dynamic tasks from goals:', dynamicTasks);
      setTasks(dynamicTasks);
    } else if (questionnaire) {
      console.log('Dashboard: No goals data, using questionnaire data');
      // Fallback to questionnaire-based tasks when no goals are available
      const questionnaireTasks: Task[] = [
        {
          id: '1',
          title: `Wake up at ${questionnaire.wakeUpTime || '7AM'}`,
          category: 'sleep',
          isCompleted: false,
          difficulty: 4,
          streak: 10,
          repeat: 'Everyday',
          description: 'Rise before everyone, seize the day.',
          image: 'sunrise'
        },
        {
          id: '2',
          title: `Drink ${questionnaire.waterGoal || '2L'} water`,
          category: 'water',
          isCompleted: false,
          difficulty: 1,
          streak: 10,
          repeat: 'Everyday',
          description: 'Stay hydrated, stay energised.',
          image: 'water'
        },
        {
          id: '3',
          title: 'Take cold shower',
          category: 'shower',
          isCompleted: false,
          difficulty: 3,
          streak: 8,
          repeat: '1x/week',
          description: 'Build mental toughness.',
          image: 'shower'
        },
        {
          id: '4',
          title: `Exercise ${questionnaire.exerciseGoal || '30'} minutes`,
          category: 'exercise',
          isCompleted: false,
          difficulty: 4,
          streak: 5,
          repeat: 'Everyday',
          description: 'Build strength and endurance.',
          image: 'exercise'
        },
        {
          id: '5',
          title: `Meditate ${questionnaire.mindGoal || '10'} minutes`,
          category: 'mind',
          isCompleted: false,
          difficulty: 2,
          streak: 12,
          repeat: 'Everyday',
          description: 'Find inner peace and focus.',
          image: 'meditation'
        },
        {
          id: '6',
          title: 'Read 30 minutes',
          category: 'mind',
          isCompleted: false,
          difficulty: 2,
          streak: 7,
          repeat: 'Everyday',
          description: 'Expand your knowledge.',
          image: 'book'
        },
      ];
      setTasks(questionnaireTasks);
    } else if (!isLoading) {
      console.log('Dashboard: No data available, setting fallback tasks');
      // Fallback tasks when no data is available
      const fallbackTasks: Task[] = [
        {
          id: '1',
          title: 'Wake up at 7AM',
          category: 'sleep',
          isCompleted: false,
          difficulty: 4,
          streak: 10,
          repeat: 'Everyday',
          description: 'Rise before everyone, seize the day.',
          image: 'sunrise'
        },
        {
          id: '2',
          title: 'Drink 2L water',
          category: 'water',
          isCompleted: false,
          difficulty: 1,
          streak: 10,
          repeat: 'Everyday',
          description: 'Stay hydrated, stay energised.',
          image: 'water'
        },
        {
          id: '3',
          title: 'Take cold shower',
          category: 'shower',
          isCompleted: false,
          difficulty: 3,
          streak: 8,
          repeat: '1x/week',
          description: 'Build mental toughness.',
          image: 'shower'
        },
        {
          id: '4',
          title: 'Exercise 30 minutes',
          category: 'exercise',
          isCompleted: false,
          difficulty: 4,
          streak: 5,
          repeat: 'Everyday',
          description: 'Build strength and endurance.',
          image: 'exercise'
        },
        {
          id: '5',
          title: 'Meditate 10 minutes',
          category: 'mind',
          isCompleted: false,
          difficulty: 2,
          streak: 12,
          repeat: 'Everyday',
          description: 'Find inner peace and focus.',
          image: 'meditation'
        },
        {
          id: '6',
          title: 'Read 30 minutes',
          category: 'mind',
          isCompleted: false,
          difficulty: 2,
          streak: 7,
          repeat: 'Everyday',
          description: 'Expand your knowledge.',
          image: 'book'
        },
      ];
      setTasks(fallbackTasks);
    }
  }, [goals, questionnaire, isLoading]);

  // Helper function to get category image
  const getCategoryImage = (category: string) => {
    switch (category) {
      case 'sleep':
        return 'sunrise';
      case 'water':
        return 'water';
      case 'exercise':
        return 'exercise';
      case 'mind':
        return 'meditation';
      case 'shower':
        return 'shower';
      case 'screenTime':
        return 'phone';
      case 'custom':
        return 'star';
      default:
        return 'checkmark-circle';
    }
  };

  // Sync tasks with progress data
  useEffect(() => {
    if (dailyProgress.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayProgress = dailyProgress.find(p => p.date === today);
      
      if (todayProgress) {
        setTasks(prevTasks => 
          prevTasks.map(task => {
            const progressTask = todayProgress.tasks.find(pt => pt.id === task.id);
            return progressTask ? { ...task, isCompleted: progressTask.isCompleted } : task;
          })
        );
      }
    }
  }, [dailyProgress]);

  // Check if all tasks are completed and advance to next day
  useEffect(() => {
    const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.isCompleted);
    
    if (allTasksCompleted && currentDay < totalDays) {
      // Show celebration
      setShowCelebration(true);
      
      // Auto-advance to next day after a short delay
      const timer = setTimeout(async () => {
        try {
          const nextDay = currentDay + 1;
          await dispatch(updateCurrentDay(nextDay)).unwrap();
          console.log(`Advanced to day ${nextDay}`);
          
          // Reset tasks for the new day
          setTasks(prevTasks => 
            prevTasks.map(task => ({ ...task, isCompleted: false }))
          );
          
          // Hide celebration
          setShowCelebration(false);
        } catch (error) {
          console.error('Failed to advance to next day:', error);
        }
      }, 3000); // 3 second delay
      
      return () => clearTimeout(timer);
    }
  }, [tasks, currentDay, totalDays, dispatch]);

  const tabs = [
    { name: 'To-dos', count: tasks.filter(t => !t.isCompleted).length, icon: 'list' },
    { name: 'Done', count: tasks.filter(t => t.isCompleted).length, icon: 'checkmark-circle' },
    { name: 'Skipped', count: 0, icon: 'close-circle' },
  ];

  const handleTaskToggle = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, isCompleted: !task.isCompleted }
        : task
    );
    
    setTasks(updatedTasks);

    // Calculate new streak for the task
    const task = updatedTasks.find(t => t.id === taskId);
    if (task) {
      const newStreak = task.isCompleted ? task.streak + 1 : Math.max(0, task.streak - 1);
      task.streak = newStreak;
    }

    // Save progress to persistent storage
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayProgress: DailyProgress = {
        id: today,
        date: today,
        tasks: updatedTasks.map(task => ({
          id: task.id,
          title: task.title,
          category: task.category,
          isCompleted: task.isCompleted,
          difficulty: task.difficulty,
          streak: task.streak,
          repeat: task.repeat,
          description: task.description,
        })),
        completedTasks: updatedTasks.filter(t => t.isCompleted).length,
        totalTasks: updatedTasks.length,
        waterIntake: 0,
        exerciseMinutes: 0,
        screenTimeHours: 0,
        stressLevel: 5,
        energyLevel: 5,
        motivationLevel: 5,
      };

      await dispatch(saveDailyProgress(todayProgress)).unwrap();
      console.log('Progress saved successfully');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Calculate overall progress and achievements
  const getOverallProgress = () => {
    const totalCompleted = dailyProgress.reduce((sum, day) => sum + day.completedTasks, 0);
    const totalPossible = dailyProgress.reduce((sum, day) => sum + day.totalTasks, 0);
    const averageCompletion = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    for (let i = dailyProgress.length - 1; i >= 0; i--) {
      if (dailyProgress[i].completedTasks > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return {
      totalCompleted,
      totalPossible,
      averageCompletion,
      currentStreak,
    };
  };

  const overallProgress = getOverallProgress();

  // Get water intake progress
  const getWaterProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = dailyProgress.find(p => p.date === today);
    return todayProgress?.waterIntake || 0;
  };

  const waterProgress = getWaterProgress();

  // Calculate achievements
  const getAchievements = () => {
    const achievements = [];
    
    if (overallProgress.currentStreak >= 7) {
      achievements.push({ type: 'streak', title: 'Week Warrior', icon: '🔥' });
    }
    
    if (overallProgress.currentStreak >= 30) {
      achievements.push({ type: 'streak', title: 'Month Master', icon: '👑' });
    }
    
    if (overallProgress.totalCompleted >= 100) {
      achievements.push({ type: 'tasks', title: 'Century Club', icon: '💯' });
    }
    
    if (overallProgress.averageCompletion >= 90) {
      achievements.push({ type: 'consistency', title: 'Consistency King', icon: '⭐' });
    }
    
    return achievements;
  };

  const achievements = getAchievements();

  // Calculate user level based on progress
  const getUserLevel = () => {
    const totalExperience = overallProgress.totalCompleted * 10 + overallProgress.currentStreak * 5;
    const level = Math.floor(totalExperience / 100) + 1;
    const experienceInCurrentLevel = totalExperience % 100;
    const experienceToNextLevel = 100 - experienceInCurrentLevel;
    
    return {
      level,
      experienceInCurrentLevel,
      experienceToNextLevel,
      totalExperience,
    };
  };

  const userLevel = getUserLevel();

  // Motivational quotes and tips
  const getMotivationalContent = () => {
    const quotes = [
      "Every day is a new beginning. Take a deep breath and start again.",
      "The only bad workout is the one that didn't happen.",
      "Small progress is still progress.",
      "You are stronger than you think.",
      "Discipline is choosing between what you want now and what you want most.",
    ];
    
    const tips = [
      "Start your day with the hardest task first.",
      "Take breaks between tasks to maintain focus.",
      "Celebrate small wins to stay motivated.",
      "Track your progress to see how far you've come.",
      "Remember why you started when motivation is low.",
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return { quote: randomQuote, tip: randomTip };
  };

  const motivationalContent = getMotivationalContent();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return 'sunny';
      case 'water':
        return 'water';
      case 'exercise':
        return 'fitness';
      case 'mind':
        return 'brain';
      case 'shower':
        return 'water-outline';
      case 'screenTime':
        return 'phone-portrait';
      case 'custom':
        return 'star';
      default:
        return 'checkmark-circle';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep':
        return '#F59E0B';
      case 'water':
        return '#06B6D4';
      case 'exercise':
        return '#10B981';
      case 'mind':
        return '#8B5CF6';
      case 'shower':
        return '#3B82F6';
      case 'screenTime':
        return '#EF4444';
      case 'custom':
        return '#8B5CF6';
      default:
        return theme.colors.primary;
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
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
            <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
              {task.description}
            </Text>
            <View style={styles.taskMeta}>
              <View style={styles.streakContainer}>
                <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                  {task.streak}d
                </Text>
              </View>
              <Text style={[styles.repeatText, { color: theme.colors.textSecondary }]}>
                {task.repeat} Difficulty
              </Text>
              <Text style={[styles.difficultyText, { color: theme.colors.primary }]}>
                {getDifficultyStars(task.difficulty)}
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
      <Text style={[styles.swipeHint, { color: theme.colors.textSecondary }]}>
        Swipe to complete or skip
      </Text>
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
          Progress since day 1
        </Text>
        <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>
          {waterProgress}L water drank today
        </Text>
      </View>
      
      <View style={styles.progressStats}>
        <View style={styles.progressStat}>
          <Text style={[styles.progressStatNumber, { color: theme.colors.primary }]}>
            {overallProgress.totalCompleted}
          </Text>
          <Text style={[styles.progressStatLabel, { color: theme.colors.textSecondary }]}>
            Tasks completed
          </Text>
        </View>
        
        <View style={styles.progressStat}>
          <Text style={[styles.progressStatNumber, { color: theme.colors.primary }]}>
            {Math.round(overallProgress.averageCompletion)}%
          </Text>
          <Text style={[styles.progressStatLabel, { color: theme.colors.textSecondary }]}>
            Success rate
          </Text>
        </View>
        
        <View style={styles.progressStat}>
          <Text style={[styles.progressStatNumber, { color: theme.colors.primary }]}>
            {overallProgress.currentStreak}
          </Text>
          <Text style={[styles.progressStatLabel, { color: theme.colors.textSecondary }]}>
            Day streak
          </Text>
        </View>
      </View>

      {/* Achievements */}
      {achievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <Text style={[styles.achievementsTitle, { color: theme.colors.text }]}>
            Recent Achievements
          </Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[styles.achievementTitle, { color: theme.colors.text }]}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
      
      {/* Level Display */}
      <View style={styles.levelContainer}>
        <Text style={[styles.levelText, { color: theme.colors.primary }]}>
          Level {userLevel.level}
        </Text>
        <View style={styles.experienceBar}>
          <View 
            style={[
              styles.experienceFill, 
              { 
                width: `${(userLevel.experienceInCurrentLevel / 100) * 100}%`,
                backgroundColor: theme.colors.primary 
              }
            ]} 
          />
        </View>
        <Text style={[styles.experienceText, { color: theme.colors.textSecondary }]}>
          {userLevel.experienceInCurrentLevel}/100 XP
        </Text>
      </View>
      
      <Text style={[styles.characterText, { color: theme.colors.textSecondary }]}>
        Day {currentDay} of your transformation
      </Text>
      
      {/* Celebration Message */}
      {showCelebration && (
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationText}>🎉</Text>
          <Text style={[styles.celebrationMessage, { color: theme.colors.primary }]}>
            {isNewDay ? 'New day started!' : 'Amazing! All tasks completed!'}
          </Text>
          <Text style={[styles.celebrationSubtext, { color: theme.colors.textSecondary }]}>
            {isNewDay ? `Welcome to Day ${currentDay}!` : 'Advancing to next day...'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderClockSection = () => (
    <View style={[
      styles.clockSection,
      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
    ]}>
      <View style={styles.clockHeader}>
        <Ionicons name="time" size={24} color={theme.colors.primary} />
        <Text style={[styles.clockTitle, { color: theme.colors.text }]}>
          Local Time
        </Text>
      </View>
      
      <View style={styles.clockContent}>
        <Text style={[styles.currentTime, { color: theme.colors.primary }]}>
          {currentTime}
        </Text>
        <Text style={[styles.currentDate, { color: theme.colors.textSecondary }]}>
          {getCurrentDate()}
        </Text>
      </View>
      
      <View style={styles.midnightCountdown}>
        <Text style={[styles.countdownLabel, { color: theme.colors.textSecondary }]}>
          Next day in:
        </Text>
        <Text style={[styles.countdownTime, { color: theme.colors.primary }]}>
          {timeUntilMidnight}
        </Text>
      </View>
      
      {isCurrentlyMidnight() && (
        <View style={styles.midnightIndicator}>
          <Text style={styles.midnightText}>🕛</Text>
          <Text style={[styles.midnightMessage, { color: theme.colors.primary }]}>
            It's midnight! New day starting...
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.logoText, { color: theme.colors.text }]}>
              Rise
            </Text>
          </View>
          <Text style={[styles.dayCounter, { color: theme.colors.text }]}>
            Day {currentDay}/{totalDays}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Everyday is a new day.
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

        {/* Clock Section */}
        {renderClockSection()}

        {/* Progress Card */}
        {renderProgressCard()}

        {/* Motivational Content */}
        <View style={[
          styles.motivationalContainer,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
        ]}>
          <Text style={[styles.motivationalQuote, { color: theme.colors.text }]}>
            "{motivationalContent.quote}"
          </Text>
          <View style={styles.tipContainer}>
            <Ionicons name="bulb" size={16} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              {motivationalContent.tip}
            </Text>
          </View>
        </View>

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
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedTab === index ? 'white' : theme.colors.textSecondary,
                  },
                ]}
              >
                {tab.name} {tab.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
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
        <TouchableOpacity style={styles.navItem} onPress={onNavigateToStats}>
          <Ionicons name="stats-chart" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.riseLogo}>
            <Ionicons name="sunny" size={24} color="#F59E0B" />
          </View>
          <Text style={[styles.navText, { color: theme.colors.primary }]}>Rise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateToCalendar}>
          <Ionicons name="trophy" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Trophy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={onNavigateToNotes}>
          <Ionicons name="grid" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>More</Text>
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dayCounter: {
    fontSize: 28,
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
  clockSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  clockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clockTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  clockContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentTime: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  currentDate: {
    fontSize: 16,
    textAlign: 'center',
  },
  midnightCountdown: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  countdownLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  countdownTime: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  midnightIndicator: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  midnightText: {
    fontSize: 24,
    marginBottom: 8,
  },
  midnightMessage: {
    fontSize: 16,
    fontWeight: '600',
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
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressStatLabel: {
    fontSize: 12,
    marginTop: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tasksSection: {
    marginBottom: 24,
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
    marginBottom: 12,
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
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  streakContainer: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  repeatText: {
    fontSize: 12,
    marginRight: 8,
  },
  difficultyText: {
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
  swipeHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  celebrationText: {
    fontSize: 30,
    marginBottom: 8,
  },
  celebrationMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  celebrationSubtext: {
    fontSize: 14,
  },
  achievementsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  achievementIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  experienceBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#4A5568',
    borderRadius: 4,
    overflow: 'hidden',
  },
  experienceFill: {
    height: '100%',
    borderRadius: 4,
  },
  experienceText: {
    fontSize: 12,
    marginTop: 4,
  },
  motivationalContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  motivationalQuote: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default Dashboard; 