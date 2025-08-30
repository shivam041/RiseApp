import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { useSelector } from 'react-redux';
import { RootState } from './src/store';
import { loadUser, saveUser, clearUser } from './src/store/slices/userSlice';
import { loadDailyProgress } from './src/store/slices/progressSlice';
import { saveQuestionnaire, loadQuestionnaire } from './src/store/slices/questionnaireSlice';
import { loadGoals } from './src/store/slices/goalsSlice';
import { loadNotes } from './src/store/slices/notesSlice';
import { loadCalendarTasks } from './src/store/slices/calendarSlice';
import { loadDayProgression } from './src/store/slices/dayProgressionSlice';
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
  const { theme } = useTheme();

  // Derive authentication state from user state
  const isAuthenticated = user && user.isAuthenticated === true;

  // Debug: Monitor user state changes
  useEffect(() => {
    console.log('App: User state changed:', user);
    console.log('App: User onboarding status:', user?.isOnboardingComplete);
    console.log('App: isAuthenticated derived value:', isAuthenticated);
  }, [user, isAuthenticated]);

  // Debug: Monitor authentication flow
  useEffect(() => {
    console.log('App: Authentication flow check:');
    console.log('  - User exists:', !!user);
    console.log('  - User onboarding complete:', user?.isOnboardingComplete);
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - Current screen:', currentScreen);
  }, [user, isAuthenticated, currentScreen]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App: Starting initialization...');
        
        // Check if user is authenticated
        const authService = AuthService.getInstance();
        const isAuthenticated = await authService.isAuthenticated();
        
        console.log('App initialization - isAuthenticated:', isAuthenticated);
        
        if (isAuthenticated) {
          console.log('App: User is authenticated, loading user data...');
          
          // Load user data first, then progress and questionnaire
          await dispatch(loadUser());
          console.log('App: User data loaded from Redux store');
          
          // Wait a bit for user data to be available, then load other data
          setTimeout(async () => {
            try {
              console.log('App: Loading additional user data...');
              await Promise.all([
                dispatch(loadDailyProgress()),
                dispatch(loadQuestionnaire()),
                dispatch(loadGoals()),
                dispatch(loadNotes()),
                dispatch(loadCalendarTasks()),
                dispatch(loadDayProgression()),
              ]);
              console.log('All data loaded successfully');
            } catch (error) {
              console.error('Failed to load data:', error);
            }
          }, 100);
          
          console.log('User data loaded successfully');
        } else {
          console.log('App: User not authenticated, clearing user data...');
          // Clear any existing user data if not authenticated
          await dispatch(clearUser());
          console.log('User data cleared - not authenticated');
        }
        
        // Update the authentication state
        // setIsAuthenticated(isAuthenticated); // This line is removed as per the new_code
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
      console.log('App: handleQuestionnaireComplete called with userData:', userData);
      
      // Get current user from auth service
      const authService = AuthService.getInstance();
      const currentUser = await authService.getCurrentUser();
      console.log('App: Current user from auth service:', currentUser);
      
      // Get stored credentials to find the email
      const storedCredentials = await authService.getStoredCredentials();
      console.log('App: Stored credentials:', storedCredentials);
      
      // Ensure we have an email - this is critical for authentication
      const userEmail = currentUser?.email || storedCredentials?.email;
      if (!userEmail) {
        throw new Error('User email not found. Cannot complete onboarding.');
      }
      
      console.log('App: Using email for user:', userEmail);
      
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
      
      console.log('App: Updated user with onboarding complete:', updatedUser);
      
      // Save user data with authentication status
      await authService.storeUser(updatedUser);
      console.log('App: User saved to auth service');
      
      // Update user in Redux store
      await dispatch(saveUser(updatedUser));
      console.log('App: User saved to Redux store');
      
      // Set authentication state
      // setIsAuthenticated(true); // This line is removed as per the new_code
      
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
      
      console.log('App: Saving questionnaire data:', questionnaireData);
      await dispatch(saveQuestionnaire(questionnaireData));
      console.log('App: Questionnaire data saved');
      
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
      console.log('App: handleLogin called for email:', email);
      const authService = AuthService.getInstance();
      const user = await authService.login(email, password);
      
      console.log('App: User returned from authService.login:', user);
      console.log('App: User onboarding status:', user.isOnboardingComplete);
      
      // Update user in Redux store
      const userToSave = {
        ...user,
        isOnboardingComplete: user.isOnboardingComplete || false,
      };
      console.log('App: Saving user to Redux store:', userToSave);
      
      await dispatch(saveUser(userToSave));
      
      // Set authentication state
      // setIsAuthenticated(true); // This line is removed as per the new_code
      
      // Load user-specific data immediately
      try {
        console.log('App: Loading user-specific data...');
        await Promise.all([
          dispatch(loadDailyProgress()),
          dispatch(loadQuestionnaire()),
          dispatch(loadGoals()),
          dispatch(loadNotes()),
          dispatch(loadCalendarTasks()),
          dispatch(loadDayProgression()),
        ]);
        console.log('User-specific data loaded successfully');
      } catch (error) {
        console.error('Failed to load user-specific data:', error);
      }
      
      // Admins go straight to backend admin panel
      if (user.isAdmin) {
        setCurrentScreen('backendAdmin');
        console.log('Admin login successful:', user.email);
        return;
      }
      
      // Set current screen based on onboarding status
      console.log('App: Setting screen based on onboarding status:', user.isOnboardingComplete);
      if (user.isOnboardingComplete) {
        console.log('App: User completed onboarding, setting screen to dashboard');
        setCurrentScreen('dashboard');
      } else {
        console.log('App: User needs to complete onboarding');
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
      // setIsAuthenticated(true); // This line is removed as per the new_code
      
      console.log('Registration successful:', user.email);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    console.log('App: handleLogout called');
    try {
      const authService = AuthService.getInstance();
      console.log('App: Calling authService.logout()');
      await authService.logout();
      
      console.log('App: Clearing user from Redux store');
      // Clear user from Redux store
      await dispatch(clearUser());
      
      console.log('App: Clearing all user-specific data from Redux store');
      // Clear all user-specific data from Redux store
      await Promise.all([
        dispatch({ type: 'goals/clearGoals' }),
        dispatch({ type: 'notes/clearNotes' }),
        dispatch({ type: 'calendar/clearCalendarTasks' }),
        dispatch({ type: 'dayProgression/clearDayProgression' }),
        dispatch({ type: 'progress/clearProgress' }),
        dispatch({ type: 'questionnaire/clearQuestionnaire' }),
      ]);
      
      console.log('App: Setting authMode to login');
      // Reset to login mode
      setAuthMode('login');
      
      console.log('Logout successful - all user data cleared');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigateToStats = () => {
    setCurrentScreen('stats');
  };

  const handleNavigateToProfile = () => {
    console.log('App: handleNavigateToProfile called, setting currentScreen to profile');
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
    console.log('App: User not authenticated, showing login/register');
    if (authMode === 'login') {
      return <Login onLogin={handleLogin} onRegister={() => setAuthMode('register')} />;
    } else {
      return <Register onRegister={handleRegister} onBackToLogin={() => setAuthMode('login')} />;
    }
  }

  // Show questionnaire if user hasn't completed onboarding
  if (!user || !user.isOnboardingComplete) {
    console.log('App: User not completed onboarding, showing onboarding');
    return <Onboarding onComplete={handleQuestionnaireComplete} onGoHome={handleLogout} />;
  }

  console.log('App: User authenticated and completed onboarding, showing main app');

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
      console.log('App: Rendering Profile component');
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
