/**
 * Notification Service for Firebase Cloud Messaging
 * Handles FCM token management, permission requests, and message handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { API_URL } from '../services/api.config';
import { apiClient } from '../api/client';

// Conditionally import expo modules to avoid crashes in development builds
let Notifications: any = null;
let Device: any = null;
let Constants: any = null;

try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('⚠️ expo-notifications not available:', error.message);
}

try {
  Device = require('expo-device');
} catch (error) {
  console.log('⚠️ expo-device not available:', error.message);
}

try {
  Constants = require('expo-constants');
} catch (error) {
  console.log('⚠️ expo-constants not available:', error.message);
}

// Configure notification behavior (only if available)
if (Notifications && Notifications.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

class NotificationService {
  private fcmToken: string | null = null;

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Check if expo-notifications is available
      if (!Notifications || !Notifications.getPermissionsAsync || !Notifications.requestPermissionsAsync) {
        console.log('⚠️ Expo notifications not available in this environment');
        return false;
      }

      // Request Expo notification permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied');
        return false;
      }
      
      console.log('✅ Notification permission granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      // For development builds that don't support expo-notifications, return true to allow app to continue
      if (error.message?.includes('ExpoPushTokenManager') || error.message?.includes('native module')) {
        console.log('⚠️ Using mock permission for development build');
        return true;
      }
      return false;
    }
  }

  /**
   * Get Expo push token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      // Check if expo-device is available
      if (Device && !Device.isDevice) {
        console.log('⚠️ Push tokens only work on physical devices');
        return null;
      }

      // Check if expo-notifications is available
      if (!Notifications || !Notifications.getExpoPushTokenAsync) {
        console.log('⚠️ Expo notifications not available in this environment');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      console.log('🔑 Expo Push Token:', token.data);
      this.fcmToken = token.data;
      return token.data;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      // Return a mock token for development builds that don't support expo-notifications
      if (error.message?.includes('ExpoPushTokenManager') || error.message?.includes('native module') || error.message?.includes('expodevice') || error.message?.includes('Invalid or expired Firebase token')) {
        console.log('⚠️ Using mock token for development build');
        const mockToken = 'ExponentPushToken[development-build-mock-token]';
        this.fcmToken = mockToken;
        return mockToken;
      }
      return null;
    }
  }

  /**
   * Update FCM token on backend
   */
  async updateFCMToken(token: string): Promise<boolean> {
    try {
      console.log('🔄 Updating FCM token on backend...');
      
      const response = await apiClient.post('/notifications/fcm-token', {
        fcmToken: token,
        deviceType: Platform.OS,
        appVersion: Constants?.expoConfig?.version || '1.0.0'
      });

      if (response.status === 200 || response.status === 201) {
        console.log('✅ FCM token updated successfully');
        return true;
      } else {
        console.log('❌ Failed to update FCM token:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
      // Handle Firebase token errors gracefully
      if (error.message?.includes('Invalid or expired Firebase token')) {
        console.log('⚠️ Firebase token expired, skipping FCM token update');
        return false;
      }
      return false;
    }
  }

  /**
   * Remove FCM token (on logout)
   */
  async removeFCMToken(): Promise<boolean> {
    try {
      console.log('🔄 Removing FCM token from backend...');
      
      const response = await apiClient.delete('/notifications/fcm-token');

      if (response.status === 200 || response.status === 204) {
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

      // Update token on backend (don't fail if this fails)
      try {
        await this.updateFCMToken(token);
      } catch (error) {
        console.log('⚠️ Failed to update FCM token on backend, continuing...');
      }

      // Set up message listeners
      this.setupMessageListeners();

      console.log('✅ Notification system initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      // Don't fail the entire app if notifications fail
      console.log('⚠️ Notification system failed to initialize, but app will continue');
      return false;
    }
  }

  /**
   * Set up message listeners
   */
  private setupMessageListeners(): void {
    try {
      // Check if expo-notifications listeners are available
      if (!Notifications || !Notifications.addNotificationReceivedListener || !Notifications.addNotificationResponseReceivedListener) {
        console.log('⚠️ Expo notification listeners not available in this environment');
        return;
      }

      // Listen for notification received
      Notifications.addNotificationReceivedListener(notification => {
        console.log('📱 Notification received:', notification);
      });

      // Listen for notification response (when user taps notification)
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('📱 Notification response:', response);
      });
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
  }

  /**
   * Show local notification
   */
  private async showLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      // Check if expo-notifications is available
      if (!Notifications || !Notifications.scheduleNotificationAsync) {
        console.log('⚠️ Expo notifications not available for local notifications');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title || 'MotorSync',
          body: body || 'You have a new notification',
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(title: string, body: string): Promise<boolean> {
    try {
      console.log('🔄 Sending test notification...');
      
      const response = await apiClient.post('/notifications/test', {
        title,
        body
      });

      if (response.status === 200 || response.status === 201) {
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
