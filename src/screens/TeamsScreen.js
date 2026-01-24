import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/useTranslation';
import { colors, radii, shadows } from '../utils/theme';

export default function TeamsScreen() {
  const { t } = useTranslation();

  const handleCreateTeam = () => {
    // TODO: Implement create team functionality
    console.log('Create team');
  };

  const handleJoinTeam = () => {
    // TODO: Implement join team functionality
    console.log('Join team');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('teams')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={80} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('teams')}</Text>
          <Text style={styles.emptySubtitle}>{t('teamsDescription') || 'Create or join a team to collaborate with your colleagues'}</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreateTeam}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>{t('createTeam')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.joinButton]}
              onPress={handleJoinTeam}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add" size={24} color="#fff" />
              <Text style={styles.buttonText}>{t('joinTeam')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
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
});
