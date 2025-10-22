/**
 * Notification API Service
 * Handles all backend communication for notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api.config';
import { apiClient } from '../api/client';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  sentAt: string;
  delivered: boolean;
  data?: any;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  recentNotifications: number;
  byType: Record<string, number>;
}

export interface NotificationHistoryResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface NotificationStatsResponse {
  success: boolean;
  data: NotificationStats;
}

class NotificationAPI {
  /**
   * Get authentication headers (deprecated - now using apiClient)
   * @deprecated Use apiClient instead which handles token refresh automatically
   */
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('firebaseToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(
    page: number = 1, 
    limit: number = 50, 
    type: string | null = null
  ): Promise<NotificationHistoryResponse> {
    try {
      console.log('📱 Loading notifications...', { page, type });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (type) {
        params.append('type', type);
      }

      const response = await apiClient.get(`/notifications/history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error loading notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStatsResponse> {
    try {
      console.log('📊 Loading notification stats...');
      
      const response = await apiClient.get('/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.patch('/notifications/mark-read', { notificationIds });
      return response.data;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(title: string, body: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post('/notifications/test', { title, body });
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Get FCM token status
   */
  async getFCMTokenStatus(): Promise<{ success: boolean; data?: { hasToken: boolean; lastUpdated?: string } }> {
    try {
      const response = await apiClient.get('/notifications/fcm-token');
      return response.data;
    } catch (error) {
      console.error('Error fetching FCM token status:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    followUpEnquiry: boolean;
    followUpBooking: boolean;
    urgentEnquiry: boolean;
    urgentBooking: boolean;
    deliveryReminder: boolean;
    eveningReminder: boolean;
    weeklySummary: boolean;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<{ success: boolean; data?: any }> {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default new NotificationAPI();
