import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
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
  const isWeb = Platform.OS === 'web';
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          <Text style={styles.lastUpdated}>
            {t('lastUpdated') || 'Last Updated'}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. {t('informationWeCollect') || 'Information We Collect'}</Text>
            <Text style={styles.paragraph}>
              {t('privacyInfoCollection') || 'TeamLink collects information necessary to provide our services, including:'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyPersonalInfo') || 'Personal information (name, email, phone number)'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyWorkInfo') || 'Work-related information (department, role, team assignments)'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyUsageData') || 'Usage data (tasks, schedules, time clock entries, messages)'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyLocationData') || 'Location data (when using Time Clock features)'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyDeviceInfo') || 'Device information (platform, app version)'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. {t('howWeUseInfo') || 'How We Use Your Information'}</Text>
            <Text style={styles.paragraph}>
              {t('privacyUsePurpose') || 'We use your information to:'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyProvideServices') || 'Provide and maintain our services'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyImproveServices') || 'Improve and personalize your experience'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyCommunicate') || 'Communicate with you about your account and services'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyTeamCollaboration') || 'Enable team collaboration and task management'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyCompliance') || 'Comply with legal obligations'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. {t('dataSharing') || 'Data Sharing and Disclosure'}</Text>
            <Text style={styles.paragraph}>
              {t('privacySharingPolicy') || 'We do not sell your personal information. We may share your information only in the following circumstances:'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyTeamMembers') || 'With team members and administrators within your organization'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyServiceProviders') || 'With service providers who assist in operating our services (under strict confidentiality agreements)'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyLegalRequirements') || 'When required by law or to protect our rights'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. {t('dataSecurity') || 'Data Security'}</Text>
            <Text style={styles.paragraph}>
              {t('privacySecurityMeasures') || 'We implement industry-standard security measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. {t('yourRights') || 'Your Rights'}</Text>
            <Text style={styles.paragraph}>
              {t('privacyUserRights') || 'You have the right to:'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyAccessData') || 'Access and review your personal information'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyCorrectData') || 'Correct inaccurate information'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyDeleteData') || 'Request deletion of your account and data'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('privacyOptOut') || 'Opt-out of certain data processing activities'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. {t('dataRetention') || 'Data Retention'}</Text>
            <Text style={styles.paragraph}>
              {t('privacyRetentionPolicy') || 'We retain your information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal information within 30 days.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. {t('childrenPrivacy') || "Children's Privacy"}</Text>
            <Text style={styles.paragraph}>
              {t('privacyChildrenPolicy') || 'TeamLink is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. {t('changesToPolicy') || 'Changes to This Policy'}</Text>
            <Text style={styles.paragraph}>
              {t('privacyPolicyChanges') || 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. {t('contactUs') || 'Contact Us'}</Text>
            <Text style={styles.paragraph}>
              {t('privacyContact') || 'If you have questions about this Privacy Policy, please contact us through the app settings or your organization\'s administrator.'}
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
  },
  scrollContent: {
    paddingBottom: 24,
  },
  scrollContentWeb: {
    flexGrow: 1,
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
