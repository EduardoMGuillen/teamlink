import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows, themes } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { currentUser, logout, selectedTheme, changeTheme, theme } = useAppState();
  const { colors } = theme;
  const { t, language, changeLanguage, availableLanguages } = useTranslation();
  const navigation = useNavigation();
  const isWeb = Platform.OS === 'web';

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLanguageChange = async (lang) => {
    await changeLanguage(lang);
  };

  const handleSignOut = async () => {
    await logout();
  };

  const handleThemeChange = async (themeId) => {
    await changeTheme(themeId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{currentUser?.email || ''}</Text>
            {currentUser?.department && (
              <Text style={styles.profileDepartment}>{currentUser.department}</Text>
            )}
          </View>
        </View>

        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="language" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>{t('language')}</Text>
            </View>
            <View style={styles.languageButtonsContainer}>
              {availableLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageButton,
                    language === lang.code && styles.languageButtonActive
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      language === lang.code && styles.languageButtonTextActive
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.languageCheckIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('themes') || 'Themes'}</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="color-palette" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>{t('theme') || 'Theme'}</Text>
            </View>
            <View style={styles.themeButtonsContainer}>
              {Object.values(themes).map((themeOption) => (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeButton,
                    selectedTheme === themeOption.id && styles.themeButtonActive,
                  ]}
                  onPress={() => handleThemeChange(themeOption.id)}
                >
                  <View
                    style={[
                      styles.themeSwatch,
                      { backgroundColor: themeOption.colors.primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.themeButtonText,
                      selectedTheme === themeOption.id && styles.themeButtonTextActive,
                    ]}
                  >
                    {themeOption.name}
                  </Text>
                  {selectedTheme === themeOption.id && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.settingRow}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>{t('notifications')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => navigation.navigate('MotivationSettings')}
          >
            <View style={styles.settingRow}>
              <Ionicons name="bulb" size={24} color={colors.accent} />
              <Text style={styles.settingLabel}>Daily Motivation</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>{t('about')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => navigation.navigate('ConnectionTest')}
          >
            <View style={styles.settingRow}>
              <Ionicons name="server" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>Database Connection Test</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.settingCard, styles.signOutCard]}
            onPress={handleSignOut}
          >
            <View style={styles.settingRow}>
              <Ionicons name="log-out" size={24} color="#FF3B30" />
              <Text style={[styles.settingLabel, styles.signOutText]}>
                {t('signOut')}
              </Text>
            </View>
          </TouchableOpacity>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  profileDepartment: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  settingCard: {
    backgroundColor: colors.surface,
    padding: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '600',
  },
  languageButtonsContainer: {
    marginTop: 12,
    gap: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  languageButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  themeButtonsContainer: {
    marginTop: 12,
    gap: 8,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  themeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  themeSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  themeButtonText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  themeButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  themeButtonsContainer: {
    marginTop: 12,
    gap: 8,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  themeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  themeSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  themeButtonText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  themeButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  languageCheckIcon: {
    marginLeft: 8,
  },
  signOutCard: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#FF3B30',
  },
});
