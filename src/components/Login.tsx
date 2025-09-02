import React, { useState, useEffect } from 'react';
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
import { AuthService } from '../services/AuthService';

const { width, height } = Dimensions.get('window');

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered login on component mount
  useEffect(() => {
    loadRememberedLogin();
  }, []);

  const loadRememberedLogin = async () => {
    try {
      const authService = AuthService.getInstance();
      const remembered = await authService.getRememberedLogin();
      if (remembered) {
        setEmail(remembered.email);
        setPassword(remembered.password);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Failed to load remembered login:', error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Handle remembered login
      const authService = AuthService.getInstance();
      if (rememberMe) {
        await authService.setRememberedLogin(email.trim(), password);
      } else {
        await authService.clearRememberedLogin();
      }

      await onLogin(email.trim(), password);
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCharacter = () => (
    <View style={styles.characterContainer}>
      <View style={styles.characterPlatform}>
        <View style={styles.character}>
          <View style={styles.torch}>
            <View style={styles.flame} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderGems = () => (
    <View style={styles.gemsContainer}>
      <View style={[styles.gem, styles.gemRed]} />
      <View style={[styles.gem, styles.gemGreen]} />
      <View style={[styles.gem, styles.gemOrange]} />
      <View style={[styles.gem, styles.gemPurple]} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Continue your transformation journey
          </Text>
        </View>

        {/* Character and Gems */}
        {renderCharacter()}
        {renderGems()}

        {/* Login Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="mail" size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="oneTimeCode"
              autoComplete="off"
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

          {/* Remember Me Checkbox */}
          <View style={styles.rememberMeContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[
                styles.checkbox,
                {
                  backgroundColor: rememberMe ? theme.colors.primary : 'transparent',
                  borderColor: rememberMe ? theme.colors.primary : theme.colors.border,
                }
              ]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={[styles.rememberMeText, { color: theme.colors.textSecondary }]}>
                Remember my login
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.loginButtonText}>Logging in...</Text>
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
              or
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, { borderColor: theme.colors.primary }]}
            onPress={onRegister}
          >
            <Text style={[styles.registerButtonText, { color: theme.colors.primary }]}>
              Create New Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  characterPlatform: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  character: {
    width: 80,
    height: 80,
    backgroundColor: '#1F2937',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  torch: {
    width: 20,
    height: 30,
    backgroundColor: '#92400E',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flame: {
    width: 16,
    height: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  gemsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  gem: {
    width: 40,
    height: 40,
    marginHorizontal: 8,
    borderRadius: 6,
  },
  gemRed: {
    backgroundColor: '#EF4444',
  },
  gemGreen: {
    backgroundColor: '#10B981',
  },
  gemOrange: {
    backgroundColor: '#F59E0B',
  },
  gemPurple: {
    backgroundColor: '#8B5CF6',
  },
  rememberMeContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  textInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 48,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  registerButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default Login; 