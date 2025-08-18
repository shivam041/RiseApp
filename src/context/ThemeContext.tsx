import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    card: string;
    shadow: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    card: '#FFFFFF',
    shadow: '#000000',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#FF6B35', // Orange accent color from the images
    secondary: '#8B5CF6', // Purple for mystical elements
    background: '#1A0F0F', // Very dark brown/black background
    surface: '#2D1B1B', // Dark brown surface
    text: '#FFFFFF', // White text
    textSecondary: '#B8B8B8', // Light gray secondary text
    border: '#3D2A2A', // Dark brown border
    success: '#10B981', // Green for success
    warning: '#F59E0B', // Amber for warnings
    error: '#EF4444', // Red for errors
    card: '#2D1B1B', // Dark brown card background
    shadow: '#000000', // Black shadow
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(darkTheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme) {
        const isDark = JSON.parse(savedTheme);
        setThemeState(isDark ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem('theme_preference', JSON.stringify(isDark));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = (isDark: boolean) => {
    const newTheme = isDark ? darkTheme : lightTheme;
    setThemeState(newTheme);
    saveThemePreference(isDark);
  };

  const toggleTheme = () => {
    const newIsDark = !theme.isDark;
    setTheme(newIsDark);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 