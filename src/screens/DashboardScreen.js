import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows } from '../utils/theme';
import { tasksService } from '../services/tasksService';
// import { shiftsService } from '../services/shiftsService'; // Temporarily hidden
import { notificationsService } from '../services/notificationsService';
import { calendarScheduleService } from '../services/calendarScheduleService';
import { teamsService } from '../services/teamsService';
import DailyMotivation from '../components/DailyMotivation';

const toLocalDateString = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function DashboardScreen() {
  const { currentUser, theme } = useAppState();
  const { colors } = theme;
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isWeb = Platform.OS === 'web';
  const [stats, setStats] = useState({ hours: 0, tasks: 0 });
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [todayActivities, setTodayActivities] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [hasTeams, setHasTeams] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadDashboardData();
      loadUnreadNotifications();
      loadTodayActivities();
      loadUserTeams();
      const interval = setInterval(() => {
        loadDashboardData();
        loadUnreadNotifications();
        loadTodayActivities();
        loadUserTeams();
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
      const today = toLocalDateString(new Date());
      const activities = await calendarScheduleService.getActivitiesForDate(currentUser.id, today);
      setTodayActivities(activities);
    } catch (error) {
      console.error('Error loading today activities:', error);
    }
  };

  const loadUserTeams = async () => {
    if (!currentUser?.id) return;
    try {
      const teams = await teamsService.getUserTeams(currentUser.id);
      setUserTeams(teams);
      setHasTeams(teams.length > 0);
    } catch (error) {
      console.error('Error loading user teams:', error);
      setHasTeams(false);
    }
  };

  const loadDashboardData = async () => {
    if (!currentUser?.id) return;

    try {
      // Load tasks from database
      const tasks = await tasksService.getTasks(currentUser.id);

      // Count completed tasks
      const completedTasks = tasks.filter((task) => task.status === 'completed').length;

      setStats({
        hours: 0, // Temporarily hidden
        tasks: completedTasks,
      });

      // Build recent activity
      const activities = [];

      // Add recent task completions
      tasks
        .filter((task) => task.status === 'completed')
        .sort((a, b) => {
          return new Date(b.dueDate) - new Date(a.dueDate);
        })
        .slice(0, 5)
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

  const quickActions = useMemo(() => {
    const actions = [
      { id: '2', icon: 'calendar', title: t('viewSchedule'), color: colors.primary, bg: '#EEF2FF', screen: 'Schedule' },
      { id: '3', icon: 'checkmark-circle', title: t('myTasks'), color: colors.accent, bg: '#FFF7ED', screen: 'Tasks' },
      { id: '4', icon: 'chatbubble', title: t('messages'), color: '#A855F7', bg: '#F5F3FF', screen: 'Chat' },
      { id: '6', icon: 'people', title: t('teams'), color: '#10B981', bg: '#ECFDF5', screen: 'Teams' },
      { id: '5', icon: 'bulb', title: 'Spark', color: colors.accent, bg: '#FFF9E6', screen: 'MotivationSettings' },
    ];
    
    // Add Time Clock only if user is in at least one team
    if (hasTeams) {
      actions.splice(3, 0, { 
        id: '1', 
        icon: 'time', 
        title: t('timeClock'), 
        color: colors.secondary, 
        bg: '#ECFDF5', 
        screen: 'TimeClock' 
      });
    }
    
    return actions;
  }, [hasTeams, colors, t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>{t('welcome')},</Text>
              <Text style={styles.nameText}>
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={24} color={colors.primary} />
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Daily Motivation - Spark */}
          <DailyMotivation />

        {/* Quick Actions + This Week: agrupados para evitar hueco en medio (p. ej. Android web) */}
        <View style={styles.quickAndThisWeekBlock}>
        <View style={[styles.section, isWeb && styles.sectionWeb, styles.sectionQuickActions]}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={[styles.quickActionsGrid, isWeb && styles.quickActionsGridWeb]}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  isWeb && styles.quickActionCardWeb,
                  { backgroundColor: action.bg },
                ]}
                onPress={() => {
                  if (action.screen === 'Tasks') {
                    navigation.navigate('MainTabs', { screen: 'Tasks' });
                  } else if (action.screen === 'Schedule') {
                    navigation.navigate('MainTabs', { screen: 'Schedule' });
                  } else if (action.screen === 'Chat') {
                    navigation.navigate('Chat');
                  } else if (action.screen === 'Teams') {
                    navigation.navigate('MainTabs', { screen: 'Teams' });
                  } else if (action.screen === 'TimeClock') {
                    navigation.navigate('TimeClock');
                  } else if (action.screen === 'MotivationSettings') {
                    navigation.navigate('MotivationSettings');
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
        <View style={[styles.section, isWeb && styles.sectionWeb, styles.sectionThisWeek]}>
          <Text style={styles.sectionTitle}>{t('thisWeek') || 'This Week'}</Text>
          <View style={[styles.statsRow, isWeb && styles.statsRowWeb]}>
            {/* <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#007AFF" />
              <Text style={styles.statValue}>{stats.hours}</Text>
              <Text style={styles.statLabel}>{t('hours') || 'Hours'}</Text>
            </View> */}
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.statValue}>{stats.tasks}</Text>
              <Text style={styles.statLabel}>{t('tasks')}</Text>
            </View>
          </View>
        </View>
        </View>

        {/* Today's Activities */}
        <View style={[styles.section, isWeb && styles.sectionWeb]}>
          <Text style={styles.sectionTitle}>{t('yourActivitiesToday')}</Text>
          {todayActivities.length > 0 ? (
            todayActivities.map((activity) => (
              <View
                key={activity.id}
                style={[styles.activityCard, isWeb && styles.activityCardWeb]}
              >
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
        <View style={[styles.section, isWeb && styles.sectionWeb]}>
          <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <View
                key={activity.id}
                style={[styles.activityCard, isWeb && styles.activityCardWeb]}
              >
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
    paddingBottom: 24,
    flexGrow: 0,
  },
  content: {
    width: '100%',
  },
  contentWeb: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionWeb: {
    paddingHorizontal: 0,
  },
  quickAndThisWeekBlock: {
    gap: 4,
  },
  sectionQuickActions: {
    paddingBottom: 8,
  },
  sectionThisWeek: {
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionsGridWeb: {
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '47%',
    borderRadius: radii.lg,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    ...shadows.soft,
  },
  quickActionCardWeb: {
    width: '31%',
    minHeight: 130,
  },
  quickActionText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsRowWeb: {
    maxWidth: 360,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.soft,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 10,
    ...shadows.soft,
  },
  activityCardWeb: {
    padding: 16,
  },
  activityIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activitySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
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
