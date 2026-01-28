import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppState } from '../context/AppStateContext';
import { useTranslation } from '../utils/useTranslation';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { radii, shadows } from '../utils/theme';

export default function EditProfileScreen() {
  const { currentUser, setCurrentUser, theme } = useAppState();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = theme;
  const isWeb = Platform.OS === 'web';
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [department, setDepartment] = useState(currentUser?.department ?? '');
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name ?? '');
      setPhone(currentUser.phone ?? '');
      setDepartment(currentUser.department ?? '');
      setAvatarUrl(currentUser.avatar_url ?? null);
    }
  }, [currentUser?.id]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionRequired') || 'Permission', t('photoLibraryPermission') || 'Allow access to photo library to set profile photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setAvatarUri(result.assets[0].uri);
        setAvatarUrl(null);
      }
    } catch (err) {
      console.error('pickImage error:', err);
      Alert.alert(t('error') || 'Error', err?.message || 'Could not open photo picker.');
    }
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      const fields = {
        name: name.trim(),
        phone: phone.trim() || null,
        department: department.trim() || null,
      };
      if (avatarUri) {
        const mime = avatarUri.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
        const newAvatarUrl = await authService.uploadAvatar(currentUser.id, avatarUri, mime);
        if (!newAvatarUrl) {
          Alert.alert(
            t('error') || 'Error',
            t('avatarUploadFailed') || 'Could not upload photo. Check storage bucket "team-files" and run add_users_avatar_url.sql in Supabase.'
          );
          return;
        }
        fields.avatar_url = newAvatarUrl;
      }
      const res = await authService.updateProfile(currentUser.id, fields);
      if (!res.success) {
        Alert.alert(t('error') || 'Error', res.error || 'Could not update profile.');
        return;
      }
      if (res.user) {
        const next = { ...currentUser, ...res.user };
        setCurrentUser(next);
        await AsyncStorage.setItem('@teamlink_user', JSON.stringify(next));
      }
      navigation.goBack();
    } catch (err) {
      console.error('handleSave error:', err);
      Alert.alert(t('error') || 'Error', err?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarUri || avatarUrl;
  const initial = (name || currentUser?.email?.split('@')[0] || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editProfile') || 'Edit profile'}</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveBtnText}>{t('save') || 'Save'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>{t('changeProfilePhoto') || 'Change profile photo'}</Text>

          <Text style={styles.label}>{t('name') || 'Name'}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('name') || 'Name'}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />

          <Text style={styles.label}>{t('email') || 'Email'}</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={currentUser?.email ?? ''}
            editable={false}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.hint}>{t('emailNotEditable') || 'Email cannot be changed.'}</Text>

          <Text style={styles.label}>{t('phone') || 'Phone'}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('phone') || 'Phone'}
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>{t('department') || 'Department'}</Text>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            placeholder={t('department') || 'Department'}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { padding: 4 },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    saveBtn: { padding: 8 },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    content: {
      padding: 20,
      width: '100%',
    },
    contentWeb: {
      maxWidth: 520,
      alignSelf: 'center',
    },
    avatarWrap: {
      alignSelf: 'center',
      marginBottom: 8,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      fontSize: 40,
      fontWeight: '600',
      color: '#fff',
    },
    avatarBadge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    avatarHint: {
      alignSelf: 'center',
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radii.lg,
      padding: 14,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    inputDisabled: {
      opacity: 0.8,
    },
    hint: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: -8,
      marginBottom: 16,
    },
  });
