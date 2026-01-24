import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { teamsService } from '../services/teamsService';
import { messagesService } from '../services/messagesService';
import { useNavigation } from '@react-navigation/native';

export default function DirectoryScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAppState();
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  useEffect(() => {
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedDepartment, users]);

  const loadUsers = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      const allUsers = await teamsService.getAllUsers();
      // Filtrar el usuario actual
      const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.department && user.department.toLowerCase().includes(query))
      );
    }

    // Filtrar por departamento
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(user => user.department === selectedDepartment);
    }

    setFilteredUsers(filtered);
  };

  const handleSendMessage = async (userId) => {
    navigation.navigate('Chat', { userId });
  };

  const departments = ['All', ...new Set(users.map(u => u.department).filter(Boolean))];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('directory') || 'Directory'}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search') || 'Search...'}
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Department Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.departmentFilter}
        contentContainerStyle={styles.departmentFilterContent}
      >
        {departments.map((dept) => (
          <TouchableOpacity
            key={dept}
            style={[
              styles.departmentChip,
              selectedDepartment === dept && styles.departmentChipActive,
            ]}
            onPress={() => setSelectedDepartment(dept)}
          >
            <Text
              style={[
                styles.departmentChipText,
                selectedDepartment === dept && styles.departmentChipTextActive,
              ]}
            >
              {dept}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Users List */}
      <ScrollView style={styles.list}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>
              {searchQuery ? t('noResults') || 'No results found' : t('noUsers') || 'No users found'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userItem}
              onPress={() => handleSendMessage(user.id)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.department && (
                  <Text style={styles.userDepartment}>{user.department}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => handleSendMessage(user.id)}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#000',
  },
  departmentFilter: {
    maxHeight: 50,
    marginBottom: 8,
  },
  departmentFilterContent: {
    paddingHorizontal: 16,
  },
  departmentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  departmentChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  departmentChipText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  departmentChipTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 12,
    color: '#007AFF',
  },
  messageButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});
