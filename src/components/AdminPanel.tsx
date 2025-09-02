import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AuthService } from '../services/AuthService';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    try {
      setIsLoading(true);
      const authService = AuthService.getInstance();
      const data = await authService.exportAllUsersData();
      setUsers(data.users);
      setStats(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all user data and reset the app. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const authService = AuthService.getInstance();
              await authService.clearAllUserData();
              Alert.alert('Success', 'All user data has been cleared');
              loadUsersData(); // Reload the data
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert('Error', 'Failed to clear user data');
            }
          },
        },
      ]
    );
  };

  const renderUserCard = (user: any, index: number) => (
    <View key={user.id || index} style={[styles.userCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.userHeader}>
        <View style={[styles.userAvatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user.name || 'No Name'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user.email}
          </Text>
        </View>
        <View style={styles.userStatus}>
          {user.isAuthenticated ? (
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          ) : (
            <Ionicons name="close-circle" size={20} color={theme.colors.error} />
          )}
        </View>
      </View>
      
      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>ID:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{user.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Start Date:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {new Date(user.startDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Current Day:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{user.currentDay}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Onboarding:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {user.isOnboardingComplete ? 'Complete' : 'Incomplete'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>System Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.totalUsers}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>{stats.mockUsers}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Demo Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.success }]}>{stats.registeredUsers}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Registered</Text>
          </View>
        </View>
        <Text style={[styles.exportDate, { color: theme.colors.textSecondary }]}>
          Last updated: {new Date(stats.exportDate).toLocaleString()}
        </Text>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Admin Panel</Text>
        <TouchableOpacity onPress={loadUsersData} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        {renderStats()}

        {/* Users Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>All Users</Text>
            <TouchableOpacity onPress={handleClearData} style={styles.clearButton}>
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading users...
              </Text>
            </View>
          ) : users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No users found
              </Text>
            </View>
          ) : (
            users.map((user, index) => renderUserCard(user, index))
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#3D2A2A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  exportDate: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    padding: 8,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  userStatus: {
    marginLeft: 8,
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: '#3D2A2A',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default AdminPanel; 