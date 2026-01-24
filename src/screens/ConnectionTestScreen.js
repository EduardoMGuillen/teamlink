import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';

export default function ConnectionTestScreen() {
  const navigation = useNavigation();
  const [tests, setTests] = useState({
    connection: { status: 'pending', message: 'Waiting...', details: null },
    auth: { status: 'pending', message: 'Waiting...', details: null },
    database: { status: 'pending', message: 'Waiting...', details: null },
    rls: { status: 'pending', message: 'Waiting...', details: null },
  });
  const [isRunning, setIsRunning] = useState(false);
  const [envInfo, setEnvInfo] = useState(null);

  useEffect(() => {
    // Obtener información de variables de entorno
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'Not set';
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY 
      ? `${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
      : 'Not set';
    
    setEnvInfo({
      url,
      key,
      platform: Platform.OS,
      isWeb: Platform.OS === 'web',
    });

    // Ejecutar tests automáticamente al cargar
    runAllTests();
  }, []);

  const updateTest = (testName, status, message, details = null) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status, message, details },
    }));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests({
      connection: { status: 'pending', message: 'Testing...', details: null },
      auth: { status: 'pending', message: 'Testing...', details: null },
      database: { status: 'pending', message: 'Testing...', details: null },
      rls: { status: 'pending', message: 'Testing...', details: null },
    });

    // Test 1: Basic Connection
    await testConnection();
    
    // Test 2: Authentication
    await testAuth();
    
    // Test 3: Database Query
    await testDatabase();
    
    // Test 4: RLS Policies
    await testRLS();

    setIsRunning(false);
  };

  const testConnection = async () => {
    try {
      // Try to get session (this tests basic connectivity)
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        if (error.message.includes('CORS') || error.message.includes('Network')) {
          updateTest('connection', 'error', 'CORS or Network Error', error);
        } else {
          updateTest('connection', 'error', `Connection Error: ${error.message}`, error);
        }
      } else {
        updateTest('connection', 'success', 'Connected to Supabase successfully', {
          hasSession: !!data.session,
        });
      }
    } catch (error) {
      updateTest('connection', 'error', `Failed to connect: ${error.message}`, error);
    }
  };

  const testAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        updateTest('auth', 'error', `Auth Error: ${error.message}`, error);
      } else {
        updateTest('auth', 'success', session 
          ? 'Authentication working (session active)' 
          : 'Authentication working (no active session)', 
        { hasSession: !!session });
      }
    } catch (error) {
      updateTest('auth', 'error', `Auth Test Failed: ${error.message}`, error);
    }
  };

  const testDatabase = async () => {
    try {
      // Try to query users table (this will test RLS too)
      const { data, error, count } = await supabase
        .from('users')
        .select('id, email, name', { count: 'exact' })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('permission')) {
          updateTest('database', 'warning', 'Database accessible but RLS may be blocking queries', error);
        } else {
          updateTest('database', 'error', `Database Error: ${error.message}`, error);
        }
      } else {
        updateTest('database', 'success', `Database accessible (${count || 0} users found)`, {
          count,
          sample: data?.[0] || null,
        });
      }
    } catch (error) {
      updateTest('database', 'error', `Database Test Failed: ${error.message}`, error);
    }
  };

  const testRLS = async () => {
    try {
      // Try to insert a test (this will fail due to RLS, but that's expected)
      // We just want to see if we get an RLS error or a different error
      const { error } = await supabase
        .from('users')
        .insert({ email: 'test@test.com', name: 'Test' })
        .select();

      if (error) {
        if (error.code === '42501' || error.message.includes('row-level security')) {
          updateTest('rls', 'success', 'RLS is active and working (insert blocked as expected)', {
            code: error.code,
            message: error.message,
          });
        } else if (error.code === '23505') {
          // Unique constraint violation - table exists and RLS allows insert but email exists
          updateTest('rls', 'success', 'RLS allows queries, table structure is correct', {
            code: error.code,
            message: 'Email already exists (expected)',
          });
        } else {
          updateTest('rls', 'warning', `RLS Test: ${error.message}`, error);
        }
      } else {
        updateTest('rls', 'warning', 'RLS may not be configured (insert succeeded unexpectedly)', null);
      }
    } catch (error) {
      updateTest('rls', 'error', `RLS Test Failed: ${error.message}`, error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color="#28a745" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="#dc3545" />;
      case 'warning':
        return <Ionicons name="warning" size={24} color="#ffc107" />;
      default:
        return <ActivityIndicator size="small" color="#007AFF" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return '#d4edda';
      case 'error':
        return '#f8d7da';
      case 'warning':
        return '#fff3cd';
      default:
        return '#e7f3ff';
    }
  };

  const getTextColor = (status) => {
    switch (status) {
      case 'success':
        return '#155724';
      case 'error':
        return '#721c24';
      case 'warning':
        return '#856404';
      default:
        return '#004085';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>🔍 Database Connection Test</Text>
        <Text style={styles.subtitle}>Verify Vercel ↔ Supabase connection</Text>
        <Text style={styles.note}>No login required - Test connection status</Text>
      </View>

      {/* Environment Info */}
      {envInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}><Text style={styles.label}>Platform:</Text> {envInfo.platform}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Supabase URL:</Text> {envInfo.url}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>API Key:</Text> {envInfo.key}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Web Mode:</Text> {envInfo.isWeb ? 'Yes' : 'No'}</Text>
          </View>
        </View>
      )}

      {/* Test Results */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <TouchableOpacity 
            onPress={runAllTests} 
            disabled={isRunning}
            style={[styles.refreshButton, isRunning && styles.refreshButtonDisabled]}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {Object.entries(tests).map(([testName, test]) => (
          <View 
            key={testName} 
            style={[
              styles.testCard, 
              { backgroundColor: getStatusColor(test.status) }
            ]}
          >
            <View style={styles.testHeader}>
              {getStatusIcon(test.status)}
              <View style={styles.testInfo}>
                <Text style={[styles.testName, { color: getTextColor(test.status) }]}>
                  {testName.charAt(0).toUpperCase() + testName.slice(1)} Test
                </Text>
                <Text style={[styles.testMessage, { color: getTextColor(test.status) }]}>
                  {test.message}
                </Text>
              </View>
            </View>
            {test.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Details:</Text>
                <Text style={styles.detailsText}>
                  {JSON.stringify(test.details, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What to Check</Text>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionText}>✅ <Text style={styles.bold}>Connection:</Text> Should show "Connected successfully"</Text>
          <Text style={styles.instructionText}>✅ <Text style={styles.bold}>Auth:</Text> Should work even without active session</Text>
          <Text style={styles.instructionText}>✅ <Text style={styles.bold}>Database:</Text> Should be able to query tables</Text>
          <Text style={styles.instructionText}>✅ <Text style={styles.bold}>RLS:</Text> Should show RLS is active (insert blocked)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 40 : 24,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  note: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
    fontStyle: 'italic',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#007AFF',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e7f3ff',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshText: {
    marginLeft: 4,
    color: '#007AFF',
    fontWeight: '600',
  },
  testCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testInfo: {
    marginLeft: 12,
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  testMessage: {
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  detailsText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
  },
});
