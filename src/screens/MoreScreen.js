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
import { useNavigation } from '@react-navigation/native';

export default function MoreScreen() {
  const { currentUser } = useAppState();
  const navigation = useNavigation();

  const menuSections = [
    {
      title: 'Operations Hub',
      items: [
        { icon: 'document-text', label: 'Forms & Checklists', screen: 'Forms' },
        { icon: 'chatbubble', label: 'Chat', screen: 'Chat' },
      ],
    },
    {
      title: 'Communications',
      items: [
        { icon: 'notifications', label: 'Updates', screen: 'Updates' },
        { icon: 'people', label: 'Directory', screen: 'Directory' },
        { icon: 'book', label: 'Knowledge Base', screen: 'KnowledgeBase' },
      ],
    },
    {
      title: 'HR Hub',
      items: [
        { icon: 'school', label: 'Training', screen: 'Training' },
        { icon: 'folder', label: 'Documents', screen: 'Documents' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: 'settings', label: 'Settings', screen: 'Settings' },
        { icon: 'log-out', label: 'Sign Out', action: 'signOut', color: '#FF3B30' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
            {currentUser.department && (
              <Text style={styles.profileDepartment}>{currentUser.department}</Text>
            )}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={() => {
                  if (item.action === 'signOut') {
                    // Handle sign out
                  } else if (item.screen) {
                    navigation.navigate(item.screen);
                  }
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={item.color || '#007AFF'}
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

