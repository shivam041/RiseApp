import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '../context/ThemeContext';
import { DailyProgress, Task } from '../types';

interface CalendarProps {
  onBack: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const dailyProgress = useSelector((state: RootState) => state.progress.dailyProgress);
  const questionnaire = useSelector((state: RootState) => state.questionnaire.questionnaire);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getProgressForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return dailyProgress.find(progress => progress.date === dateString);
  };

  const getDayTasks = (date: Date) => {
    if (!questionnaire) return [];
    
    const tasks: Task[] = [
      {
        id: 'sleep',
        day: 1,
        category: 'sleep',
        title: `Wake up at ${questionnaire.sleepGoal}`,
        description: 'Start your day with purpose',
        isCompleted: false,
        difficulty: 'medium',
        estimatedTime: 0,
        tips: ['Go to bed early', 'Avoid screens before sleep']
      },
      {
        id: 'water',
        day: 1,
        category: 'water',
        title: `Drink ${questionnaire.waterGoal} glasses of water`,
        description: 'Stay hydrated throughout the day',
        isCompleted: false,
        difficulty: 'easy',
        estimatedTime: 0,
        tips: ['Keep water bottle nearby', 'Set hourly reminders']
      },
      {
        id: 'exercise',
        day: 1,
        category: 'exercise',
        title: `Exercise for ${questionnaire.exerciseGoal} minutes`,
        description: 'Build strength and endurance',
        isCompleted: false,
        difficulty: 'hard',
        estimatedTime: parseInt(questionnaire.exerciseGoal),
        tips: ['Start with warm-up', 'Find activities you enjoy']
      },
      {
        id: 'mind',
        day: 1,
        category: 'mind',
        title: `Meditate for ${questionnaire.mindGoal} minutes`,
        description: 'Develop mental clarity and focus',
        isCompleted: false,
        difficulty: 'medium',
        estimatedTime: parseInt(questionnaire.mindGoal),
        tips: ['Find quiet space', 'Focus on breathing']
      },
      {
        id: 'screen',
        day: 1,
        category: 'screenTime',
        title: `Limit screen time to ${questionnaire.screenTimeGoal} hours`,
        description: 'Reduce digital distractions',
        isCompleted: false,
        difficulty: 'hard',
        estimatedTime: 0,
        tips: ['Use app timers', 'Find offline activities']
      },
      {
        id: 'shower',
        day: 1,
        category: 'shower',
        title: `Cold shower for ${questionnaire.showerGoal} minutes`,
        description: 'Build mental resilience',
        isCompleted: false,
        difficulty: 'hard',
        estimatedTime: parseInt(questionnaire.showerGoal),
        tips: ['Start with warm water', 'Gradually reduce temperature']
      }
    ];
    
    return tasks;
  };

  const renderCalendarHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          style={styles.monthButton}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          style={styles.monthButton}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCalendarDays = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const progress = getProgressForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isToday && { borderColor: theme.colors.primary, borderWidth: 2 },
            isSelected && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[
            styles.dayText,
            { color: theme.colors.text },
            isSelected && { color: theme.colors.background }
          ]}>
            {day}
          </Text>
          {progress && (
            <View style={styles.progressIndicator}>
              <Text style={[styles.progressText, { color: theme.colors.success }]}>
                {progress.completedTasks}/{progress.totalTasks}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const renderSelectedDateDetails = () => {
    const progress = getProgressForDate(selectedDate);
    const tasks = getDayTasks(selectedDate);
    
    return (
      <View style={[styles.dateDetails, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.dateTitle, { color: theme.colors.text }]}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {progress ? (
          <View style={styles.progressSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              Progress: {progress.completedTasks}/{progress.totalTasks} completed
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(progress.completedTasks / progress.totalTasks) * 100}%`,
                    backgroundColor: theme.colors.primary
                  }
                ]} 
              />
            </View>
          </View>
        ) : (
          <Text style={[styles.noProgressText, { color: theme.colors.textSecondary }]}>
            No progress recorded for this day
          </Text>
        )}
        
        <View style={styles.tasksSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Today's Goals
          </Text>
          <ScrollView style={styles.tasksList}>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <Ionicons 
                    name={getTaskIcon(task.category)} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                    {task.title}
                  </Text>
                </View>
                <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
                  {task.description}
                </Text>
                {task.estimatedTime > 0 && (
                  <Text style={[styles.taskTime, { color: theme.colors.textSecondary }]}>
                    ⏱️ {task.estimatedTime} minutes
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'sleep': return 'bed';
      case 'water': return 'water';
      case 'exercise': return 'fitness';
      case 'mind': return 'leaf';
      case 'screenTime': return 'phone-portrait';
      case 'shower': return 'water';
      default: return 'checkmark-circle';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderCalendarHeader()}
      
      <View style={styles.calendarContainer}>
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={[styles.weekDay, { color: theme.colors.textSecondary }]}>
              {day}
            </Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {renderCalendarDays()}
        </View>
      </View>
      
      {renderSelectedDateDetails()}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthButton: {
    padding: 8,
    marginHorizontal: 5,
  },
  calendarContainer: {
    padding: 20,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (Dimensions.get('window').width - 60) / 7,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateDetails: {
    flex: 1,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3D2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  noProgressText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  tasksSection: {
    flex: 1,
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    backgroundColor: '#2D1B1B',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskTime: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default Calendar; 