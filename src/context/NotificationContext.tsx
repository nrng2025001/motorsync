/**
 * Notification Context Provider
 * Manages notification state and provides notification functionality throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import NotificationAPI, { Notification, NotificationStats } from '../services/NotificationAPI';
import NotificationService from '../services/NotificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  // State
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  refreshing: boolean;
  
  // Actions
  loadNotifications: (page?: number, type?: string | null) => Promise<void>;
  loadStats: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markMultipleAsRead: (notificationIds: string[]) => Promise<void>;
  sendTestNotification: (title: string, body: string) => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Utility
  getUnreadCount: () => number;
  getNotificationsByType: (type: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Auth context
  const { state: authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;
  const user = authState.user;

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load notification history
  const loadNotifications = useCallback(async (page: number = 1, type: string | null = null) => {
    // ✅ Check authentication before loading
    if (!isAuthenticated || !user) {
      console.log('⏭️  Skipping notification load - not authenticated');
      return;
    }

    setLoading(true);
    try {
      console.log('📱 Loading notifications...', { page, type });
      const response = await NotificationAPI.getNotificationHistory(page, 50, type);
      
      if (response.success) {
        setNotifications(response.data.notifications);
        console.log('✅ Notifications loaded:', response.data.notifications.length);
      } else {
        console.log('❌ Failed to load notifications');
        Alert.alert('Error', 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load notification statistics
  const loadStats = useCallback(async () => {
    // ✅ Check authentication before loading
    if (!isAuthenticated || !user) {
      console.log('⏭️  Skipping stats load - not authenticated');
      return;
    }

    try {
      console.log('📊 Loading notification stats...');
      const response = await NotificationAPI.getNotificationStats();
      
      if (response.success) {
        setStats(response.data);
        console.log('✅ Stats loaded:', response.data);
      } else {
        console.log('❌ Failed to load stats');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [isAuthenticated, user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log('📖 Marking notification as read:', notificationId);
      const response = await NotificationAPI.markAsRead(notificationId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, delivered: true }
              : notif
          )
        );
        
        // Update stats
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            unreadCount: Math.max(0, prev.unreadCount - 1)
          } : null);
        }
        
        console.log('✅ Notification marked as read');
      } else {
        console.log('❌ Failed to mark notification as read');
        Alert.alert('Error', 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  }, [stats]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      console.log('📖 Marking multiple notifications as read:', notificationIds.length);
      const response = await NotificationAPI.markMultipleAsRead(notificationIds);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id)
              ? { ...notif, delivered: true }
              : notif
          )
        );
        
        // Update stats
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            unreadCount: Math.max(0, prev.unreadCount - notificationIds.length)
          } : null);
        }
        
        console.log('✅ Multiple notifications marked as read');
      } else {
        console.log('❌ Failed to mark notifications as read');
        Alert.alert('Error', 'Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  }, [stats]);

  // Send test notification
  const sendTestNotification = useCallback(async (title: string, body: string): Promise<boolean> => {
    try {
      console.log('🧪 Sending test notification...', { title, body });
      const response = await NotificationAPI.sendTestNotification(title, body);
      
      if (response.success) {
        console.log('✅ Test notification sent successfully');
        Alert.alert('Success', 'Test notification sent successfully!');
        return true;
      } else {
        console.log('❌ Failed to send test notification');
        Alert.alert('Error', 'Failed to send test notification');
        return false;
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
      return false;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      const response = await NotificationAPI.deleteNotification(notificationId);
      
      if (response.success) {
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        
        // Update stats
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            totalNotifications: Math.max(0, prev.totalNotifications - 1),
            unreadCount: Math.max(0, prev.unreadCount - 1)
          } : null);
        }
        
        console.log('✅ Notification deleted');
      } else {
        console.log('❌ Failed to delete notification');
        Alert.alert('Error', 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  }, [stats]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadNotifications(1),
        loadStats()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadNotifications, loadStats]);

  // Utility functions
  const getUnreadCount = useCallback((): number => {
    return notifications.filter(notif => !notif.delivered).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type: string): Notification[] => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  // Initialize notifications on app start
  useEffect(() => {
    // ✅ Wait for authentication before initializing
    if (!isAuthenticated || !user) {
      console.log('⏭️  Waiting for authentication before initializing notifications...');
      return;
    }

    console.log('🚀 Initializing notification system...');
    NotificationService.initializeNotifications().then(result => {
      if (result.success) {
        console.log('✅ Notification system initialized');
        // Load initial data
        loadNotifications(1);
        loadStats();
      } else {
        console.log('⚠️ Notification system not available:', result.error);
        // Show user-friendly error message
        if (result.error?.includes('Authentication failed') || result.error?.includes('Authentication expired')) {
          Alert.alert(
            'Authentication Required',
            'Please log in again to enable notifications.',
            [{ text: 'OK' }]
          );
        } else if (result.error?.includes('permission denied')) {
          Alert.alert(
            'Notification Permission',
            'Please enable notifications in your device settings to receive updates.',
            [{ text: 'OK' }]
          );
        } else if (result.error?.includes('Network error')) {
          Alert.alert(
            'Connection Issue',
            'Unable to connect to notification service. Please check your internet connection.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Notification Setup',
            'Unable to set up notifications. You can try again later.',
            [{ text: 'OK' }]
          );
        }
        // Still try to load data even if notifications fail
        loadNotifications(1);
        loadStats();
      }
    }).catch(error => {
      console.log('⚠️ Notification system error, continuing without notifications:', error.message);
      Alert.alert(
        'Notification Error',
        'An unexpected error occurred while setting up notifications.',
        [{ text: 'OK' }]
      );
      // Still try to load data even if notifications fail (only if authenticated)
      if (isAuthenticated && user) {
        loadNotifications(1);
        loadStats();
      }
    });
  }, [isAuthenticated, user, loadNotifications, loadStats]);

  const value: NotificationContextType = {
    // State
    notifications,
    stats,
    loading,
    refreshing,
    
    // Actions
    loadNotifications,
    loadStats,
    markAsRead,
    markMultipleAsRead,
    sendTestNotification,
    deleteNotification,
    refreshNotifications,
    
    // Utility
    getUnreadCount,
    getNotificationsByType,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
