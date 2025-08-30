import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { checkNewDay, loadDayProgression } from '../store/slices/dayProgressionSlice';

export const useClock = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentDay, isNewDay, lastMidnightCheck } = useSelector((state: RootState) => state.dayProgression);
  const user = useSelector((state: RootState) => state.user.user);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<Date>(new Date());

  // Function to check if it's a new day
  const checkForNewDay = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      await dispatch(checkNewDay()).unwrap();
    } catch (error) {
      console.error('Failed to check for new day:', error);
    }
  }, [dispatch, user?.email]);

  // Function to get time until next midnight
  const getTimeUntilMidnight = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    return timeUntilMidnight;
  }, []);

  // Function to format time until midnight
  const getFormattedTimeUntilMidnight = useCallback(() => {
    const timeUntilMidnight = getTimeUntilMidnight();
    const hours = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, [getTimeUntilMidnight]);

  // Function to get current local time
  const getCurrentTime = useCallback(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  // Function to get current local date
  const getCurrentDate = useCallback(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Function to check if it's currently midnight (within a 1-minute window)
  const isCurrentlyMidnight = useCallback(() => {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() < 1;
  }, []);

  // Start the clock monitoring
  const startClock = useCallback(() => {
    if (intervalRef.current) return; // Already running
    
    // Check immediately
    checkForNewDay();
    
    // Set up interval to check every minute
    intervalRef.current = setInterval(() => {
      const now = new Date();
      
      // Check if we've crossed midnight
      if (now.getDate() !== lastCheckRef.current.getDate() || 
          now.getMonth() !== lastCheckRef.current.getMonth() || 
          now.getFullYear() !== lastCheckRef.current.getFullYear()) {
        
        console.log('Midnight detected! Checking for new day...');
        checkForNewDay();
        lastCheckRef.current = now;
      }
    }, 60000); // Check every minute
    
    console.log('Clock monitoring started');
  }, [checkForNewDay]);

  // Stop the clock monitoring
  const stopClock = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Clock monitoring stopped');
    }
  }, []);

  // Initialize clock when component mounts
  useEffect(() => {
    if (user?.email) {
      // Load day progression data
      dispatch(loadDayProgression());
      
      // Start clock monitoring
      startClock();
      
      // Cleanup on unmount
      return () => {
        stopClock();
      };
    }
  }, [user?.email, dispatch, startClock, stopClock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopClock();
    };
  }, [stopClock]);

  return {
    currentDay,
    isNewDay,
    lastMidnightCheck,
    getCurrentTime,
    getCurrentDate,
    getTimeUntilMidnight,
    getFormattedTimeUntilMidnight,
    isCurrentlyMidnight,
    startClock,
    stopClock,
    checkForNewDay
  };
};
