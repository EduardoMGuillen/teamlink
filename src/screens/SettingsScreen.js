import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useTranslation } from '../utils/useTranslation';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { currentUser, logout } = useAppState();
  const { t, language, changeLanguage, availableLanguages } = useTranslation();
  const navigation = useNavigation();

  const handleLanguageChange = async (lang) => {
    await changeLanguage(lang);
  };

  const handleSignOut = async () => {
    await logout();
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
              <Ionicons name="language" size={24} color="#007AFF" />
              <Text style={styles.settingLabel}>{t('language')}</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={language}
                onValueChange={handleLanguageChange}
                style={styles.picker}
              >
                {availableLanguages.map((lang) => (
                  <Picker.Item
                    key={lang.code}
                    label={lang.name}
                    value={lang.code}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="person" size={24} color="#007AFF" />
              <Text style={styles.settingLabel}>{t('profile')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="notifications" size={24} color="#007AFF" />
              <Text style={styles.settingLabel}>{t('notifications')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <Text style={styles.settingLabel}>{t('about')}</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => navigation.navigate('ConnectionTest')}
          >
            <View style={styles.settingRow}>
              <Ionicons name="server" size={24} color="#007AFF" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
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
    fontWeight: '600',
    color: '#000',
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  profileDepartment: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  settingCard: {
    backgroundColor: '#fff',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  pickerContainer: {
    marginTop: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  signOutCard: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#FF3B30',
  },
});
