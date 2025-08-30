# Rise App - Local Clock System

## Overview

The Rise app now includes a sophisticated local clock system that automatically detects when midnight (12:00 AM) occurs and advances to the next day. This system ensures that users' progress automatically advances to the next day at midnight, providing a seamless daily progression experience.

## Features

### 🕐 **Real-Time Clock Display**
- Shows current local time with seconds precision
- Displays current date in a readable format
- Updates every second for accurate timekeeping

### 🌅 **Automatic Day Progression**
- Automatically detects when midnight occurs
- Advances to the next day without user intervention
- Resets daily tasks for the new day
- Shows celebration message when new day starts

### ⏰ **Midnight Countdown**
- Real-time countdown to next midnight
- Shows hours and minutes until next day
- Visual indicator when it's currently midnight

### 💾 **Persistent Day Tracking**
- Day progression is saved to AsyncStorage
- Survives app restarts and browser closures
- User-specific day tracking (each user has their own day count)
- Automatic loading when app starts

## Technical Implementation

### Redux Store Integration

The clock system is integrated into the Redux store through the `dayProgressionSlice`:

```typescript
// Store structure
{
  dayProgression: {
    currentDay: number,
    lastMidnightCheck: string,
    isNewDay: boolean,
    isLoading: boolean,
    error: string | null
  }
}
```

### Key Functions

#### `checkNewDay()`
- Automatically called every minute
- Compares current date with last midnight check
- Advances day counter when midnight is detected
- Updates AsyncStorage with new day information

#### `loadDayProgression()`
- Loads saved day progression from AsyncStorage
- Called when app initializes or user logs in
- Restores user's current day and last check time

#### `advanceToNextDay()`
- Manually advances to the next day
- Useful for testing or user-initiated day changes
- Updates both Redux state and AsyncStorage

### Clock Monitoring

The system uses a custom hook `useClock()` that:

1. **Starts monitoring** when component mounts
2. **Checks every minute** for midnight crossing
3. **Updates time display** every second
4. **Automatically cleans up** when component unmounts

```typescript
const {
  currentDay,           // Current day number
  isNewDay,            // Boolean indicating if it's a new day
  getCurrentTime,      // Function to get formatted current time
  getCurrentDate,      // Function to get formatted current date
  getFormattedTimeUntilMidnight, // Function to get countdown
  isCurrentlyMidnight, // Function to check if it's midnight
  checkForNewDay,      // Function to manually check for new day
  advanceToNextDay,    // Function to manually advance day
  resetDayProgression  // Function to reset day counter
} = useClock();
```

## User Experience

### Dashboard Integration

The clock system is prominently displayed on the Dashboard:

1. **Clock Section**: Shows current time, date, and countdown
2. **Day Counter**: Displays "Day X of your transformation"
3. **New Day Celebration**: Shows celebration when day advances
4. **Task Reset**: Automatically resets daily tasks for new day

### Visual Indicators

- **Clock Icon**: Time-related information
- **Countdown Timer**: Purple-themed countdown to midnight
- **Midnight Indicator**: Red-themed indicator when it's midnight
- **Celebration Animation**: Emoji and message when new day starts

## Data Persistence

### AsyncStorage Keys

Each user's day progression is stored with unique keys:

```typescript
`currentDay_${userEmail}`           // Current day number
`lastMidnightCheck_${userEmail}`    // Last midnight check timestamp
```

### Automatic Loading

Day progression data is automatically loaded:
- When the app starts
- When a user logs in
- When the Dashboard component mounts

### Error Handling

The system includes robust error handling:
- Graceful fallbacks if data loading fails
- Console logging for debugging
- User-friendly error messages

## Testing and Development

### ClockTest Component

A dedicated test component (`ClockTest.tsx`) is available for development:

- Shows all clock system values in real-time
- Provides buttons to test functionality
- Useful for debugging and development

### Manual Testing

You can test the system by:

1. **Changing system time** to near midnight
2. **Using the test buttons** in ClockTest component
3. **Checking console logs** for midnight detection
4. **Verifying AsyncStorage** persistence

## Configuration

### Update Intervals

- **Time Display**: Updates every second
- **Midnight Check**: Checks every minute
- **Data Persistence**: Saves immediately when changes occur

### Time Zones

The system uses the device's local time zone:
- Automatically adjusts to user's location
- No manual timezone configuration needed
- Respects daylight saving time changes

## Browser Compatibility

The clock system works on both:
- **Web (Netlify)**: Uses browser's Date API
- **Mobile (React Native)**: Uses device's system time
- **Cross-platform**: Consistent behavior across platforms

## Future Enhancements

Potential improvements for future versions:

1. **Customizable Day Start**: Allow users to set custom day start times
2. **Time Zone Support**: Manual timezone selection
3. **Day Skipping**: Allow users to skip days if needed
4. **Analytics**: Track day progression patterns
5. **Notifications**: Alert users when new day starts

## Troubleshooting

### Common Issues

1. **Day not advancing**: Check if user is logged in and data is loading
2. **Time not updating**: Verify component is mounted and clock is running
3. **Data not persisting**: Check AsyncStorage permissions and user authentication

### Debug Information

Enable console logging to see:
- Clock monitoring start/stop
- Midnight detection events
- Data loading/saving operations
- Error messages and fallbacks

## Conclusion

The local clock system provides a robust, user-friendly way to automatically track daily progression in the Rise app. It ensures that users always know what day they're on and that their progress advances seamlessly at midnight, creating a smooth and engaging user experience.
