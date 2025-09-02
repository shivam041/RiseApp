import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BackendAuthService, BackendUser } from '../services/BackendAuthService';

interface BackendUserManagementProps {
  onBack: () => void;
}

const BackendUserManagement: React.FC<BackendUserManagementProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    isAdmin: false,
  });

  const backendAuthService = BackendAuthService.getInstance();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const result = await backendAuthService.getAllUsers();
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        Alert.alert('Error', result.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const result = await backendAuthService.registerUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name || newUser.email.split('@')[0],
      });

      if (result.success) {
        Alert.alert('Success', 'User created successfully');
        setNewUser({ email: '', password: '', name: '', isAdmin: false });
        setShowAddUser(false);
        await loadUsers();
      } else {
        Alert.alert('Error', result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await backendAuthService.updateUserStatus(userId, !currentStatus);
      if (result.success) {
        await loadUsers();
      } else {
        Alert.alert('Error', result.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await backendAuthService.deleteUser(userId);
              if (result.success) {
                Alert.alert('Success', 'User deleted successfully');
                await loadUsers();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginLeft: 15,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 20,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      marginBottom: 20,
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    userCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    userEmail: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    userStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 12,
      marginRight: 8,
      color: theme.colors.textSecondary,
    },
    userInfo: {
      marginBottom: 8,
    },
    userInfoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    userActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    activateButton: {
      backgroundColor: theme.colors.success,
    },
    deactivateButton: {
      backgroundColor: theme.colors.warning,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    adminBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    adminBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
    addUserForm: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    switchLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    formButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    formButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButton: {
      backgroundColor: theme.colors.border,
    },
    formButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    loadingText: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: 20,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add User Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddUser(!showAddUser)}
        >
          <Text style={styles.addButtonText}>
            {showAddUser ? 'Cancel' : 'Add New User'}
          </Text>
        </TouchableOpacity>

        {/* Add User Form */}
        {showAddUser && (
          <View style={styles.addUserForm}>
            <Text style={styles.formTitle}>Create New User</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={newUser.password}
              onChangeText={(text) => setNewUser({ ...newUser, password: text })}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Name (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newUser.name}
              onChangeText={(text) => setNewUser({ ...newUser, name: text })}
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Admin User</Text>
              <Switch
                value={newUser.isAdmin}
                onValueChange={(value) => setNewUser({ ...newUser, isAdmin: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={newUser.isAdmin ? 'white' : theme.colors.textSecondary}
              />
            </View>
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => setShowAddUser(false)}
              >
                <Text style={styles.formButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.submitButton]}
                onPress={handleAddUser}
                disabled={isLoading}
              >
                <Text style={styles.formButtonText}>
                  {isLoading ? 'Creating...' : 'Create User'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Users List */}
        {isLoading && !refreshing ? (
          <Text style={styles.loadingText}>Loading users...</Text>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No users found matching your search' : 'No users found'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userStatus}>
                  <Text style={styles.statusText}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Text>
                  {user.is_admin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.userInfo}>
                {user.name && (
                  <Text style={styles.userInfoText}>Name: {user.name}</Text>
                )}
                <Text style={styles.userInfoText}>
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.userInfoText}>
                  Current Day: {user.current_day}
                </Text>
                <Text style={styles.userInfoText}>
                  Onboarding: {user.is_onboarding_complete ? 'Complete' : 'Incomplete'}
                </Text>
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    user.is_active ? styles.deactivateButton : styles.activateButton,
                  ]}
                  onPress={() => handleToggleUserStatus(user.id, user.is_active)}
                >
                  <Ionicons
                    name={user.is_active ? 'pause' : 'play'}
                    size={12}
                    color="white"
                  />
                  <Text style={styles.actionButtonText}>
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteUser(user.id, user.email)}
                >
                  <Ionicons name="trash" size={12} color="white" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default BackendUserManagement;
