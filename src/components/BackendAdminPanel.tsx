import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AuthService } from '../services/AuthService';

interface BackendAdminPanelProps {
  onBack: () => void;
  onNavigateToUserManagement?: () => void;
}

const BackendAdminPanel: React.FC<BackendAdminPanelProps> = ({ onBack, onNavigateToUserManagement }) => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

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

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real backend, this would call an API
              Alert.alert('Success', 'User deleted successfully');
              loadUsersData(); // Reload the data
            } catch (error) {
              console.error('Failed to delete user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditingUser({ ...user });
  };

  const handleSaveUser = async () => {
    try {
      // In a real backend, this would call an API
      Alert.alert('Success', 'User updated successfully');
      setSelectedUser(null);
      setEditingUser(null);
      loadUsersData(); // Reload the data
    } catch (error) {
      console.error('Failed to update user:', error);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleCancelEdit = () => {
    setSelectedUser(null);
    setEditingUser(null);
  };

  const handleClearAllData = async () => {
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

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderUserCard = (user: any, index: number) => (
    <View key={user.id || index} style={[styles.userCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.userHeader}>
        <View style={[styles.userAvatar, { backgroundColor: user.isAdmin ? theme.colors.error : theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user.name || 'No Name'}
            {user.isAdmin && (
              <Text style={[styles.adminBadge, { color: theme.colors.error }]}> ADMIN</Text>
            )}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user.email}
          </Text>
        </View>
        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditUser(user)}
          >
            <Ionicons name="create" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteUser(user.id)}
          >
            <Ionicons name="trash" size={20} color={theme.colors.error} />
          </TouchableOpacity>
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
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Status:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {user.isAuthenticated ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEditModal = () => {
    if (!selectedUser || !editingUser) return null;

    return (
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Edit User</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={editingUser.name || ''}
              onChangeText={(text) => setEditingUser({ ...editingUser, name: text })}
              placeholder="Enter name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={editingUser.email}
              onChangeText={(text) => setEditingUser({ ...editingUser, email: text })}
              placeholder="Enter email"
              placeholderTextColor={theme.colors.textSecondary}
              editable={false} // Email should not be editable
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Current Day</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={editingUser.currentDay?.toString() || '1'}
              onChangeText={(text) => setEditingUser({ ...editingUser, currentDay: parseInt(text) || 1 })}
              placeholder="Enter current day"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
              onPress={handleCancelEdit}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSaveUser}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Backend Statistics</Text>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Backend Admin</Text>
        <TouchableOpacity onPress={loadUsersData} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        {renderStats()}

        {/* User Management Button */}
        {onNavigateToUserManagement && (
          <TouchableOpacity
            style={[styles.userManagementButton, { backgroundColor: theme.colors.primary }]}
            onPress={onNavigateToUserManagement}
          >
            <Ionicons name="people" size={20} color="white" />
            <Text style={styles.userManagementButtonText}>Manage Users</Text>
          </TouchableOpacity>
        )}

        {/* Search Section */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchTextInput, { color: theme.colors.text }]}
              placeholder="Search users..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Users Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>User Management</Text>
            <TouchableOpacity onPress={handleClearAllData} style={styles.clearButton}>
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading users...
              </Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {searchQuery ? 'No users found matching your search' : 'No users found'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((user, index) => renderUserCard(user, index))
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      {renderEditModal()}
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
  userManagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  userManagementButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  searchTextInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
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
  adminBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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

export default BackendAdminPanel; 