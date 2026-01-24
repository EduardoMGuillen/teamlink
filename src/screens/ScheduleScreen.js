import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { calendarScheduleService } from '../services/calendarScheduleService';
import { colors, radii, shadows } from '../utils/theme';

const toLocalDateString = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAppState();
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [recurringSchedules, setRecurringSchedules] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [activities, setActivities] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('recurring'); // 'recurring' | 'event'
  const [editingItem, setEditingItem] = useState(null);

  // Recurring schedule fields
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('17:00');
  const [scheduleLocation, setScheduleLocation] = useState('');
  const [schedulePosition, setSchedulePosition] = useState('');
  const [selectedDays, setSelectedDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(new Date());
  const [tempEndTime, setTempEndTime] = useState(new Date());

  // Event fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartTime, setEventStartTime] = useState(new Date());
  const [eventEndTime, setEventEndTime] = useState(new Date());
  const [eventLocation, setEventLocation] = useState('');
  const [showEventStartPicker, setShowEventStartPicker] = useState(false);
  const [showEventStartTimePicker, setShowEventStartTimePicker] = useState(false);
  const [showEventEndPicker, setShowEventEndPicker] = useState(false);
  const [showEventEndTimePicker, setShowEventEndTimePicker] = useState(false);
  const [tempEventStartTime, setTempEventStartTime] = useState(new Date());
  const [tempEventEndTime, setTempEventEndTime] = useState(new Date());

  useEffect(() => {
    if (currentUser?.id) {
      loadData();
    }
  }, [currentUser, selectedDate]);

  const loadData = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const startDate = parseLocalDateString(selectedDate);
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = parseLocalDateString(selectedDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setHours(23, 59, 59, 999);

      const [recurring, events, dayActivities] = await Promise.all([
        calendarScheduleService.getRecurringSchedules(currentUser.id),
        calendarScheduleService.getCalendarEvents(currentUser.id, startDate, endDate),
        calendarScheduleService.getActivitiesForDate(currentUser.id, `${selectedDate}T00:00:00`),
      ]);

      setRecurringSchedules(recurring);
      setCalendarEvents(events);
      setActivities(dayActivities);
    } catch (error) {
      console.error('Error loading planner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeString = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseTimeToDate = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const toLocalDateTimeInput = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const parseLocalDateString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const webInputStyle = {
    width: '100%',
    padding: 12,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    fontSize: 14,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    marginBottom: 12,
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const openAddRecurring = () => {
    setModalType('recurring');
    setEditingItem(null);
    setScheduleTitle('');
    setScheduleDescription('');
    setScheduleStartTime('09:00');
    setScheduleEndTime('17:00');
    setScheduleLocation('');
    setSchedulePosition('');
    setSelectedDays({
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    });
    setShowModal(true);
  };

  const openAddEvent = () => {
    setModalType('event');
    setEditingItem(null);
    const baseDate = parseLocalDateString(selectedDate);
    const start = new Date(baseDate);
    start.setHours(9, 0, 0, 0);
    const end = new Date(baseDate);
    end.setHours(10, 0, 0, 0);
    setEventTitle('');
    setEventDescription('');
    setEventStartTime(start);
    setEventEndTime(end);
    setEventLocation('');
    setShowModal(true);
  };

  const openEditRecurring = (schedule) => {
    setModalType('recurring');
    setEditingItem(schedule);
    setScheduleTitle(schedule.title);
    setScheduleDescription(schedule.description || '');
    setScheduleStartTime(schedule.startTime);
    setScheduleEndTime(schedule.endTime);
    setScheduleLocation(schedule.location || '');
    setSchedulePosition(schedule.position || '');
    setSelectedDays(schedule.days);
    setShowModal(true);
  };

  const openEditEvent = (event) => {
    setModalType('event');
    setEditingItem(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventStartTime(new Date(event.startTime));
    setEventEndTime(new Date(event.endTime));
    setEventLocation(event.location || '');
    setShowModal(true);
  };

  const handleSaveRecurring = async () => {
    if (!scheduleTitle.trim() || !scheduleStartTime || !scheduleEndTime) {
      Alert.alert('Error', t('pleaseFillAllFields'));
      return;
    }
    const hasDaySelected = Object.values(selectedDays).some((v) => v);
    if (!hasDaySelected) {
      Alert.alert('Error', t('selectDays'));
      return;
    }
    if (!currentUser?.id) {
      Alert.alert('Error', t('userNotAuthenticated'));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        userId: currentUser.id,
        title: scheduleTitle.trim(),
        description: scheduleDescription.trim() || null,
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        location: scheduleLocation.trim() || null,
        position: schedulePosition.trim() || null,
        days: selectedDays,
      };

      let result;
      if (editingItem) {
        result = await calendarScheduleService.updateRecurringSchedule(editingItem.id, payload);
      } else {
        result = await calendarScheduleService.createRecurringSchedule(payload);
      }

      if (!result.success) {
        Alert.alert('Error', result.error || t('failedToSaveSchedule'));
      } else {
        setShowModal(false);
        await loadData();
      }
    } catch (error) {
      console.error('Error saving recurring schedule:', error);
      Alert.alert('Error', t('failedToSaveSchedule'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', t('pleaseFillAllFields'));
      return;
    }
    if (eventStartTime >= eventEndTime) {
      Alert.alert('Error', t('endTimeAfterStartTime'));
      return;
    }
    if (!currentUser?.id) {
      Alert.alert('Error', t('userNotAuthenticated'));
      return;
    }

    const conflicts = await calendarScheduleService.checkScheduleConflict(
      currentUser.id,
      eventStartTime,
      eventEndTime
    );
    if (conflicts.length > 0) {
      Alert.alert(t('scheduleConflict'), t('conflictMessage'));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        userId: currentUser.id,
        title: eventTitle.trim(),
        description: eventDescription.trim() || null,
        startTime: eventStartTime,
        endTime: eventEndTime,
        location: eventLocation.trim() || null,
      };

      let result;
      if (editingItem) {
        result = await calendarScheduleService.updateCalendarEvent(editingItem.id, payload);
      } else {
        result = await calendarScheduleService.createCalendarEvent(payload);
      }

      if (!result.success) {
        Alert.alert('Error', result.error || t('failedToSaveEvent'));
      } else {
        setShowModal(false);
        await loadData();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', t('failedToSaveEvent'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id, type) => {
    Alert.alert(t('confirmDelete'), '', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          let result;
          if (type === 'recurring') {
            result = await calendarScheduleService.deleteRecurringSchedule(id);
          } else {
            result = await calendarScheduleService.deleteCalendarEvent(id);
          }
          if (!result.success) {
            Alert.alert('Error', result.error || t('failedToDelete'));
          } else {
            await loadData();
          }
          setIsLoading(false);
        },
      },
    ]);
  };

  const openActivityEdit = (activity) => {
    if (activity.type === 'recurring') {
      const schedule = recurringSchedules.find((s) => `recurring-${s.id}` === activity.id);
      if (schedule) openEditRecurring(schedule);
    } else {
      const event = calendarEvents.find((e) => `event-${e.id}` === activity.id);
      if (event) openEditEvent(event);
    }
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: colors.primary,
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('calendarSchedule')}</Text>
          <Text style={styles.subtitle}>
            {t('today')}: {selectedDate}
          </Text>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              todayTextColor: colors.primary,
              selectedDayBackgroundColor: colors.primary,
              arrowColor: colors.primary,
            }}
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={openAddRecurring}>
            <Ionicons name="repeat" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>{t('addRecurringSchedule')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={openAddEvent}>
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>{t('addEvent')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('activitiesFor')} {selectedDate}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={activity.type === 'recurring' ? 'repeat' : 'calendar'}
                    size={16}
                    color={activity.type === 'recurring' ? colors.primary : colors.accent}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>
                    {typeof activity.startTime === 'string'
                      ? `${activity.startTime} - ${activity.endTime}`
                      : `${activity.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${activity.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </Text>
                  {activity.location && (
                    <Text style={styles.activityLocation}>{activity.location}</Text>
                  )}
                </View>
                <View style={styles.activityActions}>
                  <TouchableOpacity onPress={() => openActivityEdit(activity)}>
                    <Ionicons name="pencil" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(activity.id.replace(`${activity.type}-`, ''), activity.type)}
                  >
                    <Ionicons name="trash" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('noActivitiesToday')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Recurring Schedule Modal */}
      <Modal visible={showModal && modalType === 'recurring'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem ? t('editRecurringSchedule') : t('addRecurringSchedule')}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalScrollContent}
              >
              <TextInput
                style={styles.input}
                placeholder={t('title')}
                value={scheduleTitle}
                onChangeText={setScheduleTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('description')}
                value={scheduleDescription}
                onChangeText={setScheduleDescription}
                multiline
              />

              <Text style={styles.label}>{t('selectDays')}</Text>
              <View style={styles.daysRow}>
                {[
                  { key: 'monday', label: t('mon') },
                  { key: 'tuesday', label: t('tue') },
                  { key: 'wednesday', label: t('wed') },
                  { key: 'thursday', label: t('thu') },
                  { key: 'friday', label: t('fri') },
                  { key: 'saturday', label: t('sat') },
                  { key: 'sunday', label: t('sun') },
                ].map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayDot,
                      selectedDays[day.key] && styles.dayDotActive,
                    ]}
                    onPress={() => toggleDay(day.key)}
                  >
                    <Text
                      style={[
                        styles.dayDotText,
                        selectedDays[day.key] && styles.dayDotTextActive,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t('startTime')}</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={scheduleStartTime}
                  onChange={(e) => setScheduleStartTime(e.target.value)}
                  style={webInputStyle}
                />
              ) : (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    setTempStartTime(parseTimeToDate(scheduleStartTime));
                    setShowStartTimePicker(true);
                  }}
                >
                  <Text style={styles.timeButtonText}>{scheduleStartTime}</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.label}>{t('endTime')}</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={scheduleEndTime}
                  onChange={(e) => setScheduleEndTime(e.target.value)}
                  style={webInputStyle}
                />
              ) : (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    setTempEndTime(parseTimeToDate(scheduleEndTime));
                    setShowEndTimePicker(true);
                  }}
                >
                  <Text style={styles.timeButtonText}>{scheduleEndTime}</Text>
                </TouchableOpacity>
              )}

              {Platform.OS === 'ios' && showStartTimePicker && (
                <View style={styles.inlinePicker}>
                  <DateTimePicker
                    value={tempStartTime}
                    mode="time"
                    display="spinner"
                    textColor={colors.text}
                    themeVariant="light"
                    onChange={(event, date) => date && setTempStartTime(date)}
                  />
                  <View style={styles.inlinePickerActions}>
                    <TouchableOpacity
                      style={styles.inlineCancel}
                      onPress={() => setShowStartTimePicker(false)}
                    >
                      <Text style={styles.cancelText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inlineSave}
                      onPress={() => {
                        setScheduleStartTime(formatTimeString(tempStartTime));
                        setShowStartTimePicker(false);
                      }}
                    >
                      <Text style={styles.saveText}>{t('save')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {Platform.OS === 'ios' && showEndTimePicker && (
                <View style={styles.inlinePicker}>
                  <DateTimePicker
                    value={tempEndTime}
                    mode="time"
                    display="spinner"
                    textColor={colors.text}
                    themeVariant="light"
                    onChange={(event, date) => date && setTempEndTime(date)}
                  />
                  <View style={styles.inlinePickerActions}>
                    <TouchableOpacity
                      style={styles.inlineCancel}
                      onPress={() => setShowEndTimePicker(false)}
                    >
                      <Text style={styles.cancelText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inlineSave}
                      onPress={() => {
                        setScheduleEndTime(formatTimeString(tempEndTime));
                        setShowEndTimePicker(false);
                      }}
                    >
                      <Text style={styles.saveText}>{t('save')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={styles.label}>{t('location')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('location')}
                value={scheduleLocation}
                onChangeText={setScheduleLocation}
              />
              <Text style={styles.label}>{t('position')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('position')}
                value={schedulePosition}
                onChangeText={setSchedulePosition}
              />
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveRecurring}>
                  <Text style={styles.saveText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Event Modal */}
      <Modal visible={showModal && modalType === 'event'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem ? t('editEvent') : t('addEvent')}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalScrollContent}
              >
              <TextInput
                style={styles.input}
                placeholder={t('title')}
                value={eventTitle}
                onChangeText={setEventTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('description')}
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
              />

              <Text style={styles.label}>{t('startTime')}</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="datetime-local"
                  value={toLocalDateTimeInput(eventStartTime)}
                  onChange={(e) => setEventStartTime(new Date(e.target.value))}
                  style={webInputStyle}
                />
              ) : (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    setTempEventStartTime(new Date(eventStartTime));
                    setShowEventStartPicker(true);
                  }}
                >
                  <Text style={styles.timeButtonText}>
                    {eventStartTime.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.label}>{t('endTime')}</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="datetime-local"
                  value={toLocalDateTimeInput(eventEndTime)}
                  onChange={(e) => setEventEndTime(new Date(e.target.value))}
                  style={webInputStyle}
                />
              ) : (
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    setTempEventEndTime(new Date(eventEndTime));
                    setShowEventEndPicker(true);
                  }}
                >
                  <Text style={styles.timeButtonText}>
                    {eventEndTime.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              )}

              {Platform.OS === 'ios' && showEventStartPicker && (
                <View style={styles.inlinePicker}>
                  <DateTimePicker
                    value={tempEventStartTime}
                    mode="datetime"
                    display="spinner"
                    textColor={colors.text}
                    themeVariant="light"
                    onChange={(event, date) => date && setTempEventStartTime(date)}
                  />
                  <View style={styles.inlinePickerActions}>
                    <TouchableOpacity
                      style={styles.inlineCancel}
                      onPress={() => setShowEventStartPicker(false)}
                    >
                      <Text style={styles.cancelText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inlineSave}
                      onPress={() => {
                        setEventStartTime(new Date(tempEventStartTime));
                        setShowEventStartPicker(false);
                      }}
                    >
                      <Text style={styles.saveText}>{t('save')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {Platform.OS === 'ios' && showEventEndPicker && (
                <View style={styles.inlinePicker}>
                  <DateTimePicker
                    value={tempEventEndTime}
                    mode="datetime"
                    display="spinner"
                    textColor={colors.text}
                    themeVariant="light"
                    onChange={(event, date) => date && setTempEventEndTime(date)}
                  />
                  <View style={styles.inlinePickerActions}>
                    <TouchableOpacity
                      style={styles.inlineCancel}
                      onPress={() => setShowEventEndPicker(false)}
                    >
                      <Text style={styles.cancelText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inlineSave}
                      onPress={() => {
                        setEventEndTime(new Date(tempEventEndTime));
                        setShowEventEndPicker(false);
                      }}
                    >
                      <Text style={styles.saveText}>{t('save')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={styles.label}>{t('location')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('location')}
                value={eventLocation}
                onChangeText={setEventLocation}
              />
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
                  <Text style={styles.saveText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Android pickers */}
      {Platform.OS === 'android' && showStartTimePicker && (
        <DateTimePicker
          value={parseTimeToDate(scheduleStartTime)}
          mode="time"
          display="default"
          onChange={(event, date) => {
            setShowStartTimePicker(false);
            if (date) setScheduleStartTime(formatTimeString(date));
          }}
        />
      )}
      {Platform.OS === 'android' && showEndTimePicker && (
        <DateTimePicker
          value={parseTimeToDate(scheduleEndTime)}
          mode="time"
          display="default"
          onChange={(event, date) => {
            setShowEndTimePicker(false);
            if (date) setScheduleEndTime(formatTimeString(date));
          }}
        />
      )}
      {Platform.OS === 'android' && showEventStartPicker && (
        <DateTimePicker
          value={eventStartTime}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEventStartPicker(false);
            if (date) {
              const newDate = new Date(eventStartTime);
              newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setEventStartTime(newDate);
              setShowEventStartTimePicker(true);
            }
          }}
        />
      )}
      {Platform.OS === 'android' && showEventStartTimePicker && (
        <DateTimePicker
          value={eventStartTime}
          mode="time"
          display="default"
          onChange={(event, date) => {
            setShowEventStartTimePicker(false);
            if (date) {
              const newDate = new Date(eventStartTime);
              newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
              setEventStartTime(newDate);
            }
          }}
        />
      )}
      {Platform.OS === 'android' && showEventEndPicker && (
        <DateTimePicker
          value={eventEndTime}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEventEndPicker(false);
            if (date) {
              const newDate = new Date(eventEndTime);
              newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setEventEndTime(newDate);
              setShowEventEndTimePicker(true);
            }
          }}
        />
      )}
      {Platform.OS === 'android' && showEventEndTimePicker && (
        <DateTimePicker
          value={eventEndTime}
          mode="time"
          display="default"
          onChange={(event, date) => {
            setShowEventEndTimePicker(false);
            if (date) {
              const newDate = new Date(eventEndTime);
              newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
              setEventEndTime(newDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 16,
    ...shadows.soft,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    ...shadows.soft,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    ...shadows.soft,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 10,
    ...shadows.soft,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  activityTime: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  activityLocation: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  activityActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.soft,
  },
  emptyText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 20,
    maxHeight: '90%',
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dayDot: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  dayDotActive: {
    backgroundColor: colors.primary,
  },
  dayDotText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dayDotTextActive: {
    color: '#fff',
  },
  timeButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
  },
  timeButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  inlinePicker: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 12,
    ...shadows.soft,
  },
  inlinePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inlineCancel: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  inlineSave: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
