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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface RegisterProps {
  onRegister: (email: string, password: string, confirmPassword: string) => void;
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBackToLogin }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: '' };
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(email.trim(), password, confirmPassword);
    } catch (error) {
      Alert.alert('Registration Failed', 'An error occurred during registration. Please try again.');
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Start your transformation journey today
          </Text>
        </View>

        {/* Character and Gems */}
        {renderCharacter()}
        {renderGems()}

        {/* Register Form */}
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
              placeholder="Create a password"
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

          {/* Confirm Password Input */}
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
              placeholder="Confirm your password"
              placeholderTextColor={theme.colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="oneTimeCode"
              autoComplete="off"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View style={styles.passwordRequirements}>
            <Text style={[styles.requirementsTitle, { color: theme.colors.textSecondary }]}>
              Password must contain:
            </Text>
            <View style={styles.requirementItem}>
              <Ionicons
                name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={password.length >= 8 ? theme.colors.success : theme.colors.textSecondary}
              />
              <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                At least 8 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={/(?=.*[a-z])/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/(?=.*[a-z])/.test(password) ? theme.colors.success : theme.colors.textSecondary}
              />
              <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                One lowercase letter
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={/(?=.*[A-Z])/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/(?=.*[A-Z])/.test(password) ? theme.colors.success : theme.colors.textSecondary}
              />
              <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                One uppercase letter
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={/(?=.*\d)/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/(?=.*\d)/.test(password) ? theme.colors.success : theme.colors.textSecondary}
              />
              <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                One number
              </Text>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.registerButtonText}>Creating Account...</Text>
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity style={styles.backToLogin} onPress={onBackToLogin}>
            <Text style={[styles.backToLoginText, { color: theme.colors.primary }]}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
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
  passwordRequirements: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  backToLogin: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
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

export default Register; 