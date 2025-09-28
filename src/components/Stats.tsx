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

interface StatsProps {
  onBack: () => void;
}

interface RatingCategory {
  id: string;
  name: string;
  currentRating: number;
  dayOneRating: number;
  improvement: number;
  icon: string;
  color: string;
}

const Stats: React.FC<StatsProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Get progress data from Redux store
  const dailyProgress = useSelector((state: RootState) => state.progress.dailyProgress);
  const currentDay = useSelector((state: RootState) => state.progress.currentDay);

  // Calculate ratings based on actual progress
  const calculateRatings = (): RatingCategory[] => {
    if (dailyProgress.length === 0) {
      return getDefaultRatings();
    }

    const totalDays = dailyProgress.length;
    const totalTasks = dailyProgress.reduce((sum, day) => sum + day.totalTasks, 0);
    const totalCompleted = dailyProgress.reduce((sum, day) => sum + day.completedTasks, 0);
    
    // Calculate category-specific ratings
    const categoryStats = {
      sleep: { completed: 0, total: 0 },
      water: { completed: 0, total: 0 },
      exercise: { completed: 0, total: 0 },
      mind: { completed: 0, total: 0 },
      shower: { completed: 0, total: 0 },
    };

    dailyProgress.forEach(day => {
      day.tasks.forEach(task => {
        if (categoryStats[task.category as keyof typeof categoryStats]) {
          categoryStats[task.category as keyof typeof categoryStats].total++;
          if (task.isCompleted) {
            categoryStats[task.category as keyof typeof categoryStats].completed++;
          }
        }
      });
    });

    const overallRating = Math.min(100, Math.round((totalCompleted / totalTasks) * 100) + 50);
    const dayOneRating = Math.max(30, overallRating - 35);

    return [
      {
        id: 'overall',
        name: 'Overall',
        currentRating: overallRating,
        dayOneRating: dayOneRating,
        improvement: overallRating - dayOneRating,
        icon: 'star',
        color: '#F59E0B',
      },
      {
        id: 'wisdom',
        name: 'Wisdom',
        currentRating: Math.min(100, Math.round((categoryStats.mind.completed / categoryStats.mind.total) * 100) + 50),
        dayOneRating: 42,
        improvement: Math.min(100, Math.round((categoryStats.mind.completed / categoryStats.mind.total) * 100) + 50) - 42,
        icon: 'book',
        color: '#8B5CF6',
      },
      {
        id: 'strength',
        name: 'Strength',
        currentRating: Math.min(100, Math.round((categoryStats.exercise.completed / categoryStats.exercise.total) * 100) + 50),
        dayOneRating: 51,
        improvement: Math.min(100, Math.round((categoryStats.exercise.completed / categoryStats.exercise.total) * 100) + 50) - 51,
        icon: 'fitness',
        color: '#10B981',
      },
      {
        id: 'focus',
        name: 'Focus',
        currentRating: Math.min(100, Math.round((categoryStats.sleep.completed / categoryStats.sleep.total) * 100) + 50),
        dayOneRating: 48,
        improvement: Math.min(100, Math.round((categoryStats.sleep.completed / categoryStats.sleep.total) * 100) + 50) - 48,
        icon: 'eye',
        color: '#06B6D4',
      },
      {
        id: 'confidence',
        name: 'Confidence',
        currentRating: Math.min(100, Math.round((totalCompleted / totalTasks) * 100) + 45),
        dayOneRating: 44,
        improvement: Math.min(100, Math.round((totalCompleted / totalTasks) * 100) + 45) - 44,
        icon: 'person',
        color: '#EF4444',
      },
      {
        id: 'purpose',
        name: 'Purpose',
        currentRating: Math.min(100, Math.round((totalCompleted / totalTasks) * 100) + 40),
        dayOneRating: 45,
        improvement: Math.min(100, Math.round((totalCompleted / totalTasks) * 100) + 40) - 45,
        icon: 'flag',
        color: '#8B5CF6',
      },
    ];
  };

  const getDefaultRatings = (): RatingCategory[] => [
    {
      id: 'overall',
      name: 'Overall',
      currentRating: 53,
      dayOneRating: 53,
      improvement: 0,
      icon: 'star',
      color: '#F59E0B',
    },
    {
      id: 'wisdom',
      name: 'Wisdom',
      currentRating: 42,
      dayOneRating: 42,
      improvement: 0,
      icon: 'book',
      color: '#8B5CF6',
    },
    {
      id: 'strength',
      name: 'Strength',
      currentRating: 51,
      dayOneRating: 51,
      improvement: 0,
      icon: 'fitness',
      color: '#10B981',
    },
    {
      id: 'focus',
      name: 'Focus',
      currentRating: 48,
      dayOneRating: 48,
      improvement: 0,
      icon: 'eye',
      color: '#06B6D4',
    },
    {
      id: 'confidence',
      name: 'Confidence',
      currentRating: 44,
      dayOneRating: 44,
      improvement: 0,
      icon: 'person',
      color: '#EF4444',
    },
    {
      id: 'purpose',
      name: 'Purpose',
      currentRating: 45,
      dayOneRating: 45,
      improvement: 0,
      icon: 'flag',
      color: '#8B5CF6',
    },
  ];

  const [ratingCategories, setRatingCategories] = useState<RatingCategory[]>(getDefaultRatings());

  useEffect(() => {
    setRatingCategories(calculateRatings());
  }, [dailyProgress]);

  const tabs = [
    { name: 'Current rating', id: 'current' },
    { name: 'Day 1 rating', id: 'day1' },
    { name: 'Potential', id: 'potential' },
  ];

  const renderRatingCard = (category: RatingCategory, index: number) => {
    const isOverall = category.id === 'overall';
    const rating = selectedTab === 0 ? category.currentRating : 
                  selectedTab === 1 ? category.dayOneRating : 
                  Math.min(100, category.currentRating + 15);
    
    return (
      <View
        key={category.id}
        style={[
          styles.ratingCard,
          {
            backgroundColor: isOverall ? category.color : theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.ratingHeader}>
          <View style={styles.ratingIconContainer}>
            <Ionicons
              name={category.icon as any}
              size={20}
              color={isOverall ? 'white' : category.color}
            />
          </View>
          <Text style={[
            styles.ratingName,
            { color: isOverall ? 'white' : theme.colors.text }
          ]}>
            {category.name}
          </Text>
        </View>
        
        <View style={styles.ratingScore}>
          <Text style={[
            styles.ratingNumber,
            { color: isOverall ? 'white' : theme.colors.text }
          ]}>
            {rating}
          </Text>
          {selectedTab === 0 && (
            <Text style={[
              styles.improvementText,
              { color: isOverall ? 'white' : theme.colors.primary }
            ]}>
              +{category.improvement}▲
            </Text>
          )}
        </View>

        {/* Simple line graph representation */}
        <View style={styles.graphContainer}>
          <View style={styles.graphLine}>
            {[1, 2, 3, 4, 5].map((point, i) => (
              <View
                key={i}
                style={[
                  styles.graphPoint,
                  {
                    backgroundColor: isOverall ? 'white' : theme.colors.primary,
                    opacity: 0.3 + (i * 0.15),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: // Current rating
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabDescription, { color: theme.colors.textSecondary }]}>
              Your rating reflect your current lifestyle. Increase rating by completing tasks daily.
            </Text>
            <View style={styles.ratingGrid}>
              {ratingCategories.map((category, index) => renderRatingCard(category, index))}
            </View>
          </View>
        );
      case 1: // Day 1 rating
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabDescription, { color: theme.colors.textSecondary }]}>
              This is where you started. Look how far you've come!
            </Text>
            <View style={styles.ratingGrid}>
              {ratingCategories.map((category, index) => renderRatingCard(category, index))}
            </View>
          </View>
        );
      case 2: // Potential
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabDescription, { color: theme.colors.textSecondary }]}>
              Your potential if you maintain consistency. Keep pushing forward!
            </Text>
            <View style={styles.ratingGrid}>
              {ratingCategories.map((category, index) => renderRatingCard(category, index))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Rise rating
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
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
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
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
          <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
          <Text style={[styles.navText, { color: theme.colors.primary }]}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.riseLogo}>
            <Ionicons name="sunny" size={24} color="#F59E0B" />
          </View>
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Rise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="trophy" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.navText, { color: theme.colors.textSecondary }]}>Trophy</Text>
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
  tabContent: {
    marginBottom: 24,
  },
  tabDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 120,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '600',
  },
  graphContainer: {
    height: 20,
    justifyContent: 'center',
  },
  graphLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  graphPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
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

export default Stats; 