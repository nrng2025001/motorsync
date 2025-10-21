/**
 * Notification Test Screen
 * Simple screen to test notification functionality
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, TextInput, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNotifications } from '../../context/NotificationContext';
import { theme, spacing } from '../../utils/theme';

export function NotificationTestScreen(): React.JSX.Element {
  const { sendTestNotification, loadNotifications, loadStats } = useNotifications();
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testBody, setTestBody] = useState('This is a test notification from MotorSync');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const handleSendTest = async () => {
    setLoading(true);
    try {
      const success = await sendTestNotification(testTitle, testBody);
      if (success) {
        setSnackbar({ visible: true, message: 'Test notification sent successfully!' });
      } else {
        setSnackbar({ visible: true, message: 'Failed to send test notification' });
      }
    } catch (error) {
      setSnackbar({ visible: true, message: 'Error sending test notification' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNotifications(1),
        loadStats()
      ]);
      setSnackbar({ visible: true, message: 'Data refreshed successfully!' });
    } catch (error) {
      setSnackbar({ visible: true, message: 'Error refreshing data' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Notification Test</Text>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Send Test Notification</Text>
          
          <TextInput
            label="Title"
            value={testTitle}
            onChangeText={setTestTitle}
            style={styles.input}
          />
          
          <TextInput
            label="Body"
            value={testBody}
            onChangeText={setTestBody}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          
          <Button
            mode="contained"
            onPress={handleSendTest}
            loading={loading}
            disabled={!testTitle.trim() || !testBody.trim()}
            style={styles.button}
          >
            Send Test Notification
          </Button>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Refresh Data</Text>
          <Text style={styles.description}>
            Refresh notification history and statistics from the backend
          </Text>
          
          <Button
            mode="outlined"
            onPress={handleRefreshData}
            loading={loading}
            style={styles.button}
          >
            Refresh Data
          </Button>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Notification Types</Text>
          <Text style={styles.description}>
            The system will automatically send these types of notifications:
          </Text>
          
          <View style={styles.typeList}>
            <Text style={styles.typeItem}>• Follow-up Enquiry</Text>
            <Text style={styles.typeItem}>• Follow-up Booking</Text>
            <Text style={styles.typeItem}>• Urgent Enquiry</Text>
            <Text style={styles.typeItem}>• Urgent Booking</Text>
            <Text style={styles.typeItem}>• Delivery Reminder</Text>
            <Text style={styles.typeItem}>• Evening Reminder</Text>
            <Text style={styles.typeItem}>• Weekly Summary</Text>
            <Text style={styles.typeItem}>• Assignment Update</Text>
          </View>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  typeList: {
    marginTop: spacing.sm,
  },
  typeItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xs,
  },
});
