import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { radii, shadows } from '../utils/theme';
import { tasksService } from '../services/tasksService';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';

export default function TeamTasksScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser, theme } = useAppState();
  const { colors } = theme;
  const isWeb = Platform.OS === 'web';
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const teamId = route.params?.teamId;
  const teamName = route.params?.teamName || 'Team';
  
  const [teamTasks, setTeamTasks] = useState([]);
  const [teamStats, setTeamStats] = useState({ pending: 0, inProgress: 0, completed: 0, unassigned: 0 });
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date());
  const [taskAssignedTo, setTaskAssignedTo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      loadTeamTasks();
      loadTeamStats();
      loadTeamLeaderboard();
      loadTeamMembers();
    }
  }, [teamId]);

  const loadTeamTasks = async () => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const tasks = await tasksService.getTeamTasks(teamId);
      setTeamTasks(tasks);
    } catch (error) {
      console.error('Error loading team tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamStats = async () => {
    if (!teamId) return;
    try {
      const stats = await tasksService.getTeamStats(teamId);
      setTeamStats(stats);
    } catch (error) {
      console.error('Error loading team stats:', error);
    }
  };

  const loadTeamLeaderboard = async () => {
    if (!teamId) return;
    try {
      const leaderboard = await tasksService.getTeamLeaderboard(teamId, 'month');
      setTeamLeaderboard(leaderboard);
    } catch (error) {
      console.error('Error loading team leaderboard:', error);
    }
  };

  const loadTeamMembers = async () => {
    if (!teamId) return;
    try {
      const { teamsService } = await import('../services/teamsService');
      const members = await teamsService.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const handleCreateTeamTask = async () => {
    if (!teamId || !currentUser?.id || !taskTitle.trim()) return;
    
    setIsWorking(true);
    try {
      const result = await tasksService.createTeamTask(teamId, currentUser.id, {
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate,
        assignedTo: taskAssignedTo,
      });

      if (result.success) {
        setShowCreateTaskModal(false);
        resetTaskForm();
        await loadTeamTasks();
        await loadTeamStats();
        await loadTeamLeaderboard();
      }
    } catch (error) {
      console.error('Error creating team task:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleClaimTask = async (taskId) => {
    if (!currentUser?.id) return;
    
    setIsWorking(true);
    try {
      const result = await tasksService.claimTask(taskId, currentUser.id);
      if (result.success) {
        await loadTeamTasks();
        await loadTeamStats();
        await loadTeamLeaderboard();
      }
    } catch (error) {
      console.error('Error claiming task:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setIsWorking(true);
    try {
      const result = await tasksService.updateTask(taskId, { status: newStatus });
      if (result.success) {
        await loadTeamTasks();
        await loadTeamStats();
        await loadTeamLeaderboard();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const getFilteredTasks = () => {
    if (!currentUser?.id) return teamTasks;
    
    switch (taskFilter) {
      case 'unassigned':
        return teamTasks.filter(task => task.isUnassigned);
      case 'my':
        return teamTasks.filter(task => task.assignedTo === currentUser.id);
      case 'completed':
        return teamTasks.filter(task => task.status === 'completed');
      default:
        return teamTasks;
    }
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskDueDate(new Date());
    setTaskAssignedTo(null);
  };

  const formatDate = (date) => {
    const value = new Date(date);
    return value.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{teamName} - {t('teamTasks')}</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => {
            resetTaskForm();
            setShowCreateTaskModal(true);
          }}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          {/* Task Stats */}
          <View style={styles.taskStatsRow}>
            <View style={styles.taskStatCard}>
              <Text style={styles.taskStatValue}>{teamStats.pending + teamStats.inProgress}</Text>
              <Text style={styles.taskStatLabel}>{t('active') || 'Active'}</Text>
            </View>
            <View style={styles.taskStatCard}>
              <Text style={styles.taskStatValue}>{teamStats.unassigned}</Text>
              <Text style={styles.taskStatLabel}>{t('unassigned') || 'Unassigned'}</Text>
            </View>
            <View style={styles.taskStatCard}>
              <Text style={styles.taskStatValue}>{teamStats.completed}</Text>
              <Text style={styles.taskStatLabel}>{t('completed') || 'Completed'}</Text>
            </View>
          </View>

          {/* Task Filters */}
          <View style={styles.taskFiltersRow}>
            {['all', 'unassigned', 'my', 'completed'].map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.taskFilterButton,
                  taskFilter === filter && styles.taskFilterButtonActive,
                ]}
                onPress={() => setTaskFilter(filter)}
              >
                <Text
                  style={[
                    styles.taskFilterText,
                    taskFilter === filter && styles.taskFilterTextActive,
                  ]}
                >
                  {t(`taskFilter${filter.charAt(0).toUpperCase() + filter.slice(1)}`) || filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Task List */}
          <View style={styles.tasksList}>
            {getFilteredTasks().length === 0 ? (
              <View style={styles.emptyUpdates}>
                <Text style={styles.emptyUpdatesText}>
                  {t('noTeamTasks') || 'No tasks found'}
                </Text>
              </View>
            ) : (
              getFilteredTasks().map(task => {
                const isUnassigned = task.isUnassigned;
                const isAssignedToMe = task.assignedTo === currentUser?.id;
                const canClaim = isUnassigned && !isAssignedToMe;
                
                return (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskCardHeader}>
                      <View style={styles.taskCardHeaderLeft}>
                        <Text style={styles.taskCardTitle}>{task.title}</Text>
                        <View style={styles.taskCardMeta}>
                          <View style={[
                            styles.priorityBadge,
                            task.priority === 'high' && styles.priorityBadgeHigh,
                            task.priority === 'medium' && styles.priorityBadgeMedium,
                            task.priority === 'low' && styles.priorityBadgeLow,
                          ]}>
                            <Text style={styles.priorityBadgeText}>{task.priority}</Text>
                          </View>
                          {task.assignedUser ? (
                            <Text style={styles.taskAssignedText}>
                              {t('assignedTo') || 'Assigned to'} {task.assignedUser.name}
                            </Text>
                          ) : (
                            <Text style={styles.taskUnassignedText}>
                              {t('unassigned') || 'Unassigned'}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        task.status === 'completed' && styles.statusBadgeCompleted,
                        task.status === 'inProgress' && styles.statusBadgeInProgress,
                      ]}>
                        <Text style={styles.statusBadgeText}>{task.status}</Text>
                      </View>
                    </View>
                    
                    {task.description && (
                      <Text style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                    
                    <View style={styles.taskCardFooter}>
                      <Text style={styles.taskDueDate}>
                        {t('dueDate') || 'Due'}: {formatDate(task.dueDate)}
                      </Text>
                      <View style={styles.taskActions}>
                        {canClaim && (
                          <TouchableOpacity
                            style={styles.claimButton}
                            onPress={() => handleClaimTask(task.id)}
                          >
                            <Ionicons name="hand-left" size={16} color={colors.primary} />
                            <Text style={styles.claimButtonText}>
                              {t('claimTask') || 'Claim'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {isAssignedToMe && task.status !== 'completed' && (
                          <TouchableOpacity
                            style={styles.statusButton}
                            onPress={() => {
                              const nextStatus = task.status === 'pending' ? 'inProgress' : 'completed';
                              handleUpdateTaskStatus(task.id, nextStatus);
                            }}
                          >
                            <Text style={styles.statusButtonText}>
                              {task.status === 'pending' ? t('start') || 'Start' : t('complete') || 'Complete'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Leaderboard */}
          {teamLeaderboard.length > 0 && (
            <View style={styles.leaderboardSection}>
              <Text style={styles.leaderboardTitle}>
                {t('topContributors') || 'Top Contributors'}
              </Text>
              <View style={styles.leaderboardList}>
                {teamLeaderboard.slice(0, 5).map((member, index) => (
                  <View key={member.userId} style={styles.leaderboardItem}>
                    <View style={styles.leaderboardRank}>
                      {index === 0 && <Ionicons name="trophy" size={20} color="#FFD700" />}
                      {index === 1 && <Ionicons name="medal" size={20} color="#C0C0C0" />}
                      {index === 2 && <Ionicons name="medal" size={20} color="#CD7F32" />}
                      {index > 2 && <Text style={styles.leaderboardRankText}>#{index + 1}</Text>}
                    </View>
                    <View style={styles.leaderboardMemberInfo}>
                      <Text style={styles.leaderboardMemberName}>{member.name}</Text>
                      <Text style={styles.leaderboardMemberTasks}>
                        {member.completedTasks} {t('tasksCompleted') || 'tasks completed'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Team Task Modal */}
      <Modal visible={showCreateTaskModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('createTeamTask') || 'Create Team Task'}</Text>
            
            <Text style={styles.inputLabel}>{t('title') || 'Title'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('taskTitlePlaceholder') || 'Task title'}
              value={taskTitle}
              onChangeText={setTaskTitle}
            />

            <Text style={styles.inputLabel}>{t('description') || 'Description'}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('taskDescriptionPlaceholder') || 'Task description (optional)'}
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>{t('priority') || 'Priority'}</Text>
            <View style={styles.priorityRow}>
              {['low', 'medium', 'high'].map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityChip,
                    taskPriority === priority && styles.priorityChipActive,
                  ]}
                  onPress={() => setTaskPriority(priority)}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      taskPriority === priority && styles.priorityChipTextActive,
                    ]}
                  >
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t('dueDate') || 'Due Date'}</Text>
            {Platform.OS === 'web' ? (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {taskDueDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <DateTimePicker
                value={taskDueDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date) setTaskDueDate(date);
                }}
                textColor={colors.text}
                themeVariant="light"
              />
            )}

            {Platform.OS === 'web' && showDatePicker && (
              <Modal visible={showDatePicker} transparent animationType="fade">
                <View style={styles.calendarModalOverlay}>
                  <View style={styles.calendarModalContent}>
                    <Calendar
                      onDayPress={(day) => {
                        setTaskDueDate(new Date(day.dateString));
                        setShowDatePicker(false);
                      }}
                      markedDates={{
                        [taskDueDate.toISOString().split('T')[0]]: { selected: true },
                      }}
                      theme={{
                        backgroundColor: colors.surface,
                        calendarBackground: colors.surface,
                        textSectionTitleColor: colors.text,
                        selectedDayBackgroundColor: colors.primary,
                        selectedDayTextColor: '#fff',
                        todayTextColor: colors.primary,
                        dayTextColor: colors.text,
                        textDisabledColor: colors.textMuted,
                        dotColor: colors.primary,
                        selectedDotColor: '#fff',
                        arrowColor: colors.primary,
                        monthTextColor: colors.text,
                        textDayFontWeight: '500',
                        textMonthFontWeight: '700',
                        textDayHeaderFontWeight: '600',
                      }}
                    />
                    <TouchableOpacity
                      style={styles.calendarCloseButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.calendarCloseButtonText}>{t('close') || 'Close'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

            <Text style={styles.inputLabel}>{t('assignTo') || 'Assign To'}</Text>
            <View style={styles.assignRow}>
              <TouchableOpacity
                style={[
                  styles.assignChip,
                  taskAssignedTo === null && styles.assignChipActive,
                ]}
                onPress={() => setTaskAssignedTo(null)}
              >
                <Text
                  style={[
                    styles.assignChipText,
                    taskAssignedTo === null && styles.assignChipTextActive,
                  ]}
                >
                  {t('unassigned') || 'Unassigned'}
                </Text>
              </TouchableOpacity>
              {teamMembers.map(member => (
                <TouchableOpacity
                  key={member.userId}
                  style={[
                    styles.assignChip,
                    taskAssignedTo === member.userId && styles.assignChipActive,
                  ]}
                  onPress={() => setTaskAssignedTo(member.userId)}
                >
                  <Text
                    style={[
                      styles.assignChipText,
                      taskAssignedTo === member.userId && styles.assignChipTextActive,
                    ]}
                  >
                    {member.user.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setShowCreateTaskModal(false);
                  resetTaskForm();
                }}
              >
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleCreateTeamTask}
                disabled={isWorking || !taskTitle.trim()}
              >
                {isWorking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>{t('create') || 'Create'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  createButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  scrollContentWeb: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
    padding: 20,
  },
  contentWeb: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  taskStatCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    alignItems: 'center',
    ...shadows.soft,
  },
  taskStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  taskStatLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  taskFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  taskFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  taskFilterButtonActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  taskFilterText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  taskFilterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tasksList: {
    gap: 12,
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.soft,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskCardHeaderLeft: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  taskCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  priorityBadgeHigh: {
    backgroundColor: `${colors.danger}20`,
  },
  priorityBadgeMedium: {
    backgroundColor: `${colors.accent}20`,
  },
  priorityBadgeLow: {
    backgroundColor: `${colors.secondary}20`,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  taskAssignedText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  taskUnassignedText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  statusBadgeCompleted: {
    backgroundColor: `${colors.secondary}20`,
  },
  statusBadgeInProgress: {
    backgroundColor: `${colors.primary}20`,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDueDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  claimButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  leaderboardSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
  },
  leaderboardRank: {
    width: 24,
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  leaderboardMemberInfo: {
    flex: 1,
  },
  leaderboardMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardMemberTasks: {
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyUpdates: {
    padding: 24,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  emptyUpdatesText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 12,
    color: colors.text,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  priorityChipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  priorityChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModalContent: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  calendarCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  calendarCloseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  assignRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  assignChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  assignChipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  assignChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  assignChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  modalCancel: {
    backgroundColor: colors.surfaceAlt,
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: '600',
  },
  modalSave: {
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
