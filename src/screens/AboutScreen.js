import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows } from '../utils/theme';

const isWeb = Platform.OS === 'web';

export default function AboutScreen() {
  const { theme } = useAppState();
  const { colors } = theme;
  const navigation = useNavigation();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const features = [
    {
      icon: 'people',
      title: 'Team Collaboration',
      description:
        'Create and manage teams, invite members, and collaborate seamlessly with your colleagues.',
    },
    {
      icon: 'checkmark-circle',
      title: 'Task Management',
      description:
        'Organize individual and team tasks with priorities, due dates, and status tracking.',
    },
    {
      icon: 'time',
      title: 'Time Clock',
      description:
        'Track work hours with GPS location and optional photo verification for accurate timekeeping.',
    },
    {
      icon: 'calendar',
      title: 'Schedule Management',
      description:
        'View and manage your work schedule, recurring events, and team calendars in one place.',
    },
    {
      icon: 'chatbubble',
      title: 'Team Messaging',
      description: 'Communicate with your team through real-time messaging and updates.',
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      description:
        'Stay informed with real-time notifications about tasks, messages, time clock events, and team activity.',
    },
    {
      icon: 'document-text',
      title: 'Updates',
      description: 'Share and receive important team updates and announcements.',
    },
    {
      icon: 'bulb',
      title: 'Daily Motivation',
      description:
        'Get inspired with daily motivational quotes and personalized messages configured by your team.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('about') || 'About'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        bounces={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          {/* App Info */}
          <View style={styles.appInfoCard}>
            <View style={styles.appIconContainer}>
              <Ionicons name="people-circle" size={64} color={colors.primary} />
            </View>
            <Text style={styles.appName}>TeamLink</Text>
            <Text style={styles.appVersion}>Version 1.1</Text>
            <Text style={styles.appDescription}>
              TeamLink is a team collaboration and workforce management platform that helps teams stay
              organized, communicate clearly, and track work in one place. Manage tasks, schedules, time
              tracking, and updates without bouncing between different tools.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('features') || 'Features'}</Text>
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={[styles.featureIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <Ionicons name={feature.icon} size={28} color={colors.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('additionalInformation') || 'Additional Information'}
            </Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                TeamLink is available on iOS, Android, and Web so you and your team can access your
                workspace from anywhere.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Your data is stored in a secure, cloud‑hosted database with access control and encryption.
                We prioritize privacy and security in every new feature we ship.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                For support, questions, or feedback, contact your organization&apos;s administrator or use
                the in‑app support options.
              </Text>
            </View>
          </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      cursor: 'default',
      overscrollBehavior: 'contain',
      height: '100%',
      maxHeight: '100vh',
      scrollbarWidth: 'thin',
    }),
  },
  scrollContent: {
    paddingBottom: 48,
    ...(Platform.OS === 'web' && {
      paddingTop: 16,
    }),
  },
  content: {
    width: '100%',
    padding: 20,
  },
  contentWeb: {
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  appInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...shadows.card,
  },
  appIconContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.soft,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 12,
    ...shadows.soft,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
