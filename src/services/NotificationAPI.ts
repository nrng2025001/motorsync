/**
 * Notification API Service
 * Handles all backend communication for notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api.config';

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
   * Get authentication headers
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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (type) {
        params.append('type', type);
      }

      const response = await fetch(
        `${API_URL}/notifications/history?${params}`,
        { 
          headers: await this.getHeaders(),
          method: 'GET'
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching notification history:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStatsResponse> {
    try {
      const response = await fetch(
        `${API_URL}/notifications/stats`,
        { 
          headers: await this.getHeaders(),
          method: 'GET'
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
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
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: await this.getHeaders()
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
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
      const response = await fetch(
        `${API_URL}/notifications/mark-read`,
        {
          method: 'PATCH',
          headers: await this.getHeaders(),
          body: JSON.stringify({ notificationIds })
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
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
      const response = await fetch(
        `${API_URL}/notifications/test`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify({ title, body })
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
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
      const response = await fetch(
        `${API_URL}/notifications/fcm-token`,
        { 
          headers: await this.getHeaders(),
          method: 'GET'
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
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
      const response = await fetch(
        `${API_URL}/notifications/preferences`,
        {
          method: 'PUT',
          headers: await this.getHeaders(),
          body: JSON.stringify(preferences)
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
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
      const response = await fetch(
        `${API_URL}/notifications/preferences`,
        { 
          headers: await this.getHeaders(),
          method: 'GET'
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
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
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: await this.getHeaders()
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default new NotificationAPI();
