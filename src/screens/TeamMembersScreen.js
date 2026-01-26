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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { radii, shadows } from '../utils/theme';
import { teamsService } from '../services/teamsService';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function TeamMembersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser, theme } = useAppState();
  const { colors } = theme;
  const isWeb = Platform.OS === 'web';
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const teamId = route.params?.teamId;
  const teamName = route.params?.teamName || 'Team';
  const userRole = route.params?.userRole || 'member';
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [isWorking, setIsWorking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const canManageMembers = userRole === 'manager' || userRole === 'lead';

  useEffect(() => {
    if (teamId) {
      loadTeamMembers();
    }
  }, [teamId]);

  const loadTeamMembers = async () => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const members = await teamsService.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteByEmail = async () => {
    if (!currentUser?.email || !teamId || !inviteEmail.trim()) return;
    setIsWorking(true);
    setInviteStatus('');
    try {
      const result = await teamsService.inviteByEmail(teamId, currentUser.id, inviteEmail, memberRole);
      if (result.success) {
        setInviteStatus(t('inviteSent') || 'Invitation sent.');
        setInviteEmail('');
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteStatus('');
        }, 1500);
      } else {
        setInviteStatus(result.error || 'Error sending invitation');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      setInviteStatus('Error sending invitation');
    } finally {
      setIsWorking(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!teamId || !userId) return;
    setIsWorking(true);
    try {
      const result = await teamsService.removeMember(teamId, userId);
      if (result.success) {
        await loadTeamMembers();
      }
    } catch (error) {
      console.error('Error removing member:', error);
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
        <Text style={styles.headerTitle}>{teamName} - {t('teamMembers')}</Text>
        {canManageMembers && (
          <TouchableOpacity 
            style={styles.inviteButton}
            onPress={() => setShowInviteModal(true)}
          >
            <Ionicons name="person-add" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          <View style={styles.membersList}>
            {teamMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={colors.textMuted} />
                <Text style={styles.emptyText}>{t('noMembers') || 'No members found'}</Text>
              </View>
            ) : (
              teamMembers.map(member => (
                <View key={member.userId} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.user.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.user.name}</Text>
                    <Text style={styles.memberMeta}>
                      {member.user.email} • {member.role}
                    </Text>
                  </View>
                  {canManageMembers && member.userId !== currentUser?.id && (
                    <TouchableOpacity 
                      onPress={() => handleRemoveMember(member.userId)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="remove-circle-outline" size={22} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Invite Member Modal */}
      <Modal visible={showInviteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('inviteMembers') || 'Invite Members'}</Text>
            <Text style={styles.inputLabel}>{t('inviteEmail') || 'Email address'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('inviteEmailPlaceholder') || 'name@company.com'}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={styles.inputLabel}>{t('role') || 'Role'}</Text>
            <View style={styles.roleRow}>
              {['member', 'lead', 'manager'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleChip,
                    memberRole === role && styles.roleChipActive,
                  ]}
                  onPress={() => setMemberRole(role)}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      memberRole === role && styles.roleChipTextActive,
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {!!inviteStatus && (
              <Text style={[styles.inviteStatus, inviteStatus.includes('Error') && styles.inviteStatusError]}>
                {inviteStatus}
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteStatus('');
                }}
              >
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleInviteByEmail}
                disabled={isWorking || !inviteEmail.trim()}
              >
                {isWorking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>{t('sendInvite') || 'Send Invite'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  inviteButton: {
    padding: 4,
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
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.soft,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  memberMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  removeButton: {
    padding: 4,
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
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  roleChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  inviteStatus: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  inviteStatusError: {
    color: colors.danger,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
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
