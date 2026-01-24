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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Ionicons name="link" size={80} color="#fff" />
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
                <ActivityIndicator color="#007AFF" />
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
          </View>

          <Text style={styles.footer}>
            By signing in, you agree to our Terms of Service
          </Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    opacity: 0.9,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  footer: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
});

