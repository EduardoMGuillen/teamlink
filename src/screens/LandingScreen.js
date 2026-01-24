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
        <View style={[styles.brandRow, isMobile && styles.brandRowMobile]}>
          <Image 
            source={require('../../logo.png')} 
            style={[styles.logo, isMobile && styles.logoMobile]}
            resizeMode="contain"
          />
          {!isMobile && <Text style={styles.brand}>TeamLink</Text>}
        </View>
        
        <View style={[styles.headerRight, isMobile && styles.headerRightMobile]}>
          {/* Language Selector */}
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[styles.languageButton, isMobile && styles.languageButtonMobile]}
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Ionicons name="globe-outline" size={isMobile ? 16 : 18} color={colors.text} />
              {!isMobile && (
                <Text style={[styles.languageText, isMobile && styles.languageTextMobile]}>
                  {availableLanguages.find(l => l.code === language)?.name || 'EN'}
                </Text>
              )}
              <Ionicons 
                name={showLanguageDropdown ? "chevron-up" : "chevron-down"} 
                size={isMobile ? 14 : 16} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
            
            {showLanguageDropdown && (
              <View style={[styles.languageDropdown, isMobile && styles.languageDropdownMobile]}>
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
            style={[styles.loginButton, isMobile && styles.loginButtonMobile]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.loginButtonText, isMobile && styles.loginButtonTextMobile]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.signUpButton, isMobile && styles.signUpButtonMobile]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={[styles.signUpButtonText, isMobile && styles.signUpButtonTextMobile]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, isMobile && styles.heroSectionMobile]}>
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.badgeText}>{t('landingWorkforceOS')}</Text>
            </View>
            
            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              {t('landingHeroTitle')}
            </Text>
            
            <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
              {t('landingHeroSubtitle')}
            </Text>
            
            <View style={[styles.ctaButtons, isMobile && styles.ctaButtonsMobile]}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.primaryButtonText}>{t('landingStartFree')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.secondaryButtonText}>{t('login')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.trustSection}>
              <Text style={styles.trustText}>{t('landingTrustedBy')}</Text>
              <View style={styles.trustPills}>
                {[t('landingOperations'), t('landingRetail'), t('landingFieldServices'), t('landingHospitality')].map((industry) => (
                  <View key={industry} style={styles.pill}>
                    <Text style={styles.pillText}>{industry}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Dashboard Preview */}
          <View style={[styles.dashboardCard, isMobile && styles.dashboardCardMobile]}>
            <Text style={styles.dashboardTitle}>{t('landingTodayAtGlance')}</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>{t('landingActiveTeams')}</Text>
                <Text style={styles.metricValue}>12</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>{t('landingTasksDone')}</Text>
                <Text style={styles.metricValue}>34</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>{t('landingEvents')}</Text>
                <Text style={styles.metricValue}>5</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>{t('landingMessages')}</Text>
                <Text style={styles.metricValue}>128</Text>
              </View>
            </View>
            <View style={styles.dashboardFooter}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={styles.dashboardFooterText}>
                {t('landingPlannerKeepsAligned')}
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            {t('landingEverythingTeamNeeds')}
          </Text>
          <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
            {t('landingBuiltInTools')}
          </Text>
          
          <View style={[styles.featuresGrid, isMobile && styles.featuresGridMobile]}>
            {[
              {
                icon: 'calendar',
                color: colors.primary,
                titleKey: 'landingPlannerTitle',
                descKey: 'landingPlannerDesc',
              },
              {
                icon: 'checkmark-circle',
                color: colors.accent,
                titleKey: 'landingTasksTitle',
                descKey: 'landingTasksDesc',
              },
              {
                icon: 'chatbubbles',
                color: '#A855F7',
                titleKey: 'landingChatTitle',
                descKey: 'landingChatDesc',
              },
              {
                icon: 'people',
                color: '#10B981',
                titleKey: 'landingTeamsTitle',
                descKey: 'landingTeamsDesc',
              },
              {
                icon: 'sparkles',
                color: colors.accent,
                titleKey: 'landingMotivationTitle',
                descKey: 'landingMotivationDesc',
              },
              {
                icon: 'image',
                color: '#3B82F6',
                titleKey: 'landingBackgroundsTitle',
                descKey: 'landingBackgroundsDesc',
              }
            ].map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <Ionicons name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                <Text style={styles.featureDescription}>{t(feature.descKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Banner */}
        <View style={styles.ctaBanner}>
          <View style={styles.ctaBannerContent}>
            <Text style={styles.ctaBannerTitle}>{t('landingCTATitle')}</Text>
            <Text style={styles.ctaBannerSubtitle}>
              {t('landingCTASubtitle')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ctaBannerButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.ctaBannerButtonText}>{t('landingCreateWorkspace')}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} TeamLink. {t('landingAllRightsReserved')}.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(isWeb && {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }),
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 56,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  brandRowMobile: {
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoMobile: {
    width: 24,
    height: 24,
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
    flexShrink: 0,
  },
  headerRightMobile: {
    gap: 8,
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
  languageButtonMobile: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  languageTextMobile: {
    fontSize: 12,
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
  languageDropdownMobile: {
    right: -8,
    minWidth: 100,
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
  loginButtonMobile: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  loginButtonTextMobile: {
    fontSize: 12,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  signUpButtonMobile: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signUpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  signUpButtonTextMobile: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    ...(isWeb && {
      marginTop: 80, // Space for fixed header
      flex: 1,
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      // Enable mouse wheel scrolling on web
      cursor: 'default',
      // Force scroll behavior
      overscrollBehavior: 'contain',
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 48,
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






