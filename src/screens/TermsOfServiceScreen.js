import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows } from '../utils/theme';

const isWeb = Platform.OS === 'web';

export default function TermsOfServiceScreen() {
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
          <Text style={styles.headerTitle}>{t('termsOfService') || 'Terms of Service'}</Text>
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
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing or using TeamLink, you agree to be bound by these Terms of Service and all applicable laws
              and regulations. If you do not agree with these terms, you must not use the service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Use of the Service</Text>
            <Text style={styles.paragraph}>
              TeamLink is a team collaboration and workforce management platform. You agree to use the service only for
              lawful purposes and in accordance with these Terms.
            </Text>
            <Text style={styles.subsectionTitle}>User obligations:</Text>
            <Text style={styles.bulletPoint}>• Provide accurate and complete information</Text>
            <Text style={styles.bulletPoint}>• Keep your login credentials secure</Text>
            <Text style={styles.bulletPoint}>• Respect other users and maintain professional conduct</Text>
            <Text style={styles.bulletPoint}>
              • Not use the service for any illegal, harmful, or unauthorized activity
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Account Responsibility</Text>
            <Text style={styles.paragraph}>
              You are responsible for all activity that occurs under your account. If you suspect unauthorized access,
              you must notify your administrator or support as soon as possible.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. User Content</Text>
            <Text style={styles.paragraph}>
              You retain ownership of the content you create or upload to TeamLink. By using the service, you grant us
              a limited license to store, process, and display that content as needed to operate the platform.
            </Text>
            <Text style={styles.paragraph}>
              You are responsible for ensuring that your content does not violate any laws or third‑party rights.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The TeamLink platform, including its design, code, and branding, is protected by intellectual property
              laws. You may not copy, modify, reverse engineer, or create derivative works of any part of the service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Service Availability</Text>
            <Text style={styles.paragraph}>
              We aim to keep TeamLink available and reliable, but we cannot guarantee uninterrupted or error‑free
              operation. We may modify, suspend, or discontinue features or the service at any time.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              To the fullest extent permitted by law, TeamLink will not be liable for any indirect, incidental, special,
              or consequential damages arising out of or in connection with your use of the service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Termination</Text>
            <Text style={styles.paragraph}>
              We may suspend or terminate your access to TeamLink if you violate these Terms or use the service in a
              way that may cause harm. You may also stop using the service at any time and request that your account be
              closed.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Changes to These Terms</Text>
            <Text style={styles.paragraph}>
              We may update these Terms from time to time. If we make material changes, we will update the &quot;Last
              Updated&quot; date and, where appropriate, notify you in the app. Continued use of the service after
              changes means you accept the updated Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms will be governed by applicable law in your region, without regard to conflict of law rules.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Contact</Text>
            <Text style={styles.paragraph}>
              If you have questions about these Terms of Service, please contact your organization&apos;s administrator
              or reach out through the in‑app support options.
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
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
