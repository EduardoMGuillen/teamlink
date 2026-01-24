import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { shiftsService } from '../services/shiftsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOCK_STATE_KEY = '@teamlink_clock_state';

export default function TimeClockScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAppState();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('Main Office');
  const [shifts, setShifts] = useState([]);
  const [activeShiftId, setActiveShiftId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadClockState();
      loadShifts();
      checkActiveShift();
    }
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [currentUser]);

  const loadClockState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(CLOCK_STATE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);
        setIsClockedIn(state.isClockedIn);
        if (state.clockInTime) {
          setClockInTime(new Date(state.clockInTime));
        }
        if (state.location) {
          setLocation(state.location);
        }
      }
    } catch (error) {
      console.error('Error loading clock state:', error);
    }
  };

  const saveClockState = async () => {
    try {
      await AsyncStorage.setItem(
        CLOCK_STATE_KEY,
        JSON.stringify({
          isClockedIn,
          clockInTime: clockInTime?.toISOString(),
          location,
        })
      );
    } catch (error) {
      console.error('Error saving clock state:', error);
    }
  };

  const loadShifts = async () => {
    if (!currentUser?.id) return;
    
    try {
      const loadedShifts = await shiftsService.getShifts(currentUser.id);
      setShifts(loadedShifts);
    } catch (error) {
      console.error('Error loading shifts:', error);
    }
  };

  const checkActiveShift = async () => {
    if (!currentUser?.id) return;
    
    try {
      const activeShift = await shiftsService.getActiveShift(currentUser.id);
      if (activeShift) {
        setIsClockedIn(true);
        setClockInTime(activeShift.clockIn);
        setActiveShiftId(activeShift.id);
        // Cargar location desde el estado guardado
        const savedState = await AsyncStorage.getItem(CLOCK_STATE_KEY);
        if (savedState) {
          const state = JSON.parse(savedState);
          if (state.location) {
            setLocation(state.location);
          }
        }
      }
    } catch (error) {
      console.error('Error checking active shift:', error);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('today');
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday');
    }
    return date.toLocaleDateString();
  };

  const getElapsedTime = () => {
    if (!clockInTime) return '0:00:00';
    const elapsed = Math.floor((currentTime - clockInTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return '0.0';
    const elapsed = Math.floor((clockOut - clockIn) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const decimalHours = hours + minutes / 60;
    return decimalHours.toFixed(1);
  };

  const [weeklyHours, setWeeklyHours] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      loadWeeklyHours();
    }
  }, [currentUser, shifts]);

  const loadWeeklyHours = async () => {
    if (!currentUser?.id) return;
    
    try {
      const hours = await shiftsService.getWeeklyHours(currentUser.id);
      setWeeklyHours(hours);
    } catch (error) {
      console.error('Error loading weekly hours:', error);
    }
  };

  const handleClockInOut = async () => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      if (isClockedIn) {
        // Clock Out
        if (!activeShiftId) {
          Alert.alert('Error', 'No active shift found');
          setIsLoading(false);
          return;
        }

        const result = await shiftsService.clockOut(activeShiftId);
        if (result.success) {
          setIsClockedIn(false);
          setClockInTime(null);
          setActiveShiftId(null);
          await loadShifts();
          await saveClockState();
        } else {
          Alert.alert('Error', result.error || 'Failed to clock out');
        }
      } else {
        // Clock In
        const result = await shiftsService.clockIn(currentUser.id, location);
        if (result.success) {
          setIsClockedIn(true);
          setClockInTime(result.shift.clockIn);
          setActiveShiftId(result.shift.id);
          await saveClockState();
        } else {
          Alert.alert('Error', result.error || 'Failed to clock in');
        }
      }
    } catch (error) {
      console.error('Error clocking in/out:', error);
      Alert.alert('Error', 'Failed to clock in/out');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationLabel = (loc) => {
    switch (loc) {
      case 'Main Office':
        return t('mainOffice');
      case 'Warehouse':
        return t('warehouse');
      case 'Remote':
        return t('remote');
      default:
        return loc;
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
                {t('clockedInAt')} {formatTime(clockInTime)}
              </Text>
              <Text style={styles.durationText}>
                {t('duration')}: {getElapsedTime()}
              </Text>
            </>
          )}
        </View>

        {!isClockedIn && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>{t('location')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={location}
                onValueChange={(value) => {
                  setLocation(value);
                  saveClockState();
                }}
                style={styles.picker}
              >
                <Picker.Item label={t('mainOffice')} value="Main Office" />
                <Picker.Item label={t('warehouse')} value="Warehouse" />
                <Picker.Item label={t('remote')} value="Remote" />
              </Picker>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.clockButton, isClockedIn && styles.clockOutButton, isLoading && styles.clockButtonDisabled]}
          onPress={handleClockInOut}
          disabled={isLoading}
        >
          <Ionicons
            name={isClockedIn ? 'time' : 'time-outline'}
            size={24}
            color="#fff"
          />
          <Text style={styles.clockButtonText}>
            {isClockedIn ? t('clockOut') : t('clockIn')}
          </Text>
        </TouchableOpacity>

        {/* Weekly Summary */}
        {shifts.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>{t('weeklySummary') || 'Weekly Summary'}</Text>
            <View style={styles.summaryCard}>
              <Ionicons name="time" size={24} color="#007AFF" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>{t('totalHours') || 'Total Hours'}</Text>
                <Text style={styles.summaryValue}>{weeklyHours.toFixed(1)} {t('hours') || 'hrs'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Shifts */}
        {shifts.length > 0 ? (
          <View style={styles.recentShiftsContainer}>
            <Text style={styles.sectionTitle}>{t('recentShifts')}</Text>
            {shifts
              .filter((shift) => shift.clockOut)
              .slice(0, 5)
              .map((shift) => (
                <View key={shift.id} style={styles.shiftCard}>
                  <View style={styles.shiftInfo}>
                    <Text style={styles.shiftDate}>{formatDate(shift.clockIn)}</Text>
                    <Text style={styles.shiftTime}>
                      {formatTime(shift.clockIn)} - {formatTime(shift.clockOut)}
                    </Text>
                    <Text style={styles.shiftLocation}>
                      {getLocationLabel(shift.location)}
                    </Text>
                  </View>
                  <Text style={styles.shiftDuration}>
                    {calculateDuration(shift.clockIn, shift.clockOut)} hrs
                  </Text>
                </View>
              ))}
          </View>
        ) : (
          <View style={styles.emptyShifts}>
            <Ionicons name="time-outline" size={50} color="#8E8E93" />
            <Text style={styles.emptyShiftsText}>
              {t('noShiftsFound') || 'No shifts found'}
            </Text>
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
  clockButtonDisabled: {
    opacity: 0.6,
  },
  summaryContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  recentShiftsContainer: {
    marginTop: 20,
  },
  emptyShifts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginTop: 20,
  },
  emptyShiftsText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
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
    marginBottom: 8,
  },
  shiftInfo: {
    flex: 1,
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
