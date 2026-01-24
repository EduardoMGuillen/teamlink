import React, { useState, useEffect } from 'react';
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
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppState } from '../context/AppStateContext';
import { calendarScheduleService } from '../services/calendarScheduleService';
import { useTranslation } from '../utils/useTranslation';

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAppState();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('recurring'); // 'recurring' or 'events'
  const [recurringSchedules, setRecurringSchedules] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('recurring'); // 'recurring' or 'event'
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields for recurring schedule
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('17:00');
  const [scheduleLocation, setScheduleLocation] = useState('Main Office');
  const [schedulePosition, setSchedulePosition] = useState('Operations');
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

  // Form fields for calendar event
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartTime, setEventStartTime] = useState(new Date());
  const [eventEndTime, setEventEndTime] = useState(new Date());
  const [eventLocation, setEventLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [showEventStartPicker, setShowEventStartPicker] = useState(false);
  const [showEventEndPicker, setShowEventEndPicker] = useState(false);
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadData();
    }
  }, [currentUser, selectedDate]);

  const loadData = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      // Load recurring schedules
      const recurring = await calendarScheduleService.getRecurringSchedules(currentUser.id);
      setRecurringSchedules(recurring);
      
      // Load calendar events for a 3-month range (1 month before and after selected date)
      const startDate = new Date(selectedDate);
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setHours(23, 59, 59, 999);
      
      const events = await calendarScheduleService.getCalendarEvents(
        currentUser.id,
        startDate,
        endDate
      );
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    if (type === 'recurring') {
      setScheduleTitle('');
      setScheduleDescription('');
      setScheduleStartTime('09:00');
      setScheduleEndTime('17:00');
      setScheduleLocation('Main Office');
      setSchedulePosition('Operations');
      setSelectedDays({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      });
    } else {
      const now = new Date();
      setEventTitle('');
      setEventDescription('');
      setEventStartTime(now);
      setEventEndTime(new Date(now.getTime() + 60 * 60 * 1000)); // +1 hour
      setEventLocation('');
      setIsAllDay(false);
    }
    setShowModal(true);
  };

  const openEditModal = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'recurring') {
      setScheduleTitle(item.title);
      setScheduleDescription(item.description || '');
      setScheduleStartTime(item.startTime);
      setScheduleEndTime(item.endTime);
      setScheduleLocation(item.location || 'Main Office');
      setSchedulePosition(item.position || 'Operations');
      setSelectedDays(item.days);
    } else {
      setEventTitle(item.title);
      setEventDescription(item.description || '');
      setEventStartTime(item.startTime);
      setEventEndTime(item.endTime);
      setEventLocation(item.location || '');
      setIsAllDay(item.isAllDay || false);
    }
    setShowModal(true);
  };

  const handleSaveRecurringSchedule = async () => {
    if (!scheduleTitle.trim() || !scheduleStartTime || !scheduleEndTime) {
      Alert.alert('Error', t('pleaseFillAllFields') || 'Please fill all required fields');
      return;
    }

    const hasDaySelected = Object.values(selectedDays).some(selected => selected);
    if (!hasDaySelected) {
      Alert.alert('Error', t('selectDays') || 'Please select at least one day');
      return;
    }

    if (!currentUser?.id) {
      Alert.alert('Error', t('userNotAuthenticated') || 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const scheduleData = {
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
        result = await calendarScheduleService.updateRecurringSchedule(editingItem.id, scheduleData);
      } else {
        result = await calendarScheduleService.createRecurringSchedule(scheduleData);
      }

      if (result.success) {
        await loadData();
        setShowModal(false);
      } else {
        Alert.alert('Error', result.error || t('failedToSaveSchedule') || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Error saving recurring schedule:', error);
      Alert.alert('Error', t('failedToSaveSchedule') || 'Failed to save schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', t('pleaseFillAllFields') || 'Please fill all required fields');
      return;
    }

    if (eventStartTime >= eventEndTime) {
      Alert.alert('Error', t('endTimeAfterStartTime') || 'End time must be after start time');
      return;
    }

    if (!currentUser?.id) {
      Alert.alert('Error', t('userNotAuthenticated') || 'User not authenticated');
      return;
    }

    // Verificar conflictos con horarios recurrentes
    const conflicts = await calendarScheduleService.checkScheduleConflict(
      currentUser.id,
      eventStartTime,
      eventEndTime
    );

    if (conflicts && conflicts.length > 0) {
      Alert.alert(
        t('scheduleConflict') || 'Schedule Conflict',
        t('conflictMessage') || 'This event conflicts with your recurring schedule. Please choose a different time.',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const eventData = {
        userId: currentUser.id,
        title: eventTitle.trim(),
        description: eventDescription.trim() || null,
        startTime: eventStartTime,
        endTime: eventEndTime,
        location: eventLocation.trim() || null,
        isAllDay: isAllDay,
      };

      let result;
      if (editingItem) {
        result = await calendarScheduleService.updateCalendarEvent(editingItem.id, eventData);
      } else {
        result = await calendarScheduleService.createCalendarEvent(eventData);
      }

      if (result.success) {
        await loadData();
        setShowModal(false);
      } else {
        Alert.alert('Error', result.error || t('failedToSaveEvent') || 'Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', t('failedToSaveEvent') || 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    Alert.alert(
      t('delete') || 'Delete',
      t('confirmDelete') || 'Are you sure you want to delete this?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('delete') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              let result;
              if (type === 'recurring') {
                result = await calendarScheduleService.deleteRecurringSchedule(id);
              } else {
                result = await calendarScheduleService.deleteCalendarEvent(id);
              }

              if (result.success) {
                await loadData();
              } else {
                Alert.alert('Error', result.error || t('failedToDelete') || 'Failed to delete');
              }
            } catch (error) {
              console.error('Error deleting:', error);
              Alert.alert('Error', t('failedToDelete') || 'Failed to delete');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Obtener actividades para la fecha seleccionada
  const getActivitiesForDate = async (date) => {
    if (!currentUser?.id) return [];
    try {
      return await calendarScheduleService.getActivitiesForDate(currentUser.id, date);
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  };

  // Marcar fechas en el calendario
  const markedDates = {};
  const dateObj = new Date(selectedDate);
  const dayOfWeek = dateObj.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];

  // Marcar fechas con horarios recurrentes
  recurringSchedules.forEach(schedule => {
    if (schedule.days[dayName]) {
      const dateString = selectedDate;
      if (!markedDates[dateString]) {
        markedDates[dateString] = { marked: true, dotColor: '#007AFF' };
      }
    }
  });

  // Marcar fechas con eventos
  calendarEvents.forEach(event => {
    const eventDate = event.startTime.toISOString().split('T')[0];
    if (!markedDates[eventDate]) {
      markedDates[eventDate] = { marked: true, dotColor: '#FF9500' };
    } else {
      markedDates[eventDate].dots = [
        { color: '#007AFF', selectedDotColor: '#007AFF' },
        { color: '#FF9500', selectedDotColor: '#FF9500' },
      ];
    }
  });

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#007AFF',
  };

  // Obtener actividades del día seleccionado
  const [dayActivities, setDayActivities] = useState([]);
  useEffect(() => {
    if (currentUser?.id && selectedDate) {
      getActivitiesForDate(selectedDate).then(setDayActivities);
    }
  }, [selectedDate, recurringSchedules, calendarEvents, currentUser]);

  const formatTime = (time) => {
    if (typeof time === 'string') {
      return time;
    }
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (date) => {
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const dayLabels = [
    { key: 'monday', short: t('mon'), full: t('monday') },
    { key: 'tuesday', short: t('tue'), full: t('tuesday') },
    { key: 'wednesday', short: t('wed'), full: t('wednesday') },
    { key: 'thursday', short: t('thu'), full: t('thursday') },
    { key: 'friday', short: t('fri'), full: t('friday') },
    { key: 'saturday', short: t('sat'), full: t('saturday') },
    { key: 'sunday', short: t('sun'), full: t('sunday') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendarSchedule')}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonRecurring]}
            onPress={() => openAddModal('recurring')}
          >
            <Ionicons name="repeat" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonEvent]}
            onPress={() => openAddModal('event')}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recurring' && styles.tabActive]}
          onPress={() => setActiveTab('recurring')}
        >
          <Text style={[styles.tabText, activeTab === 'recurring' && styles.tabTextActive]}>
            {t('recurringSchedule')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            {t('calendarEvent')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: '#007AFF',
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
            }}
          />
        </View>

        {/* Activities for selected date */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>
            {t('activitiesFor') || 'Activities for'} {new Date(selectedDate).toLocaleDateString()}
          </Text>
          {dayActivities.length > 0 ? (
            dayActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={[
                    styles.activityTypeBadge,
                    { backgroundColor: activity.type === 'recurring' ? '#007AFF20' : '#FF950020' }
                  ]}>
                    <Text style={[
                      styles.activityTypeText,
                      { color: activity.type === 'recurring' ? '#007AFF' : '#FF9500' }
                    ]}>
                      {activity.type === 'recurring' ? t('recurring') : t('event')}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                  </Text>
                </View>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                {activity.description && (
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                )}
                {activity.location && (
                  <View style={styles.activityLocation}>
                    <Ionicons name="location" size={14} color="#8E8E93" />
                    <Text style={styles.activityLocationText}>{activity.location}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={50} color="#8E8E93" />
              <Text style={styles.emptyText}>{t('noActivitiesToday')}</Text>
            </View>
          )}
        </View>

        {/* Recurring Schedules List */}
        {activeTab === 'recurring' && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>{t('recurringSchedule')}</Text>
            {recurringSchedules.length > 0 ? (
              recurringSchedules.map((schedule) => (
                <View key={schedule.id} style={styles.scheduleCard}>
                  <View style={styles.scheduleHeader}>
                    <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                    <View style={styles.scheduleActions}>
                      <TouchableOpacity onPress={() => openEditModal(schedule, 'recurring')}>
                        <Ionicons name="create-outline" size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(schedule.id, 'recurring')}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.scheduleTime}>
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </Text>
                  {schedule.description && (
                    <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                  )}
                  <View style={styles.daysContainer}>
                    {dayLabels.map((day) => (
                      <View
                        key={day.key}
                        style={[
                          styles.dayChip,
                          schedule.days[day.key] && styles.dayChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayChipText,
                            schedule.days[day.key] && styles.dayChipTextActive,
                          ]}
                        >
                          {day.short}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {schedule.location && (
                    <View style={styles.scheduleLocation}>
                      <Ionicons name="location" size={14} color="#8E8E93" />
                      <Text style={styles.scheduleLocationText}>{schedule.location}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="repeat-outline" size={50} color="#8E8E93" />
                <Text style={styles.emptyText}>{t('noRecurringSchedules')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Calendar Events List */}
        {activeTab === 'events' && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>{t('calendarEvent')}</Text>
            {calendarEvents.length > 0 ? (
              calendarEvents.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventActions}>
                      <TouchableOpacity onPress={() => openEditModal(event, 'event')}>
                        <Ionicons name="create-outline" size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(event.id, 'event')}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.eventDateTime}>
                    {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
                  </Text>
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                  {event.location && (
                    <View style={styles.eventLocation}>
                      <Ionicons name="location" size={14} color="#8E8E93" />
                      <Text style={styles.eventLocationText}>{event.location}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={50} color="#8E8E93" />
                <Text style={styles.emptyText}>{t('noEvents')}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal for Recurring Schedule */}
      <Modal
        visible={showModal && modalType === 'recurring'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled={Platform.OS !== 'web'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? t('editRecurringSchedule') : t('addRecurringSchedule')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>{t('title')} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t('title')}
                value={scheduleTitle}
                onChangeText={setScheduleTitle}
                returnKeyType="next"
              />

              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('description')}
                value={scheduleDescription}
                onChangeText={setScheduleDescription}
                multiline
                numberOfLines={3}
                returnKeyType="done"
              />

              <Text style={styles.label}>{t('selectDays')} *</Text>
              <View style={styles.daysSelector}>
                {dayLabels.map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      selectedDays[day.key] && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDay(day.key)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays[day.key] && styles.dayButtonTextActive,
                      ]}
                    >
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t('startTime')} *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={scheduleStartTime}
                  onChange={(e) => setScheduleStartTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 16,
                    border: '1px solid #E5E5EA',
                    borderRadius: 12,
                    fontSize: 16,
                    backgroundColor: '#F2F2F7',
                    fontFamily: 'inherit',
                    color: '#1a1a1a',
                    marginBottom: 16,
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={styles.timeButtonText}>{scheduleStartTime}</Text>
                    <Ionicons name="time-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  {showStartTimePicker && (
                    <DateTimePicker
                      value={new Date(`2000-01-01T${scheduleStartTime}`)}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedTime) => {
                        setShowStartTimePicker(Platform.OS === 'ios');
                        if (selectedTime) {
                          const hours = selectedTime.getHours().toString().padStart(2, '0');
                          const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                          setScheduleStartTime(`${hours}:${minutes}`);
                        }
                      }}
                    />
                  )}
                </>
              )}

              <Text style={styles.label}>{t('endTime')} *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={scheduleEndTime}
                  onChange={(e) => setScheduleEndTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 16,
                    border: '1px solid #E5E5EA',
                    borderRadius: 12,
                    fontSize: 16,
                    backgroundColor: '#F2F2F7',
                    fontFamily: 'inherit',
                    color: '#1a1a1a',
                    marginBottom: 16,
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.timeButtonText}>{scheduleEndTime}</Text>
                    <Ionicons name="time-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  {showEndTimePicker && (
                    <DateTimePicker
                      value={new Date(`2000-01-01T${scheduleEndTime}`)}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedTime) => {
                        setShowEndTimePicker(Platform.OS === 'ios');
                        if (selectedTime) {
                          const hours = selectedTime.getHours().toString().padStart(2, '0');
                          const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                          setScheduleEndTime(`${hours}:${minutes}`);
                        }
                      }}
                    />
                  )}
                </>
              )}

              <Text style={styles.label}>{t('location')}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={scheduleLocation}
                  onValueChange={setScheduleLocation}
                  style={styles.picker}
                >
                  <Picker.Item label="Main Office" value="Main Office" />
                  <Picker.Item label="Warehouse" value="Warehouse" />
                  <Picker.Item label="Remote" value="Remote" />
                </Picker>
              </View>

              <Text style={styles.label}>{t('position')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('position')}
                value={schedulePosition}
                onChangeText={setSchedulePosition}
                returnKeyType="done"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSaveRecurringSchedule}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal for Calendar Event */}
      <Modal
        visible={showModal && modalType === 'event'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled={Platform.OS !== 'web'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? t('editEvent') : t('addEvent')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>{t('title')} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t('title')}
                value={eventTitle}
                onChangeText={setEventTitle}
                returnKeyType="next"
              />

              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('description')}
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
                numberOfLines={3}
                returnKeyType="done"
              />

              <Text style={styles.label}>{t('startTime')} *</Text>
              {Platform.OS === 'web' ? (
                <>
                  <input
                    type="date"
                    value={eventStartTime.toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        newDate.setHours(eventStartTime.getHours(), eventStartTime.getMinutes());
                        setEventStartTime(newDate);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 16,
                      border: '1px solid #E5E5EA',
                      borderRadius: 12,
                      fontSize: 16,
                      backgroundColor: '#F2F2F7',
                      fontFamily: 'inherit',
                      color: '#1a1a1a',
                      marginBottom: 12,
                    }}
                  />
                  <input
                    type="time"
                    value={eventStartTime.toTimeString().slice(0, 5)}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(eventStartTime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setEventStartTime(newDate);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 16,
                      border: '1px solid #E5E5EA',
                      borderRadius: 12,
                      fontSize: 16,
                      backgroundColor: '#F2F2F7',
                      fontFamily: 'inherit',
                      color: '#1a1a1a',
                      marginBottom: 16,
                    }}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowEventStartPicker(true)}
                  >
                    <Text style={styles.dateTimeButtonText}>
                      {formatDateTime(eventStartTime)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  {showEventStartPicker && (
                    <DateTimePicker
                      value={eventStartTime}
                      mode="datetime"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowEventStartPicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setEventStartTime(selectedDate);
                        }
                      }}
                    />
                  )}
                </>
              )}

              <Text style={styles.label}>{t('endTime')} *</Text>
              {Platform.OS === 'web' ? (
                <>
                  <input
                    type="date"
                    value={eventEndTime.toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        newDate.setHours(eventEndTime.getHours(), eventEndTime.getMinutes());
                        setEventEndTime(newDate);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 16,
                      border: '1px solid #E5E5EA',
                      borderRadius: 12,
                      fontSize: 16,
                      backgroundColor: '#F2F2F7',
                      fontFamily: 'inherit',
                      color: '#1a1a1a',
                      marginBottom: 12,
                    }}
                  />
                  <input
                    type="time"
                    value={eventEndTime.toTimeString().slice(0, 5)}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(eventEndTime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setEventEndTime(newDate);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 16,
                      border: '1px solid #E5E5EA',
                      borderRadius: 12,
                      fontSize: 16,
                      backgroundColor: '#F2F2F7',
                      fontFamily: 'inherit',
                      color: '#1a1a1a',
                      marginBottom: 16,
                    }}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowEventEndPicker(true)}
                  >
                    <Text style={styles.dateTimeButtonText}>
                      {formatDateTime(eventEndTime)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  {showEventEndPicker && (
                    <DateTimePicker
                      value={eventEndTime}
                      mode="datetime"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowEventEndPicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setEventEndTime(selectedDate);
                        }
                      }}
                    />
                  )}
                </>
              )}

              <Text style={styles.label}>{t('location')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('location')}
                value={eventLocation}
                onChangeText={setEventLocation}
                returnKeyType="done"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSaveEvent}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonRecurring: {
    backgroundColor: '#007AFF',
  },
  addButtonEvent: {
    backgroundColor: '#FF9500',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  tabTextActive: {
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 10,
  },
  activitiesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  activityLocationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleTime: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  dayChipActive: {
    backgroundColor: '#007AFF',
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  dayChipTextActive: {
    color: '#fff',
  },
  scheduleLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  scheduleLocationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventLocationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Platform.OS === 'ios' ? '90%' : '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  modalScrollView: {
    flexGrow: 1,
  },
  modalScrollContent: {
    paddingBottom: 10,
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  daysSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  dayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  timeButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#000',
  },
  dateTimeButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#000',
  },
  pickerContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});
