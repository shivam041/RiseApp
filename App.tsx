import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { useSelector } from 'react-redux';
import { RootState } from './src/store';
import { loadUser, saveUser, clearUser } from './src/store/slices/userSlice';
import { loadDailyProgress } from './src/store/slices/progressSlice';
import { saveQuestionnaire, loadQuestionnaire } from './src/store/slices/questionnaireSlice';
import Onboarding from './src/components/Onboarding';
import Dashboard from './src/components/Dashboard';
import NotificationSettings from './src/components/NotificationSettings';
import Stats from './src/components/Stats';
import Profile from './src/components/Profile';
import Login from './src/components/Login';
import Register from './src/components/Register';
import AdminPanel from './src/components/AdminPanel';
import BackendAdminPanel from './src/components/BackendAdminPanel';
import Calendar from './src/components/Calendar';
import Notes from './src/components/Notes';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import NotificationService from './src/services/NotificationService';
import AuthService from './src/services/AuthService';

type Screen = 'dashboard' | 'notificationSettings' | 'stats' | 'profile' | 'adminPanel' | 'backendAdmin' | 'calendar' | 'notes';

const AppContent: React.FC = () => {
  const dispatch = store.dispatch;
  const user = useSelector((state: RootState) => state.user.user);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is authenticated
        const authService = AuthService.getInstance();
        const isAuthenticated = await authService.isAuthenticated();
        
        console.log('App initialization - isAuthenticated:', isAuthenticated);
        
        if (isAuthenticated) {
          // Load user data first, then progress and questionnaire
          await dispatch(loadUser());
          
          // Wait a bit for user data to be available, then load other data
          setTimeout(async () => {
            try {
              await Promise.all([
                dispatch(loadDailyProgress()),
                dispatch(loadQuestionnaire()),
              ]);
              console.log('Progress and questionnaire data loaded successfully');
            } catch (error) {
              console.error('Failed to load progress/questionnaire data:', error);
            }
          }, 100);
          
          console.log('User data loaded successfully');
        } else {
          // Clear any existing user data if not authenticated
          await dispatch(clearUser());
          console.log('User data cleared - not authenticated');
        }
        
        // Update the authentication state
        setIsAuthenticated(isAuthenticated);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Clear user data on error
        await dispatch(clearUser());
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  const handleQuestionnaireComplete = async (userData: any) => {
    try {
      // Get current user from auth service
      const authService = AuthService.getInstance();
      const currentUser = await authService.getCurrentUser();
      
      // Get stored credentials to find the email
      const storedCredentials = await authService.getStoredCredentials();
      
      // Ensure we have an email - this is critical for authentication
      const userEmail = currentUser?.email || storedCredentials?.email;
      if (!userEmail) {
        throw new Error('User email not found. Cannot complete onboarding.');
      }
      
      // Create or update user with onboarding complete
      const updatedUser = {
        ...currentUser,
        name: userData.name || currentUser?.name || 'User',
        isOnboardingComplete: true,
        isAuthenticated: true,
        email: userEmail, // Use the found email
        id: currentUser?.id || `user-${Date.now()}`,
        startDate: currentUser?.startDate || new Date().toISOString(),
        currentDay: currentUser?.currentDay || 1,
      };
      
      // Save user data with authentication status
      await authService.storeUser(updatedUser);
      
      // Update user in Redux store
      await dispatch(saveUser(updatedUser));
      
      // Set authentication state
      setIsAuthenticated(true);
      
      // Save questionnaire data
      const questionnaireData = {
        sleepGoal: userData.sleepGoal,
        waterGoal: userData.hydrationGoal.toString(), // Convert to string to match interface
        exerciseGoal: userData.exerciseGoal.toString(), // Convert to string to match interface
        mindGoal: userData.mindGoal.toString(), // Convert to string to match interface
        screenTimeGoal: userData.screenTimeGoal.toString(), // Convert to string to match interface
        showerGoal: userData.showerGoal.toString(), // Convert to string to match interface
        wakeUpTime: userData.wakeUpTime,
        bedTime: userData.bedTime,
        currentWaterIntake: 0,
        currentExerciseMinutes: 0,
        currentScreenTimeHours: 0,
        stressLevel: 5,
        energyLevel: 5,
        motivationLevel: 5,
      };
      
      await dispatch(saveQuestionnaire(questionnaireData));
      
      // Set up smart notifications based on user goals
      const notificationService = NotificationService.getInstance();
      await notificationService.setupUserNotifications({
        sleep: true,
        water: true,
        exercise: true,
        mind: true,
        screenTime: true,
        shower: true,
        wakeUpTime: userData.wakeUpTime,
        bedTime: userData.bedTime,
        sleepGoal: userData.sleepGoal,
        hydrationGoal: userData.hydrationGoal,
        exerciseGoal: userData.exerciseGoal,
        mindGoal: userData.mindGoal,
        screenTimeGoal: userData.screenTimeGoal,
        showerGoal: userData.showerGoal,
      }, []);
      
      console.log('Onboarding completed and notifications set up successfully');
      
      // Redirect to dashboard after successful completion
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const authService = AuthService.getInstance();
      const user = await authService.login(email, password);
      
      // Update user in Redux store
      await dispatch(saveUser({
        ...user,
        isOnboardingComplete: user.isOnboardingComplete || false,
      }));
      
      // Set authentication state
      setIsAuthenticated(true);
      
      // Admins go straight to backend admin panel
      if (user.isAdmin) {
        setCurrentScreen('backendAdmin');
        console.log('Admin login successful:', user.email);
        return;
      }
      
      // Set current screen based on onboarding status
      if (user.isOnboardingComplete) {
        setCurrentScreen('dashboard');
      } else {
        // User needs to complete onboarding
        // The App component will automatically show Onboarding
      }
      
      console.log('Login successful:', user.email);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string, confirmPassword: string) => {
    try {
      const authService = AuthService.getInstance();
      const user = await authService.register(email, password);
      
      // Update user in Redux store
      await dispatch(saveUser({
        ...user,
        isOnboardingComplete: false,
      }));
      
      // Set authentication state
      setIsAuthenticated(true);
      
      console.log('Registration successful:', user.email);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const authService = AuthService.getInstance();
      await authService.logout();
      
      // Clear user from Redux store
      await dispatch(clearUser());
      
      // Clear authentication state
      setIsAuthenticated(false);
      
      // Reset to login mode
      setAuthMode('login');
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigateToStats = () => {
    setCurrentScreen('stats');
  };

  const handleNavigateToProfile = () => {
    setCurrentScreen('profile');
  };

  const handleNavigateToNotificationSettings = () => {
    setCurrentScreen('notificationSettings');
  };

  const handleNavigateToAdminPanel = () => {
    setCurrentScreen('adminPanel');
  };

  const handleNavigateToCalendar = () => {
    setCurrentScreen('calendar');
  };

  const handleNavigateToNotes = () => {
    setCurrentScreen('notes');
  };

  const handleAdminAccess = () => {
    setCurrentScreen('backendAdmin');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading Rise...
        </Text>
      </View>
    );
  }

  // Check authentication status
  // const isAuthenticated = user && user.isAuthenticated; // Removed duplicate declaration

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    if (authMode === 'login') {
      return <Login onLogin={handleLogin} onRegister={() => setAuthMode('register')} />;
    } else {
      return <Register onRegister={handleRegister} onBackToLogin={() => setAuthMode('login')} />;
    }
  }

  // Show questionnaire if user hasn't completed onboarding
  if (!user || !user.isOnboardingComplete) {
    return <Onboarding onComplete={handleQuestionnaireComplete} />;
  }

  // User is authenticated and has completed onboarding - show main app
  // If current screen is dashboard, show dashboard
  if (currentScreen === 'dashboard') {
    return (
      <Dashboard
        onNavigateToStats={handleNavigateToStats}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToNotificationSettings={handleNavigateToNotificationSettings}
        onNavigateToCalendar={handleNavigateToCalendar}
        onNavigateToNotes={handleNavigateToNotes}
      />
    );
  }

  // Show different screens based on current screen state
  switch (currentScreen) {
    case 'notificationSettings':
      return <NotificationSettings onBack={handleBackToDashboard} />;
    case 'stats':
      return <Stats onBack={handleBackToDashboard} />;
    case 'profile':
      return (
        <Profile 
          onBack={handleBackToDashboard} 
          onNavigateToNotificationSettings={handleNavigateToNotificationSettings}
          onLogout={handleLogout}
          onNavigateToAdminPanel={handleNavigateToAdminPanel}
        />
      );
    case 'adminPanel':
      return (
        <AdminPanel 
          onBack={handleBackToDashboard}
        />
      );
    case 'backendAdmin':
      return (
        <BackendAdminPanel 
          onBack={handleBackToDashboard}
        />
      );
    case 'calendar':
      return <Calendar onBack={handleBackToDashboard} />;
    case 'notes':
      return <Notes onBack={handleBackToDashboard} />;
    default:
      return (
        <Dashboard
          onNavigateToStats={handleNavigateToStats}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToNotificationSettings={handleNavigateToNotificationSettings}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToNotes={handleNavigateToNotes}
        />
      );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}
