import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows } from '../utils/theme';

export default function PrivacyPolicyScreen() {
  const { theme } = useAppState();
  const { colors } = theme;
  const navigation = useNavigation();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('privacyPolicy') || 'Privacy Policy'}</Text>
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
          <Text style={styles.lastUpdated}>
            {t('lastUpdated') || 'Last Updated'}: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
              TeamLink collects only the information needed to provide and improve the service. This may include:
            </Text>
            <Text style={styles.bulletPoint}>• Personal information (name, email, phone number)</Text>
            <Text style={styles.bulletPoint}>• Work information (department, role, teams you belong to)</Text>
            <Text style={styles.bulletPoint}>• Usage data (tasks, schedules, time clock entries, messages)</Text>
            <Text style={styles.bulletPoint}>
              • Location data (only when you use Time Clock features that request your location)
            </Text>
            <Text style={styles.bulletPoint}>• Device information (platform, app version)</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>We use your information to:</Text>
            <Text style={styles.bulletPoint}>• Provide and maintain the TeamLink service</Text>
            <Text style={styles.bulletPoint}>• Personalize your experience and improve product quality</Text>
            <Text style={styles.bulletPoint}>• Communicate with you about your account and updates</Text>
            <Text style={styles.bulletPoint}>• Enable collaboration between you and your team members</Text>
            <Text style={styles.bulletPoint}>• Comply with legal, accounting, and security obligations</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Sharing and Disclosure</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal data. We share information only in the following limited situations:
            </Text>
            <Text style={styles.bulletPoint}>
              • With team members and administrators in your organization, so they can collaborate with you
            </Text>
            <Text style={styles.bulletPoint}>
              • With infrastructure and analytics providers who help us run TeamLink, under strict confidentiality
              agreements
            </Text>
            <Text style={styles.bulletPoint}>
              • When required by law, or when we need to protect the rights, property, or safety of users or the
              service
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We use encryption, access controls, and secure infrastructure to protect your data. While no online
              service can be 100% secure, we continuously improve our safeguards to reduce risk.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Your Rights and Choices</Text>
            <Text style={styles.paragraph}>Depending on your region, you may have the right to:</Text>
            <Text style={styles.bulletPoint}>• Access and review the personal information we hold about you</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate or incomplete information</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your account and associated data</Text>
            <Text style={styles.bulletPoint}>
              • Opt out of certain types of communications or data processing, where applicable
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Data Retention</Text>
            <Text style={styles.paragraph}>
              We keep your information for as long as you have an active account or as needed to provide the service.
              When your account is closed, we delete or anonymize your data within a reasonable period, unless we must
              retain it to comply with legal obligations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Children&apos;s Privacy</Text>
            <Text style={styles.paragraph}>
              TeamLink is not directed to children under 13, and we do not knowingly collect personal information from
              children under 13. If we learn that such data has been collected, we will delete it.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may occasionally update this Privacy Policy. When we make material changes, we will update the
              &quot;Last Updated&quot; date at the top of this page and, where appropriate, notify you through the app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact</Text>
            <Text style={styles.paragraph}>
              If you have questions about this Privacy Policy or how we handle your data, please contact your
              organization&apos;s administrator or reach out through the support options available in the app.
            </Text>
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
  lastUpdated: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
});
