import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SupabaseService } from '../services/SupabaseService';

const SupabaseTest: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [testResult, setTestResult] = useState<string>('');

  const testSupabaseConnection = async () => {
    try {
      setTestResult('Testing Supabase connection...');
      const supabase = SupabaseService.getInstance();
      
      if (!supabase) {
        setTestResult('❌ Supabase service not available');
        return;
      }
      
      setTestResult('✅ Supabase service available');
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  const testUserRegistration = async () => {
    try {
      setTestResult('Testing user registration...');
      const supabase = SupabaseService.getInstance();
      
      if (!supabase) {
        setTestResult('❌ Supabase service not available');
        return;
      }
      
      const user = await supabase.signUp(email, password, 'Test User');
      setTestResult(`✅ User registered: ${user.email} (ID: ${user.id})`);
    } catch (error) {
      setTestResult(`❌ Registration failed: ${error}`);
    }
  };

  const testUserLogin = async () => {
    try {
      setTestResult('Testing user login...');
      const supabase = SupabaseService.getInstance();
      
      if (!supabase) {
        setTestResult('❌ Supabase service not available');
        return;
      }
      
      const user = await supabase.signIn(email, password);
      setTestResult(`✅ User logged in: ${user.email} (ID: ${user.id})`);
    } catch (error) {
      setTestResult(`❌ Login failed: ${error}`);
    }
  };

  const testDatabaseInitialization = async () => {
    try {
      setTestResult('Testing database initialization...');
      const supabase = SupabaseService.getInstance();
      
      if (!supabase) {
        setTestResult('❌ Supabase service not available');
        return;
      }
      
      await supabase.initializeDatabase();
      setTestResult('✅ Database initialization completed');
    } catch (error) {
      setTestResult(`❌ Database initialization failed: ${error}`);
    }
  };

  const testGoalsCRUD = async () => {
    try {
      setTestResult('Testing goals CRUD operations...');
      const supabase = SupabaseService.getInstance();
      
      if (!supabase) {
        setTestResult('❌ Supabase service not available');
        return;
      }
      
      // First, we need a user
      let user;
      try {
        user = await supabase.signIn(email, password);
      } catch (error) {
        // Try to register if login fails
        user = await supabase.signUp(email, password, 'Test User');
      }
      
      if (!user) {
        setTestResult('❌ No user available for testing');
        return;
      }
      
      // Test goals operations
      const testGoals = [
        {
          id: 'test-1',
          title: 'Test Goal 1',
          description: 'Test Description 1',
          category: 'exercise' as any,
          value: '30 minutes',
          target: 'Daily exercise',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      // Save goals
      await supabase.saveGoals(user.id, testGoals);
      setTestResult('✅ Goals saved successfully');
      
      // Load goals
      const loadedGoals = await supabase.loadGoals(user.id);
      setTestResult(`✅ Goals loaded: ${loadedGoals.length} goals found`);
      
    } catch (error) {
      setTestResult(`❌ Goals CRUD test failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Integration Test</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testSupabaseConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testDatabaseInitialization}>
          <Text style={styles.buttonText}>Test DB Init</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testUserRegistration}>
          <Text style={styles.buttonText}>Test Registration</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testUserLogin}>
          <Text style={styles.buttonText}>Test Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testGoalsCRUD}>
          <Text style={styles.buttonText}>Test Goals CRUD</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Test Results:</Text>
        <Text style={styles.resultText}>{testResult}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SupabaseTest;
