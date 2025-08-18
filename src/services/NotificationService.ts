import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types';

export interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  data?: any;
  trigger: Notifications.NotificationTriggerInput;
}

export interface UserGoals {
  sleep: boolean;
  water: boolean;
  exercise: boolean;
  mind: boolean;
  screenTime: boolean;
  shower: boolean;
  wakeUpTime: string;
  bedTime: string;
  sleepGoal: string;
  hydrationGoal: number;
  exerciseGoal: number;
  mindGoal: number;
  screenTimeGoal: number;
  showerGoal: number;
}

export type HabitCategory = 'sleep' | 'water' | 'exercise' | 'mind' | 'screenTime' | 'shower';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      console.log('Requesting notification permissions...');
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Existing notification permission status:', existingStatus);
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions from user...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('User response to notification permission request:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get notification permissions! Status:', finalStatus);
        return false;
      }

      console.log('Notification permissions granted successfully');

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Project ID is optional in dev; guard against missing config
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        return token.data;
      } catch (e) {
        const token = await Notifications.getExpoPushTokenAsync({ projectId: undefined as any });
        return token.data;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  async scheduleNotification(schedule: NotificationSchedule): Promise<string> {
    try {
      console.log('Scheduling notification:', schedule.title);
      
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.error('Cannot schedule notification: permissions not granted');
        throw new Error('Notification permissions not granted');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: schedule.title,
          body: schedule.body,
          data: schedule.data,
          sound: Platform.OS === 'ios' ? 'default' : undefined,
          priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.HIGH : undefined,
        },
        trigger: schedule.trigger,
      });

      console.log('Notification scheduled successfully with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async scheduleGoalNotifications(goals: UserGoals): Promise<string[]> {
    try {
      const notificationIds: string[] = [];

      // Schedule wake-up notification
      if (goals.sleepGoal) {
        const wakeUpId = await this.scheduleWakeUpNotification(goals.sleepGoal);
        notificationIds.push(wakeUpId);
      }

      // Schedule hydration reminders
      if (goals.hydrationGoal && goals.hydrationGoal > 0) {
        const hydrationIds = await this.scheduleHydrationReminders(goals.hydrationGoal, goals.sleepGoal);
        notificationIds.push(...hydrationIds);
      }

      // Schedule exercise reminder
      if (goals.exerciseGoal && goals.exerciseGoal > 0) {
        const exerciseId = await this.scheduleExerciseReminder(goals.exerciseGoal, goals.sleepGoal);
        notificationIds.push(exerciseId);
      }

      // Schedule mind/meditation reminder
      if (goals.mindGoal && goals.mindGoal > 0) {
        const mindId = await this.scheduleMindReminder(goals.mindGoal, goals.sleepGoal);
        notificationIds.push(mindId);
      }

      // Schedule screen time limit reminder
      if (goals.screenTimeGoal && goals.screenTimeGoal > 0) {
        const screenTimeId = await this.scheduleScreenTimeReminder(goals.screenTimeGoal, goals.sleepGoal);
        notificationIds.push(screenTimeId);
      }

      // Schedule shower reminder
      if (goals.showerGoal && goals.showerGoal > 0) {
        const showerId = await this.scheduleShowerReminder(goals.showerGoal, goals.sleepGoal);
        notificationIds.push(showerId);
      }

      return notificationIds;
    } catch (error) {
      console.error('Error scheduling goal notifications:', error);
      throw error;
    }
  }

  async scheduleWakeUpNotification(wakeUpTime: string): Promise<string> {
    const [hours, minutes] = this.parseTimeString(wakeUpTime);
    const now = new Date();
    let targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return await this.scheduleNotification({
      id: 'wake-up',
      title: 'Rise',
      body: 'Time to start your day and conquer your goals!',
      data: { type: 'wake-up', goal: 'sleep' },
      trigger: {
        date: targetTime,
        repeats: true,
      },
    });
  }

  async scheduleHydrationReminders(glasses: number, wakeUpTime: string): Promise<string[]> {
    const notificationIds: string[] = [];
    const intervalMinutes = 60; // Every hour
    const totalNotifications = Math.ceil((24 * 60) / intervalMinutes); // Cover 24 hours

    for (let i = 0; i < totalNotifications; i++) {
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + i, 0, 0, 0); // Start from current hour

      // If the time has passed today, schedule for tomorrow
      if (reminderTime <= new Date()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const notificationId = await this.scheduleNotification({
        id: `hydration-${i}`,
        title: 'Rise',
        body: `Time to drink water! Goal: ${glasses} glasses today`,
        data: { type: 'hydration', goal: 'water', target: glasses },
        trigger: {
          date: reminderTime,
          repeats: true,
        },
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  }

  async scheduleExerciseReminder(exerciseMinutes: number, wakeUpTime: string): Promise<string> {
    const [hours, minutes] = this.parseTimeString(wakeUpTime);
    const now = new Date();
    let exerciseTime = new Date(now);
    
    // Schedule exercise reminder for middle of the day (12 PM)
    exerciseTime.setHours(12, 0, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (exerciseTime <= now) {
      exerciseTime.setDate(exerciseTime.getDate() + 1);
    }

    return await this.scheduleNotification({
      id: 'exercise',
      title: 'Rise',
      body: `Time to exercise! Your goal: ${exerciseMinutes} minutes today`,
      data: { type: 'exercise', goal: 'exercise', target: exerciseMinutes },
      trigger: { date: exerciseTime, repeats: true },
    });
  }

  async scheduleMindReminder(mindMinutes: number, wakeUpTime: string): Promise<string> {
    const [hours, minutes] = this.parseTimeString(wakeUpTime);
    const now = new Date();
    let mindTime = new Date(now);
    
    // Schedule mind/mindfulness reminder for middle of the day (2 PM)
    mindTime.setHours(14, 0, 0, 0);

    if (mindTime <= now) {
      mindTime.setDate(mindTime.getDate() + 1);
    }

    return await this.scheduleNotification({
      id: 'mind',
      title: 'Rise',
      body: `Time for mindfulness! Your goal: ${mindMinutes} minutes today`,
      data: { type: 'mind', goal: 'mind', target: mindMinutes },
      trigger: { date: mindTime, repeats: true },
    });
  }

  async scheduleScreenTimeReminder(hours: number, wakeUpTime: string): Promise<string> {
    const [wakeHours, wakeMinutes] = this.parseTimeString(wakeUpTime);
    const now = new Date();
    let screenTimeLimit = new Date(now);
    screenTimeLimit.setHours(wakeHours + 8, wakeMinutes, 0, 0); // 8 hours after wake-up

    // If the time has passed today, schedule for tomorrow
    if (screenTimeLimit <= now) {
      screenTimeLimit.setDate(screenTimeLimit.getDate() + 1);
    }

    return await this.scheduleNotification({
      id: 'screen-time',
      title: 'Rise',
      body: `Screen time alert! You're approaching your ${hours} hour limit`,
      data: { type: 'screenTime', goal: 'screenTime', target: hours },
      trigger: {
        date: screenTimeLimit,
        repeats: true,
      },
    });
  }

  async scheduleShowerReminder(showerMinutes: number, wakeUpTime: string): Promise<string> {
    const [hours, minutes] = this.parseTimeString(wakeUpTime);
    const now = new Date();
    let showerTime = new Date(now);
    showerTime.setHours(hours + 3, minutes, 0, 0); // 3 hours after wake-up

    if (showerTime <= now) {
      showerTime.setDate(showerTime.getDate() + 1);
    }

    return await this.scheduleNotification({
      id: 'shower',
      title: 'Rise',
      body: `Cold shower time! Your goal: ${showerMinutes} minutes today`,
      data: { type: 'shower', goal: 'shower', target: showerMinutes },
      trigger: { date: showerTime, repeats: true },
    });
  }

  private parseTimeString(timeString: string): [number, number] {
    // Handle both "6:00 AM" and "06:00" formats
    const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3]?.toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return [hours, minutes];
    }
    return [6, 0]; // Default to 6:00 AM
  }

  async scheduleSleepNotification(time: string, type: 'wakeUp' | 'bedTime'): Promise<string> {
    const [hours, minutes] = this.parseTimeString(time);
    const now = new Date();
    let targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const title = type === 'wakeUp' ? '🌅 Rise and Shine!' : '😴 Time for Bed';
    const body = type === 'wakeUp' 
      ? 'Time to start your day and conquer your goals!' 
      : 'Get your rest to wake up refreshed tomorrow';

    return await this.scheduleNotification({
      id: `sleep-${type}`,
      title,
      body,
      data: { type: 'sleep', goal: 'sleep', sleepType: type },
      trigger: {
        date: targetTime,
        repeats: true,
      },
    });
  }

  async scheduleWaterReminders(wakeUpTime: string): Promise<string[]> {
    const notificationIds: string[] = [];
    const intervalMinutes = 60; // Every hour
    const totalNotifications = Math.ceil((24 * 60) / intervalMinutes); // Cover 24 hours

    for (let i = 0; i < totalNotifications; i++) {
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + i, 0, 0, 0); // Start from current hour

      // If the time has passed today, schedule for tomorrow
      if (reminderTime <= new Date()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const notificationId = await this.scheduleNotification({
        id: `water-reminder-${i}`,
        title: 'Rise',
        body: 'Time to drink water! Stay hydrated throughout the day',
        data: { type: 'water', goal: 'water' },
        trigger: {
          date: reminderTime,
          repeats: true,
        },
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  }

  async scheduleExerciseReminders(wakeUpTime: string): Promise<string[]> {
    const notificationIds: string[] = [];
    const now = new Date();
    let exerciseTime = new Date(now);
    exerciseTime.setHours(12, 0, 0, 0); // Middle of the day

    // If the time has passed today, schedule for tomorrow
    if (exerciseTime <= now) {
      exerciseTime.setDate(exerciseTime.getDate() + 1);
    }

    const notificationId = await this.scheduleNotification({
      id: 'exercise',
      title: 'Rise',
      body: 'Time to exercise! Complete your daily exercise goal',
      data: { type: 'exercise', goal: 'exercise' },
      trigger: { date: exerciseTime, repeats: true },
    });

    notificationIds.push(notificationId);
    return notificationIds;
  }

  async scheduleMindReminders(wakeUpTime: string): Promise<string[]> {
    const notificationIds: string[] = [];
    const now = new Date();
    let mindTime = new Date(now);
    mindTime.setHours(14, 0, 0, 0); // Middle of the day

    // If the time has passed today, schedule for tomorrow
    if (mindTime <= now) {
      mindTime.setDate(mindTime.getDate() + 1);
    }

    const notificationId = await this.scheduleNotification({
      id: 'mind',
      title: 'Rise',
      body: 'Time for mindfulness! Complete your daily meditation goal',
      data: { type: 'mind', goal: 'mind' },
      trigger: { date: mindTime, repeats: true },
    });

    notificationIds.push(notificationId);
    return notificationIds;
  }

  async scheduleScreenTimeReminders(wakeUpTime: string): Promise<string[]> {
    const [hours, minutes] = this.parseTimeString(wakeUpTime);
    const now = new Date();
    let screenTimeLimit = new Date(now);
    screenTimeLimit.setHours(hours + 8, minutes, 0, 0); // 8 hours after wake-up

    // If the time has passed today, schedule for tomorrow
    if (screenTimeLimit <= now) {
      screenTimeLimit.setDate(screenTimeLimit.getDate() + 1);
    }

    return [await this.scheduleNotification({
      id: 'screen-time-reminder',
      title: '📱 Screen Time Alert',
      body: 'You\'re approaching your 2 hour screen time limit',
      data: { type: 'screen-time', goal: 'screenTime', target: 2 },
      trigger: {
        date: screenTimeLimit,
        repeats: true,
      },
    })];
  }

  async scheduleShowerReminders(wakeUpTime: string): Promise<string[]> {
    const [hours, minutes] = this.parseTimeString(wakeUpTime);
    const now = new Date();
    let showerTime = new Date(now);
    showerTime.setHours(hours + 3, minutes, 0, 0); // 3 hours after wake-up

    // If the time has passed today, schedule for tomorrow
    if (showerTime <= now) {
      showerTime.setDate(showerTime.getDate() + 1);
    }

    return [await this.scheduleNotification({
      id: 'shower-reminder',
      title: '🚿 Cold Shower Time!',
      body: 'Your goal: 2 minutes of cold shower today',
      data: { type: 'shower', goal: 'shower', target: 2 },
      trigger: {
        date: showerTime,
        repeats: true,
      },
    })];
  }

  async scheduleMotivationalNotifications(): Promise<string[]> {
    const now = new Date();
    const notificationIds: string[] = [];

    // Morning motivation (9 AM)
    const morningTime = new Date(now);
    morningTime.setHours(9, 0, 0, 0);
    if (morningTime <= now) morningTime.setDate(morningTime.getDate() + 1);

    const morningId = await this.scheduleNotification({
      id: 'morning-motivation',
      title: 'Rise',
      body: 'Good morning, warrior! Today is your day to rise above!',
      data: { type: 'motivation', time: 'morning' },
      trigger: {
        date: morningTime,
        repeats: true,
      },
    });

    // Afternoon motivation (2 PM)
    const afternoonTime = new Date(now);
    afternoonTime.setHours(14, 0, 0, 0);
    if (afternoonTime <= now) afternoonTime.setDate(afternoonTime.getDate() + 1);

    const afternoonId = await this.scheduleNotification({
      id: 'afternoon-motivation',
      title: 'Rise',
      body: 'Keep going! You\'re doing amazing! Don\'t stop now!',
      data: { type: 'motivation', time: 'afternoon' },
      trigger: {
        date: afternoonTime,
        repeats: true,
      },
    });

    // Evening motivation (7 PM)
    const eveningTime = new Date(now);
    eveningTime.setHours(19, 0, 0, 0);
    if (eveningTime <= now) eveningTime.setDate(eveningTime.getDate() + 1);

    const eveningId = await this.scheduleNotification({
      id: 'evening-motivation',
      title: 'Rise',
      body: 'Evening reflection! Take a moment to reflect on your progress today',
      data: { type: 'motivation', time: 'evening' },
      trigger: {
        date: eveningTime,
        repeats: true,
      },
    });

    notificationIds.push(morningId, afternoonId, eveningId);

    return notificationIds;
  }

  async scheduleWeeklyProgressNotification(): Promise<string> {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(20, 0, 0, 0); // 8 PM on Sunday

    if (nextSunday <= now) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }

    return await this.scheduleNotification({
      id: 'weekly-progress',
      title: 'Rise',
      body: 'Weekly progress report! Time to review your progress and set new goals!',
      data: { type: 'weekly-progress' },
      trigger: {
        date: nextSunday,
        repeats: true,
      },
    });
  }

  private getCategoryEmoji(category: HabitCategory): string {
    const emojis = {
      sleep: '🌙',
      water: '💧',
      exercise: '💪',
      mind: '🧘‍♀️',
      screenTime: '📱',
      shower: '🚿',
    };
    return emojis[category] || '🎯';
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async setupUserNotifications(goals: UserGoals, tasks: Task[]): Promise<void> {
    try {
      await this.cancelAllNotifications();
      await this.scheduleGoalNotifications(goals);
      await this.scheduleMotivationalNotifications();
      await this.scheduleWeeklyProgressNotification();

      // Add a periodic task ticker every 2 hours as a safety net to keep engagement
      const now = new Date();
      const tickerStart = new Date(now);
      tickerStart.setMinutes(now.getMinutes() + 5);
      await this.scheduleNotification({
        id: 'task-ticker',
        title: 'Rise',
        body: 'Quick check-in: knock out your next task!',
        data: { type: 'ticker' },
        trigger: { repeats: true, seconds: 7200, type: 'date' }, // every 2 hours
      });

      console.log('User notifications setup completed successfully');
    } catch (error) {
      console.error('Error setting up user notifications:', error);
      throw error;
    }
  }

  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      throw error;
    }
  }

  async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'wake-up') {
      // Handle wake-up notification response
      console.log('User responded to wake-up notification');
    } else if (data?.type === 'hydration') {
      // Handle hydration notification response
      console.log('User responded to hydration notification');
    } else if (data?.type === 'exercise') {
      // Handle exercise notification response
      console.log('User responded to exercise notification');
    }
    // Add more notification type handlers as needed
  }
}

export default NotificationService; 