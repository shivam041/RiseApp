import { TaskTemplate } from '../types';

export const taskTemplates: TaskTemplate[] = [
  // SLEEP TASKS
  {
    category: 'sleep',
    title: 'Set a consistent wake-up time',
    description: 'Choose a wake-up time and stick to it for the next 7 days',
    difficulty: 'easy',
    estimatedTime: 1,
    tips: ['Place your alarm across the room', 'Use a gentle alarm sound', 'Avoid snoozing'],
    dayRange: { start: 1, end: 7 }
  },
  {
    category: 'sleep',
    title: 'Create a bedtime routine',
    description: 'Develop a 30-minute pre-sleep routine',
    difficulty: 'easy',
    estimatedTime: 30,
    tips: ['Read a book', 'Practice deep breathing', 'Avoid screens 1 hour before bed'],
    dayRange: { start: 8, end: 14 }
  },
  {
    category: 'sleep',
    title: 'Optimize your sleep environment',
    description: 'Make your bedroom conducive to sleep',
    difficulty: 'medium',
    estimatedTime: 15,
    tips: ['Keep room cool and dark', 'Use blackout curtains', 'Remove electronics'],
    dayRange: { start: 15, end: 21 }
  },
  {
    category: 'sleep',
    title: 'Practice sleep hygiene',
    description: 'Implement advanced sleep hygiene practices',
    difficulty: 'medium',
    estimatedTime: 20,
    tips: ['Avoid caffeine after 2 PM', 'Exercise earlier in the day', 'Use blue light filters'],
    dayRange: { start: 22, end: 28 }
  },
  {
    category: 'sleep',
    title: 'Master your sleep schedule',
    description: 'Maintain perfect sleep timing for 2 weeks',
    difficulty: 'hard',
    estimatedTime: 1,
    tips: ['Track your sleep quality', 'Adjust gradually', 'Be consistent on weekends'],
    dayRange: { start: 29, end: 42 }
  },
  {
    category: 'sleep',
    title: 'Advanced sleep optimization',
    description: 'Fine-tune your sleep for maximum recovery',
    difficulty: 'hard',
    estimatedTime: 30,
    tips: ['Experiment with sleep cycles', 'Optimize room temperature', 'Use sleep tracking'],
    dayRange: { start: 43, end: 66 }
  },

  // WATER TASKS
  {
    category: 'water',
    title: 'Start with 4 glasses daily',
    description: 'Drink 4 glasses of water throughout the day',
    difficulty: 'easy',
    estimatedTime: 1,
    tips: ['Keep a water bottle nearby', 'Set reminders', 'Start with room temperature water'],
    dayRange: { start: 1, end: 7 }
  },
  {
    category: 'water',
    title: 'Increase to 6 glasses',
    description: 'Gradually increase to 6 glasses of water daily',
    difficulty: 'easy',
    estimatedTime: 1,
    tips: ['Drink before meals', 'Add lemon for flavor', 'Track your intake'],
    dayRange: { start: 8, end: 14 }
  },
  {
    category: 'water',
    title: 'Reach 8 glasses daily',
    description: 'Achieve the recommended 8 glasses of water',
    difficulty: 'medium',
    estimatedTime: 1,
    tips: ['Use a large water bottle', 'Set hourly reminders', 'Monitor urine color'],
    dayRange: { start: 15, end: 28 }
  },
  {
    category: 'water',
    title: 'Optimize hydration timing',
    description: 'Learn when to drink water for maximum benefit',
    difficulty: 'medium',
    estimatedTime: 1,
    tips: ['Drink upon waking', 'Hydrate before exercise', 'Avoid late night drinking'],
    dayRange: { start: 29, end: 42 }
  },
  {
    category: 'water',
    title: 'Advanced hydration strategy',
    description: 'Develop personalized hydration based on activity',
    difficulty: 'hard',
    estimatedTime: 5,
    tips: ['Calculate needs based on weight', 'Adjust for exercise', 'Monitor electrolytes'],
    dayRange: { start: 43, end: 66 }
  },

  // EXERCISE TASKS
  {
    category: 'exercise',
    title: 'Start with 10-minute walks',
    description: 'Take a 10-minute walk every day',
    difficulty: 'easy',
    estimatedTime: 10,
    tips: ['Walk after meals', 'Use a step counter', 'Find scenic routes'],
    dayRange: { start: 1, end: 7 }
  },
  {
    category: 'exercise',
    title: 'Increase to 15-minute walks',
    description: 'Extend your daily walks to 15 minutes',
    difficulty: 'easy',
    estimatedTime: 15,
    tips: ['Add some hills', 'Increase pace gradually', 'Walk with a friend'],
    dayRange: { start: 8, end: 14 }
  },
  {
    category: 'exercise',
    title: 'Add bodyweight exercises',
    description: 'Include 10 minutes of bodyweight exercises',
    difficulty: 'medium',
    estimatedTime: 25,
    tips: ['Start with push-ups and squats', 'Use proper form', 'Rest between sets'],
    dayRange: { start: 15, end: 28 }
  },
  {
    category: 'exercise',
    title: 'Create a workout routine',
    description: 'Develop a structured 30-minute workout',
    difficulty: 'medium',
    estimatedTime: 30,
    tips: ['Alternate cardio and strength', 'Track your progress', 'Stay consistent'],
    dayRange: { start: 29, end: 42 }
  },
  {
    category: 'exercise',
    title: 'Advanced fitness program',
    description: 'Implement a comprehensive fitness program',
    difficulty: 'hard',
    estimatedTime: 45,
    tips: ['Include HIIT workouts', 'Add flexibility training', 'Monitor recovery'],
    dayRange: { start: 43, end: 66 }
  },

  // MIND TASKS
  {
    category: 'mind',
    title: 'Start with 5-minute meditation',
    description: 'Practice 5 minutes of daily meditation',
    difficulty: 'easy',
    estimatedTime: 5,
    tips: ['Use guided meditation apps', 'Find a quiet space', 'Focus on breathing'],
    dayRange: { start: 1, end: 7 }
  },
  {
    category: 'mind',
    title: 'Read for 15 minutes daily',
    description: 'Read a book for 15 minutes each day',
    difficulty: 'easy',
    estimatedTime: 15,
    tips: ['Choose engaging books', 'Read before bed', 'Join a book club'],
    dayRange: { start: 8, end: 14 }
  },
  {
    category: 'mind',
    title: 'Practice gratitude journaling',
    description: 'Write down 3 things you\'re grateful for daily',
    difficulty: 'medium',
    estimatedTime: 10,
    tips: ['Write in the morning', 'Be specific', 'Reflect on small moments'],
    dayRange: { start: 15, end: 28 }
  },
  {
    category: 'mind',
    title: 'Learn a new skill',
    description: 'Spend 20 minutes learning something new',
    difficulty: 'medium',
    estimatedTime: 20,
    tips: ['Use online courses', 'Practice daily', 'Track your progress'],
    dayRange: { start: 29, end: 42 }
  },
  {
    category: 'mind',
    title: 'Advanced mental training',
    description: 'Implement advanced cognitive training exercises',
    difficulty: 'hard',
    estimatedTime: 30,
    tips: ['Try brain training apps', 'Learn a language', 'Practice mindfulness'],
    dayRange: { start: 43, end: 66 }
  },

  // SCREEN TIME TASKS
  {
    category: 'screenTime',
    title: 'Track your screen time',
    description: 'Monitor how much time you spend on screens',
    difficulty: 'easy',
    estimatedTime: 5,
    tips: ['Use built-in screen time features', 'Be honest with yourself', 'Set daily limits'],
    dayRange: { start: 1, end: 7 }
  },
  {
    category: 'screenTime',
    title: 'Reduce by 30 minutes',
    description: 'Cut your daily screen time by 30 minutes',
    difficulty: 'easy',
    estimatedTime: 1,
    tips: ['Delete social media apps', 'Use grayscale mode', 'Set app limits'],
    dayRange: { start: 8, end: 14 }
  },
  {
    category: 'screenTime',
    title: 'No screens 1 hour before bed',
    description: 'Avoid all screens for 1 hour before sleep',
    difficulty: 'medium',
    estimatedTime: 1,
    tips: ['Use night mode', 'Read a book instead', 'Practice relaxation'],
    dayRange: { start: 15, end: 28 }
  },
  {
    category: 'screenTime',
    title: 'Implement screen-free zones',
    description: 'Create areas in your home where screens are not allowed',
    difficulty: 'medium',
    estimatedTime: 10,
    tips: ['Keep bedroom screen-free', 'Designate meal times', 'Use physical books'],
    dayRange: { start: 29, end: 42 }
  },
  {
    category: 'screenTime',
    title: 'Digital minimalism practice',
    description: 'Adopt a digital minimalism lifestyle',
    difficulty: 'hard',
    estimatedTime: 1,
    tips: ['Unsubscribe from unnecessary emails', 'Use focus modes', 'Practice intentional tech use'],
    dayRange: { start: 43, end: 66 }
  },

  // SHOWER TASKS
  {
    category: 'shower',
    title: 'Establish shower routine',
    description: 'Create a consistent daily shower schedule',
    difficulty: 'easy',
    estimatedTime: 15,
    tips: ['Shower at the same time daily', 'Use invigorating products', 'Practice good hygiene'],
    dayRange: { start: 1, end: 7 }
  },
  {
    category: 'shower',
    title: 'Try lukewarm water',
    description: 'Gradually reduce shower temperature',
    difficulty: 'easy',
    estimatedTime: 15,
    tips: ['Start with warm water', 'Gradually reduce temperature', 'Focus on breathing'],
    dayRange: { start: 8, end: 14 }
  },
  {
    category: 'shower',
    title: 'Cold shower introduction',
    description: 'End your shower with 30 seconds of cold water',
    difficulty: 'medium',
    estimatedTime: 15,
    tips: ['Start with just your feet', 'Focus on your breath', 'Gradually increase exposure'],
    dayRange: { start: 15, end: 28 }
  },
  {
    category: 'shower',
    title: 'Extend cold exposure',
    description: 'Increase cold shower duration to 2 minutes',
    difficulty: 'medium',
    estimatedTime: 15,
    tips: ['Use the Wim Hof method', 'Stay calm and focused', 'Build up gradually'],
    dayRange: { start: 29, end: 42 }
  },
  {
    category: 'shower',
    title: 'Master cold therapy',
    description: 'Practice advanced cold exposure techniques',
    difficulty: 'hard',
    estimatedTime: 20,
    tips: ['Combine with breathing exercises', 'Listen to your body', 'Track your progress'],
    dayRange: { start: 43, end: 66 }
  }
]; 