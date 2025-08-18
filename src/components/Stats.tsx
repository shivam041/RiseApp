import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface StatsProps {
  onBack: () => void;
}

const Stats: React.FC<StatsProps> = ({ onBack }) => {
  const { theme } = useTheme();

  const stats = [
    {
      category: 'Sleep',
      icon: 'bed',
      color: '#8B5CF6',
      current: 7,
      target: 8,
      unit: 'hours',
      streak: 5,
    },
    {
      category: 'Water',
      icon: 'water',
      color: '#06B6D4',
      current: 6,
      target: 8,
      unit: 'glasses',
      streak: 12,
    },
    {
      category: 'Exercise',
      icon: 'fitness',
      color: '#10B981',
      current: 25,
      target: 30,
      unit: 'minutes',
      streak: 8,
    },
  ];

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressBar}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );

  const renderStatCard = (stat: any) => {
    const percentage = (stat.current / stat.target) * 100;

    return (
      <View
        key={stat.category}
        style={[
          styles.statCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.statHeader}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: stat.color },
            ]}
          >
            <Ionicons name={stat.icon as any} size={20} color="white" />
          </View>
          <View style={styles.statInfo}>
            <Text style={[styles.statTitle, { color: theme.colors.text }]}>
              {stat.category}
            </Text>
            <Text style={[styles.statStreak, { color: theme.colors.textSecondary }]}>
              {stat.streak} day streak
            </Text>
          </View>
        </View>
        
        <View style={styles.statProgress}>
          <View style={styles.statNumbers}>
            <Text style={[styles.currentValue, { color: theme.colors.text }]}>
              {stat.current}
            </Text>
            <Text style={[styles.targetValue, { color: theme.colors.textSecondary }]}>
              / {stat.target} {stat.unit}
            </Text>
          </View>
          {renderProgressBar(percentage, stat.color)}
          <Text style={[styles.percentageText, { color: stat.color }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
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
          Your Progress
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Card */}
        <View
          style={[
            styles.overviewCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>
            Overall Progress
          </Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewNumber, { color: theme.colors.primary }]}>
                18
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                Days
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewNumber, { color: theme.colors.primary }]}>
                87%
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                Success Rate
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewNumber, { color: theme.colors.primary }]}>
                12
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                Current Streak
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Habit Tracking
          </Text>
          {stats.map(renderStatCard)}
        </View>
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
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  overviewCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statStreak: {
    fontSize: 12,
  },
  statProgress: {
    alignItems: 'center',
  },
  statNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  targetValue: {
    fontSize: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#3D2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Stats; 