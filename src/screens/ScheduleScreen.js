import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const schedules = [
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      location: 'Main Office',
      position: 'Operations',
    },
    {
      id: '2',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '16:00',
      location: 'Warehouse',
      position: 'Operations',
    },
  ];

  const filteredSchedules = schedules.filter(
    (schedule) => schedule.date === selectedDate
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#007AFF',
              },
            }}
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
    </SafeAreaView>
  );
}

const calculateDuration = (start, end) => {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  return ((endTotal - startTotal) / 60).toFixed(1);
};

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
});

