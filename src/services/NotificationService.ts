/**
 * Notification Service for Firebase Cloud Messaging
 * Handles FCM token management, permission requests, and message handling
 */

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { API_URL } from '../services/api.config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private fcmToken: string | null = null;

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Request FCM permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ FCM permission granted');
        
        // Request Expo notification permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('❌ Expo notification permission denied');
          return false;
        }
        
        console.log('✅ Expo notification permission granted');
        return true;
      } else {
        console.log('❌ FCM permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('⚠️ FCM tokens only work on physical devices');
        return null;
      }

      const token = await messaging().getToken();
      console.log('🔑 FCM Token:', token);
      this.fcmToken = token;
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Update FCM token on backend
   */
  async updateFCMToken(token: string): Promise<boolean> {
    try {
      const firebaseToken = await AsyncStorage.getItem('firebaseToken');
      if (!firebaseToken) {
        console.log('❌ No Firebase token available');
        return false;
      }

      const response = await fetch(`${API_URL}/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          fcmToken: token,
          deviceType: Platform.OS,
          appVersion: Constants.expoConfig?.version || '1.0.0'
        })
      });

      if (response.ok) {
        console.log('✅ FCM token updated successfully');
        return true;
      } else {
        console.log('❌ Failed to update FCM token:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
      return false;
    }
  }

  /**
   * Remove FCM token (on logout)
   */
  async removeFCMToken(): Promise<boolean> {
    try {
      const firebaseToken = await AsyncStorage.getItem('firebaseToken');
      if (!firebaseToken) {
        console.log('❌ No Firebase token available');
        return false;
      }

      const response = await fetch(`${API_URL}/notifications/fcm-token`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        }
      });

      if (response.ok) {
        console.log('✅ FCM token removed successfully');
        this.fcmToken = null;
        return true;
      } else {
        console.log('❌ Failed to remove FCM token:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error removing FCM token:', error);
      return false;
    }
  }

  /**
   * Initialize notification system
   */
  async initializeNotifications(): Promise<boolean> {
    try {
      console.log('🚀 Initializing notification system...');
      
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('❌ Notification permission denied');
        return false;
      }

      const token = await this.getFCMToken();
      if (!token) {
        console.log('❌ Failed to get FCM token');
        return false;
      }

      // Update token on backend
      await this.updateFCMToken(token);

      // Set up message listeners
      this.setupMessageListeners();

      console.log('✅ Notification system initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Set up message listeners
   */
  private setupMessageListeners(): void {
    // Listen for token refresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log('🔄 FCM token refreshed:', newToken);
      this.fcmToken = newToken;
      await this.updateFCMToken(newToken);
    });

    // Listen for foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('📱 Foreground message received:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Listen for background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('📱 Background message received:', remoteMessage);
      // Handle background notification
      return Promise.resolve();
    });
  }

  /**
   * Show local notification
   */
  private async showLocalNotification(remoteMessage: any): Promise<void> {
    try {
      const { notification, data } = remoteMessage;
      
      if (notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title || 'MotorSync',
            body: notification.body || 'You have a new notification',
            data: data || {},
            sound: 'default',
          },
          trigger: null, // Show immediately
        });
      }
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(title: string, body: string): Promise<boolean> {
    try {
      const firebaseToken = await AsyncStorage.getItem('firebaseToken');
      if (!firebaseToken) {
        console.log('❌ No Firebase token available');
        return false;
      }

      const response = await fetch(`${API_URL}/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({ title, body })
      });

      if (response.ok) {
        console.log('✅ Test notification sent successfully');
        return true;
      } else {
        console.log('❌ Failed to send test notification:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Get current FCM token
   */
  getCurrentToken(): string | null {
    return this.fcmToken;
  }
}

export default new NotificationService();
