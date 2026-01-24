import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../utils/useTranslation';
import { tasksService } from '../services/tasksService';
import { shiftsService } from '../services/shiftsService';
import { notificationsService } from '../services/notificationsService';
import { calendarScheduleService } from '../services/calendarScheduleService';

export default function DashboardScreen() {
  const { currentUser } = useAppState();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ hours: 0, tasks: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [todayActivities, setTodayActivities] = useState([]);

  useEffect(() => {
    if (currentUser?.id) {
      loadDashboardData();
      loadUnreadNotifications();
      loadTodayActivities();
      const interval = setInterval(() => {
        loadDashboardData();
        loadUnreadNotifications();
        loadTodayActivities();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadUnreadNotifications = async () => {
    if (!currentUser?.id) return;
    try {
      const unread = await notificationsService.getUnreadNotifications(currentUser.id);
      setUnreadNotifications(unread.length);
    } catch (error) {
      console.error('Error loading unread notifications:', error);
    }
  };

  const loadTodayActivities = async () => {
    if (!currentUser?.id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const activities = await calendarScheduleService.getActivitiesForDate(currentUser.id, today);
      setTodayActivities(activities);
    } catch (error) {
      console.error('Error loading today activities:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!currentUser?.id) return;

    try {
      // Load tasks and shifts from database
      const [tasks, weeklyHours] = await Promise.all([
        tasksService.getTasks(currentUser.id),
        shiftsService.getWeeklyHours(currentUser.id),
      ]);

      // Count completed tasks
      const completedTasks = tasks.filter((task) => task.status === 'completed').length;

      setStats({
        hours: weeklyHours.toFixed(1),
        tasks: completedTasks,
      });

      // Load recent shifts for activity
      const shifts = await shiftsService.getShifts(currentUser.id);

      // Build recent activity
      const activities = [];

      // Add recent shifts
      shifts
        .filter((shift) => shift.clockOut)
        .slice(0, 3)
        .forEach((shift) => {
          activities.push({
            id: `shift-${shift.id}`,
            type: 'shift',
            title: t('clockedInAt'),
            subtitle: formatTime(shift.clockIn),
            icon: 'time',
            time: getTimeAgo(shift.clockIn),
            timestamp: shift.clockIn.getTime(),
          });
        });

      // Add recent task completions
      tasks
        .filter((task) => task.status === 'completed')
        .sort((a, b) => {
          return new Date(b.dueDate) - new Date(a.dueDate);
        })
        .slice(0, 3)
        .forEach((task) => {
          activities.push({
            id: `task-${task.id}`,
            type: 'task',
            title: t('task') + ' ' + t('completed').toLowerCase(),
            subtitle: task.title,
            icon: 'checkmark-circle',
            time: getTimeAgo(task.dueDate),
            timestamp: task.dueDate.getTime(),
          });
        });

      // Sort by timestamp and take most recent 5
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    if (diffDays === 1) return t('yesterday');
    return `${diffDays} days ago`;
  };

  const quickActions = [
    { id: '1', icon: 'time', title: t('clockIn'), color: '#34C759', screen: 'Time' },
    { id: '2', icon: 'calendar', title: t('viewSchedule'), color: '#007AFF', screen: 'Schedule' },
    { id: '3', icon: 'checkmark-circle', title: t('myTasks'), color: '#FF9500', screen: 'Tasks' },
    { id: '4', icon: 'chatbubble', title: t('messages'), color: '#AF52DE', screen: 'Chat' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>{t('welcome')},</Text>
            <Text style={styles.nameText}>{currentUser?.name || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={24} color="#007AFF" />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => {
                  if (action.screen === 'Time') {
                    navigation.navigate('MainTabs', { screen: 'Time' });
                  } else if (action.screen === 'Tasks') {
                    navigation.navigate('MainTabs', { screen: 'Tasks' });
                  } else if (action.screen === 'Schedule') {
                    navigation.navigate('MainTabs', { screen: 'Schedule' });
                  }
                }}
              >
                <Ionicons name={action.icon} size={28} color={action.color} />
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('thisWeek') || 'This Week'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#007AFF" />
              <Text style={styles.statValue}>{stats.hours}</Text>
              <Text style={styles.statLabel}>{t('hours') || 'Hours'}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.statValue}>{stats.tasks}</Text>
              <Text style={styles.statLabel}>{t('tasks')}</Text>
            </View>
          </View>
        </View>

        {/* Today's Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('yourActivitiesToday')}</Text>
          {todayActivities.length > 0 ? (
            todayActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={[
                  styles.activityIconContainer,
                  { backgroundColor: activity.type === 'recurring' ? '#007AFF20' : '#FF950020' }
                ]}>
                  <Ionicons 
                    name={activity.type === 'recurring' ? 'repeat' : 'calendar'} 
                    size={20} 
                    color={activity.type === 'recurring' ? '#007AFF' : '#FF9500'} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
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
                  </View>
                  <Text style={styles.activitySubtitle}>
                    {typeof activity.startTime === 'string' 
                      ? `${activity.startTime} - ${activity.endTime}`
                      : `${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}`}
                  </Text>
                  {activity.description && (
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                  )}
                  {activity.location && (
                    <View style={styles.activityLocation}>
                      <Ionicons name="location" size={12} color="#8E8E93" />
                      <Text style={styles.activityLocationText}>{activity.location}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>
                {t('noActivitiesToday')}
              </Text>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityIconContainer}>
                  <Ionicons name={activity.icon} size={20} color="#007AFF" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>
                {t('noRecentActivity') || 'No recent activity'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionText: {
    fontSize: 14,
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activityTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  activityLocationText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  emptyActivity: {
    padding: 20,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
