import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useDispatch, useSelector } from './src/store';
import { RootState, AppDispatch } from './src/store';
import { saveUser, loadUser, clearUser } from './src/store/slices/userSlice';
import { loadDailyProgress, clearProgress } from './src/store/slices/progressSlice';
import { loadQuestionnaire, saveQuestionnaire, clearQuestionnaire } from './src/store/slices/questionnaireSlice';
import { loadGoals, clearGoals } from './src/store/slices/goalsSlice';
import { loadNotes, clearNotes } from './src/store/slices/notesSlice';
import { loadCalendarTasks, clearCalendarTasks } from './src/store/slices/calendarSlice';
import { loadDayProgression, clearDayProgression } from './src/store/slices/dayProgressionSlice';
import { AuthService } from './src/services/AuthService';
import { BackendAuthService } from './src/services/BackendAuthService';
import { OneSignalService } from './src/services/OneSignalService';
import { MotivationalQuotesService } from './src/services/MotivationalQuotesService';

// Import components
import Login from './src/components/Login';
import Register from './src/components/Register';
import BackendLogin from './src/components/BackendLogin';
import BackendRegister from './src/components/BackendRegister';
import Dashboard from './src/components/Dashboard';
import Profile from './src/components/Profile';
import Calendar from './src/components/Calendar';
import Notes from './src/components/Notes';
import Onboarding from './src/components/Onboarding';
import NotificationSettings from './src/components/NotificationSettings';
import Stats from './src/components/Stats';
import AdminPanel from './src/components/AdminPanel';
import BackendAdminPanel from './src/components/BackendAdminPanel';
import BackendUserManagement from './src/components/BackendUserManagement';

// Import types
import { User } from './src/services/AuthService';

// Service worker registration for web
const registerServiceWorker = async () => {
  if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('New version available');
              if (confirm('A new version is available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Initialize OneSignal and motivational quotes
const initializeServices = async () => {
  try {
    // Initialize OneSignal
    const oneSignalService = OneSignalService.getInstance();
    await oneSignalService.initialize();
    
    // Schedule daily reminders
    await oneSignalService.scheduleDailyReminders();
    
    console.log('OneSignal and motivational quotes initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
};

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const { theme } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'profile' | 'calendar' | 'notes' | 'notificationSettings' | 'stats' | 'adminPanel' | 'backendAdmin' | 'backendUserManagement'>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [useBackendAuth, setUseBackendAuth] = useState(true); // Use backend auth by default
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Register service worker for web
        if (Platform.OS === 'web') {
          await registerServiceWorker();
        }
        
        // Initialize OneSignal and other services
        await initializeServices();
        
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

  useEffect(() => {
    // Initialize OneSignal
    const initOneSignal = async () => {
      if (Platform.OS !== 'web') return;
      try {
        const isProdDomain = typeof window !== 'undefined' && window.location && window.location.origin === 'https://riseapppp.netlify.app';
        if (!isProdDomain) {
          console.log('OneSignal init skipped: not on production domain');
          return;
        }
        // Load OneSignal SDK
        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          // Initialize OneSignal after SDK loads
          // @ts-ignore
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          // @ts-ignore
          window.OneSignalDeferred.push(async function(OneSignal: any) {
            await OneSignal.init({
              appId: "6bad5469-9ea4-4946-99b6-8ed0c933549c",
              allowLocalhostAsSecureOrigin: true,
              notifyButton: {
                enable: true,
              },
              welcomeNotification: {
                title: 'Welcome to Rise! 🌅',
                message: 'You\'ll now receive daily reminders and motivational quotes.',
              },
            });
            console.log('OneSignal initialized successfully');
          });
        };
      } catch (e) {
        console.warn('OneSignal init failed/skipped', e);
      }
    };

    if (Platform.OS === 'web') {
      initOneSignal();
    }
  }, []);

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
        extraTasks: userData.extraTasks || [], // Include extra tasks from onboarding
      };
      
      console.log('App: Saving questionnaire data:', questionnaireData);
      await dispatch(saveQuestionnaire(questionnaireData));
      console.log('App: Questionnaire data saved');

      // Persist onboarding completion to backend when using backend auth
      try {
        if (useBackendAuth) {
          const backendAuth = BackendAuthService.getInstance();
          await backendAuth.updateUserProfile(updatedUser.id, {
            name: updatedUser.name,
            is_onboarding_complete: true,
            current_day: updatedUser.currentDay,
          });
        }
      } catch (persistError) {
        console.warn('App: Failed to persist onboarding to backend, continuing', persistError);
      }

      // As a robust fallback, also persist onboarding_complete flag keyed by email
      try {
        const authSvc = AuthService.getInstance();
        await authSvc.updateUserOnboardingStatus(userEmail, true);
        // Additionally keep a separate flag in AsyncStorage in case user object is overwritten
        // The AuthService method will write user and optionally backend; we also ensure the local flag is present
        // by reusing updateUserOnboardingStatus which calls storeUser.
      } catch (e) {
        console.warn('Failed to persist local onboarding flag, continuing', e);
      }
      
      // Set up smart notifications based on user goals
      const oneSignalService = OneSignalService.getInstance();
      await oneSignalService.scheduleDailyReminders();
      
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
        dispatch(clearGoals()),
        dispatch(clearNotes()),
        dispatch(clearCalendarTasks()),
        dispatch(clearDayProgression()),
        dispatch(clearProgress()),
        dispatch(clearQuestionnaire()),
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

  const handleNavigateToUserManagement = () => {
    setCurrentScreen('backendUserManagement');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  // Backend Authentication Handlers
  const handleBackendLogin = async (backendUser: any) => {
    try {
      console.log('Backend login successful:', backendUser);
      
      // Convert backend user to frontend user format
      const frontendUser = {
        ...backendUser,
        isAuthenticated: true,
      };

      // Save user to Redux store
      await dispatch(saveUser(frontendUser));

      // Load all user data
      await Promise.all([
        dispatch(loadDailyProgress()),
        dispatch(loadQuestionnaire()),
        dispatch(loadGoals()),
        dispatch(loadNotes()),
        dispatch(loadCalendarTasks()),
        dispatch(loadDayProgression()),
      ]);

      // Navigate based on onboarding status
      if (frontendUser.isOnboardingComplete) {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('dashboard'); // You can change this to 'onboarding' if needed
      }
    } catch (error) {
      console.error('Error handling backend login:', error);
      Alert.alert('Error', 'Failed to complete login process');
    }
  };

  const handleBackendRegister = async (backendUser: any) => {
    try {
      console.log('Backend registration successful:', backendUser);
      
      // Convert backend user to frontend user format
      const frontendUser = {
        ...backendUser,
        isAuthenticated: true,
      };

      // Save user to Redux store
      await dispatch(saveUser(frontendUser));

      // Load all user data
      await Promise.all([
        dispatch(loadDailyProgress()),
        dispatch(loadQuestionnaire()),
        dispatch(loadGoals()),
        dispatch(loadNotes()),
        dispatch(loadCalendarTasks()),
        dispatch(loadDayProgression()),
      ]);

      // New users go straight to onboarding (App will render Onboarding when isOnboardingComplete is false)
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Error handling backend registration:', error);
      Alert.alert('Error', 'Failed to complete registration process');
    }
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
    if (useBackendAuth) {
      // Use backend authentication
      if (authMode === 'login') {
        return <BackendLogin onLogin={handleBackendLogin} onRegister={() => setAuthMode('register')} />;
      } else {
        return <BackendRegister onRegister={handleBackendRegister} onLogin={() => setAuthMode('login')} />;
      }
    } else {
      // Use local authentication (fallback)
      if (authMode === 'login') {
        return <Login onLogin={handleLogin} onRegister={() => setAuthMode('register')} />;
      } else {
        return <Register onRegister={handleRegister} onBackToLogin={() => setAuthMode('login')} />;
      }
    }
  }

  // Show questionnaire if user hasn't completed onboarding
  if (!user || !user.isOnboardingComplete) {
    // Robust fallback: check local onboarding flag to decide
    // Note: we can't use async hooks here; instead, rely on stored user hydration in useEffect elsewhere
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
          onNavigateToUserManagement={handleNavigateToUserManagement}
        />
      );
    case 'backendUserManagement':
      return (
        <BackendUserManagement 
          onBack={() => setCurrentScreen('backendAdmin')}
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
