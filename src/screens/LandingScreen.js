import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../utils/theme';
import { useTranslation } from '../utils/useTranslation';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;

export default function LandingScreen() {
  const navigation = useNavigation();
  const { t, language, changeLanguage, availableLanguages } = useTranslation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setShowLanguageDropdown(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile, isWeb && styles.headerWeb]}>
        <View style={styles.brandRow}>
          <Image 
            source={require('../../logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brand}>TeamLink</Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* Language Selector */}
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Ionicons name="globe-outline" size={18} color={colors.text} />
              <Text style={styles.languageText}>
                {availableLanguages.find(l => l.code === language)?.name || 'EN'}
              </Text>
              <Ionicons 
                name={showLanguageDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
            
            {showLanguageDropdown && (
              <View style={styles.languageDropdown}>
                {availableLanguages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageOption,
                      language === lang.code && styles.languageOptionActive
                    ]}
                    onPress={() => handleLanguageSelect(lang.code)}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      language === lang.code && styles.languageOptionTextActive
                    ]}>
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Auth Buttons */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, isMobile && styles.heroSectionMobile]}>
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.badgeText}>Workforce OS</Text>
            </View>
            
            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              The modern workspace for teams that move fast
            </Text>
            
            <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
              TeamLink brings schedules, tasks, teams, and messaging into one beautiful hub. 
              Built for growing companies that need clarity, speed, and alignment every day.
            </Text>
            
            <View style={[styles.ctaButtons, isMobile && styles.ctaButtonsMobile]}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.primaryButtonText}>Start free</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.secondaryButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.trustSection}>
              <Text style={styles.trustText}>Trusted by teams in</Text>
              <View style={styles.trustPills}>
                {['Operations', 'Retail', 'Field Services', 'Hospitality'].map((industry) => (
                  <View key={industry} style={styles.pill}>
                    <Text style={styles.pillText}>{industry}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Dashboard Preview */}
          <View style={[styles.dashboardCard, isMobile && styles.dashboardCardMobile]}>
            <Text style={styles.dashboardTitle}>Today at a glance</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Active teams</Text>
                <Text style={styles.metricValue}>12</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Tasks done</Text>
                <Text style={styles.metricValue}>34</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Events</Text>
                <Text style={styles.metricValue}>5</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Messages</Text>
                <Text style={styles.metricValue}>128</Text>
              </View>
            </View>
            <View style={styles.dashboardFooter}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={styles.dashboardFooterText}>
                Planner keeps everyone aligned in real time
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            Everything your team needs
          </Text>
          <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
            Built-in tools for planning, delivery, collaboration, and team focus
          </Text>
          
          <View style={[styles.featuresGrid, isMobile && styles.featuresGridMobile]}>
            {[
              {
                icon: 'calendar',
                color: colors.primary,
                title: 'Planner that stays accurate',
                description: 'Keep schedules, recurring shifts, and events perfectly aligned across every device.'
              },
              {
                icon: 'checkmark-circle',
                color: colors.accent,
                title: 'Tasks your team completes',
                description: 'Assign, track, and close tasks with clarity, ownership, and momentum.'
              },
              {
                icon: 'chatbubbles',
                color: '#A855F7',
                title: 'Conversations in context',
                description: 'One-on-one and team chat keep decisions connected to the work.'
              },
              {
                icon: 'people',
                color: '#10B981',
                title: 'Teams & Approvals',
                description: 'Create teams, approve join requests, and invite members by email with role control.'
              },
              {
                icon: 'sparkles',
                color: colors.accent,
                title: 'Daily Motivation',
                description: 'Spark keeps teams aligned with daily focus prompts and configurable notifications.'
              },
              {
                icon: 'image',
                color: '#3B82F6',
                title: 'Custom Backgrounds',
                description: 'Personalize the workspace with curated backgrounds from Settings.'
              }
            ].map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <Ionicons name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Banner */}
        <View style={styles.ctaBanner}>
          <View style={styles.ctaBannerContent}>
            <Text style={styles.ctaBannerTitle}>Ready to bring your team together?</Text>
            <Text style={styles.ctaBannerSubtitle}>
              Launch TeamLink in minutes and stay in sync from day one.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ctaBannerButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.ctaBannerButtonText}>Create your workspace</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} TeamLink. All rights reserved.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isWeb ? 48 : 20,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 100,
  },
  headerWeb: {
    ...(isWeb && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
    }),
  },
  headerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  languageContainer: {
    position: 'relative',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  languageDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
    ...shadows.card,
    zIndex: 1000,
  },
  languageOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  languageOptionActive: {
    backgroundColor: `${colors.primary}15`,
  },
  languageOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  languageOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  signUpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    ...(isWeb && {
      height: 'calc(100vh - 80px)',
      overflowY: 'scroll',
      WebkitOverflowScrolling: 'touch',
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 48,
    ...(isWeb && {
      paddingTop: 80, // Space for fixed header
    }),
  },
  heroSection: {
    flexDirection: 'row',
    gap: 32,
    paddingHorizontal: isWeb ? 48 : 20,
    paddingTop: 48,
    paddingBottom: 64,
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  heroSectionMobile: {
    flexDirection: 'column',
    paddingTop: 32,
    paddingBottom: 40,
  },
  heroContent: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 56,
    marginBottom: 16,
  },
  heroTitleMobile: {
    fontSize: 32,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.textMuted,
    lineHeight: 28,
    marginBottom: 32,
  },
  heroSubtitleMobile: {
    fontSize: 16,
    lineHeight: 24,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  ctaButtonsMobile: {
    flexDirection: 'column',
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    ...shadows.soft,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  trustSection: {
    marginTop: 24,
  },
  trustText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  trustPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    maxWidth: 400,
  },
  dashboardCardMobile: {
    maxWidth: '100%',
    marginTop: 32,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metric: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceAlt,
    padding: 16,
    borderRadius: radii.md,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  dashboardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dashboardFooterText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  featuresSection: {
    paddingHorizontal: isWeb ? 48 : 20,
    paddingVertical: 64,
    backgroundColor: colors.surfaceAlt,
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionTitleMobile: {
    fontSize: 28,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 48,
  },
  sectionSubtitleMobile: {
    fontSize: 16,
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  featuresGridMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  featureCard: {
    flex: 1,
    minWidth: isMobile ? '100%' : '30%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  ctaBanner: {
    marginHorizontal: isWeb ? 48 : 20,
    marginTop: 64,
    marginBottom: 48,
    padding: 32,
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    ...shadows.card,
    ...(isWeb && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  ctaBannerContent: {
    flex: 1,
  },
  ctaBannerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  ctaBannerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  ctaBannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaBannerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: isWeb ? 48 : 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
