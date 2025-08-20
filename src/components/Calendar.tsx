import React, { useState, useEffect } from 'react';
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
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  // Get progress data from Redux store
  const currentDay = useSelector((state: RootState) => state.progress.currentDay);
  const dailyProgress = useSelector((state: RootState) => state.progress.dailyProgress);

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

  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      const isActive = currentWeek?.activeDays.includes(i);
      const isCurrentDay = i === currentDay;
      const isCompleted = dailyProgress.some(day => 
        day.date === new Date().toISOString().split('T')[0] && 
        day.completedTasks > 0
      );
      
      days.push(
        <View
          key={i}
          style={[
            styles.calendarDay,
            isActive && styles.calendarDayActive,
            isCurrentDay && styles.calendarDayCurrent,
            isCompleted && styles.calendarDayCompleted,
          ]}
        >
          <Text style={[
            styles.calendarDayText,
            isActive && styles.calendarDayTextActive,
            isCurrentDay && styles.calendarDayTextCurrent,
          ]}>
            {i}
          </Text>
        </View>
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

        {/* Week Tasks */}
        {renderWeekTasks()}
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
    backgroundColor: '#4CAF50', // A green color for completed days
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
});

export default Calendar; 