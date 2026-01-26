import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { radii, shadows } from '../utils/theme';
import { teamsService } from '../services/teamsService';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function TeamJoinRequestsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser, theme } = useAppState();
  const { colors } = theme;
  const isWeb = Platform.OS === 'web';
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const teamId = route.params?.teamId;
  const teamName = route.params?.teamName || 'Team';
  
  const [joinRequests, setJoinRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (teamId) {
      loadJoinRequests();
    }
  }, [teamId]);

  const loadJoinRequests = async () => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const requests = await teamsService.getJoinRequests(teamId);
      setJoinRequests(requests);
    } catch (error) {
      console.error('Error loading join requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (request) => {
    if (!teamId) return;
    setIsWorking(true);
    try {
      const result = await teamsService.approveJoinRequest(request.id, teamId, request.userId);
      if (result.success) {
        await loadJoinRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setIsWorking(true);
    try {
      const result = await teamsService.rejectJoinRequest(requestId);
      if (result.success) {
        await loadJoinRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsWorking(false);
    }
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{teamName} - {t('joinRequests')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          {joinRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="person-add-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {t('noJoinRequests') || 'No pending requests'}
              </Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {joinRequests.map(request => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <View style={styles.requestAvatar}>
                      <Text style={styles.requestAvatarText}>
                        {request.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.requestDetails}>
                      <Text style={styles.requestName}>{request.user?.name || 'User'}</Text>
                      <Text style={styles.requestEmail}>{request.user?.email || ''}</Text>
                      <Text style={styles.requestDate}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.requestApprove]}
                      onPress={() => handleApproveRequest(request)}
                      disabled={isWorking}
                    >
                      {isWorking ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={18} color="#fff" />
                          <Text style={styles.requestButtonText}>
                            {t('approve') || 'Approve'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.requestReject]}
                      onPress={() => handleRejectRequest(request.id)}
                      disabled={isWorking}
                    >
                      <Ionicons name="close-circle" size={18} color="#fff" />
                      <Text style={styles.requestButtonText}>
                        {t('reject') || 'Reject'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.soft,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  requestEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
  },
  requestApprove: {
    backgroundColor: colors.primary,
  },
  requestReject: {
    backgroundColor: colors.danger,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
});
