import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows } from '../utils/theme';
import { useAppState } from '../context/AppStateContext';
import { tasksService } from '../services/tasksService';
import { teamsService } from '../services/teamsService';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';

export default function TasksScreen() {
  const { currentUser, theme } = useAppState();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isWeb = Platform.OS === 'web';
  const normalizeDateInput = (dateInput) => {
    if (dateInput instanceof Date) return dateInput;
    return new Date(dateInput);
  };

  const toLocalDateString = (date) => {
    const safeDate = normalizeDateInput(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${safeDate.getFullYear()}-${pad(safeDate.getMonth() + 1)}-${pad(safeDate.getDate())}`;
  };

  const parseLocalDateString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const pickerTextColor = colors.text;
  const pickerThemeVariant = 'light';

  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskStatus, setTaskStatus] = useState('pending');
  const [taskDueDate, setTaskDueDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date()); // Temporary date for picker
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority', 'status'
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  React.useEffect(() => {
    if (currentUser?.id) {
      loadTasks();
    }
  }, [currentUser]);

  const loadTasks = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const loadedTasks = await tasksService.getTasks(currentUser.id);
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    { key: 'All', label: t('all') },
    { key: 'Pending', label: t('pending') },
    { key: 'In Progress', label: t('inProgress') },
    { key: 'Completed', label: t('completed') },
  ];

  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = tasks.filter((task) => {
      // Filter by status
      if (selectedFilter !== 'All') {
        if (selectedFilter === 'Pending' && task.status !== 'pending') return false;
        if (selectedFilter === 'In Progress' && task.status !== 'inProgress') return false;
        if (selectedFilter === 'Completed' && task.status !== 'completed') return false;
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }
      
      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'status') {
        const statusOrder = { pending: 1, inProgress: 2, completed: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

    return filtered;
  }, [tasks, selectedFilter, searchQuery, sortBy]);

  const openAddModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskStatus('pending');
    const today = new Date();
    setTaskDueDate(today);
    setTempDate(today); // Initialize tempDate
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    const dueDate = new Date(task.dueDate);
    setTaskDueDate(dueDate);
    setTempDate(dueDate); // Initialize tempDate for editing
    setShowModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!currentUser?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      if (editingTask) {
        const result = await tasksService.updateTask(editingTask.id, {
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          priority: taskPriority,
          status: taskStatus,
          dueDate: taskDueDate,
        });
        if (result.success) {
          await loadTasks();
          setShowModal(false);
          setEditingTask(null);
          setTaskTitle('');
          setTaskDescription('');
          setTaskDueDate(new Date());
          setTempDate(new Date());
        } else {
          Alert.alert('Error', result.error || 'Failed to update task');
        }
      } else {
        const result = await tasksService.createTask(currentUser.id, {
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          dueDate: taskDueDate,
          status: 'pending',
          priority: taskPriority,
          assignedTo: currentUser.id, // Individual tasks always assigned to creator
        });
        if (result.success) {
          await loadTasks();
          setShowModal(false);
          setTaskTitle('');
          setTaskDescription('');
          setTaskDueDate(new Date());
          setTempDate(new Date());
        } else {
          Alert.alert('Error', result.error || 'Failed to create task');
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let newStatus;
    if (task.status === 'pending') {
      newStatus = 'inProgress';
    } else if (task.status === 'inProgress') {
      newStatus = 'completed';
    } else {
      newStatus = 'pending';
    }

    try {
      const result = await tasksService.updateTask(taskId, { status: newStatus });
      if (result.success) {
        await loadTasks();
      } else {
        Alert.alert('Error', result.error || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const changeTaskStatus = async (taskId, newStatus) => {
    try {
      const result = await tasksService.updateTask(taskId, { status: newStatus });
      if (result.success) {
        await loadTasks();
      } else {
        Alert.alert('Error', result.error || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const deleteTask = (taskId) => {
    Alert.alert(
      t('delete'),
      'Are you sure you want to delete this task?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await tasksService.deleteTask(taskId);
              if (result.success) {
                await loadTasks();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete task');
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return '#8E8E93';
      case 'medium':
        return '#007AFF';
      case 'high':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const getPriorityLabel = (priority) => {
    return t(priority);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('tasks')}</Text>
            <TouchableOpacity onPress={openAddModal}>
              <Ionicons name="add-circle" size={32} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search') || 'Search tasks...'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Options */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>{t('sortBy') || 'Sort By'}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'date', label: t('date') || 'Date' },
                { key: 'priority', label: t('priority') },
                { key: 'status', label: t('status') || 'Status' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortButton,
                    sortBy === option.key && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortBy === option.key && styles.sortButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter.key && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.tasksContainer}>
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <TouchableOpacity
                style={styles.taskCheckbox}
                onPress={() => toggleTaskStatus(task.id)}
                onLongPress={() => {
                  // Long press to show status selection
                  Alert.alert(
                    t('changeStatus') || 'Change Status',
                    t('selectNewStatus') || 'Select new status:',
                    [
                      {
                        text: t('pending'),
                        onPress: () => changeTaskStatus(task.id, 'pending'),
                      },
                      {
                        text: t('inProgress'),
                        onPress: () => changeTaskStatus(task.id, 'inProgress'),
                      },
                      {
                        text: t('completed'),
                        onPress: () => changeTaskStatus(task.id, 'completed'),
                      },
                      { text: t('cancel'), style: 'cancel' },
                    ]
                  );
                }}
              >
                <Ionicons
                  name={
                    task.status === 'completed'
                      ? 'checkmark-circle'
                      : task.status === 'inProgress'
                      ? 'time'
                      : 'ellipse-outline'
                  }
                  size={24}
                  color={
                    task.status === 'completed'
                      ? '#34C759'
                      : task.status === 'inProgress'
                      ? '#007AFF'
                      : '#8E8E93'
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.taskContent}
                onPress={() => openEditModal(task)}
              >
                <Text
                  style={[
                    styles.taskTitle,
                    task.status === 'completed' && styles.taskTitleCompleted,
                  ]}
                >
                  {task.title}
                </Text>
                {task.description ? (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                ) : null}
                <View style={styles.taskMeta}>
                  <View style={styles.badgesRow}>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(task.priority) + '20' },
                      ]}
                    >
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(task.priority) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          { color: getPriorityColor(task.priority) },
                        ]}
                      >
                        {getPriorityLabel(task.priority).toUpperCase()}
                      </Text>
                    </View>
                    {task.isTeamTask && (
                      <View style={styles.teamBadge}>
                        <Ionicons name="people" size={12} color="#007AFF" />
                        <Text style={styles.teamBadgeText}>
                          {t('team') || 'TEAM'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dueDateText}>
                    {task.dueDate.toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(task.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={50} color="#8E8E93" />
            <Text style={styles.emptyText}>{t('noTasks')}</Text>
          </View>
        )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
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
                {editingTask ? t('edit') : t('addTask')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={styles.input}
                placeholder={t('taskTitle')}
                value={taskTitle}
                onChangeText={setTaskTitle}
                returnKeyType="next"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('taskDescription')}
                value={taskDescription}
                onChangeText={setTaskDescription}
                multiline
                numberOfLines={4}
                returnKeyType="done"
              />

              <Text style={styles.label}>{t('dueDate')}</Text>
              <View style={styles.datePickerContainer}>
                {Platform.OS === 'web' ? (
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      setTempDate(new Date(taskDueDate));
                      setShowDatePicker(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar" size={20} color={colors.primary} />
                    <Text style={styles.dateText}>
                      {taskDueDate.toLocaleDateString()}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => {
                        setTempDate(new Date(taskDueDate));
                        setShowDatePicker(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calendar" size={20} color="#007AFF" />
                      <Text style={styles.dateText}>
                        {taskDueDate.toLocaleDateString()}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                    {Platform.OS === 'android' && showDatePicker && (
                      <DateTimePicker
                        value={taskDueDate}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setTaskDueDate(selectedDate);
                            setTempDate(selectedDate);
                          }
                        }}
                      />
                    )}
                    {Platform.OS === 'ios' && showDatePicker && (
                      <View style={styles.inlinePicker}>
                        <DateTimePicker
                          value={tempDate}
                          mode="date"
                          display="spinner"
                          minimumDate={new Date()}
                          textColor={pickerTextColor}
                          themeVariant={pickerThemeVariant}
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              setTempDate(selectedDate);
                            }
                          }}
                        />
                        <View style={styles.inlinePickerActions}>
                          <TouchableOpacity
                            style={styles.inlineCancel}
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text style={styles.modalCancel}>{t('cancel')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.inlineSave}
                            onPress={() => {
                              setTaskDueDate(new Date(tempDate));
                              setShowDatePicker(false);
                            }}
                          >
                            <Text style={styles.modalDone}>{t('save')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>


              <Text style={styles.label}>{t('priority')}</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      taskPriority === priority && styles.priorityButtonActive,
                      { borderColor: getPriorityColor(priority) },
                    ]}
                    onPress={() => setTaskPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        taskPriority === priority && {
                          color: getPriorityColor(priority),
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {t(priority)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {editingTask && (
                <>
                  <Text style={styles.label}>{t('status') || 'Status'}</Text>
                  <TouchableOpacity
                    style={styles.statusButton}
                    onPress={() => {
                      let nextStatus;
                      if (taskStatus === 'pending') {
                        nextStatus = 'inProgress';
                      } else if (taskStatus === 'inProgress') {
                        nextStatus = 'completed';
                      } else {
                        nextStatus = 'pending';
                      }
                      setTaskStatus(nextStatus);
                    }}
                  >
                    <View style={styles.statusButtonContent}>
                      <Ionicons
                        name={
                          taskStatus === 'completed'
                            ? 'checkmark-circle'
                            : taskStatus === 'inProgress'
                            ? 'time'
                            : 'ellipse-outline'
                        }
                        size={20}
                        color={
                          taskStatus === 'completed'
                            ? '#34C759'
                            : taskStatus === 'inProgress'
                            ? '#007AFF'
                            : '#8E8E93'
                        }
                      />
                      <Text style={styles.statusButtonText}>
                        {taskStatus === 'pending'
                          ? t('pending')
                          : taskStatus === 'inProgress'
                          ? t('inProgress')
                          : t('completed')}
                      </Text>
                    </View>
                    <Text style={styles.statusButtonHint}>
                      {t('tapToChange') || 'Tap to change'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTask}
              >
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* iOS date picker is rendered inline inside the add task modal */}

      {/* Date Picker Modal for Web */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerModalOverlay}>
            <TouchableOpacity
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={styles.datePickerModalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancel}>{t('cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t('dueDate')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setTaskDueDate(new Date(tempDate));
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.modalDone}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
              <Calendar
                current={toLocalDateString(tempDate)}
                markedDates={{
                  [toLocalDateString(tempDate)]: {
                    selected: true,
                    selectedColor: colors.primary,
                  },
                }}
                onDayPress={(day) => {
                  const nextDate = parseLocalDateString(day.dateString);
                  setTempDate(nextDate);
                  setTaskDueDate(nextDate);
                }}
                theme={{
                  todayTextColor: colors.primary,
                  selectedDayBackgroundColor: colors.primary,
                  arrowColor: colors.primary,
                }}
              />
            </View>
          </View>
        </Modal>
      )}

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
  },
  scrollContentWeb: {
    flexGrow: 1,
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    height: 46,
    ...shadows.soft,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginRight: 12,
    fontWeight: '600',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 16,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tasksContainer: {
    padding: 20,
    paddingTop: 0,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    ...shadows.soft,
  },
  taskCheckbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  teamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#007AFF20',
    gap: 4,
  },
  teamBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dueDateText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 20,
    maxHeight: Platform.OS === 'ios' ? '90%' : '95%',
  },
  modalScrollView: {
    flexGrow: 1,
  },
  modalScrollContent: {
    paddingBottom: 10,
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  priorityButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#F2F2F7',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  pickerButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerButtonText: {
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
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalDone: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalPicker: {
    height: 200,
  },
  datePickerIOS: {
    height: 200,
    width: '100%',
  },
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  datePickerWrapper: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlinePicker: {
    marginTop: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 12,
  },
  inlinePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inlineCancel: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  inlineSave: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statusButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 20,
  },
  statusButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  statusButtonHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
