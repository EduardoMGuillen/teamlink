import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows } from '../utils/theme';

export default function MoreScreen() {
  const { currentUser, logout, theme } = useAppState();
  const { colors } = theme;
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isWeb = Platform.OS === 'web';

  const styles = useMemo(() => createStyles(colors), [colors]);

  const menuSections = [
    {
      title: 'Communications',
      items: [
        { icon: 'chatbubble', label: t('messages'), screen: 'Chat' },
        { icon: 'notifications', label: t('updates'), screen: 'Updates' },
        { icon: 'people', label: t('directory'), screen: 'Directory' },
      ],
    },
    {
      title: t('settings'),
      items: [
        { icon: 'settings', label: t('settings'), screen: 'Settings' },
        { icon: 'information-circle', label: t('about'), screen: 'About' },
        { icon: 'log-out', label: t('signOut'), action: 'signOut', color: '#FF3B30' },
      ],
    },
    {
      title: t('legal') || 'Legal',
      items: [
        { icon: 'document-text', label: t('privacyPolicy') || 'Privacy Policy', screen: 'PrivacyPolicy' },
        { icon: 'document-text', label: t('termsOfService') || 'Terms of Service', screen: 'TermsOfService' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
        {/* Profile Section – tap to edit */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            {currentUser.avatar_url ? (
              <Image source={{ uri: currentUser.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {(currentUser.name || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
            {currentUser.department && (
              <Text style={styles.profileDepartment}>{currentUser.department}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={async () => {
                  if (item.action === 'signOut') {
                    await logout();
                  } else if (item.screen) {
                    navigation.navigate(item.screen);
                  }
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={item.color || colors.primary}
                />
                <Text
                  style={[styles.menuItemText, item.color && { color: item.color }]}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#C7C7CC"
                  style={styles.chevron}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    width: '100%',
  },
  contentWeb: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 'auto',
  },
});

