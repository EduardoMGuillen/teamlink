import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const { login } = useAppState();
  const { t } = useTranslation();
  const navigation = useNavigation();
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 24 : 32,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' && {
      maxWidth: 420,
      width: '100%',
      alignSelf: 'center',
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 32 : 60,
  },
  logo: {
    width: Platform.OS === 'web' ? 80 : 120,
    height: Platform.OS === 'web' ? 80 : 120,
    marginBottom: Platform.OS === 'web' ? 12 : 16,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 42,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: Platform.OS === 'web' ? 12 : 16,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    color: '#666666',
    marginTop: Platform.OS === 'web' ? 4 : 8,
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
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 14 : 16,
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 12 : 8,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#cccccc',
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
    color: '#007AFF',
    fontWeight: '500',
  },
  testConnectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'web' ? 12 : 16,
    padding: Platform.OS === 'web' ? 10 : 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  testConnectionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: Platform.OS === 'web' ? 16 : 20,
  },
});

