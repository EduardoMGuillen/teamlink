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
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppState } from '../context/AppStateContext';
import { useTranslation } from '../utils/useTranslation';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { timezones, countries } from '../utils/timezones';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [country, setCountry] = useState('US');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [gender, setGender] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const handleSignUp = async () => {
    // Validations
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', t('passwordsDontMatch'));
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.signUp(email.trim(), password, {
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        date_of_birth: dateOfBirth.toISOString().split('T')[0],
        country: country,
        city: city.trim(),
        timezone: timezone,
        gender: gender,
      });

      if (result.success) {
        // Si hay un mensaje especial, mostrarlo
        if (result.user?.message) {
          Alert.alert('Success', result.user.message, [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Login');
              },
            },
          ]);
        } else {
          Alert.alert('Success', t('registrationSuccess'), [
            {
              text: 'OK',
              onPress: () => {
                // Login automatically after signup
                navigation.navigate('Login');
              },
            },
          ]);
        }
      } else {
        // Mostrar error con formato mejorado (soporta saltos de línea)
        const errorMessage = result.error || 'Registration failed';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="link" size={80} color="#fff" />
              <Text style={styles.title}>TeamLink</Text>
              <Text style={styles.subtitle}>{t('signUpTitle')}</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('fullName')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('fullName')}
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('email')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('email')}
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password */}
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
                />
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('confirmPassword')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('confirmPassword')}
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Phone Number */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('phoneNumber')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('phoneNumber')}
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Date of Birth */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('dateOfBirth')}</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={dateOfBirth.toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDateOfBirth(new Date(e.target.value));
                      }
                    }}
                    style={{
                      width: '100%',
                      marginTop: 8,
                      padding: 16,
                      border: '1px solid #E5E5EA',
                      borderRadius: 12,
                      fontSize: 16,
                      backgroundColor: '#fff',
                      fontFamily: 'inherit',
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateButtonText}>
                        {formatDate(dateOfBirth)}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          if (Platform.OS === 'android') {
                            setShowDatePicker(false);
                          }
                          if (selectedDate) {
                            setDateOfBirth(selectedDate);
                          }
                          if (Platform.OS === 'ios') {
                            // On iOS, keep picker open until user dismisses
                          }
                        }}
                      />
                    )}
                    {Platform.OS === 'ios' && showDatePicker && (
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.doneButtonText}>{t('save')}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              {/* Country */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('country')}</Text>
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {countries.find(c => c.value === country)?.label || countries[0].label}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#007AFF" />
                  </TouchableOpacity>
                ) : Platform.OS === 'web' ? (
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                      marginTop: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#E5E5EA',
                      borderRadius: 8,
                      fontSize: 16,
                      backgroundColor: '#fff',
                    }}
                  >
                    {countries.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={country}
                      onValueChange={setCountry}
                      style={styles.picker}
                    >
                      {countries.map((c) => (
                        <Picker.Item
                          key={c.value}
                          label={c.label}
                          value={c.value}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              {/* City */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('city')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('city')}
                  placeholderTextColor="#999"
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />
              </View>

              {/* Timezone */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('timezone')}</Text>
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowTimezonePicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {timezones.find(tz => tz.value === timezone)?.label || timezones[0].label}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#007AFF" />
                  </TouchableOpacity>
                ) : Platform.OS === 'web' ? (
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    style={{
                      marginTop: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#E5E5EA',
                      borderRadius: 8,
                      fontSize: 16,
                      backgroundColor: '#fff',
                    }}
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={timezone}
                      onValueChange={setTimezone}
                      style={styles.picker}
                    >
                      {timezones.map((tz) => (
                        <Picker.Item
                          key={tz.value}
                          label={tz.label}
                          value={tz.value}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              {/* Gender */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('gender')}</Text>
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowGenderPicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {gender === 'male' ? t('male') : gender === 'female' ? t('female') : gender === 'other' ? t('other') : t('selectGender') || 'Select Gender'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#007AFF" />
                  </TouchableOpacity>
                ) : Platform.OS === 'web' ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      marginTop: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#E5E5EA',
                      borderRadius: 8,
                      fontSize: 16,
                      backgroundColor: '#fff',
                    }}
                  >
                    <option value="">{t('selectGender') || 'Select Gender'}</option>
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={gender}
                      onValueChange={setGender}
                      style={styles.picker}
                    >
                      <Picker.Item label={t('selectGender') || 'Select Gender'} value="" />
                      <Picker.Item label={t('male')} value="male" />
                      <Picker.Item label={t('female')} value="female" />
                      <Picker.Item label={t('other')} value="other" />
                    </Picker>
                  </View>
                )}
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <Text style={styles.buttonText}>{t('signUp')}</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity
                style={styles.linkContainer}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  {t('alreadyHaveAccount')} {t('signIn')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Country Picker Modal for iOS */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showCountryPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCountryPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                    <Text style={styles.modalCancel}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t('country')}</Text>
                  <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                    <Text style={styles.modalDone}>{t('save')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={country}
                    onValueChange={(value) => {
                      setCountry(value);
                      setShowCountryPicker(false);
                    }}
                    style={styles.modalPicker}
                    itemStyle={styles.pickerItem}
                  >
                    {countries.map((c) => (
                      <Picker.Item
                        key={c.value}
                        label={c.label}
                        value={c.value}
                        color="#000000"
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Timezone Picker Modal for iOS */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showTimezonePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimezonePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowTimezonePicker(false)}>
                    <Text style={styles.modalCancel}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t('timezone')}</Text>
                  <TouchableOpacity onPress={() => setShowTimezonePicker(false)}>
                    <Text style={styles.modalDone}>{t('save')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={timezone}
                    onValueChange={(value) => {
                      setTimezone(value);
                      setShowTimezonePicker(false);
                    }}
                    style={styles.modalPicker}
                    itemStyle={styles.pickerItem}
                  >
                    {timezones.map((tz) => (
                      <Picker.Item
                        key={tz.value}
                        label={tz.label}
                        value={tz.value}
                        color="#000000"
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Gender Picker Modal for iOS */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showGenderPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowGenderPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                    <Text style={styles.modalCancel}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t('gender')}</Text>
                  <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                    <Text style={styles.modalDone}>{t('save')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={gender}
                    onValueChange={(value) => {
                      setGender(value);
                      setShowGenderPicker(false);
                    }}
                    style={styles.modalPicker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label={t('selectGender') || 'Select Gender'} value="" color="#000000" />
                    <Picker.Item label={t('male')} value="male" color="#000000" />
                    <Picker.Item label={t('female')} value="female" color="#000000" />
                    <Picker.Item label={t('other')} value="other" color="#000000" />
                  </Picker>
                </View>
              </View>
            </View>
          </Modal>
        )}
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 16,
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
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
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  doneButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 0,
    height: 300,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalDone: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  pickerWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  modalPicker: {
    flex: 1,
    width: '100%',
    color: '#000000',
  },
  pickerItem: {
    color: '#000000',
    fontSize: 18,
  },
});
