import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { tasksService } from '../services/tasksService';
import { teamsService } from '../services/teamsService';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAppState();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority', 'status'
  const [isLoading, setIsLoading] = useState(false);
  const [assignedTo, setAssignedTo] = useState(null); // null = self, userId = assign to other
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
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
    setTaskDueDate(new Date());
    setAssignedTo(null); // Reset assignment
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskDueDate(new Date(task.dueDate));
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
          dueDate: taskDueDate,
        });
        if (result.success) {
          await loadTasks();
          setShowModal(false);
          setEditingTask(null);
          setTaskTitle('');
          setTaskDescription('');
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
          assignedTo: assignedTo || currentUser.id, // Assign to selected user or self
        });
        if (result.success) {
          await loadTasks();
          setShowModal(false);
          setTaskTitle('');
          setTaskDescription('');
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

      <ScrollView style={styles.tasksContainer}>
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
                  <input
                    type="date"
                    value={taskDueDate.toISOString().split('T')[0]}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setTaskDueDate(new Date(e.target.value));
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
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
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
                          }
                        }}
                      />
                    )}
                  </>
                )}
              </View>

              {!editingTask && (
                <>
                  <Text style={styles.label}>{t('assignTo') || 'Assign To'}</Text>
                  {Platform.OS === 'ios' ? (
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowUserPicker(true)}
                    >
                      <Text style={styles.pickerButtonText}>
                        {assignedTo
                          ? availableUsers.find(u => u.id === assignedTo)?.name || 'Select User'
                          : currentUser.name + ' (Me)'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={assignedTo || currentUser.id}
                        onValueChange={(value) => setAssignedTo(value === currentUser.id ? null : value)}
                        style={styles.picker}
                      >
                        <Picker.Item label={`${currentUser.name} (Me)`} value={currentUser.id} />
                        {availableUsers
                          .filter(u => u.id !== currentUser.id)
                          .map((user) => (
                            <Picker.Item key={user.id} label={user.name} value={user.id} />
                          ))}
                      </Picker>
                    </View>
                  )}
                </>
              )}

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

      {/* Date Picker Modal for iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancel}>{t('cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t('dueDate')}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalDone}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={taskDueDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTaskDueDate(selectedDate);
                  }
                }}
                style={styles.datePickerIOS}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* User Picker Modal for iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showUserPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowUserPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowUserPicker(false)}>
                  <Text style={styles.modalCancel}>{t('cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t('assignTo') || 'Assign To'}</Text>
                <TouchableOpacity onPress={() => setShowUserPicker(false)}>
                  <Text style={styles.modalDone}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={assignedTo || currentUser.id}
                onValueChange={(value) => setAssignedTo(value === currentUser.id ? null : value)}
                style={styles.modalPicker}
              >
                <Picker.Item label={`${currentUser.name} (Me)`} value={currentUser.id} />
                {availableUsers
                  .filter(u => u.id !== currentUser.id)
                  .map((user) => (
                    <Picker.Item key={user.id} label={user.name} value={user.id} />
                  ))}
              </Picker>
            </View>
          </View>
        </Modal>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#000',
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
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#000',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tasksContainer: {
    flex: 1,
    padding: 20,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  taskCheckbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    color: '#8E8E93',
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
    fontSize: 20,
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
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
});
