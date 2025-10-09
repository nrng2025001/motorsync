import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Icon,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { theme, spacing } from '../../utils/theme';

/**
 * Notification types
 */
type NotificationType = 'enquiry' | 'quotation' | 'reminder' | 'system' | 'performance';

/**
 * Notification interface
 */
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  relatedId?: string; // ID of related enquiry, quotation, etc.
}

/**
 * Notifications state interface
 */
interface NotificationsState {
  data: Notification[];
  loading: boolean;
  error: string | null;
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'enquiry':
      return 'account-plus';
    case 'quotation':
      return 'file-document';
    case 'reminder':
      return 'clock-alert';
    case 'system':
      return 'cog';
    case 'performance':
      return 'chart-line';
    default:
      return 'bell';
  }
}

/**
 * Get priority color
 */
function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return theme.colors.error;
    case 'medium':
      return theme.colors.warning;
    case 'low':
      return theme.colors.success;
    default:
      return theme.colors.outline;
  }
}

/**
 * Get type color
 */
function getTypeColor(type: NotificationType): string {
  switch (type) {
    case 'enquiry':
      return theme.colors.tertiary;
    case 'quotation':
      return theme.colors.primary;
    case 'reminder':
      return theme.colors.warning;
    case 'system':
      return theme.colors.onSurfaceVariant;
    case 'performance':
      return theme.colors.success;
    default:
      return theme.colors.outline;
  }
}

/**
 * Placeholder API function for fetching notifications
 * TODO: Replace with actual API call
 */
const fetchNotificationsFromAPI = async (): Promise<Notification[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return empty array for now - replace with actual API call
  return [];
};

/**
 * Notifications Screen Component
 * Displays notifications and reminders - can be opened from dashboard
 */
export function NotificationsScreen({ navigation }: any): React.JSX.Element {
  const { state } = useAuth();
  const [notificationsState, setNotificationsState] = useState<NotificationsState>({
    data: [],
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationsState(prev => ({ ...prev, loading: true, error: null }));
      const data = await fetchNotificationsFromAPI();
      setNotificationsState({ data, loading: false, error: null });
    } catch (error) {
      setNotificationsState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      }));
    }
  }, []);

  /**
   * Handle pull to refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications().finally(() => {
      setRefreshing(false);
    });
  }, [fetchNotifications]);

  /**
   * Effect to fetch notifications on component mount
   */
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = (notificationId: string) => {
    setNotificationsState(prev => ({
      ...prev,
      data: prev.data.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      ),
    }));
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    setNotificationsState(prev => ({
      ...prev,
      data: prev.data.map(notification => ({ ...notification, isRead: true })),
    }));
  };

  /**
   * Handle notification action
   */
  const handleNotificationAction = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    Alert.alert(
      'Notification Action',
      `This would handle the action for: ${notification.title}. In a full implementation, this would navigate to the relevant screen or perform the required action.`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Delete notification
   */
  const deleteNotification = (notificationId: string) => {
    setNotificationsState(prev => ({
      ...prev,
      data: prev.data.filter(n => n.id !== notificationId),
    }));
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Separate unread and read notifications
  const unreadNotifications = notificationsState.data.filter(n => !n.isRead);
  const readNotifications = notificationsState.data.filter(n => n.isRead);

  // Show loading state
  if (notificationsState.loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
            <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Notifications
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (notificationsState.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
            <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Notifications
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Failed to load notifications</Text>
          <Text style={styles.errorMessage}>{notificationsState.error}</Text>
          <Button
            mode="contained"
            onPress={fetchNotifications}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          Notifications
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with action button */}
        {unreadNotifications.length > 0 && (
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.headerTitle}>
              {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
            </Text>
            <Button
              mode="text"
              compact
              onPress={markAllAsRead}
              style={styles.markAllButton}
            >
              Mark all read
            </Button>
          </View>
        )}

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              New
            </Text>
            {unreadNotifications.map((notification) => (
              <Card
                key={notification.id}
                style={[styles.notificationCard, styles.unreadCard]}
                onPress={() => handleNotificationAction(notification)}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                      <Icon
                        source={getNotificationIcon(notification.type)}
                        size={24}
                        color={getTypeColor(notification.type)}
                      />
                    </View>
                    <View style={styles.notificationInfo}>
                      <Text variant="titleMedium" style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text variant="bodyMedium" style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <View style={styles.notificationMeta}>
                        <Text variant="bodySmall" style={styles.timestamp}>
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                        <View style={styles.chips}>
                          <Chip
                            mode="flat"
                            textStyle={{ fontSize: 10 }}
                            style={[
                              styles.chip,
                              { backgroundColor: `${getPriorityColor(notification.priority)}20` }
                            ]}
                          >
                            {notification.priority.toUpperCase()}
                          </Chip>
                          {notification.actionRequired && (
                            <Chip
                              mode="flat"
                              textStyle={{ fontSize: 10 }}
                              style={[styles.chip, styles.actionChip]}
                            >
                              ACTION REQUIRED
                            </Chip>
                          )}
                        </View>
                      </View>
                    </View>
                    <Button
                      mode="text"
                      compact
                      icon="close"
                      onPress={() => deleteNotification(notification.id)}
                      style={styles.deleteButton}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Earlier
            </Text>
            {readNotifications.map((notification) => (
              <Card
                key={notification.id}
                style={styles.notificationCard}
                onPress={() => handleNotificationAction(notification)}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                      <Icon
                        source={getNotificationIcon(notification.type)}
                        size={20}
                        color={theme.colors.onSurfaceVariant}
                      />
                    </View>
                    <View style={styles.notificationInfo}>
                      <Text variant="titleSmall" style={styles.readNotificationTitle}>
                        {notification.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.readNotificationMessage}>
                        {notification.message}
                      </Text>
                      <Text variant="bodySmall" style={styles.readTimestamp}>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                    </View>
                    <Button
                      mode="text"
                      compact
                      icon="close"
                      onPress={() => deleteNotification(notification.id)}
                      style={styles.deleteButton}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Empty state */}
        {notificationsState.data.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon source="bell-off" size={48} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No notifications
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                You're all caught up! New notifications will appear here.
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  headerTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  markAllButton: {
    minWidth: 80,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  notificationCard: {
    marginBottom: spacing.sm,
    elevation: 1,
  },
  unreadCard: {
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  cardContent: {
    paddingVertical: spacing.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  readNotificationTitle: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  readNotificationMessage: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: theme.colors.onSurfaceVariant,
  },
  readTimestamp: {
    color: theme.colors.onSurfaceVariant,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    height: 20,
  },
  actionChip: {
    backgroundColor: `${theme.colors.tertiary}20`,
  },
  deleteButton: {
    marginLeft: spacing.sm,
  },
  emptyCard: {
    marginTop: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    marginVertical: spacing.md,
  },
  emptySubtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: theme.colors.onSurfaceVariant,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    marginTop: spacing.md,
    color: theme.colors.onSurface,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: spacing.sm,
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.lg,
  },
});
