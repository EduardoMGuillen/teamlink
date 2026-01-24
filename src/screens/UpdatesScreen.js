import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { updatesService } from '../services/updatesService';

export default function UpdatesScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAppState();
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, [currentUser]);

  const loadUpdates = async () => {
    if (!currentUser?.id) return;

    try {
      const loadedUpdates = await updatesService.getAllUpdates(currentUser.id);
      setUpdates(loadedUpdates);
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUpdates();
  };

  const formatDate = (date) => {
    const now = new Date();
    const updateDate = new Date(date);
    const diff = now - updateDate;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return `${minutes} ${t('minutesAgo')}`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ${t('hoursAgo')}`;
    if (minutes < 2880) return t('yesterday');
    
    return updateDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: updateDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'normal':
        return '#007AFF';
      case 'low':
        return '#8E8E93';
      default:
        return '#007AFF';
    }
  };

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {updates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>{t('noUpdates')}</Text>
          </View>
        ) : (
          updates.map((update) => (
            <TouchableOpacity key={update.id} style={styles.updateCard}>
              {update.isPinned && (
                <View style={styles.pinnedBadge}>
                  <Ionicons name="pin" size={12} color="#fff" />
                  <Text style={styles.pinnedText}>{t('pinned')}</Text>
                </View>
              )}
              <View style={styles.updateHeader}>
                <View style={styles.authorInfo}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorAvatarText}>
                      {update.authorName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>{update.authorName}</Text>
                    <Text style={styles.updateTime}>{formatDate(update.createdAt)}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(update.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>{t(update.priority) || update.priority}</Text>
                </View>
              </View>
              <Text style={styles.updateTitle}>{update.title}</Text>
              <Text style={styles.updateContent}>{update.content}</Text>
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
  list: {
    flex: 1,
  },
  updateCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  pinnedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  updateTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  updateContent: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
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
