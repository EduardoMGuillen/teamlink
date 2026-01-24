import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows } from '../utils/theme';
import { useAppState } from '../context/AppStateContext';
import { motivationService } from '../services/motivationService';
import { Picker } from '@react-native-picker/picker';

export default function MotivationSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useAppState();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await motivationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await motivationService.savePreferences(updated);
  };

  const toggleTimeSlot = (slot) => {
    const currentTimes = preferences.preferredTimes || [];
    const newTimes = currentTimes.includes(slot)
      ? currentTimes.filter(t => t !== slot)
      : [...currentTimes, slot];
    updatePreference('preferredTimes', newTimes);
  };

  if (loading || !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const timeSlotLabels = {
    morning: 'Morning (8 AM - 11 AM)',
    afternoon: 'Afternoon (1 PM - 4 PM)',
    evening: 'Evening (5 PM - 8 PM)',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Motivation</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Spark Info */}
        <View style={styles.infoCard}>
          <View style={styles.sparkIconContainer}>
            <Image 
              source={require('../../spark.png')} 
              style={styles.sparkImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.infoTitle}>Meet Spark</Text>
          <Text style={styles.infoText}>
            Spark provides daily motivation focused on productivity, teamwork, and personal growth.
            Customize your experience below.
          </Text>
        </View>

        {/* Enable/Disable */}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="bulb" size={24} color={colors.accent} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Enable Daily Motivation</Text>
                <Text style={styles.settingDescription}>
                  Show motivational quotes on your home screen
                </Text>
              </View>
              <Switch
                value={preferences.enabled}
                onValueChange={(value) => updatePreference('enabled', value)}
                trackColor={{ false: '#E5E5EA', true: `${colors.accent}80` }}
                thumbColor={preferences.enabled ? colors.accent : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Show Spark Icon */}
        {preferences.enabled && (
          <View style={styles.section}>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <Ionicons name="eye" size={24} color={colors.primary} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Show Spark Icon</Text>
                  <Text style={styles.settingDescription}>
                    Display Spark's icon next to daily quotes
                  </Text>
                </View>
                <Switch
                  value={preferences.showSpark}
                  onValueChange={(value) => updatePreference('showSpark', value)}
                  trackColor={{ false: '#E5E5EA', true: `${colors.primary}80` }}
                  thumbColor={preferences.showSpark ? colors.primary : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
        )}

        {/* Notifications */}
        {preferences.enabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.settingCard}>
                <View style={styles.settingRow}>
                  <Ionicons name="notifications" size={24} color={colors.primary} />
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Enable Notifications</Text>
                    <Text style={styles.settingDescription}>
                      Receive motivational quotes via push notifications
                    </Text>
                  </View>
                  <Switch
                    value={preferences.notificationsEnabled}
                    onValueChange={(value) => updatePreference('notificationsEnabled', value)}
                    trackColor={{ false: '#E5E5EA', true: `${colors.primary}80` }}
                    thumbColor={preferences.notificationsEnabled ? colors.primary : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>

            {preferences.notificationsEnabled && (
              <>
                {/* Notification Count */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Frequency</Text>
                  <View style={styles.settingCard}>
                    <View style={styles.settingRow}>
                      <Ionicons name="time" size={24} color={colors.primary} />
                      <View style={styles.settingContent}>
                        <Text style={styles.settingLabel}>Notifications per day</Text>
                        <Text style={styles.settingDescription}>
                          Choose how many motivational quotes you want to receive daily
                        </Text>
                      </View>
                    </View>
                    <View style={styles.frequencyButtons}>
                      {[1, 2, 3].map((count) => (
                        <TouchableOpacity
                          key={count}
                          style={[
                            styles.frequencyButton,
                            preferences.notificationCount === count && styles.frequencyButtonActive,
                          ]}
                          onPress={() => updatePreference('notificationCount', count)}
                        >
                          <Text
                            style={[
                              styles.frequencyButtonText,
                              preferences.notificationCount === count && styles.frequencyButtonTextActive,
                            ]}
                          >
                            {count}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Preferred Times */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Preferred Times</Text>
                  {Object.keys(timeSlotLabels).map((slot) => (
                    <View key={slot} style={styles.settingCard}>
                      <View style={styles.settingRow}>
                        <Ionicons
                          name={
                            slot === 'morning'
                              ? 'sunny'
                              : slot === 'afternoon'
                              ? 'partly-sunny'
                              : 'moon'
                          }
                          size={24}
                          color={colors.primary}
                        />
                        <View style={styles.settingContent}>
                          <Text style={styles.settingLabel}>{timeSlotLabels[slot]}</Text>
                        </View>
                        <Switch
                          value={preferences.preferredTimes?.includes(slot) || false}
                          onValueChange={() => toggleTimeSlot(slot)}
                          trackColor={{ false: '#E5E5EA', true: `${colors.primary}80` }}
                          thumbColor={
                            preferences.preferredTimes?.includes(slot)
                              ? colors.primary
                              : '#f4f3f4'
                          }
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 44,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: radii.lg,
    alignItems: 'center',
    ...shadows.soft,
  },
  sparkIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  sparkImage: {
    width: 56,
    height: 56,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  settingCard: {
    backgroundColor: colors.surface,
    padding: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  pickerContainer: {
    marginTop: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  frequencyButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  frequencyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  frequencyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
  },
  frequencyButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
