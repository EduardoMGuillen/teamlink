import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../utils/theme';
import { useTranslation } from '../utils/useTranslation';

export default function LandingScreen() {
  const navigation = useNavigation();
  const { t, language, changeLanguage, availableLanguages } = useTranslation();
  const isWeb = Platform.OS === 'web';
  const { width } = Dimensions.get('window');
  const isWide = width >= 1024;
  const isCompact = width < 768;

  return (
    <View style={styles.container}>
      <View style={[styles.header, isCompact && styles.headerCompact]}>
        <View style={styles.brandRow}>
          {isWeb ? (
            <Image source={require('../../logo.png')} style={styles.logoImage} />
          ) : (
            <View style={styles.logoDot} />
          )}
          <Text style={styles.brand}>TeamLink</Text>
        </View>
        <View style={[styles.headerActions, isCompact && styles.headerActionsCompact]}>
          <View style={styles.languageSelector}>
            {availableLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  language === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === lang.code && styles.languageButtonTextActive,
                  ]}
                >
                  {lang.code.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.authActions}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.headerLink}>{t('login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.headerButtonText}>{t('signUp')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.heroBadgeText}>Workforce OS</Text>
            </View>
            <Text style={styles.heroTitle}>
              The modern workspace for teams that move fast
            </Text>
            <Text style={styles.heroSubtitle}>
              TeamLink brings schedules, tasks, teams, and messaging into one
              beautiful hub. Built for growing companies that need clarity,
              speed, and alignment every day.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.primaryCta}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.primaryCtaText}>Start free</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryCta}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.secondaryCtaText}>{t('login')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.trustRow}>
              <Text style={styles.trustText}>Trusted by teams in</Text>
              <View style={styles.trustPills}>
                <View style={styles.trustPill}>
                  <Text style={styles.trustPillText}>Operations</Text>
                </View>
                <View style={styles.trustPill}>
                  <Text style={styles.trustPillText}>Retail</Text>
                </View>
                <View style={styles.trustPill}>
                  <Text style={styles.trustPillText}>Field Services</Text>
                </View>
                <View style={styles.trustPill}>
                  <Text style={styles.trustPillText}>Hospitality</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.heroCard}>
            <Text style={styles.heroCardTitle}>Today at a glance</Text>
            <View style={styles.heroCardRow}>
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricLabel}>Active teams</Text>
                <Text style={styles.heroMetricValue}>12</Text>
              </View>
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricLabel}>Tasks done</Text>
                <Text style={styles.heroMetricValue}>34</Text>
              </View>
            </View>
            <View style={styles.heroCardRow}>
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricLabel}>Events</Text>
                <Text style={styles.heroMetricValue}>5</Text>
              </View>
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricLabel}>Messages</Text>
                <Text style={styles.heroMetricValue}>128</Text>
              </View>
            </View>
            <View style={styles.heroCardFooter}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={styles.heroCardFooterText}>
                Planner keeps everyone aligned in real time
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
          <View style={styles.featureCard}>
            <Ionicons name="calendar" size={22} color={colors.primary} />
            <Text style={styles.featureTitle}>Planner that stays accurate</Text>
            <Text style={styles.featureText}>
              Keep schedules, recurring shifts, and events perfectly aligned
              across every device.
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            <Text style={styles.featureTitle}>Tasks your team completes</Text>
            <Text style={styles.featureText}>
              Assign, track, and close tasks with clarity, ownership, and
              momentum.
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="chatbubbles" size={22} color="#A855F7" />
            <Text style={styles.featureTitle}>Conversations in context</Text>
            <Text style={styles.featureText}>
              One-on-one and team chat keep decisions connected to the work.
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Everything your team uses daily</Text>
          <Text style={styles.sectionSubheading}>
            Built-in tools for planning, delivery, collaboration, and team focus.
          </Text>
          <View style={[styles.stackGrid, isWide && styles.stackGridWide]}>
            <View style={styles.stackItem}>
              <Ionicons name="sparkles" size={20} color={colors.accent} />
              <Text style={styles.stackTitle}>Daily Motivation</Text>
              <Text style={styles.stackText}>
                Spark keeps teams aligned with daily focus prompts and
                configurable notifications.
              </Text>
            </View>
            <View style={styles.stackItem}>
              <Ionicons name="people" size={20} color="#22C55E" />
              <Text style={styles.stackTitle}>Teams & Approvals</Text>
              <Text style={styles.stackText}>
                Create teams, approve join requests, and invite members by
                email with role control.
              </Text>
            </View>
            <View style={styles.stackItem}>
              <Ionicons name="color-palette" size={20} color="#0EA5E9" />
              <Text style={styles.stackTitle}>Custom Backgrounds</Text>
              <Text style={styles.stackText}>
                Personalize the workspace with curated backgrounds from
                Settings.
              </Text>
            </View>
            <View style={styles.stackItem}>
              <Ionicons name="notifications" size={20} color="#F97316" />
              <Text style={styles.stackTitle}>Updates & Alerts</Text>
              <Text style={styles.stackText}>
                Broadcast updates and keep every team member in sync.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>How TeamLink works</Text>
          <View style={styles.steps}>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>01</Text>
              <Text style={styles.stepTitle}>Create your workspace</Text>
              <Text style={styles.stepText}>
                Set up your team, define roles, and invite members instantly.
              </Text>
            </View>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>02</Text>
              <Text style={styles.stepTitle}>Plan the week</Text>
              <Text style={styles.stepText}>
                Use Planner to schedule events, shifts, and recurring schedules.
              </Text>
            </View>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>03</Text>
              <Text style={styles.stepTitle}>Execute with clarity</Text>
              <Text style={styles.stepText}>
                Track tasks, chat with members, and keep progress visible.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.ctaBanner}>
          <View>
            <Text style={styles.ctaTitle}>Ready to bring your team together?</Text>
            <Text style={styles.ctaSubtitle}>
              Launch TeamLink in minutes and stay in sync from day one.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.bannerButtonText}>Create your workspace</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} TeamLink</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  brand: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerActionsCompact: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  languageButtonActive: {
    backgroundColor: `${colors.primary}20`,
  },
  languageButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  languageButtonTextActive: {
    color: colors.primary,
  },
  authActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  headerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  contentWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  hero: {
    gap: 24,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  heroContent: {
    flex: 1,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 30,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    lineHeight: Platform.OS === 'web' ? 42 : 38,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
    lineHeight: 24,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  primaryCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadows.soft,
  },
  primaryCtaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryCta: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  secondaryCtaText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  trustRow: {
    marginTop: 18,
  },
  trustText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  trustPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trustPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  trustPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  heroCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  heroCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  heroCardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  heroMetric: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: radii.md,
  },
  heroMetricLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  heroMetricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  heroCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  heroCardFooterText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  featureGrid: {
    marginTop: 32,
    gap: 16,
  },
  featureGridWide: {
    flexDirection: 'row',
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  featureText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  ctaBanner: {
    marginTop: 32,
    padding: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionBlock: {
    marginTop: 32,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubheading: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  stackGrid: {
    gap: 14,
  },
  stackGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stackItem: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  stackTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  stackText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  steps: {
    gap: 14,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  stepTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  stepText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  ctaSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
    marginTop: 6,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  bannerButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
