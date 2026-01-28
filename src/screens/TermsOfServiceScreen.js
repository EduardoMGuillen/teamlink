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

export default function TermsOfServiceScreen() {
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
          <Text style={styles.headerTitle}>{t('termsOfService') || 'Terms of Service'}</Text>
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
            <Text style={styles.sectionTitle}>1. {t('acceptanceOfTerms') || 'Acceptance of Terms'}</Text>
            <Text style={styles.paragraph}>
              {t('termsAcceptance') || 'By accessing or using TeamLink, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. {t('useOfService') || 'Use of Service'}</Text>
            <Text style={styles.paragraph}>
              {t('termsUseDescription') || 'TeamLink is a team collaboration and management platform. You agree to use the service only for lawful purposes and in accordance with these Terms.'}
            </Text>
            <Text style={styles.subsectionTitle}>
              {t('userObligations') || 'User Obligations:'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('termsProvideAccurateInfo') || 'Provide accurate and complete information'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('termsMaintainSecurity') || 'Maintain the security of your account credentials'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('termsRespectOthers') || 'Respect other users and maintain professional conduct'}
            </Text>
            <Text style={styles.bulletPoint}>
              • {t('termsNoIllegalActivity') || 'Not use the service for any illegal or unauthorized purpose'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. {t('accountResponsibility') || 'Account Responsibility'}</Text>
            <Text style={styles.paragraph}>
              {t('termsAccountResponsibility') || 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. {t('userContent') || 'User Content'}</Text>
            <Text style={styles.paragraph}>
              {t('termsUserContent') || 'You retain ownership of any content you create or upload to TeamLink. By using the service, you grant TeamLink a license to use, store, and display your content as necessary to provide the service.'}
            </Text>
            <Text style={styles.paragraph}>
              {t('termsContentStandards') || 'You agree not to upload content that is illegal, harmful, threatening, abusive, or violates any third-party rights.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. {t('intellectualProperty') || 'Intellectual Property'}</Text>
            <Text style={styles.paragraph}>
              {t('termsIPRights') || 'The TeamLink service, including its design, features, and functionality, is owned by TeamLink and protected by intellectual property laws. You may not copy, modify, or create derivative works of the service.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. {t('serviceAvailability') || 'Service Availability'}</Text>
            <Text style={styles.paragraph}>
              {t('termsAvailability') || 'We strive to provide reliable service but do not guarantee uninterrupted or error-free operation. We reserve the right to modify, suspend, or discontinue any part of the service at any time.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. {t('limitationOfLiability') || 'Limitation of Liability'}</Text>
            <Text style={styles.paragraph}>
              {t('termsLiability') || 'To the maximum extent permitted by law, TeamLink shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. {t('termination') || 'Termination'}</Text>
            <Text style={styles.paragraph}>
              {t('termsTermination') || 'We reserve the right to terminate or suspend your account at any time for violation of these Terms or for any other reason. You may also terminate your account at any time through the app settings.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. {t('changesToTerms') || 'Changes to Terms'}</Text>
            <Text style={styles.paragraph}>
              {t('termsChanges') || 'We may update these Terms of Service from time to time. Continued use of the service after changes constitutes acceptance of the new terms.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. {t('governingLaw') || 'Governing Law'}</Text>
            <Text style={styles.paragraph}>
              {t('termsGoverningLaw') || 'These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. {t('contactUs') || 'Contact Us'}</Text>
            <Text style={styles.paragraph}>
              {t('termsContact') || 'If you have questions about these Terms of Service, please contact us through the app settings or your organization\'s administrator.'}
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
    flexGrow: 0,
  },
  scrollContentWeb: {
    paddingBottom: 24,
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
