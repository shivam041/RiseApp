import OneSignal from 'react-onesignal';

export interface NotificationSchedule {
  id: string;
  title: string;
  message: string;
  time: string; // HH:MM format
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  type: 'reminder' | 'motivation' | 'custom';
}

export interface DailyQuote {
  id: string;
  quote: string;
  author: string;
  category: string;
}

export class OneSignalService {
  private static instance: OneSignalService;
  private isInitialized: boolean = false;
  private userId: string | null = null;

  private constructor() {}

  public static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  /**
   * Initialize OneSignal
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('OneSignal already initialized');
      return;
    }

    try {
      console.log('Initializing OneSignal...');
      
      // Initialize OneSignal
      await OneSignal.init({
        appId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || 'your-onesignal-app-id',
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true,
        },
        welcomeNotification: {
          title: 'Welcome to Rise! 🌅',
          message: 'You\'ll now receive daily reminders and motivational quotes.',
        },
      });

      // Request notification permission
      const permission = await OneSignal.Notifications.requestPermission();
      console.log('Notification permission:', permission);

      if (permission) {
        // Get user ID
        const id = await OneSignal.User.getOneSignalId();
        if (id) {
          this.userId = id;
          console.log('OneSignal User ID:', id);
        }

        // Set up notification event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('OneSignal initialized successfully');
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('OneSignal initialization failed:', error);
      throw error;
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupEventListeners(): void {
    // When notification is received while app is open
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('Notification clicked:', event);
      // Handle notification click - could navigate to specific screen
    });

    // When notification is received
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      console.log('Notification received:', event);
      // Customize notification display
      event.preventDefault();
      event.notification.display();
    });
  }

  /**
   * Send immediate notification
   */
  async sendNotification(title: string, message: string, data?: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('OneSignal not initialized');
    }

    try {
      await OneSignal.Notifications.create({
        title,
        message,
        data,
        url: window.location.origin, // Navigate to app when clicked
      });
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Schedule daily reminder notifications
   */
  async scheduleDailyReminders(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('OneSignal not initialized');
    }

    try {
      // Morning motivation (8:00 AM)
      await this.scheduleNotification({
        id: 'morning-motivation',
        title: 'Good Morning! 🌅',
        message: 'Time to rise and conquer your goals!',
        time: '08:00',
        days: [0, 1, 2, 3, 4, 5, 6], // Every day
        enabled: true,
        type: 'motivation',
      });

      // Mid-morning reminder (10:00 AM)
      await this.scheduleNotification({
        id: 'mid-morning-reminder',
        title: 'Morning Check-in ☀️',
        message: 'How are your morning goals coming along?',
        time: '10:00',
        days: [0, 1, 2, 3, 4, 5, 6],
        enabled: true,
        type: 'reminder',
      });

      // Lunch reminder (12:00 PM)
      await this.scheduleNotification({
        id: 'lunch-reminder',
        title: 'Lunch Break Reminder 🍽️',
        message: 'Don\'t forget to hydrate and take a break!',
        time: '12:00',
        days: [0, 1, 2, 3, 4, 5, 6],
        enabled: true,
        type: 'reminder',
      });

      // Afternoon motivation (3:00 PM)
      await this.scheduleNotification({
        id: 'afternoon-motivation',
        title: 'Afternoon Boost! 💪',
        message: 'Keep pushing forward - you\'re doing great!',
        time: '15:00',
        days: [0, 1, 2, 3, 4, 5, 6],
        enabled: true,
        type: 'motivation',
      });

      // Evening check-in (6:00 PM)
      await this.scheduleNotification({
        id: 'evening-checkin',
        title: 'Evening Reflection 🌙',
        message: 'How did you do today? Time to review your progress.',
        time: '18:00',
        days: [0, 1, 2, 3, 4, 5, 6],
        enabled: true,
        type: 'reminder',
      });

      // Bedtime reminder (9:00 PM)
      await this.scheduleNotification({
        id: 'bedtime-reminder',
        title: 'Bedtime Prep 😴',
        message: 'Time to wind down and prepare for tomorrow.',
        time: '21:00',
        days: [0, 1, 2, 3, 4, 5, 6],
        enabled: true,
        type: 'reminder',
      });

      console.log('Daily reminders scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule daily reminders:', error);
      throw error;
    }
  }

  /**
   * Schedule a recurring notification
   */
  private async scheduleNotification(schedule: NotificationSchedule): Promise<void> {
    try {
      // For web apps, we'll use the browser's notification scheduling
      // OneSignal handles the scheduling on their servers
      await OneSignal.Notifications.create({
        title: schedule.title,
        message: schedule.message,
        data: {
          type: schedule.type,
          scheduleId: schedule.id,
        },
        url: window.location.origin,
        // Schedule for next occurrence
        ...this.calculateNextOccurrence(schedule.time, schedule.days),
      });
    } catch (error) {
      console.error(`Failed to schedule notification ${schedule.id}:`, error);
    }
  }

  /**
   * Calculate next occurrence of a scheduled time
   */
  private calculateNextOccurrence(time: string, days: number[]): any {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    // Find next valid day
    while (!days.includes(targetTime.getDay())) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return {
      scheduledAt: targetTime.toISOString(),
    };
  }

  /**
   * Send motivational quote notification
   */
  async sendMotivationalQuote(quote: DailyQuote): Promise<void> {
    await this.sendNotification(
      'Daily Motivation 💫',
      `"${quote.quote}" - ${quote.author}`,
      { type: 'motivation', quoteId: quote.id }
    );
  }

  /**
   * Send task reminder notification
   */
  async sendTaskReminder(taskName: string, category: string): Promise<void> {
    await this.sendNotification(
      'Task Reminder ⏰',
      `Don't forget: ${taskName}`,
      { type: 'reminder', taskName, category }
    );
  }

  /**
   * Send goal completion celebration
   */
  async sendGoalCelebration(goalName: string): Promise<void> {
    await this.sendNotification(
      'Goal Achieved! 🎉',
      `Congratulations! You've completed: ${goalName}`,
      { type: 'celebration', goalName }
    );
  }

  /**
   * Send water reminder
   */
  async sendWaterReminder(): Promise<void> {
    await this.sendNotification(
      'Hydration Reminder 💧',
      'Time to drink some water! Stay hydrated.',
      { type: 'reminder', category: 'water' }
    );
  }

  /**
   * Send exercise reminder
   */
  async sendExerciseReminder(): Promise<void> {
    await this.sendNotification(
      'Exercise Reminder 🏃‍♂️',
      'Time to get moving! Even 10 minutes counts.',
      { type: 'reminder', category: 'exercise' }
    );
  }

  /**
   * Send sleep reminder
   */
  async sendSleepReminder(): Promise<void> {
    await this.sendNotification(
      'Sleep Reminder 😴',
      'Time to prepare for bed. Good sleep = better tomorrow!',
      { type: 'reminder', category: 'sleep' }
    );
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    reminders: boolean;
    motivation: boolean;
    water: boolean;
    exercise: boolean;
    sleep: boolean;
  }): Promise<void> {
    try {
      // Store preferences in OneSignal tags
      await OneSignal.User.addTag('reminders_enabled', preferences.reminders.toString());
      await OneSignal.User.addTag('motivation_enabled', preferences.motivation.toString());
      await OneSignal.User.addTag('water_reminders', preferences.water.toString());
      await OneSignal.User.addTag('exercise_reminders', preferences.exercise.toString());
      await OneSignal.User.addTag('sleep_reminders', preferences.sleep.toString());

      console.log('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<any> {
    try {
      const tags = await OneSignal.User.getTags();
      return {
        reminders: tags.reminders_enabled === 'true',
        motivation: tags.motivation_enabled === 'true',
        water: tags.water_reminders === 'true',
        exercise: tags.exercise_reminders === 'true',
        sleep: tags.sleep_reminders === 'true',
      };
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return {
        reminders: true,
        motivation: true,
        water: true,
        exercise: true,
        sleep: true,
      };
    }
  }

  /**
   * Test notification
   */
  async sendTestNotification(): Promise<void> {
    await this.sendNotification(
      'Test Notification 🔔',
      'This is a test notification from Rise!',
      { type: 'test' }
    );
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}
