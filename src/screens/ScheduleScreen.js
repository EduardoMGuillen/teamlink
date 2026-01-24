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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAppState } from '../context/AppStateContext';
import { schedulesService } from '../services/schedulesService';
import { useTranslation } from '../utils/useTranslation';

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAppState();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('Main Office');
  const [position, setPosition] = useState('Operations');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadSchedules();
    }
  }, [currentUser]);

  const loadSchedules = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const loadedSchedules = await schedulesService.getSchedules(currentUser.id);
      setSchedules(loadedSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(
    (schedule) => schedule.date === selectedDate
  );

  const openAddModal = () => {
    setEditingSchedule(null);
    setStartTime('09:00');
    setEndTime('17:00');
    setLocation('Main Office');
    setPosition('Operations');
    setShowModal(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setLocation(schedule.location);
    setPosition(schedule.position);
    setShowModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!startTime || !endTime) {
      Alert.alert('Error', 'Please enter start and end times');
      return;
    }

    setIsLoading(true);
    try {
      if (editingSchedule) {
        const result = await schedulesService.updateSchedule(editingSchedule.id, {
          date: selectedDate,
          startTime,
          endTime,
          location,
          position,
        });
        if (result.success) {
          await loadSchedules();
          setShowModal(false);
        } else {
          Alert.alert('Error', result.error || 'Failed to update schedule');
        }
      } else {
        const result = await schedulesService.createSchedule(currentUser.id, {
          date: selectedDate,
          startTime,
          endTime,
          location,
          position,
        });
        if (result.success) {
          await loadSchedules();
          setShowModal(false);
        } else {
          Alert.alert('Error', result.error || 'Failed to create schedule');
        }
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to save schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = (scheduleId) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await schedulesService.deleteSchedule(scheduleId);
              if (result.success) {
                await loadSchedules();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete schedule');
              }
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert('Error', 'Failed to delete schedule');
            }
          },
        },
      ]
    );
  };

  const calculateDuration = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    return ((endTotal - startTotal) / 60).toFixed(1);
  };

  // Marcar fechas que tienen schedules
  const markedDates = {};
  schedules.forEach(schedule => {
    if (!markedDates[schedule.date]) {
      markedDates[schedule.date] = { marked: true, dotColor: '#007AFF' };
    }
  });
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#007AFF',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle" size={32} color="#007AFF" />
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

        <View style={styles.schedulesContainer}>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{schedule.startTime}</Text>
                  <Text style={styles.timeSeparator}>-</Text>
                  <Text style={styles.timeText}>{schedule.endTime}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsColumn}>
                  <Text style={styles.positionText}>{schedule.position}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#FF3B30" />
                    <Text style={styles.locationText}>{schedule.location}</Text>
                  </View>
                  <Text style={styles.durationText}>
                    {calculateDuration(schedule.startTime, schedule.endTime)} hours
                  </Text>
                </View>
                <View style={styles.actionsColumn}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(schedule)}
                  >
                    <Ionicons name="pencil" size={18} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSchedule(schedule.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={50} color="#8E8E93" />
              <Text style={styles.emptyText}>No shifts scheduled</Text>
              <Text style={styles.emptySubtext}>
                You don't have any shifts scheduled for this date
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Schedule Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.dateDisplay}>{selectedDate}</Text>

              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                value={startTime}
                onChangeText={setStartTime}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.input}
                placeholder="17:00"
                value={endTime}
                onChangeText={setEndTime}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Location</Text>
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

              <Text style={styles.label}>Position</Text>
              <TextInput
                style={styles.input}
                placeholder="Operations"
                value={position}
                onChangeText={setPosition}
                placeholderTextColor="#999"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveSchedule}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 10,
  },
  schedulesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  timeColumn: {
    width: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#8E8E93',
    marginVertical: 4,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  detailsColumn: {
    flex: 1,
  },
  positionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#007AFF',
  },
  actionsColumn: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
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
    maxHeight: '90%',
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
    maxHeight: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 12,
  },
  dateDisplay: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
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
});
