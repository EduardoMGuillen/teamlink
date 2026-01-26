import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { shiftsService } from '../services/shiftsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { radii, shadows } from '../utils/theme';

const CLOCK_STATE_KEY = '@teamlink_clock_state';

export default function TimeClockScreen() {
  const { t } = useTranslation();
  const { currentUser, theme } = useAppState();
  const { colors } = theme;
  const isWeb = Platform.OS === 'web';
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('Main Office');
  const [shifts, setShifts] = useState([]);
  const [activeShiftId, setActiveShiftId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

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
        setClockInTime(new Date(activeShift.clockIn));
        setActiveShiftId(activeShift.id);
        // Cargar location desde el turno activo o del estado guardado
        if (activeShift.location) {
          setLocation(activeShift.location);
        } else {
          const savedState = await AsyncStorage.getItem(CLOCK_STATE_KEY);
          if (savedState) {
            const state = JSON.parse(savedState);
            if (state.location) {
              setLocation(state.location);
            }
          }
        }
      } else {
        // No hay turno activo, limpiar estado
        setIsClockedIn(false);
        setClockInTime(null);
        setActiveShiftId(null);
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

  // Obtener ubicación GPS
  const getCurrentLocation = async () => {
    try {
      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for clock in. You can still clock in without location.',
          [{ text: 'OK' }]
        );
        return { latitude: null, longitude: null };
      }

      setIsGettingLocation(true);
      
      // Obtener ubicación
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get location. Clocking in without location.');
      return { latitude: null, longitude: null };
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Capturar foto
  const capturePhoto = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required for photo. You can skip the photo.',
          [{ text: 'OK' }]
        );
        return null;
      }

      setIsCapturingPhoto(true);

      // Capturar foto
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      // En web, la URI puede ser diferente
      const photoAsset = result.assets[0];
      const photoUri = photoAsset.uri;
      const mimeType = photoAsset.mimeType || photoAsset.type || null;
      
      // Subir foto a Supabase Storage (pasar el tipo MIME si está disponible)
      const photoUrl = await shiftsService.uploadPhoto(photoUri, currentUser.id, mimeType);
      
      return photoUrl;
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Could not capture photo. Clocking in without photo.');
      return null;
    } finally {
      setIsCapturingPhoto(false);
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
          // Limpiar AsyncStorage
          await AsyncStorage.removeItem(CLOCK_STATE_KEY);
          await loadShifts();
          await loadWeeklyHours();
        } else {
          Alert.alert('Error', result.error || 'Failed to clock out');
        }
      } else {
        // Clock In - Verificar que no haya un turno activo primero
        const activeShift = await shiftsService.getActiveShift(currentUser.id);
        if (activeShift) {
          Alert.alert('Error', 'You already have an active shift. Please clock out first.');
          setIsLoading(false);
          return;
        }

        // Obtener ubicación
        const { latitude, longitude } = await getCurrentLocation();
        
        // Capturar foto (opcional - solo en móvil)
        let photoUrl = null;
        if (Platform.OS !== 'web') {
          // En móvil, intentar capturar foto (el usuario puede cancelar)
          photoUrl = await capturePhoto();
        }
        
        // Hacer clock in con los datos obtenidos
        const result = await shiftsService.clockIn(
          currentUser.id,
          location,
          latitude,
          longitude,
          photoUrl
        );
        
        if (result.success) {
          setIsClockedIn(true);
          setClockInTime(result.shift.clockIn);
          setActiveShiftId(result.shift.id);
          await saveClockState();
          await loadShifts();
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

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
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
          style={[styles.clockButton, isClockedIn && styles.clockOutButton, (isLoading || isGettingLocation || isCapturingPhoto) && styles.clockButtonDisabled]}
          onPress={handleClockInOut}
          disabled={isLoading || isGettingLocation || isCapturingPhoto}
        >
          {(isLoading || isGettingLocation || isCapturingPhoto) ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={isClockedIn ? 'time' : 'time-outline'}
                size={24}
                color="#fff"
              />
              <Text style={styles.clockButtonText}>
                {isGettingLocation ? t('gettingLocation') || 'Getting location...' : 
                 isCapturingPhoto ? t('capturingPhoto') || 'Capturing photo...' :
                 isClockedIn ? t('clockOut') : t('clockIn')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Weekly Summary */}
        {shifts.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>{t('weeklySummary') || 'Weekly Summary'}</Text>
            <View style={styles.summaryCard}>
              <Ionicons name="time" size={24} color={colors.primary} />
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
                  {shift.photoUrl && (
                    <Image 
                      source={{ uri: shift.photoUrl }} 
                      style={styles.shiftPhoto}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.shiftInfo}>
                    <Text style={styles.shiftDate}>{formatDate(shift.clockIn)}</Text>
                    <Text style={styles.shiftTime}>
                      {formatTime(shift.clockIn)} - {formatTime(shift.clockOut)}
                    </Text>
                    <View style={styles.shiftLocationRow}>
                      <Ionicons name="location" size={14} color={colors.textMuted} />
                      <Text style={styles.shiftLocation}>
                        {getLocationLabel(shift.location)}
                      </Text>
                    </View>
                    {shift.latitude && shift.longitude && (
                      <Text style={styles.shiftCoordinates}>
                        📍 {shift.latitude.toFixed(4)}, {shift.longitude.toFixed(4)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.shiftDuration}>
                    {calculateDuration(shift.clockIn, shift.clockOut)} hrs
                  </Text>
                </View>
              ))}
          </View>
        ) : (
          <View style={styles.emptyShifts}>
            <Ionicons name="time-outline" size={50} color={colors.textMuted} />
            <Text style={styles.emptyShiftsText}>
              {t('noShiftsFound') || 'No shifts found'}
            </Text>
          </View>
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  scrollContentWeb: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
    padding: Platform.OS === 'web' ? 20 : 16,
    justifyContent: 'center',
  },
  contentWeb: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  clockContainer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 40 : 32,
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
  },
  timeText: {
    fontSize: Platform.OS === 'web' ? 64 : 56,
    fontWeight: '300',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
    letterSpacing: 2,
  },
  clockInText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
  },
  durationText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 8,
  },
  locationContainer: {
    marginBottom: Platform.OS === 'web' ? 30 : 24,
  },
  locationLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  clockButton: {
    backgroundColor: colors.secondary,
    borderRadius: radii.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
    ...shadows.soft,
  },
  clockOutButton: {
    backgroundColor: colors.danger,
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
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
    color: colors.textMuted,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  shiftCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: Platform.OS === 'web' ? 16 : 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    gap: 12,
  },
  shiftPhoto: {
    width: Platform.OS === 'web' ? 60 : 56,
    height: Platform.OS === 'web' ? 60 : 56,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  shiftLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  shiftLocation: {
    fontSize: 12,
    color: colors.textMuted,
  },
  shiftCoordinates: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  shiftDuration: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
});
