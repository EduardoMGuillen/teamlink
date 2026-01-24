import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useTranslation } from '../utils/useTranslation';
import { radii, shadows } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const { login, theme } = useAppState();
  const { colors } = theme;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', t('invalidCredentials'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        Alert.alert('Error', result.error || t('invalidCredentials'));
      }
    } catch (error) {
      Alert.alert('Error', t('invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>TeamLink</Text>
          <Text style={styles.subtitle}>Connect your team, simplify work</Text>
        </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('email') || 'Email'}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('email') || 'Email'}
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, (isLoading || !email || !password) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>{t('signIn')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.linkText}>
                {t('dontHaveAccount')} {t('signUp')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testConnectionButton}
              onPress={() => navigation.navigate('ConnectionTest')}
            >
              <Ionicons name="server-outline" size={16} color="#fff" />
              <Text style={styles.testConnectionText}>
                Test Database Connection
              </Text>
            </TouchableOpacity>
          </View>

        <Text style={styles.footer}>
          By signing in, you agree to our Terms of Service
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 24 : 24,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginHorizontal: 20,
    ...shadows.card,
    ...(Platform.OS === 'web' && {
      maxWidth: 460,
      width: '100%',
      alignSelf: 'center',
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 24 : 32,
  },
  logo: {
    width: Platform.OS === 'web' ? 80 : 120,
    height: Platform.OS === 'web' ? 80 : 120,
    marginBottom: Platform.OS === 'web' ? 12 : 16,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 30 : 36,
    fontWeight: '800',
    color: colors.text,
    marginTop: Platform.OS === 'web' ? 8 : 12,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    color: colors.textMuted,
    marginTop: Platform.OS === 'web' ? 4 : 6,
  },
  formContainer: {
    width: '100%',
    marginBottom: Platform.OS === 'web' ? 24 : 40,
    ...(Platform.OS === 'web' && {
      maxWidth: 400,
    }),
  },
  inputContainer: {
    marginBottom: Platform.OS === 'web' ? 16 : 20,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: Platform.OS === 'web' ? 14 : 16,
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 12 : 8,
    ...shadows.soft,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.border,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: Platform.OS === 'web' ? 12 : 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  testConnectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'web' ? 12 : 16,
    padding: Platform.OS === 'web' ? 10 : 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testConnectionText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: Platform.OS === 'web' ? 16 : 20,
  },
});

