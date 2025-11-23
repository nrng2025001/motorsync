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
} catch (error: any) {
  console.log('⚠️ expo-notifications not available:', error.message);
}

try {
  Device = require('expo-device');
} catch (error: any) {
  console.log('⚠️ expo-device not available:', error.message);
}

try {
  Constants = require('expo-constants');
} catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
  async updateFCMToken(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Updating FCM token on backend...');
      
      const response = await apiClient.post('/notifications/fcm-token', {
        fcmToken: token,
        deviceType: Platform.OS,
        appVersion: Constants?.expoConfig?.version || '1.0.0'
      });

      if (response.status === 200 || response.status === 201) {
        console.log('✅ FCM token updated successfully');
        return { success: true };
      } else {
        console.log('❌ Failed to update FCM token:', response.status);
        return { success: false, error: 'Failed to update FCM token' };
      }
    } catch (error: any) {
      console.error('Error updating FCM token:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        return { success: false, error: 'Authentication failed. Please log in again.' };
      } else if (error.response?.status === 400) {
        return { success: false, error: 'Invalid request data. Please try again.' };
      } else if (error.response?.status === 404) {
        return { success: false, error: 'User not found. Please contact support.' };
      } else if (error.response?.status === 500) {
        return { success: false, error: 'Server error. Please try again later.' };
      } else if (error.message?.includes('Invalid or expired Firebase token')) {
        return { success: false, error: 'Authentication expired. Please log in again.' };
      } else if (error.message?.includes('Network request failed')) {
        return { success: false, error: 'Network error. Please check your connection.' };
      } else {
        return { success: false, error: 'Failed to update FCM token. Please try again.' };
      }
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
    } catch (error: any) {
      console.error('Error removing FCM token:', error);
      return false;
    }
  }

  /**
   * Initialize notification system
   */
  async initializeNotifications(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 Initializing notification system...');
      
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('❌ Notification permission denied');
        return { success: false, error: 'Notification permission denied' };
      }

      const token = await this.getFCMToken();
      if (!token) {
        console.log('❌ Failed to get FCM token');
        return { success: false, error: 'Failed to get FCM token' };
      }

      // Update token on backend
      const updateResult = await this.updateFCMToken(token);
      if (!updateResult.success) {
        console.log('⚠️ Failed to update FCM token on backend:', updateResult.error);
        // Don't fail completely, just log the error
        console.log('⚠️ Continuing without backend token update...');
      }

      // Set up message listeners
      this.setupMessageListeners();

      console.log('✅ Notification system initialized successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error initializing notifications:', error);
      // Don't fail the entire app if notifications fail
      console.log('⚠️ Notification system failed to initialize, but app will continue');
      return { success: false, error: 'Failed to initialize notifications' };
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
      Notifications.addNotificationReceivedListener((notification: any) => {
        console.log('📱 Notification received:', notification);
      });

      // Listen for notification response (when user taps notification)
      // Phase 2: Handle escalation alerts
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log('📱 Notification response:', response);
        this.handleNotificationResponse(response);
      });
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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

  /**
   * Phase 2: Handle notification response (when user taps notification)
   * Handles escalation alerts and navigates to appropriate screens
   */
  private handleNotificationResponse(response: any): void {
    try {
      const notification = response?.notification;
      const data = notification?.data || {};
      const type = data.type || notification?.request?.content?.data?.type;

      if (!type) {
        console.log('⚠️ No notification type found');
        return;
      }

      console.log('🔔 Handling notification type:', type);

      // Phase 2: Handle escalation alerts
      switch (type) {
        case 'inactivity_alert':
          // Enquiry has no updates for 5 days
          if (data.entityId || data.enquiryId) {
            this.navigateToEnquiry(data.entityId || data.enquiryId);
          }
          break;

        case 'aging_alert':
          // Enquiry is 20-25 days old
          if (data.entityId || data.enquiryId) {
            this.navigateToEnquiry(data.entityId || data.enquiryId);
          }
          break;

        case 'aging_alert_sm':
          // Enquiry is 30-35 days old (for Sales Manager)
          if (data.entityId || data.enquiryId) {
            this.navigateToEnquiry(data.entityId || data.enquiryId);
          }
          break;

        case 'aging_alert_gm':
          // Enquiry is 40+ days old (for General Manager)
          if (data.entityId || data.enquiryId) {
            this.navigateToEnquiry(data.entityId || data.enquiryId);
          }
          break;

        case 'retail_delay':
          // Booking not retailed within 15 days
          if (data.entityId || data.bookingId) {
            this.navigateToBooking(data.entityId || data.bookingId);
          }
          break;

        default:
          // Handle other notification types (enquiry, booking, etc.)
          if (data.enquiryId) {
            this.navigateToEnquiry(data.enquiryId);
          } else if (data.bookingId) {
            this.navigateToBooking(data.bookingId);
          }
          break;
      }
    } catch (error: any) {
      console.error('❌ Error handling notification response:', error);
    }
  }

  /**
   * Navigate to enquiry details screen
   * Uses event emitter pattern since NotificationService doesn't have direct navigation access
   */
  private navigateToEnquiry(enquiryId: string): void {
    console.log('📍 Navigating to enquiry:', enquiryId);
    // Emit event that can be listened to by navigation components
    // The NotificationContext or App.tsx should listen to this and navigate
    if (typeof window !== 'undefined' && (window as any).navigationRef) {
      (window as any).navigationRef.current?.navigate('EnquiryDetails', { enquiryId });
    } else {
      // Fallback: Store navigation intent for later use
      AsyncStorage.setItem('pendingNavigation', JSON.stringify({
        screen: 'EnquiryDetails',
        params: { enquiryId }
      }));
    }
  }

  /**
   * Navigate to booking details screen
   */
  private navigateToBooking(bookingId: string): void {
    console.log('📍 Navigating to booking:', bookingId);
    if (typeof window !== 'undefined' && (window as any).navigationRef) {
      (window as any).navigationRef.current?.navigate('BookingDetails', { bookingId });
    } else {
      // Fallback: Store navigation intent for later use
      AsyncStorage.setItem('pendingNavigation', JSON.stringify({
        screen: 'BookingDetails',
        params: { bookingId }
      }));
    }
  }
}

export default new NotificationService();
