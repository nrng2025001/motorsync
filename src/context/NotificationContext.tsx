/**
 * Notification Context Provider
 * Manages notification state and provides notification functionality throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import NotificationAPI, { Notification, NotificationStats } from '../services/NotificationAPI';
import NotificationService from '../services/NotificationService';

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
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load notification history
  const loadNotifications = useCallback(async (page: number = 1, type: string | null = null) => {
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
  }, []);

  // Load notification statistics
  const loadStats = useCallback(async () => {
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
  }, []);

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
    console.log('🚀 Initializing notification system...');
    NotificationService.initializeNotifications().then(success => {
      if (success) {
        console.log('✅ Notification system initialized');
        // Load initial data
        loadNotifications(1);
        loadStats();
      } else {
        console.log('⚠️ Notification system not available, continuing without notifications');
        // Still try to load data even if notifications fail
        loadNotifications(1);
        loadStats();
      }
    }).catch(error => {
      console.log('⚠️ Notification system error, continuing without notifications:', error.message);
      // Still try to load data even if notifications fail
      loadNotifications(1);
      loadStats();
    });
  }, [loadNotifications, loadStats]);

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
