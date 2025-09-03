import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { generate66DayProgram } from '../store/slices/questionnaireSlice';
import { createUser, setOnboardingComplete, saveUser } from '../store/slices/userSlice';
import { QuestionnaireResponse } from '../types';
import NotificationService from '../services/NotificationService';

interface QuestionnaireProps {
  onComplete: () => void;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isGoal: boolean;
  time?: string;
  showTimePicker?: boolean;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'wakeUp' | 'bedTime'>('wakeUp');
  const [formData, setFormData] = useState<Partial<QuestionnaireResponse>>({
    name: '',
    sleepGoal: '',
    waterGoal: '',
    exerciseGoal: '',
    mindGoal: '',
    screenTimeGoal: '',
    showerGoal: '',
    wakeUpTime: '07:00',
    bedTime: '22:00',
    currentWaterIntake: 4,
    currentExerciseMinutes: 0,
    currentScreenTimeHours: 6,
    stressLevel: 5,
    energyLevel: 5,
    motivationLevel: 5,
  });

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'sleep',
      title: 'Sleep Schedule',
      description: 'Set your wake up and bed times',
      icon: 'moon',
      isGoal: false,
      time: '07:00',
    },
    {
      id: 'water',
      title: 'Hydration',
      description: 'Drink more water throughout the day',
      icon: 'water',
      isGoal: false,
    },
    {
      id: 'exercise',
      title: 'Exercise',
      description: 'Get regular physical activity',
      icon: 'fitness',
      isGoal: false,
    },
    {
      id: 'mind',
      title: 'Mental Wellness',
      description: 'Practice meditation or mindfulness',
      icon: 'book',
      isGoal: false,
    },
    {
      id: 'screenTime',
      title: 'Screen Time',
      description: 'Reduce time spent on devices',
      icon: 'phone-portrait',
      isGoal: false,
    },
    {
      id: 'shower',
      title: 'Shower Habits',
      description: 'Improve your shower routine',
      icon: 'water-outline',
      isGoal: false,
    },
  ]);

  const steps = [
    {
      title: 'Welcome to Rise',
      subtitle: 'Let\'s create your personalized 66-day life reset program',
      fields: ['name'],
    },
    {
      title: 'Your Goals',
      subtitle: 'Select which areas you want to improve',
      fields: ['goals'],
    },
    {
      title: 'Current State',
      subtitle: 'Rate your current levels',
      fields: ['stressLevel', 'energyLevel', 'motivationLevel'],
    },
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goalId: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, isGoal: !goal.isGoal }
          : goal
      )
    );
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      if (timePickerMode === 'wakeUp') {
        setFormData(prev => ({ ...prev, wakeUpTime: timeString }));
        setGoals(prev => 
          prev.map(goal => 
            goal.id === 'sleep' 
              ? { ...goal, time: timeString }
              : goal
          )
        );
      } else {
        setFormData(prev => ({ ...prev, bedTime: timeString }));
      }
    }
  };

  const showTimePickerFor = (mode: 'wakeUp' | 'bedTime') => {
    setTimePickerMode(mode);
    setShowTimePicker(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create user first
      const userResult = await dispatch(createUser({ name: formData.name as string })).unwrap();
      
      // Convert goals to questionnaire format
      const questionnaireData: Partial<QuestionnaireResponse> = {
        ...formData,
        sleepGoal: goals.find(g => g.id === 'sleep')?.isGoal ? `Wake up at ${formData.wakeUpTime} and go to bed at ${formData.bedTime}` : '',
        waterGoal: goals.find(g => g.id === 'water')?.isGoal ? 'Drink 8 glasses of water daily' : '',
        exerciseGoal: goals.find(g => g.id === 'exercise')?.isGoal ? 'Exercise 30 minutes daily' : '',
        mindGoal: goals.find(g => g.id === 'mind')?.isGoal ? 'Meditate for 10 minutes daily' : '',
        screenTimeGoal: goals.find(g => g.id === 'screenTime')?.isGoal ? 'Limit screen time to 4 hours daily' : '',
        showerGoal: goals.find(g => g.id === 'shower')?.isGoal ? 'Take cold showers for 2 minutes' : '',
        extraTasks: [], // Will be populated from onboarding data
      };
      
      // Generate 66-day program
      const result = await dispatch(generate66DayProgram(questionnaireData as QuestionnaireResponse)).unwrap();
      
      // Update user to mark onboarding as complete
      const updatedUser = { ...userResult, isOnboardingComplete: true };
      await dispatch(saveUser(updatedUser)).unwrap();
      
      // Mark onboarding as complete in store
      dispatch(setOnboardingComplete());

      // Set up notifications
      try {
        const notificationService = NotificationService.getInstance();
        
        // Request permissions first
        const hasPermission = await notificationService.requestPermissions();
        
        if (hasPermission) {
          // Get the first day's tasks for notification setup
          const firstDayTasks = result.dailyProgress?.[0]?.tasks || [];
          
          // Convert goals to UserGoals format
          const userGoals = {
            sleep: goals.find(g => g.id === 'sleep')?.isGoal || false,
            water: goals.find(g => g.id === 'water')?.isGoal || false,
            exercise: goals.find(g => g.id === 'exercise')?.isGoal || false,
            mind: goals.find(g => g.id === 'mind')?.isGoal || false,
            screenTime: goals.find(g => g.id === 'screenTime')?.isGoal || false,
            shower: goals.find(g => g.id === 'shower')?.isGoal || false,
            wakeUpTime: formData.wakeUpTime || '07:00',
            bedTime: formData.bedTime || '22:00',
          };
          
          // Set up all notifications based on user's goals
          await notificationService.setupUserNotifications(userGoals, firstDayTasks);
          
          console.log('Notifications set up successfully');
        } else {
          console.log('Notification permissions not granted');
        }
      } catch (notificationError) {
        console.error('Error setting up notifications:', notificationError);
        // Don't fail the entire setup if notifications fail
      }
      
      // Call the completion callback
      onComplete();
    } catch (error) {
      console.error('Error creating program:', error);
      Alert.alert('Error', 'Failed to create your program. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: string) => {
    switch (field) {
      case 'name':
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Enter your name"
            value={formData.name || ''}
            onChangeText={(value) => handleInputChange('name', value)}
            autoFocus
          />
        );
      
      case 'goals':
        return (
          <View style={styles.goalsContainer}>
            {goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalIcon}>
                    <Ionicons name={goal.icon} size={24} color="#007AFF" />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.goalToggle,
                      goal.isGoal && styles.goalToggleActive
                    ]}
                    onPress={() => handleGoalToggle(goal.id)}
                  >
                    <Text style={[
                      styles.goalToggleText,
                      goal.isGoal && styles.goalToggleTextActive
                    ]}>
                      {goal.isGoal ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {goal.id === 'sleep' && goal.isGoal && (
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeLabel}>Set your sleep schedule:</Text>
                    <View style={styles.timeButtons}>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => showTimePickerFor('wakeUp')}
                      >
                        <Ionicons name="sunny" size={20} color="#007AFF" />
                        <Text style={styles.timeButtonText}>
                          Wake up: {formData.wakeUpTime}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => showTimePickerFor('bedTime')}
                      >
                        <Ionicons name="moon" size={20} color="#007AFF" />
                        <Text style={styles.timeButtonText}>
                          Bed time: {formData.bedTime}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      
      case 'stressLevel':
      case 'energyLevel':
      case 'motivationLevel':
        const fieldName = field as keyof QuestionnaireResponse;
        const value = formData[fieldName] as number;
        const labels = {
          stressLevel: 'Stress Level',
          energyLevel: 'Energy Level',
          motivationLevel: 'Motivation Level'
        };
        
        return (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>{labels[fieldName]}</Text>
            <Text style={styles.ratingValue}>{value}/10</Text>
            <View style={styles.ratingButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    value === rating && styles.ratingButtonActive
                  ]}
                  onPress={() => handleInputChange(fieldName, rating)}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    value === rating && styles.ratingButtonTextActive
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Step Content */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
          
          <View style={styles.fieldsContainer}>
            {currentStepData.fields.map((field) => (
              <View key={field} style={styles.fieldContainer}>
                {renderField(field)}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={isSubmitting}
        >
          <Text style={styles.nextButtonText}>
            {isSubmitting ? 'Creating...' : currentStep === steps.length - 1 ? 'Create My Program' : 'Next'}
          </Text>
          {!isSubmitting && <Ionicons name="chevron-forward" size={24} color="white" />}
        </TouchableOpacity>
      </View>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 40,
    lineHeight: 24,
    textAlign: 'center',
  },
  fieldsContainer: {
    gap: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalsContainer: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  goalToggle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  goalToggleActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  goalToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  goalToggleTextActive: {
    color: 'white',
  },
  timeContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  timeButtons: {
    gap: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  ratingContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingButtonActive: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.1 }],
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  ratingButtonTextActive: {
    color: 'white',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
});

export default Questionnaire; 