import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  loadCalendarTasks, 
  addCalendarTask, 
  updateCalendarTask, 
  deleteCalendarTask, 
  toggleTaskCompletion,
  CalendarTask 
} from '../store/slices/calendarSlice';

const { width, height } = Dimensions.get('window');

interface CalendarProps {
  onBack: () => void;
}

interface WeekTask {
  id: string;
  title: string;
  days: string;
  description: string;
}

const Calendar: React.FC<CalendarProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    time: '',
    duration: '30',
    category: 'personal' as CalendarTask['category'],
    priority: 'medium' as CalendarTask['priority'],
    isRecurring: false,
    recurringPattern: 'daily' as CalendarTask['recurringPattern'],
    tags: '',
  });
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  
  // Get progress data from Redux store
  const currentDay = useSelector((state: RootState) => state.progress.currentDay);
  const dailyProgress = useSelector((state: RootState) => state.progress.dailyProgress);
  const { tasks: calendarTasks, isLoading } = useSelector((state: RootState) => state.calendar);

  // Load calendar tasks when component mounts
  useEffect(() => {
    dispatch(loadCalendarTasks());
  }, [dispatch]);

  // Calculate which week the user is currently in
  const getCurrentWeek = () => {
    return Math.ceil(currentDay / 7);
  };

  // Update selected week to current week when component mounts
  useEffect(() => {
    const week = getCurrentWeek();
    setSelectedWeek(Math.min(week, 10)); // Cap at week 10
  }, [currentDay]);

  const weeks = [
    {
      id: 1,
      title: 'Week 1',
      days: 'Days 1-7',
      activeDays: [1, 2, 3, 4, 5, 6, 7],
      tasks: [
        'Wake up at 7AM from Day 2 to Day 6',
        'Drink 2L water everyday',
        'Do 10 push ups on Day 1',
        'Run 2km on Day 3 and Day 5',
      ],
    },
    {
      id: 2,
      title: 'Week 2',
      days: 'Days 8-14',
      activeDays: [8, 9, 10, 11, 12, 13, 14],
      tasks: [
        'Wake up at 7AM everyday',
        'Drink 2L water everyday',
        'Exercise 30 minutes daily',
        'Meditate 10 minutes daily',
      ],
    },
    {
      id: 3,
      title: 'Week 3',
      days: 'Days 15-21',
      activeDays: [15, 16, 17, 18, 19, 20, 21],
      tasks: [
        'Wake up at 7AM everyday',
        'Drink 2L water everyday',
        'Exercise 30 minutes daily',
        'Meditate 10 minutes daily',
        'Take cold shower 3x/week',
      ],
    },
    {
      id: 4,
      title: 'Week 4',
      days: 'Days 22-28',
      activeDays: [22, 23, 24, 25, 26, 27, 28],
      tasks: [
        'Wake up at 7AM everyday',
        'Drink 2L water everyday',
        'Exercise 45 minutes daily',
        'Meditate 15 minutes daily',
        'Take cold shower 4x/week',
        'Read 30 minutes daily',
      ],
    },
    {
      id: 5,
      title: 'Week 5',
      days: 'Days 29-35',
      activeDays: [29, 30, 31, 32, 33, 34, 35],
      tasks: [
        'Wake up at 6:30AM everyday',
        'Drink 2.5L water everyday',
        'Exercise 45 minutes daily',
        'Meditate 15 minutes daily',
        'Take cold shower 5x/week',
        'Read 30 minutes daily',
        'Limit screen time to 3 hours',
      ],
    },
    {
      id: 6,
      title: 'Week 6',
      days: 'Days 36-42',
      activeDays: [36, 37, 38, 39, 40, 41, 42],
      tasks: [
        'Wake up at 6:30AM everyday',
        'Drink 2.5L water everyday',
        'Exercise 60 minutes daily',
        'Meditate 20 minutes daily',
        'Take cold shower 6x/week',
        'Read 45 minutes daily',
        'Limit screen time to 2.5 hours',
      ],
    },
    {
      id: 7,
      title: 'Week 7',
      days: 'Days 43-49',
      activeDays: [43, 44, 45, 46, 47, 48, 49],
      tasks: [
        'Wake up at 6:00AM everyday',
        'Drink 3L water everyday',
        'Exercise 60 minutes daily',
        'Meditate 20 minutes daily',
        'Take cold shower daily',
        'Read 45 minutes daily',
        'Limit screen time to 2 hours',
        'Journal daily',
      ],
    },
    {
      id: 8,
      title: 'Week 8',
      days: 'Days 50-56',
      activeDays: [50, 51, 52, 53, 54, 55, 56],
      tasks: [
        'Wake up at 6:00AM everyday',
        'Drink 3L water everyday',
        'Exercise 75 minutes daily',
        'Meditate 25 minutes daily',
        'Take cold shower daily',
        'Read 60 minutes daily',
        'Limit screen time to 2 hours',
        'Journal daily',
        'Practice gratitude',
      ],
    },
    {
      id: 9,
      title: 'Week 9',
      days: 'Days 57-63',
      activeDays: [57, 58, 59, 60, 61, 62, 63],
      tasks: [
        'Wake up at 5:30AM everyday',
        'Drink 3L water everyday',
        'Exercise 75 minutes daily',
        'Meditate 25 minutes daily',
        'Take cold shower daily',
        'Read 60 minutes daily',
        'Limit screen time to 1.5 hours',
        'Journal daily',
        'Practice gratitude',
        'Help someone daily',
      ],
    },
    {
      id: 10,
      title: 'Week 10',
      days: 'Days 64-66',
      activeDays: [64, 65, 66],
      tasks: [
        'Wake up at 5:30AM everyday',
        'Drink 3L water everyday',
        'Exercise 90 minutes daily',
        'Meditate 30 minutes daily',
        'Take cold shower daily',
        'Read 60 minutes daily',
        'Limit screen time to 1 hour',
        'Journal daily',
        'Practice gratitude',
        'Help someone daily',
        'Reflect on your journey',
      ],
    },
  ];

  const currentWeek = weeks.find(w => w.id === selectedWeek);

  const handleAddTask = () => {
    setTaskFormData({
      title: '',
      description: '',
      time: '',
      duration: '30',
      category: 'personal',
      priority: 'medium',
      isRecurring: false,
      recurringPattern: 'daily',
      tags: '',
    });
    setEditingTask(null);
    setShowAddTaskModal(true);
  };

  const handleEditTask = (task: CalendarTask) => {
    setTaskFormData({
      title: task.title,
      description: task.description,
      time: task.time || '',
      duration: task.duration.toString(),
      category: task.category,
      priority: task.priority,
      isRecurring: task.isRecurring,
      recurringPattern: task.recurringPattern || 'daily',
      tags: task.tags.join(', '),
    });
    setEditingTask(task);
    setShowAddTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskFormData.title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    try {
      const taskData = {
        title: taskFormData.title,
        description: taskFormData.description,
        date: selectedDate,
        time: taskFormData.time || undefined,
        duration: parseInt(taskFormData.duration),
        category: taskFormData.category,
        priority: taskFormData.priority,
        isCompleted: false,
        isRecurring: taskFormData.isRecurring,
        recurringPattern: taskFormData.isRecurring ? taskFormData.recurringPattern : undefined,
        tags: taskFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      if (editingTask) {
        await dispatch(updateCalendarTask({ ...editingTask, ...taskData })).unwrap();
        Alert.alert('Success', 'Task updated successfully!');
      } else {
        await dispatch(addCalendarTask(taskData)).unwrap();
        Alert.alert('Success', 'Task added successfully!');
      }

      setShowAddTaskModal(false);
      setEditingTask(null);
      setTaskFormData({
        title: '',
        description: '',
        time: '',
        duration: '30',
        category: 'personal',
        priority: 'medium',
        isRecurring: false,
        recurringPattern: 'daily',
        tags: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  const handleDeleteTask = async (task: CalendarTask) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCalendarTask(task.id)).unwrap();
              Alert.alert('Success', 'Task deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleTaskCompletion = async (task: CalendarTask) => {
    try {
      await dispatch(toggleTaskCompletion(task.id)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle task completion. Please try again.');
    }
  };

  const getTasksForDate = (date: string) => {
    return calendarTasks.filter(task => task.date === date);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return theme.colors.primary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return 'briefcase';
      case 'personal':
        return 'person';
      case 'health':
        return 'fitness';
      case 'learning':
        return 'school';
      case 'social':
        return 'people';
      default:
        return 'star';
    }
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      const isActive = currentWeek?.activeDays.includes(i);
      const isCurrentDay = i === currentDay;
      const isCompleted = dailyProgress.some(day => 
        day.date === new Date().toISOString().split('T')[0] && 
        day.completedTasks > 0
      );
      
      // Check if there are personal tasks for this date
      const dateStr = new Date(2024, 4, i).toISOString().split('T')[0];
      const hasPersonalTasks = getTasksForDate(dateStr).length > 0;
      
      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.calendarDay,
            isActive && styles.calendarDayActive,
            isCurrentDay && styles.calendarDayCurrent,
            isCompleted && styles.calendarDayCompleted,
            hasPersonalTasks && styles.calendarDayHasTasks,
          ]}
          onPress={() => {
            const dateStr = new Date(2024, 4, i).toISOString().split('T')[0];
            setSelectedDate(dateStr);
          }}
        >
          <Text style={[
            styles.calendarDayText,
            isActive && styles.calendarDayTextActive,
            isCurrentDay && styles.calendarDayTextCurrent,
          ]}>
            {i}
          </Text>
          {hasPersonalTasks && (
            <View style={styles.taskIndicator} />
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <Text style={[styles.calendarTitle, { color: theme.colors.text }]}>
          May 2024
        </Text>
        <View style={styles.calendarGrid}>
          {days}
        </View>
      </View>
    );
  };

  const renderWeekSelector = () => (
    <View style={styles.weekSelector}>
      <Text style={[styles.weekSelectorTitle, { color: theme.colors.text }]}>
        Select a week to view detailed routine
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weekButtons}>
          {weeks.map((week) => (
            <TouchableOpacity
              key={week.id}
              style={[
                styles.weekButton,
                selectedWeek === week.id && styles.weekButtonActive,
              ]}
              onPress={() => setSelectedWeek(week.id)}
            >
              <Text style={[
                styles.weekButtonText,
                selectedWeek === week.id && styles.weekButtonTextActive,
              ]}>
                {week.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderWeekTasks = () => (
    <View style={styles.weekTasksContainer}>
      <Text style={[styles.weekTasksTitle, { color: theme.colors.text }]}>
        Tasks of {currentWeek?.title}
      </Text>
      {currentWeek?.tasks.map((task, index) => (
        <View key={index} style={styles.taskItem}>
          <View style={styles.taskBullet} />
          <Text style={[styles.taskText, { color: theme.colors.text }]}>
            {task}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderPersonalTasks = () => {
    const tasksForSelectedDate = getTasksForDate(selectedDate);
    
    if (tasksForSelectedDate.length === 0) {
      return (
        <View style={styles.noTasksContainer}>
          <Text style={[styles.noTasksText, { color: theme.colors.textSecondary }]}>
            No personal tasks for {new Date(selectedDate).toLocaleDateString()}
          </Text>
          <TouchableOpacity style={styles.addTaskButton} onPress={handleAddTask}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addTaskButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.personalTasksContainer}>
        <View style={styles.personalTasksHeader}>
          <Text style={[styles.personalTasksTitle, { color: theme.colors.text }]}>
            Personal Tasks for {new Date(selectedDate).toLocaleDateString()}
          </Text>
          <TouchableOpacity style={styles.addTaskButton} onPress={handleAddTask}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addTaskButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
        
        {tasksForSelectedDate.map((task) => (
          <View key={task.id} style={[
            styles.personalTaskItem,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
          ]}>
            <View style={styles.taskHeader}>
              <View style={styles.taskLeft}>
                <View style={[styles.taskIcon, { backgroundColor: `${getPriorityColor(task.priority)}20` }]}>
                  <Ionicons name={getCategoryIcon(task.category) as any} size={16} color={getPriorityColor(task.priority)} />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                    {task.title}
                  </Text>
                  <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
                    {task.description}
                  </Text>
                  <View style={styles.taskMeta}>
                    {task.time && (
                      <Text style={[styles.taskMetaText, { color: theme.colors.primary }]}>
                        {task.time} ({task.duration}min)
                      </Text>
                    )}
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.taskActions}>
                <TouchableOpacity
                  style={[styles.taskCheckbox, {
                    borderColor: task.isCompleted ? theme.colors.primary : theme.colors.border,
                    backgroundColor: task.isCompleted ? theme.colors.primary : 'transparent',
                  }]}
                  onPress={() => handleToggleTaskCompletion(task)}
                >
                  {task.isCompleted && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.taskActionButton}
                  onPress={() => handleEditTask(task)}
                >
                  <Ionicons name="create" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.taskActionButton}
                  onPress={() => handleDeleteTask(task)}
                >
                  <Ionicons name="trash" size={16} color={theme.colors.error || '#EF4444'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Your next 66 days
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          The program is personalised on your current lifestyle. Tap on a week for detailed routine.
        </Text>

        {/* Week Selector */}
        {renderWeekSelector()}

        {/* Calendar */}
        {renderCalendar()}

        {/* Personal Tasks */}
        {renderPersonalTasks()}

        {/* Week Tasks */}
        {renderWeekTasks()}
      </ScrollView>

      {/* Add/Edit Task Modal */}
      <Modal
        visible={showAddTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Task title"
              placeholderTextColor={theme.colors.textSecondary}
              value={taskFormData.title}
              onChangeText={(text) => setTaskFormData({ ...taskFormData, title: text })}
            />
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Description"
              placeholderTextColor={theme.colors.textSecondary}
              value={taskFormData.description}
              onChangeText={(text) => setTaskFormData({ ...taskFormData, description: text })}
            />
            
            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInputHalf, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }]}
                placeholder="Time (HH:MM)"
                placeholderTextColor={theme.colors.textSecondary}
                value={taskFormData.time}
                onChangeText={(text) => setTaskFormData({ ...taskFormData, time: text })}
              />
              
              <TextInput
                style={[styles.modalInputHalf, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }]}
                placeholder="Duration (min)"
                placeholderTextColor={theme.colors.textSecondary}
                value={taskFormData.duration}
                onChangeText={(text) => setTaskFormData({ ...taskFormData, duration: text })}
                keyboardType="numeric"
              />
            </View>
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Tags (comma separated)"
              placeholderTextColor={theme.colors.textSecondary}
              value={taskFormData.tags}
              onChangeText={(text) => setTaskFormData({ ...taskFormData, tags: text })}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.error || '#EF4444' }]}
                onPress={() => setShowAddTaskModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveTask}
              >
                <Text style={styles.modalButtonText}>
                  {editingTask ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          <Ionicons name="trophy" size={24} color={theme.colors.primary} />
          <Text style={[styles.navText, { color: theme.colors.primary }]}>Trophy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
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
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  weekSelector: {
    marginBottom: 24,
  },
  weekSelectorTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  weekButtons: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  weekButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#2D1B1B',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  weekButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  weekButtonTextActive: {
    color: 'white',
  },
  calendarContainer: {
    marginBottom: 24,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  calendarDay: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 15,
    backgroundColor: '#2D1B1B',
    position: 'relative',
  },
  calendarDayActive: {
    backgroundColor: '#F59E0B',
  },
  calendarDayCurrent: {
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: 'white',
  },
  calendarDayCompleted: {
    backgroundColor: '#4CAF50',
  },
  calendarDayHasTasks: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  calendarDayText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  calendarDayTextActive: {
    color: 'white',
  },
  calendarDayTextCurrent: {
    color: 'white',
  },
  taskIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
  personalTasksContainer: {
    marginBottom: 24,
  },
  personalTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  personalTasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  addTaskButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addTaskButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noTasksContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 24,
  },
  noTasksText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  personalTaskItem: {
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
  taskIcon: {
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
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskActionButton: {
    padding: 4,
  },
  weekTasksContainer: {
    marginBottom: 24,
  },
  weekTasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 6,
    marginRight: 12,
  },
  taskText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
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
  modalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalInputHalf: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
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

export default Calendar; 