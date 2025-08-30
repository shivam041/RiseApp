import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useClock } from '../hooks/useClock';

const ClockTest: React.FC = () => {
  const {
    currentDay,
    isNewDay,
    getCurrentTime,
    getCurrentDate,
    getFormattedTimeUntilMidnight,
    isCurrentlyMidnight,
    checkForNewDay,
    advanceToNextDay,
    resetDayProgression
  } = useClock();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clock Test Component</Text>
      
      <View style={styles.infoSection}>
        <Text style={styles.label}>Current Day:</Text>
        <Text style={styles.value}>{currentDay}</Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.label}>Current Time:</Text>
        <Text style={styles.value}>{getCurrentTime()}</Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.label}>Current Date:</Text>
        <Text style={styles.value}>{getCurrentDate()}</Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.label}>Time Until Midnight:</Text>
        <Text style={styles.value}>{getFormattedTimeUntilMidnight()}</Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.label}>Is New Day:</Text>
        <Text style={styles.value}>{isNewDay ? 'Yes' : 'No'}</Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.label}>Is Currently Midnight:</Text>
        <Text style={styles.value}>{isCurrentlyMidnight() ? 'Yes' : 'No'}</Text>
      </View>
      
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.button} onPress={checkForNewDay}>
          <Text style={styles.buttonText}>Check for New Day</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={advanceToNextDay}>
          <Text style={styles.buttonText}>Advance to Next Day</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={resetDayProgression}>
          <Text style={styles.buttonText}>Reset Day Progression</Text>
        </TouchableOpacity>
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
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonSection: {
    marginTop: 30,
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
});

export default ClockTest;
