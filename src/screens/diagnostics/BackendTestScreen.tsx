/**
 * Backend Test Screen
 * Diagnostic tool to test all backend endpoints
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { AuthAPI, EnquiriesAPI, BookingsAPI, QuotationsAPI, StockAPI } from '../../api';
import { appConfig } from '../../config/env';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

export function BackendTestScreen(): React.JSX.Element {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { name, status, message, duration } : t);
      }
      return [...prev, { name, status, message, duration }];
    });
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTest(name, 'pending', 'Running...');
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTest(name, 'success', `✅ Success (${duration}ms)`, duration);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const message = error.message || error.toString();
      updateTest(name, 'error', `❌ ${message}`, duration);
      throw error;
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setTests([]);

    try {
      // Test 1: Health Check (no auth needed)
      await runTest('Health Check', async () => {
        const response = await fetch(`${appConfig.backendUrl}/api/health`);
        return response.json();
      });

      // Test 2: Create Test User
      await runTest('Create Test User', async () => {
        return AuthAPI.createTestUser('CUSTOMER_ADVISOR', 'test-advisor@crm.com', 'Test Advisor');
      });

      // Test 3: Enquiries Stats
      await runTest('Get Enquiries Stats', async () => {
        return EnquiriesAPI.getEnquiriesStats();
      });

      // Test 4: List Enquiries
      await runTest('List Enquiries', async () => {
        return EnquiriesAPI.getEnquiries({ status: 'NEW', page: 1, limit: 10 });
      });

      // Test 5: Bookings Stats
      await runTest('Get Bookings Stats', async () => {
        return BookingsAPI.getBookingsStats();
      });

      // Test 6: List Bookings
      await runTest('List Bookings', async () => {
        return BookingsAPI.getBookings({ page: 1, limit: 10 });
      });

      // Test 7: Quotations Stats
      await runTest('Get Quotations Stats', async () => {
        return QuotationsAPI.getQuotationStats();
      });

      // Test 8: List Stock
      await runTest('List Stock', async () => {
        return StockAPI.getStock({ page: 1, limit: 10 });
      });

      updateTest('All Tests', 'success', '🎉 All tests completed!');
    } catch (error) {
      // Tests will show individual errors
    } finally {
      setRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            🔬 Backend Diagnostics
          </Text>
          
          <View style={styles.configSection}>
            <Text variant="titleMedium">Configuration:</Text>
            <Text variant="bodyMedium">API URL: {appConfig.apiUrl}</Text>
            <Text variant="bodyMedium">Backend: {appConfig.backendUrl}</Text>
            <Text variant="bodyMedium">Environment: {appConfig.environment}</Text>
          </View>

          <Button
            mode="contained"
            onPress={runAllTests}
            disabled={running}
            style={styles.button}
            icon={running ? 'loading' : 'play'}
          >
            {running ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </Card.Content>
      </Card>

      {running && tests.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Initializing tests...</Text>
        </View>
      )}

      {tests.map((test, index) => (
        <Card key={index} style={styles.testCard}>
          <Card.Content>
            <View style={styles.testHeader}>
              <Text variant="titleMedium" style={styles.testName}>
                {getStatusIcon(test.status)} {test.name}
              </Text>
              <Chip
                style={{ backgroundColor: getStatusColor(test.status) }}
                textStyle={{ color: 'white' }}
              >
                {test.status}
              </Chip>
            </View>
            
            <Text variant="bodyMedium" style={styles.testMessage}>
              {test.message}
            </Text>
            
            {test.duration && (
              <Text variant="bodySmall" style={styles.testDuration}>
                Duration: {test.duration}ms
              </Text>
            )}
          </Card.Content>
        </Card>
      ))}

      {tests.length > 0 && !running && (
        <Card style={[styles.card, styles.summaryCard]}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              📊 Test Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">
                ✅ Passed: {tests.filter(t => t.status === 'success').length}
              </Text>
              <Text variant="bodyLarge">
                ❌ Failed: {tests.filter(t => t.status === 'error').length}
              </Text>
            </View>
            
            <Text variant="bodyMedium" style={styles.summaryNote}>
              {tests.filter(t => t.status === 'success').length === tests.length
                ? '🎉 All tests passed! Backend is working correctly.'
                : '⚠️ Some tests failed. Check the results above for details.'}
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  configSection: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  testCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    flex: 1,
    fontWeight: 'bold',
  },
  testMessage: {
    marginTop: 4,
    color: '#666',
  },
  testDuration: {
    marginTop: 4,
    color: '#999',
  },
  summaryCard: {
    backgroundColor: '#e8f5e9',
    marginTop: 8,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryNote: {
    textAlign: 'center',
    marginTop: 8,
  },
  spacing: {
    height: 32,
  },
});

