import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BackendAuthService } from '../services/BackendAuthService';

const { width, height } = Dimensions.get('window');

interface BackendLoginProps {
  onLogin: (user: any) => void;
  onRegister: () => void;
}

const BackendLogin: React.FC<BackendLoginProps> = ({ onLogin, onRegister }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const backendAuthService = BackendAuthService.getInstance();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const result = await backendAuthService.loginUser({ email, password });

      if (result.success && result.user) {
        console.log('Backend login successful:', result.user.email);
        onLogin(result.user);
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 30,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    logoText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 15,
    },
    input: {
      flex: 1,
      paddingVertical: 15,
      fontSize: 16,
      color: theme.colors.text,
    },
    passwordToggle: {
      padding: 5,
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    rememberMeText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginBottom: 20,
    },
    loginButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    loginButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    registerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    registerLink: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
      marginLeft: 5,
    },
    demoContainer: {
      marginTop: 30,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    demoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    demoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rememberMeContainer}>
            <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={20}
                color={rememberMe ? theme.colors.primary : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="hourglass" size={16} color="white" />
                <Text style={styles.loadingText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={onRegister}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Backend Authentication</Text>
          <Text style={styles.demoText}>
            This login uses the backend authentication system. Only registered users can access the app.
            Contact an admin to create an account.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default BackendLogin;
