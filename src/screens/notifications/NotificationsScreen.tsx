/**
 * Notifications Screen
 * Displays notification history, statistics, and management options
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  FAB,
  Searchbar,
  Menu,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../services/NotificationAPI';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { theme, spacing, shadows, borderRadius } from '../../utils/theme';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<MainStackParamList>;

const NOTIFICATION_TYPES = {
  FOLLOW_UP_ENQUIRY: 'follow_up_enquiry',
  FOLLOW_UP_BOOKING: 'follow_up_booking',
  URGENT_ENQUIRY: 'urgent_enquiry',
  URGENT_BOOKING: 'urgent_booking',
  DELIVERY_REMINDER: 'delivery_reminder',
  EVENING_REMINDER: 'evening_reminder',
  WEEKLY_SUMMARY: 'weekly_summary',
  ASSIGNMENT_UPDATE: 'assignment_update',
  TEST: 'test'
};

const getTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    [NOTIFICATION_TYPES.FOLLOW_UP_ENQUIRY]: 'Follow-up Enquiry',
    [NOTIFICATION_TYPES.FOLLOW_UP_BOOKING]: 'Follow-up Booking',
    [NOTIFICATION_TYPES.URGENT_ENQUIRY]: 'Urgent Enquiry',
    [NOTIFICATION_TYPES.URGENT_BOOKING]: 'Urgent Booking',
    [NOTIFICATION_TYPES.DELIVERY_REMINDER]: 'Delivery Reminder',
    [NOTIFICATION_TYPES.EVENING_REMINDER]: 'Evening Reminder',
    [NOTIFICATION_TYPES.WEEKLY_SUMMARY]: 'Weekly Summary',
    [NOTIFICATION_TYPES.ASSIGNMENT_UPDATE]: 'Assignment Update',
    [NOTIFICATION_TYPES.TEST]: 'Test Notification',
  };
  return typeMap[type] || type;
};

const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    [NOTIFICATION_TYPES.FOLLOW_UP_ENQUIRY]: '#4CAF50',
    [NOTIFICATION_TYPES.FOLLOW_UP_BOOKING]: '#2196F3',
    [NOTIFICATION_TYPES.URGENT_ENQUIRY]: '#FF9800',
    [NOTIFICATION_TYPES.URGENT_BOOKING]: '#F44336',
    [NOTIFICATION_TYPES.DELIVERY_REMINDER]: '#9C27B0',
    [NOTIFICATION_TYPES.EVENING_REMINDER]: '#607D8B',
    [NOTIFICATION_TYPES.WEEKLY_SUMMARY]: '#795548',
    [NOTIFICATION_TYPES.ASSIGNMENT_UPDATE]: '#00BCD4',
    [NOTIFICATION_TYPES.TEST]: '#9E9E9E',
  };
  return colorMap[type] || '#9E9E9E';
};

export function NotificationsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const {
    notifications,
    stats,
    loading,
    refreshing,
    loadNotifications,
    loadStats,
    markAsRead,
    markMultipleAsRead,
    sendTestNotification,
    deleteNotification,
    refreshNotifications,
    getUnreadCount,
    getNotificationsByType,
  } = useNotifications();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testBody, setTestBody] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

  // Load data on mount
  useEffect(() => {
    loadNotifications(1, selectedType);
    loadStats();
  }, [selectedType]);

  // Filter notifications based on search query
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Handle notification press
  const handleNotificationPress = useCallback(async (notification: Notification) => {
    if (!notification.delivered) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.data?.enquiryId) {
      navigation.navigate('EnquiryDetails', { enquiryId: notification.data.enquiryId });
    } else if (notification.data?.bookingId) {
      navigation.navigate('BookingDetails', { bookingId: notification.data.bookingId });
    }
  }, [markAsRead, navigation]);

  // Handle test notification
  const handleSendTest = useCallback(async () => {
    if (!testTitle.trim() || !testBody.trim()) {
      setSnackbar({ visible: true, message: 'Please enter both title and body', type: 'error' });
      return;
    }

    const success = await sendTestNotification(testTitle, markAsRead);
    if (success) {
      setTestTitle('');
      setTestBody('');
      setShowTestDialog(false);
      setSnackbar({ visible: true, message: 'Test notification sent!', type: 'success' });
    }
  }, [testTitle, testBody, sendTestNotification]);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.delivered).map(n => n.id);
    if (unreadIds.length > 0) {
      await markMultipleAsRead(unreadIds);
      setSnackbar({ visible: true, message: 'All notifications marked as read', type: 'success' });
    }
  }, [notifications, markMultipleAsRead]);

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.delivered && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <View style={styles.notificationActions}>
          {!item.delivered && (
            <IconButton
              icon="check"
              size={16}
              onPress={() => markAsRead(item.id)}
            />
          )}
          <IconButton
            icon="delete"
            size={16}
            onPress={() => deleteNotification(item.id)}
          />
        </View>
      </View>
      
      <Text style={styles.notificationBody}>{item.body}</Text>
      
      <View style={styles.notificationFooter}>
        <Chip
          mode="outlined"
          compact
          style={[styles.typeChip, { borderColor: getTypeColor(item.type) }]}
          textStyle={{ color: getTypeColor(item.type) }}
        >
          {getTypeDisplayName(item.type)}
        </Chip>
        
        <Text style={styles.notificationDate}>
          {new Date(item.sentAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render stats card
  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <Text style={styles.statsTitle}>Notification Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.totalNotifications || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.unreadCount || 0}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.recentNotifications || 0}</Text>
              <Text style={styles.statLabel}>Recent</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        {selectedType 
          ? `No ${getTypeDisplayName(selectedType).toLowerCase()} notifications found`
          : 'You don\'t have any notifications yet'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <Menu
            visible={showTypeMenu}
            onDismiss={() => setShowTypeMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowTypeMenu(true)}
                icon="filter"
              >
                {selectedType ? getTypeDisplayName(selectedType) : 'All Types'}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedType(null);
                setShowTypeMenu(false);
              }}
              title="All Types"
            />
            {Object.values(NOTIFICATION_TYPES).map(type => (
              <Menu.Item
                key={type}
                onPress={() => {
                  setSelectedType(type);
                  setShowTypeMenu(false);
                }}
                title={getTypeDisplayName(type)}
              />
            ))}
          </Menu>
          
          {getUnreadCount() > 0 && (
            <Button
              mode="contained"
              onPress={handleMarkAllAsRead}
              compact
            >
              Mark All Read
            </Button>
          )}
        </View>
      </View>

      {/* Search */}
      <Searchbar
        placeholder="Search notifications..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      {/* Stats Card */}
      {stats && renderStatsCard()}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshNotifications}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for test notification */}
      <FAB
        icon="test-tube"
        style={styles.fab}
        onPress={() => setShowTestDialog(true)}
        label="Test"
      />

      {/* Test Notification Dialog */}
      {showTestDialog && (
        <View style={styles.testDialog}>
          <Card style={styles.testCard}>
            <Text style={styles.testTitle}>Send Test Notification</Text>
            
            <Searchbar
              placeholder="Notification Title"
              value={testTitle}
              onChangeText={setTestTitle}
              style={styles.testInput}
            />
            
            <Searchbar
              placeholder="Notification Body"
              value={testBody}
              onChangeText={setTestBody}
              style={styles.testInput}
            />
            
            <View style={styles.testActions}>
              <Button
                mode="outlined"
                onPress={() => setShowTestDialog(false)}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSendTest}
                disabled={!testTitle.trim() || !testBody.trim()}
              >
                Send
              </Button>
            </View>
          </Card>
        </View>
      )}

      {/* Snackbar */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'white',
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchbar: {
    margin: spacing.md,
    marginTop: 0,
  },
  statsCard: {
    margin: spacing.md,
    marginTop: 0,
    ...shadows.sm,
  },
  statsGradient: {
    borderRadius: borderRadius.md,
  },
  statsContent: {
    padding: spacing.lg,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  listContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  notificationItem: {
    backgroundColor: 'white',
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    backgroundColor: '#f0f8ff',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationActions: {
    flexDirection: 'row',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeChip: {
    height: 24,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
  testDialog: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testCard: {
    width: width * 0.9,
    padding: spacing.lg,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  testInput: {
    marginBottom: spacing.md,
  },
  testActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});