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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { useAppState } from '../context/AppStateContext';
import { colors, radii, shadows } from '../utils/theme';
import { teamsService } from '../services/teamsService';
import { updatesService } from '../services/updatesService';
import { useNavigation } from '@react-navigation/native';

export default function TeamsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { currentUser, selectedBackground } = useAppState();
  const hasCustomBackground = selectedBackground && selectedBackground !== 'default';
  const isWeb = Platform.OS === 'web';
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamUpdates, setTeamUpdates] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamDepartment, setTeamDepartment] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinStatus, setJoinStatus] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [currentUser]);

  useEffect(() => {
    if (selectedTeamId) {
      loadTeamDetails(selectedTeamId);
    }
  }, [selectedTeamId]);

  useEffect(() => {
    loadInvites();
  }, [currentUser]);

  const selectedTeam = useMemo(
    () => teams.find(team => team.id === selectedTeamId),
    [teams, selectedTeamId]
  );
  const isManager = selectedTeam?.role === 'manager';
  const canManageMembers = selectedTeam?.role === 'manager' || selectedTeam?.role === 'lead';

  const loadTeams = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      const userTeams = await teamsService.getUserTeams(currentUser.id);
      setTeams(userTeams);
      if (userTeams.length > 0) {
        setSelectedTeamId(prev => prev || userTeams[0].id);
      } else {
        setSelectedTeamId(null);
        setTeamMembers([]);
        setTeamUpdates([]);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamDetails = async (teamId) => {
    if (!teamId) return;
    try {
      const members = await teamsService.getTeamMembers(teamId);
      setTeamMembers(members);
      const updates = await updatesService.getTeamUpdates(teamId, 3);
      setTeamUpdates(updates);
      const activeTeam = teams.find(team => team.id === teamId);
      if (activeTeam?.role === 'manager' || activeTeam?.role === 'lead') {
        const pending = await teamsService.getJoinRequests(teamId);
        setJoinRequests(pending);
      } else {
        setJoinRequests([]);
      }
    } catch (error) {
      console.error('Error loading team details:', error);
    }
  };

  const loadInvites = async () => {
    if (!currentUser?.email || !currentUser?.id) return;
    const invites = await teamsService.getPendingInvites(currentUser.email, currentUser.id);
    setPendingInvites(invites);
  };

  const resetTeamForm = () => {
    setTeamName('');
    setTeamDescription('');
    setTeamDepartment('');
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    if (!currentUser?.id) return;

    setIsWorking(true);
    try {
      const result = await teamsService.createTeam(currentUser.id, {
        name: teamName,
        description: teamDescription,
        department: teamDepartment,
      });
      if (result.success) {
        setShowCreateModal(false);
        resetTeamForm();
        await loadTeams();
        setSelectedTeamId(result.team.id);
      }
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!currentUser?.id || !joinCode.trim()) return;
    setIsWorking(true);
    try {
      const result = await teamsService.requestJoinByCode(joinCode, currentUser.id);
      if (result.success) {
        setJoinStatus(t('joinRequestSent') || 'Request sent. Waiting for approval.');
        setJoinCode('');
      }
    } catch (error) {
      console.error('Error joining team:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleInviteByEmail = async () => {
    if (!selectedTeamId || !currentUser?.id || !inviteEmail.trim()) return;
    setIsWorking(true);
    try {
      const result = await teamsService.inviteByEmail(
        selectedTeamId,
        currentUser.id,
        inviteEmail,
        memberRole
      );
      if (result.success) {
        setInviteStatus(t('inviteSent') || 'Invitation sent.');
        setInviteEmail('');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleAcceptInvite = async (invite) => {
    if (!currentUser?.id) return;
    setIsWorking(true);
    try {
      const result = await teamsService.acceptInvite(invite.id, invite.team.id, currentUser.id, invite.role);
      if (result.success) {
        await loadInvites();
        await loadTeams();
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    setIsWorking(true);
    try {
      const result = await teamsService.declineInvite(inviteId);
      if (result.success) {
        await loadInvites();
      }
    } catch (error) {
      console.error('Error declining invite:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleApproveRequest = async (request) => {
    if (!selectedTeamId) return;
    setIsWorking(true);
    try {
      const result = await teamsService.approveJoinRequest(request.id, selectedTeamId, request.userId);
      if (result.success) {
        await loadTeamDetails(selectedTeamId);
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
      if (result.success && selectedTeamId) {
        await loadTeamDetails(selectedTeamId);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleInviteMember = async (userId) => {
    if (!currentUser?.id || !selectedTeamId || !userId) return;
    setIsWorking(true);
    try {
      const result = await teamsService.addMember(selectedTeamId, userId, memberRole);
      if (result.success) {
        await loadTeamDetails(selectedTeamId);
        setInviteQuery('');
        setInviteResults([]);
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedTeamId || !userId) return;
    setIsWorking(true);
    try {
      const result = await teamsService.removeMember(selectedTeamId, userId);
      if (result.success) {
        await loadTeamDetails(selectedTeamId);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeamId || !teamName.trim()) return;
    setIsWorking(true);
    try {
      const result = await teamsService.updateTeam(selectedTeamId, {
        name: teamName,
        description: teamDescription,
        department: teamDepartment,
      });
      if (result.success) {
        setShowEditModal(false);
        await loadTeams();
      }
    } catch (error) {
      console.error('Error updating team:', error);
    } finally {
      setIsWorking(false);
    }
  };

  const openEditTeam = () => {
    if (!selectedTeam) return;
    setTeamName(selectedTeam.name || '');
    setTeamDescription(selectedTeam.description || '');
    setTeamDepartment(selectedTeam.department || '');
    setShowEditModal(true);
  };

  const formatDate = (date) => {
    const value = new Date(date);
    return value.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, hasCustomBackground && styles.containerTransparent]} edges={['top']}>
      <ScrollView
        style={[styles.scrollView, hasCustomBackground && styles.scrollViewTransparent]}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb, hasCustomBackground && styles.contentTransparent]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('teams')}</Text>
              <Text style={styles.subtitle}>{t('teamsOverview') || 'Build and manage your team workspace'}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : teams.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={80} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>{t('teams')}</Text>
                <Text style={styles.emptySubtitle}>
                  {t('teamsDescription') || 'Create or join a team to collaborate with your colleagues'}
                </Text>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.createButton]}
                    onPress={() => setShowCreateModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle" size={24} color="#fff" />
                    <Text style={styles.buttonText}>{t('createTeam')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.joinButton]}
                    onPress={() => setShowJoinModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-add" size={24} color="#fff" />
                    <Text style={styles.buttonText}>{t('joinTeam')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.teamsContent}>
          {pendingInvites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('invitations') || 'Invitations'}</Text>
              <View style={styles.requestsList}>
                {pendingInvites.map(invite => (
                  <View key={invite.id} style={styles.requestCard}>
                    <View>
                      <Text style={styles.searchTitle}>{invite.team?.name || 'Team'}</Text>
                      <Text style={styles.searchSubtitle}>
                        {invite.inviter?.name || 'Manager'} • {invite.role}
                      </Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={[styles.requestButton, styles.requestApprove]}
                        onPress={() => handleAcceptInvite(invite)}
                      >
                        <Text style={styles.requestButtonText}>{t('accept') || 'Accept'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.requestButton, styles.requestReject]}
                        onPress={() => handleDeclineInvite(invite.id)}
                      >
                        <Text style={styles.requestButtonText}>{t('decline') || 'Decline'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('myTeams') || 'My Teams'}</Text>
            <View style={styles.teamList}>
              {teams.map(team => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.teamCard,
                    selectedTeamId === team.id && styles.teamCardActive,
                  ]}
                  onPress={() => setSelectedTeamId(team.id)}
                >
                  <View style={styles.teamCardHeader}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <View style={styles.teamRoleBadge}>
                      <Text style={styles.teamRoleText}>{team.role}</Text>
                    </View>
                  </View>
                  {!!team.department && (
                    <Text style={styles.teamDepartment}>{team.department}</Text>
                  )}
                  <Text style={styles.teamDescription} numberOfLines={2}>
                    {team.description || t('teamDescriptionFallback') || 'Team workspace'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedTeam && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{t('teamDashboard') || 'Team Dashboard'}</Text>
                  {isManager && (
                    <TouchableOpacity style={styles.linkButton} onPress={openEditTeam}>
                      <Ionicons name="create-outline" size={16} color={colors.primary} />
                      <Text style={styles.linkButtonText}>{t('edit')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.dashboardCard}>
                  <View style={styles.dashboardHeader}>
                    <Text style={styles.dashboardTitle}>{selectedTeam.name}</Text>
                    <TouchableOpacity
                      style={styles.dashboardAction}
                      onPress={() => navigation.navigate('Chat', { teamId: selectedTeam.id })}
                    >
                      <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                      <Text style={styles.dashboardActionText}>{t('teamChat') || 'Team Chat'}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.dashboardSubtitle}>
                    {selectedTeam.description || t('teamDescriptionFallback') || 'Team workspace'}
                  </Text>
                  {selectedTeam.teamCode && (
                    <View style={styles.teamCodeRow}>
                      <Text style={styles.teamCodeLabel}>{t('teamCode') || 'Team Code'}:</Text>
                      <Text style={styles.teamCodeValue}>{selectedTeam.teamCode}</Text>
                    </View>
                  )}
                  <View style={styles.dashboardStats}>
                    <View style={styles.statPill}>
                      <Text style={styles.statValue}>{teamMembers.length}</Text>
                      <Text style={styles.statLabel}>{t('members') || 'Members'}</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statValue}>{teamUpdates.length}</Text>
                      <Text style={styles.statLabel}>{t('updates') || 'Updates'}</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statValue}>{selectedTeam.role}</Text>
                      <Text style={styles.statLabel}>{t('role') || 'Role'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{t('teamMembers') || 'Team Members'}</Text>
                  {canManageMembers && (
                    <TouchableOpacity style={styles.linkButton} onPress={() => setShowInviteModal(true)}>
                      <Ionicons name="person-add" size={16} color={colors.primary} />
                      <Text style={styles.linkButtonText}>{t('inviteMembers') || 'Invite'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.membersList}>
                  {teamMembers.map(member => (
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
                        <TouchableOpacity onPress={() => handleRemoveMember(member.userId)}>
                          <Ionicons name="remove-circle-outline" size={22} color={colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {isManager && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{t('joinRequests') || 'Join Requests'}</Text>
                  </View>
                  <View style={styles.requestsList}>
                    {joinRequests.length === 0 ? (
                      <View style={styles.emptyUpdates}>
                        <Text style={styles.emptyUpdatesText}>{t('noJoinRequests') || 'No pending requests'}</Text>
                      </View>
                    ) : (
                      joinRequests.map(request => (
                        <View key={request.id} style={styles.requestCard}>
                          <View>
                            <Text style={styles.searchTitle}>{request.user?.name || 'User'}</Text>
                            <Text style={styles.searchSubtitle}>{request.user?.email || ''}</Text>
                          </View>
                          <View style={styles.requestActions}>
                            <TouchableOpacity
                              style={[styles.requestButton, styles.requestApprove]}
                              onPress={() => handleApproveRequest(request)}
                            >
                              <Text style={styles.requestButtonText}>{t('approve') || 'Approve'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.requestButton, styles.requestReject]}
                              onPress={() => handleRejectRequest(request.id)}
                            >
                              <Text style={styles.requestButtonText}>{t('reject') || 'Reject'}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{t('recentUpdates') || 'Recent Updates'}</Text>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Updates')}
                  >
                    <Text style={styles.linkButtonText}>{t('viewAll') || 'View All'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.updatesList}>
                  {teamUpdates.length === 0 ? (
                    <View style={styles.emptyUpdates}>
                      <Text style={styles.emptyUpdatesText}>{t('noUpdates')}</Text>
                    </View>
                  ) : (
                    teamUpdates.map(update => (
                      <View key={update.id} style={styles.updateCard}>
                        <View style={styles.updateHeader}>
                          <Text style={styles.updateTitle}>{update.title}</Text>
                          <Text style={styles.updateDate}>{formatDate(update.createdAt)}</Text>
                        </View>
                        <Text style={styles.updateContent} numberOfLines={2}>
                          {update.content}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </>
          )}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('createTeam')}</Text>
            <Text style={styles.inputLabel}>{t('teamName') || 'Team Name'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('teamName') || 'Team name'}
              value={teamName}
              onChangeText={setTeamName}
            />
            <Text style={styles.inputLabel}>{t('teamDescription') || 'Team Description'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('teamDescription') || 'Description'}
              value={teamDescription}
              onChangeText={setTeamDescription}
            />
            <Text style={styles.inputLabel}>{t('department') || 'Department'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('department') || 'Department'}
              value={teamDepartment}
              onChangeText={setTeamDepartment}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setShowCreateModal(false);
                  resetTeamForm();
                }}
              >
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleCreateTeam}
                disabled={isWorking}
              >
                <Text style={styles.modalSaveText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('editTeam') || 'Edit Team'}</Text>
            <Text style={styles.inputLabel}>{t('teamName') || 'Team Name'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('teamName') || 'Team name'}
              value={teamName}
              onChangeText={setTeamName}
            />
            <Text style={styles.inputLabel}>{t('teamDescription') || 'Team Description'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('teamDescription') || 'Description'}
              value={teamDescription}
              onChangeText={setTeamDescription}
            />
            <Text style={styles.inputLabel}>{t('department') || 'Department'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('department') || 'Department'}
              value={teamDepartment}
              onChangeText={setTeamDepartment}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleUpdateTeam}
                disabled={isWorking}
              >
                <Text style={styles.modalSaveText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('joinTeam')}</Text>
            <Text style={styles.inputLabel}>{t('teamCode') || 'Team Code'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterTeamCode') || 'Enter team code'}
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
            />
            {!!joinStatus && <Text style={styles.joinStatus}>{joinStatus}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                  setJoinStatus('');
                }}
              >
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleJoinByCode}
                disabled={isWorking}
              >
                <Text style={styles.modalSaveText}>{t('requestToJoin') || 'Request to Join'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            {!!inviteStatus && <Text style={styles.joinStatus}>{inviteStatus}</Text>}
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
                disabled={isWorking}
              >
                <Text style={styles.modalSaveText}>{t('sendInvite') || 'Send Invite'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textMuted,
    maxWidth: 220,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  teamList: {
    gap: 12,
  },
  teamCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  teamCardActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  teamRoleBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  teamRoleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  teamDepartment: {
    fontSize: 13,
    color: colors.textMuted,
  },
  teamDescription: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
  },
  dashboardCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    ...shadows.card,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  dashboardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dashboardActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  dashboardSubtitle: {
    marginTop: 8,
    color: colors.textMuted,
  },
  teamCodeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamCodeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  teamCodeValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dashboardStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    ...shadows.soft,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#fff',
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  memberMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  updatesList: {
    gap: 12,
  },
  updateCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    ...shadows.soft,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  updateDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  updateContent: {
    marginTop: 6,
    color: colors.textMuted,
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    ...shadows.soft,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  requestApprove: {
    backgroundColor: colors.primary,
  },
  requestReject: {
    backgroundColor: colors.danger,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyUpdates: {
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  emptyUpdatesText: {
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 24,
    ...shadows.card,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: radii.lg,
    gap: 10,
    ...shadows.soft,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  joinButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 10,
    color: colors.text,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
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
  searchList: {
    maxHeight: 220,
    marginTop: 8,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  searchSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  searchAction: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  searchActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptySearchText: {
    textAlign: 'center',
    paddingVertical: 12,
    color: colors.textMuted,
  },
  joinStatus: {
    marginTop: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 6,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  roleChipActive: {
    backgroundColor: `${colors.primary}20`,
  },
  roleChipText: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  roleChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
