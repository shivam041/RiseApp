import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: (userData: OnboardingData) => void;
}

interface OnboardingData {
  name: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  age: number;
  wakeUpTime: string;
  bedTime: string;
  motivation: string;
  endGoal: string;
  darkHabits: string[];
  screenTimeReduction: boolean;
  timeWorth: number;
  extraTasks: string[];
  sleepGoal: string;
  hydrationGoal: number;
  exerciseGoal: number;
  mindGoal: number;
  screenTimeGoal: number;
  showerGoal: number;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<Partial<OnboardingData>>({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showNumberPicker, setShowNumberPicker] = useState(false);
  const [currentPickerType, setCurrentPickerType] = useState<string>('');
  const [tempTime, setTempTime] = useState<Date | null>(null);

  const getDateFromTimeString = (timeString?: string): Date => {
    const now = new Date();
    if (!timeString) return now;
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      const d = new Date(now);
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
    return now;
  };

  const steps = [
    {
      id: 'welcome',
      title: "I'm proud of you for wanting to make changes.",
      subtitle: "Let's examine your obstacles scientifically and see how habits and discipline can help you",
      showCharacter: true,
      showGems: true,
    },
    {
      id: 'name',
      title: "What's your name?",
      showCharacter: true,
      inputType: 'text',
    },
    {
      id: 'gender',
      title: "What's your gender?",
      showCharacter: true,
      options: ['Female', 'Male', 'Other', 'Prefer not to say'],
    },
    {
      id: 'age',
      title: "How old are you?",
      showCharacter: true,
      inputType: 'age',
    },
    {
      id: 'motivation',
      title: "Why do you want to reset your life?",
      showCharacter: true,
      options: [
        'Fix bad habits & gain discipline',
        'Improve body & mind',
        'Grow in study & career',
        'Recover from life setbacks',
        'Restart life with purpose',
      ],
    },
    {
      id: 'daily-drive',
      title: "What drives your journey everyday?",
      showCharacter: true,
      options: [
        'Make money to support my needs',
        'To not get fired or expelled',
        'To provide for my family',
        'Achieve my goals and dreams',
        'None of the above',
      ],
    },
    {
      id: 'main-character',
      title: "When did you last feel like the main character?",
      showCharacter: true,
      options: [
        'Just today',
        'Few days ago',
        'Few weeks ago',
        'Few months ago',
        'Too long I can\'t remember',
      ],
    },
    {
      id: 'end-goal',
      title: "What's the endgame you're striving for?",
      showCharacter: true,
      options: [
        'Learn new skills regularly',
        'Strengthen my relationships',
        'Build a successful career',
        'Stay fit and healthy',
        'None of the above',
        'More than one of above',
      ],
    },
    {
      id: 'dark-habits',
      title: "Are there any dark habits holding your power back?",
      showCharacter: true,
      options: [
        'Smoking',
        'Vaping',
        'Fap',
        'Alcohol',
        'None of the above',
        'More than one of above',
      ],
    },
    {
      id: 'screen-time',
      title: "Do you aim to reduce screen time?",
      showCharacter: true,
      options: ['No', 'Yes'],
    },
    {
      id: 'time-waste',
      title: "How many hours a week do you waste on distractions in life?",
      subtitle: "Eg. doom scrolling, procrastinating...",
      showCharacter: true,
      inputType: 'time-slider',
    },
    {
      id: 'time-worth',
      title: "If you're selling 1 hour of your life, how much would you charge?",
      showCharacter: true,
      inputType: 'money-slider',
    },
    {
      id: 'wake-up-time',
      title: "What time do you usually wake up at right now?",
      showCharacter: true,
      inputType: 'time-picker',
      goalType: 'wakeUpTime',
    },
    {
      id: 'sleep-goal',
      title: "What time do you want to wake up?",
      subtitle: "We'll send you a notification at this time to start your day",
      showCharacter: true,
      inputType: 'time-picker',
      goalType: 'sleepGoal',
    },
    {
      id: 'hydration-goal',
      title: "How many glasses of water do you want to drink daily?",
      subtitle: "We'll remind you every 1.5 hours to stay hydrated",
      showCharacter: true,
      inputType: 'number-picker',
      goalType: 'hydrationGoal',
      min: 4,
      max: 16,
      step: 1,
      unit: 'glasses',
    },
    {
      id: 'exercise-goal',
      title: "How many minutes of exercise do you want daily?",
      subtitle: "We'll remind you to complete your workout",
      showCharacter: true,
      inputType: 'number-picker',
      goalType: 'exerciseGoal',
      min: 10,
      max: 120,
      step: 5,
      unit: 'minutes',
    },
    {
      id: 'mind-goal',
      title: "How many minutes of meditation/mindfulness do you want daily?",
      subtitle: "We'll remind you to take time for your mind",
      showCharacter: true,
      inputType: 'number-picker',
      goalType: 'mindGoal',
      min: 5,
      max: 60,
      step: 5,
      unit: 'minutes',
    },
    {
      id: 'screen-time-goal',
      title: "How many hours of screen time do you want to limit yourself to?",
      subtitle: "We'll remind you when you're approaching your limit",
      showCharacter: true,
      inputType: 'number-picker',
      goalType: 'screenTimeGoal',
      min: 1,
      max: 8,
      step: 0.5,
      unit: 'hours',
    },
    {
      id: 'shower-goal',
      title: "How many minutes of cold shower do you want daily?",
      subtitle: "We'll remind you to take your cold shower",
      showCharacter: true,
      inputType: 'number-picker',
      goalType: 'showerGoal',
      min: 1,
      max: 10,
      step: 1,
      unit: 'minutes',
    },
    {
      id: 'extra-tasks',
      title: "Do you want to add any extra tasks to the program? (Max 2)",
      showCharacter: true,
      options: [
        'Journalling',
        'Sit up',
        'Push up',
        'Studying',
        'X No fap',
        'No smoke',
        'Y No alcohol',
        'Praying',
      ],
      multiSelect: true,
      maxSelect: 2,
    },
    {
      id: 'notifications',
      title: "Get daily notifications to keep motivated",
      showCharacter: false,
      notificationSettings: true,
    },
    {
      id: 'scientific-research',
      title: "Top scientific research shows that it takes",
      subtitle: "66 days to build lasting habits and transform your life.",
      showCharacter: false,
      showResearch: true,
    },
    {
      id: 'penalty-system',
      title: "Stay disciplined with your tasks",
      subtitle: "We created this system to encourage daily consistency, rewarding progress.",
      showCharacter: false,
      showPenalty: true,
    },
    {
      id: 'rpg-game',
      title: "Turn your life into a RPG game",
      subtitle: "Climb from Bronze V to Legend I by completing tasks.",
      showCharacter: true,
      showRPG: true,
    },
    {
      id: 'vow',
      title: "Do you vow to reflect on your path, even when the truth is uncomfortable?",
      showCharacter: true,
      options: ['No', 'Yes'],
    },
    {
      id: 'lock-in',
      title: "Are you ready to lock in?",
      subtitle: "The path has been revealed to you. Will you take the first step into the unknown, or remain at the gates of destiny?",
      showCharacter: false,
      showLockIn: true,
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step input
    const step = steps[currentStep];
    const require = (cond: boolean) => {
      if (!cond) {
        alert('Please complete this step before continuing.');
        return false;
      }
      return true;
    };

    let ok = true;
    switch (step.id) {
      case 'name':
        ok = require(!!userData.name && String(userData.name).trim().length > 0);
        break;
      case 'gender':
        ok = require(!!userData.gender);
        break;
      case 'age':
        ok = require(typeof userData.age === 'number' && (userData.age as number) > 0);
        break;
      case 'motivation':
      case 'daily-drive':
      case 'main-character':
      case 'end-goal':
      case 'dark-habits':
      case 'screen-time':
        ok = require(true); // options handlers already set the selection; non-empty UI state assumed
        break;
      case 'time-waste':
      case 'time-worth':
        ok = require(typeof userData.timeWorth === 'number');
        break;
      case 'wake-up-time':
        ok = require(!!userData.wakeUpTime);
        break;
      case 'sleep-goal':
        ok = require(!!userData.sleepGoal);
        break;
      case 'hydration-goal':
        ok = require(typeof userData.hydrationGoal === 'number' && (userData.hydrationGoal as number) > 0);
        break;
      case 'exercise-goal':
        ok = require(typeof userData.exerciseGoal === 'number' && (userData.exerciseGoal as number) > 0);
        break;
      case 'mind-goal':
        ok = require(typeof userData.mindGoal === 'number' && (userData.mindGoal as number) > 0);
        break;
      case 'screen-time-goal':
        ok = require(typeof userData.screenTimeGoal === 'number' && (userData.screenTimeGoal as number) > 0);
        break;
      case 'shower-goal':
        ok = require(typeof userData.showerGoal === 'number' && (userData.showerGoal as number) > 0);
        break;
      case 'lock-in':
        ok = true;
        break;
      default:
        ok = true;
    }

    if (!ok) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(userData as OnboardingData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

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

  const renderTimePicker = (goalType?: string) => (
    <View style={styles.pickerContainer}>
      <TouchableOpacity
        style={[styles.pickerButton, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border 
        }]}
        onPress={() => {
          setCurrentPickerType(goalType || 'time');
          const existing = goalType ? (userData[goalType as keyof OnboardingData] as unknown as string) : undefined;
          setTempTime(getDateFromTimeString(existing));
          setShowTimePicker(true);
        }}
      >
        <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
          {goalType && userData[goalType as keyof OnboardingData] 
            ? userData[goalType as keyof OnboardingData] 
            : 'Select Time'}
        </Text>
        <Ionicons name="time" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderNumberPicker = (goalType: string, min: number, max: number, step: number, unit: string) => {
    const currentValue = userData[goalType as keyof OnboardingData] || min;
    
    return (
      <View style={styles.pickerContainer}>
        <View style={styles.numberPickerRow}>
          <TouchableOpacity
            style={[styles.pickerArrow, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              const newValue = Math.max(min, (currentValue as number) - step);
              handleInputChange(goalType, newValue);
            }}
          >
            <Ionicons name="chevron-down" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <View style={[styles.numberDisplay, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.numberText, { color: theme.colors.text }]}>
              {currentValue}
            </Text>
            <Text style={[styles.unitText, { color: theme.colors.textSecondary }]}>
              {unit}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.pickerArrow, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              const newValue = Math.min(max, (currentValue as number) + step);
              handleInputChange(goalType, newValue);
            }}
          >
            <Ionicons name="chevron-up" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.rangeIndicator}>
          <Text style={[styles.rangeText, { color: theme.colors.textSecondary }]}>
            {min} - {max} {unit}
          </Text>
        </View>
      </View>
    );
  };

  const renderInput = () => {
    switch (currentStepData.inputType) {
      case 'text':
        return (
          <View style={styles.pickerContainer}>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textSecondary}
              value={userData.name || ''}
              onChangeText={(text) => handleInputChange('name', text)}
              autoFocus={true}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        );
      case 'age':
        return (
          <View style={styles.ageSelector}>
            {[17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((age) => {
              const isSelected = userData.age === age;
              return (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.ageOption,
                    { 
                      backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                      borderColor: isSelected ? theme.colors.primary : '#3D2A2A',
                    }
                  ]}
                  onPress={() => handleInputChange('age', age)}
                >
                  <Text style={[
                    styles.ageText, 
                    { 
                      color: isSelected ? 'white' : theme.colors.text,
                      fontWeight: isSelected ? '600' : '400'
                    }
                  ]}>
                    {age}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      case 'time-picker':
        return renderTimePicker(currentStepData.goalType);
      case 'time-slider':
        return (
          <View style={styles.pickerContainer}>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, marginBottom: 20 }]}>
              Select the number of hours per week
            </Text>
            <View style={styles.ageSelector}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map((hours) => {
                const isSelected = userData.timeWorth === hours;
                return (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.ageOption,
                      { 
                        backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                        borderColor: isSelected ? theme.colors.primary : '#3D2A2A',
                      }
                    ]}
                    onPress={() => handleInputChange('timeWorth', hours)}
                  >
                    <Text style={[
                      styles.ageText, 
                      { 
                        color: isSelected ? 'white' : theme.colors.text,
                        fontWeight: isSelected ? '600' : '400'
                      }
                    ]}>
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 'number-picker':
        if (currentStepData.goalType && currentStepData.min && currentStepData.max && currentStepData.step && currentStepData.unit) {
          return renderNumberPicker(
            currentStepData.goalType,
            currentStepData.min,
            currentStepData.max,
            currentStepData.step,
            currentStepData.unit
          );
        }
        return null;
      default:
        return null;
    }
  };

  const renderOptions = () => {
    if (!currentStepData.options) return null;

    return (
      <View style={styles.optionsContainer}>
        {currentStepData.options.map((option, index) => {
          // Check if this option is selected
          const isSelected = currentStepData.multiSelect 
            ? userData.extraTasks?.includes(option)
            : userData[currentStepData.id] === option;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : '#3D2A2A',
                }
              ]}
              onPress={() => {
                if (currentStepData.multiSelect) {
                  const current = userData.extraTasks || [];
                  const updated = current.includes(option)
                    ? current.filter(item => item !== option)
                    : current.length < (currentStepData.maxSelect || 2)
                      ? [...current, option]
                      : current;
                  handleInputChange('extraTasks', updated);
                } else {
                  handleInputChange(currentStepData.id, option);
                }
              }}
            >
              <Text style={[
                styles.optionText, 
                { 
                  color: isSelected ? 'white' : theme.colors.text,
                  fontWeight: isSelected ? '600' : '400'
                }
              ]}>
                {option}
              </Text>
              {currentStepData.multiSelect && isSelected && (
                <Ionicons name="checkmark-circle" size={24} color="white" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              backgroundColor: theme.colors.primary 
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
        {Math.round(((currentStep + 1) / steps.length) * 100)}%
      </Text>
    </View>
  );

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      // Android provides event.type: 'set' | 'dismissed'
      if (event?.type === 'set' && selectedTime && currentPickerType) {
        const timeString = selectedTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        handleInputChange(currentPickerType, timeString);
      }
      // Close picker after action
      setShowTimePicker(false);
      setTempTime(null);
      return;
    }

    // iOS: keep spinner open and update temporary value only
    if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const confirmIosTime = () => {
    if (tempTime && currentPickerType) {
      const timeString = tempTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      handleInputChange(currentPickerType, timeString);
    }
    setShowTimePicker(false);
    setTempTime(null);
  };

  const cancelIosTime = () => {
    setShowTimePicker(false);
    setTempTime(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        {renderProgressBar()}
        <View style={styles.languageSelector}>
          <Text style={[styles.languageText, { color: theme.colors.text }]}>English</Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {currentStepData.title}
          </Text>
          
          {currentStepData.subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {currentStepData.subtitle}
            </Text>
          )}

          {currentStepData.showCharacter && renderCharacter()}
          {currentStepData.showGems && renderGems()}
          {renderInput()}
          {renderOptions()}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleNext}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <View>
          {Platform.OS === 'ios' && (
            <View style={styles.iosTimeBar}>
              <TouchableOpacity onPress={cancelIosTime}>
                <Text style={[styles.iosTimeBarText, { color: theme.colors.error }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.iosTimeBarTitle, { color: theme.colors.text }]}>Select Time</Text>
              <TouchableOpacity onPress={confirmIosTime}>
                <Text style={[styles.iosTimeBarText, { color: theme.colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
          <DateTimePicker
            value={tempTime || new Date()}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={handleTimeChange}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iosTimeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iosTimeBarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  iosTimeBarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#3D2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2D1B1B',
  },
  languageText: {
    fontSize: 14,
    marginRight: 4,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  mainContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  characterContainer: {
    alignItems: 'center',
    marginVertical: 30,
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
    marginVertical: 30,
  },
  gem: {
    width: 60,
    height: 60,
    marginHorizontal: 10,
    borderRadius: 8,
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
  pickerContainer: {
    width: '100%',
    marginTop: 20,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  textInput: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 56,
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
  },
  numberPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerArrow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  numberDisplay: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  numberText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 14,
    marginTop: 4,
  },
  rangeIndicator: {
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 12,
  },
  ageSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  ageOption: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3D2A2A',
    borderRadius: 30,
    margin: 8,
  },
  ageText: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3D2A2A',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default Onboarding; 