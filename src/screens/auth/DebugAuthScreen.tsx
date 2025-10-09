/**
 * Debug Auth Screen
 * Diagnostic tool for Firebase authentication issues
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { appConfig } from '../../config/env';

export function DebugAuthScreen(): React.JSX.Element {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`[DEBUG] ${timestamp}: ${message}`);
  };

  const clearLog = () => {
    setLog([]);
  };

  const testLogin = async () => {
    clearLog();
    const auth = getAuth();
    
    try {
      addLog('🔍 Starting Firebase Auth Debug...');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Check Firebase Configuration
      addLog('📋 Firebase Configuration:');
      addLog(`  Project ID: ${auth.app.options.projectId}`);
      addLog(`  Auth Domain: ${auth.app.options.authDomain}`);
      addLog(`  API Key: ${auth.app.options.apiKey?.substring(0, 20)}...`);
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Verify correct project
      if (auth.app.options.projectId !== 'car-dealership-app-9f2d5') {
        addLog('❌ WRONG FIREBASE PROJECT!');
        addLog(`  Expected: car-dealership-app-9f2d5`);
        addLog(`  Found: ${auth.app.options.projectId}`);
        return;
      } else {
        addLog('✅ Correct Firebase project');
      }
      
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Test Credentials
      const testEmail = 'advisor@test.com';
      const testPassword = 'TestPass123!';
      
      addLog('🔐 Test Credentials:');
      addLog(`  Email: ${testEmail}`);
      addLog(`  Password: ${'*'.repeat(testPassword.length)}`);
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Attempt Firebase Login
      addLog('📧 Attempting Firebase sign-in...');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        testEmail.trim().toLowerCase(),
        testPassword
      );
      
      addLog('✅ Firebase Authentication SUCCESS!');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('👤 User Information:');
      addLog(`  UID: ${userCredential.user.uid}`);
      addLog(`  Email: ${userCredential.user.email}`);
      addLog(`  Email Verified: ${userCredential.user.emailVerified}`);
      addLog(`  Display Name: ${userCredential.user.displayName || 'Not set'}`);
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Get ID Token
      addLog('🔑 Getting Firebase ID token...');
      const idToken = await userCredential.user.getIdToken();
      addLog(`✅ Token retrieved: ${idToken.substring(0, 30)}...`);
      addLog(`  Token length: ${idToken.length} characters`);
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Test Backend API
      addLog('🌐 Testing Backend API connection...');
      addLog(`  API URL: ${appConfig.apiUrl}/auth/profile`);
      
      const response = await fetch(`${appConfig.apiUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      addLog(`  Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('📦 Backend Response:');
      addLog(JSON.stringify(data, null, 2));
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (data.success) {
        addLog('✅ BACKEND AUTHENTICATION SUCCESS! 🎉');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('👨‍💼 User Profile from Backend:');
        if (data.data && data.data.user) {
          addLog(`  Name: ${data.data.user.name}`);
          addLog(`  Email: ${data.data.user.email}`);
          addLog(`  Role: ${data.data.user.role?.name || 'Not assigned'}`);
          addLog(`  UID: ${data.data.user.firebaseUid}`);
        }
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('🎊 ALL TESTS PASSED! Login should work! 🎊');
      } else {
        addLog('❌ Backend authentication failed');
        addLog(`  Error: ${data.message || 'Unknown error'}`);
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('⚠️  Issue: User exists in Firebase but not in backend database');
        addLog('   Solution: Backend needs to create user on first login');
      }
      
    } catch (error: any) {
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('❌ ERROR OCCURRED');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog(`  Error Code: ${error.code || 'unknown'}`);
      addLog(`  Error Message: ${error.message}`);
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Specific error diagnosis
      if (error.code === 'auth/user-not-found') {
        addLog('⚠️  USER NOT FOUND IN FIREBASE');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('Possible causes:');
        addLog('  1. User was not created in Firebase');
        addLog('  2. Wrong Firebase project (check projectId above)');
        addLog('  3. User was deleted from Firebase');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('Solutions:');
        addLog('  1. Create user in Firebase Console');
        addLog('  2. Verify projectId matches: car-dealership-app-9f2d5');
        addLog('  3. Ask backend admin to recreate user');
      } else if (error.code === 'auth/wrong-password') {
        addLog('⚠️  WRONG PASSWORD');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('Possible causes:');
        addLog('  1. Password is incorrect');
        addLog('  2. Password has hidden characters (copy/paste issue)');
        addLog('  3. Password was changed in Firebase');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('Solutions:');
        addLog('  1. Verify password: TestPass123!');
        addLog('  2. Type password manually (don\'t copy/paste)');
        addLog('  3. Reset password in Firebase Console');
      } else if (error.code === 'auth/network-request-failed') {
        addLog('⚠️  NETWORK ERROR');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('Possible causes:');
        addLog('  1. No internet connection');
        addLog('  2. Firebase servers unreachable');
        addLog('  3. Firewall blocking Firebase');
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        addLog('Solutions:');
        addLog('  1. Check internet connection');
        addLog('  2. Try again in a few minutes');
        addLog('  3. Check firewall settings');
      } else if (error.code === 'auth/invalid-email') {
        addLog('⚠️  INVALID EMAIL FORMAT');
        addLog('  Email should be: advisor@test.com');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          🔐 Firebase Auth Debug
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Diagnostic Tool for Login Issues
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Test Credentials
          </Text>
          <Text variant="bodySmall" style={styles.cardText}>
            Email: advisor@test.com
          </Text>
          <Text variant="bodySmall" style={styles.cardText}>
            Password: TestPass123!
          </Text>
          <Divider style={styles.divider} />
          <Text variant="bodySmall" style={styles.note}>
            This will test Firebase authentication and backend connectivity
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={testLogin}
          icon="play"
          style={styles.testButton}
        >
          Run Diagnostics
        </Button>
        <Button
          mode="outlined"
          onPress={clearLog}
          icon="delete"
          style={styles.clearButton}
        >
          Clear Log
        </Button>
      </View>

      <Card style={styles.logCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.logTitle}>
            Diagnostic Log
          </Text>
          <Divider style={styles.divider} />
          <ScrollView style={styles.logScroll}>
            {log.length === 0 ? (
              <Text style={styles.emptyLog}>
                No logs yet. Press "Run Diagnostics" to start.
              </Text>
            ) : (
              log.map((line, index) => (
                <Text key={index} style={styles.logLine}>
                  {line}
                </Text>
              ))
            )}
          </ScrollView>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  cardText: {
    color: '#374151',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  divider: {
    marginVertical: 12,
  },
  note: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  testButton: {
    flex: 2,
  },
  clearButton: {
    flex: 1,
  },
  logCard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  logScroll: {
    maxHeight: 400,
  },
  emptyLog: {
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 40,
  },
  logLine: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
    marginBottom: 6,
    lineHeight: 16,
  },
});

