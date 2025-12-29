import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function TimeClockScreen() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('Main Office');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getElapsedTime = () => {
    if (!clockInTime) return '0:00:00';
    const elapsed = Math.floor((currentTime - clockInTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClockInOut = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      setClockInTime(null);
    } else {
      setIsClockedIn(true);
      setClockInTime(new Date());
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.clockContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          {isClockedIn && clockInTime && (
            <>
              <Text style={styles.clockInText}>
                Clocked in at {formatTime(clockInTime)}
              </Text>
              <Text style={styles.durationText}>Duration: {getElapsedTime()}</Text>
            </>
          )}
        </View>

        {!isClockedIn && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Location</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={location}
                onValueChange={setLocation}
                style={styles.picker}
              >
                <Picker.Item label="Main Office" value="Main Office" />
                <Picker.Item label="Warehouse" value="Warehouse" />
                <Picker.Item label="Remote" value="Remote" />
              </Picker>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.clockButton, isClockedIn && styles.clockOutButton]}
          onPress={handleClockInOut}
        >
          <Ionicons
            name={isClockedIn ? 'time' : 'time-outline'}
            size={24}
            color="#fff"
          />
          <Text style={styles.clockButtonText}>
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Text>
        </TouchableOpacity>

        {!isClockedIn && (
          <View style={styles.recentShiftsContainer}>
            <Text style={styles.sectionTitle}>Recent Shifts</Text>
            <View style={styles.shiftCard}>
              <View>
                <Text style={styles.shiftDate}>Today</Text>
                <Text style={styles.shiftTime}>8:00 AM - 5:00 PM</Text>
                <Text style={styles.shiftLocation}>Main Office</Text>
              </View>
              <Text style={styles.shiftDuration}>9.0 hrs</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  clockContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timeText: {
    fontSize: 64,
    fontWeight: '300',
    color: '#000',
    fontFamily: 'System',
  },
  clockInText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  durationText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#007AFF',
    marginTop: 8,
  },
  locationContainer: {
    marginBottom: 30,
  },
  locationLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  clockButton: {
    backgroundColor: '#34C759',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  clockOutButton: {
    backgroundColor: '#FF3B30',
  },
  clockButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  recentShiftsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  shiftCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  shiftTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  shiftLocation: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  shiftDuration: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
});

