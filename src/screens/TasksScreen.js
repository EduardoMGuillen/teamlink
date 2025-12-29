import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TasksScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Complete daily safety checklist',
      description: 'Review and complete all safety protocols',
      dueDate: new Date(),
      status: 'pending',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Update inventory records',
      description: 'Verify and update warehouse inventory',
      dueDate: new Date(Date.now() + 86400000),
      status: 'inProgress',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Attend team meeting',
      description: 'Weekly team sync at 2 PM',
      dueDate: new Date(),
      status: 'completed',
      priority: 'low',
    },
  ]);

  const filters = ['All', 'Pending', 'In Progress', 'Completed'];

  const filteredTasks = tasks.filter((task) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Pending') return task.status === 'pending';
    if (selectedFilter === 'In Progress') return task.status === 'inProgress';
    if (selectedFilter === 'Completed') return task.status === 'completed';
    return true;
  });

  const toggleTaskStatus = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
            }
          : task
      )
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
      case 'urgent':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.tasksContainer}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => toggleTaskStatus(task.id)}
            >
              <Ionicons
                name={
                  task.status === 'completed'
                    ? 'checkmark-circle'
                    : 'ellipse-outline'
                }
                size={24}
                color={task.status === 'completed' ? '#34C759' : '#8E8E93'}
              />
              <View style={styles.taskContent}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.status === 'completed' && styles.taskTitleCompleted,
                  ]}
                >
                  {task.title}
                </Text>
                {task.description && (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                )}
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
                      {task.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.dueDateText}>
                    {task.dueDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={50} color="#8E8E93" />
            <Text style={styles.emptyText}>No tasks</Text>
            <Text style={styles.emptySubtext}>
              You don't have any tasks in this category
            </Text>
          </View>
        )}
      </ScrollView>
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
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
  taskContent: {
    flex: 1,
    marginLeft: 12,
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

