/**
 * Team Leader Dashboard Screen
 * Phase 2: Displays TL-specific metrics and KPIs
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Snackbar,
  Button,
  TextInput,
  Chip,
  Badge,
  Icon,
  Dialog,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { dashboardAPI } from '../../api/dashboard';
import { remarksAPI } from '../../api/remarks';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';
import { RemarkHistoryEntry } from '../../services/types';

interface TLDashboardData {
  teamSize: number;
  totalHotInquiryCount: number;
  pendingCAOnUpdate: number;
  pendingEnquiriesToUpdate: number;
  todaysBookingPlan: number;
}

interface PendingRemark {
  id: string;
  entityId: string;
  entityType: 'enquiry' | 'booking';
  customerName: string;
  model?: string;
  variant?: string;
  lastRemark: RemarkHistoryEntry;
  daysSinceLastUpdate: number;
  escalationLevel?: '5_DAYS' | '20_25_DAYS' | '30_35_DAYS' | '40_PLUS_DAYS' | '15_DAYS_POST_BOOKING';
}

interface TLNotification {
  id: string;
  type: 'BOOKED' | 'LOST' | 'INACTIVITY' | 'ESCALATION';
  entityId: string;
  entityType: 'enquiry' | 'booking';
  customerName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function TeamLeaderDashboardScreen(): React.JSX.Element {
  const { state: authState } = useAuth();
  const userRole = getUserRole(authState.user);
  
  const [dashboardData, setDashboardData] = useState<TLDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Remark Review State
  const [pendingRemarks, setPendingRemarks] = useState<PendingRemark[]>([]);
  const [loadingRemarks, setLoadingRemarks] = useState(false);
  const [commentDialogVisible, setCommentDialogVisible] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<PendingRemark | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState<TLNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Verify user is Team Lead
  useEffect(() => {
    if (userRole !== 'TEAM_LEAD') {
      setError('Access denied. This dashboard is only available for Team Leaders.');
      setLoading(false);
    }
  }, [userRole]);

  const fetchDashboardData = useCallback(async () => {
    if (userRole !== 'TEAM_LEAD') return;
    
    try {
      setError(null);
      const data = await dashboardAPI.getTeamLeaderDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching TL dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userRole]);

  const fetchPendingRemarks = useCallback(async () => {
    if (userRole !== 'TEAM_LEAD') return;
    
    try {
      setLoadingRemarks(true);
      const data = await remarksAPI.getPendingRemarksForReview();
      
      // Combine enquiries and bookings into a single array
      const combined: PendingRemark[] = [
        ...data.enquiries.map((e) => ({
          id: e.id,
          entityId: e.id,
          entityType: 'enquiry' as const,
          customerName: e.customerName,
          model: e.model,
          variant: e.variant,
          lastRemark: e.lastRemark,
          daysSinceLastUpdate: e.daysSinceLastUpdate,
          escalationLevel: e.escalationLevel as any,
        })),
        ...data.bookings.map((b) => ({
          id: b.id,
          entityId: b.id,
          entityType: 'booking' as const,
          customerName: b.customerName,
          variant: b.variant,
          lastRemark: b.lastRemark,
          daysSinceLastUpdate: b.daysSinceLastUpdate,
          escalationLevel: b.escalationLevel as any,
        })),
      ];
      
      setPendingRemarks(combined);
    } catch (err: any) {
      console.error('Error fetching pending remarks:', err);
      // Don't show error for remarks, just log it
    } finally {
      setLoadingRemarks(false);
    }
  }, [userRole]);

  const fetchNotifications = useCallback(async () => {
    if (userRole !== 'TEAM_LEAD') return;
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // const data = await dashboardAPI.getTLNotifications();
      // For now, use mock data based on escalation rules
      const mockNotifications: TLNotification[] = [];
      
      // Check for escalation alerts
      pendingRemarks.forEach((remark) => {
        if (remark.escalationLevel) {
          let message = '';
          let type: 'INACTIVITY' | 'ESCALATION' = 'ESCALATION';
          
          switch (remark.escalationLevel) {
            case '5_DAYS':
              message = `${remark.customerName}: No update for 5 days`;
              type = 'INACTIVITY';
              break;
            case '20_25_DAYS':
              message = `${remark.customerName}: Lead open for 20-25 days`;
              break;
            case '30_35_DAYS':
              message = `${remark.customerName}: Lead open for 30-35 days - Notify SM`;
              break;
            case '40_PLUS_DAYS':
              message = `${remark.customerName}: Lead open for 40+ days - Notify GM`;
              break;
            case '15_DAYS_POST_BOOKING':
              message = `${remark.customerName}: Booking not retailed within 15 days`;
              break;
          }
          
          mockNotifications.push({
            id: `esc-${remark.id}`,
            type,
            entityId: remark.entityId,
            entityType: remark.entityType,
            customerName: remark.customerName,
            message,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      });
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    }
  }, [userRole, pendingRemarks]);

  useEffect(() => {
    if (userRole === 'TEAM_LEAD') {
      fetchDashboardData();
      fetchPendingRemarks();
    }
  }, [fetchDashboardData, fetchPendingRemarks, userRole]);

  useEffect(() => {
    if (userRole === 'TEAM_LEAD' && pendingRemarks.length > 0) {
      fetchNotifications();
    }
  }, [fetchNotifications, userRole, pendingRemarks.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
    fetchPendingRemarks();
    fetchNotifications();
  }, [fetchDashboardData, fetchPendingRemarks, fetchNotifications]);

  const handleMarkAsReviewed = async (remark: PendingRemark) => {
    try {
      await remarksAPI.markRemarkAsReviewed(remark.lastRemark.id);
      Alert.alert('Success', 'Remark marked as reviewed');
      fetchPendingRemarks();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark remark as reviewed');
    }
  };

  const handleOpenCommentDialog = (remark: PendingRemark) => {
    setSelectedRemark(remark);
    setCommentText('');
    setCommentDialogVisible(true);
  };

  const handleCloseCommentDialog = () => {
    setCommentDialogVisible(false);
    setSelectedRemark(null);
    setCommentText('');
  };

  const handleSubmitComment = async () => {
    if (!selectedRemark || !commentText.trim()) return;
    
    try {
      setSubmittingComment(true);
      await remarksAPI.addReviewComment(selectedRemark.lastRemark.id, commentText.trim());
      Alert.alert('Success', 'Comment added successfully');
      handleCloseCommentDialog();
      fetchPendingRemarks();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getEscalationColor = (level?: string): string => {
    switch (level) {
      case '5_DAYS':
        return '#F59E0B'; // Amber
      case '20_25_DAYS':
        return '#EF4444'; // Red
      case '30_35_DAYS':
        return '#DC2626'; // Dark Red
      case '40_PLUS_DAYS':
        return '#991B1B'; // Very Dark Red
      case '15_DAYS_POST_BOOKING':
        return '#F97316'; // Orange
      default:
        return '#64748B'; // Gray
    }
  };

  const getEscalationLabel = (level?: string): string => {
    switch (level) {
      case '5_DAYS':
        return '5 Days No Update';
      case '20_25_DAYS':
        return '20-25 Days Open';
      case '30_35_DAYS':
        return '30-35 Days (Notify SM)';
      case '40_PLUS_DAYS':
        return '40+ Days (Notify GM)';
      case '15_DAYS_POST_BOOKING':
        return '15 Days Post-Booking';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoLinearGradient
        colors={['#F8FAFC', '#EFF6FF', '#F0F9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>
              Team Leader Dashboard
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Track your team's performance
            </Text>
          </View>

          {/* Team Size Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Team Size</Text>
              <Text style={styles.cardValue}>{dashboardData.teamSize}</Text>
              <Text style={styles.cardSubtitle}>Team Members</Text>
            </Card.Content>
          </Card>

          {/* Total Hot Inquiry Count */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Total Hot Inquiry Count</Text>
              <Text style={styles.cardValue}>{dashboardData.totalHotInquiryCount}</Text>
              <Text style={styles.cardSubtitle}>Active HOT Leads</Text>
            </Card.Content>
          </Card>

          {/* Pending CA on Update */}
          <Card style={[styles.card, dashboardData.pendingCAOnUpdate > 0 && styles.urgentCard]}>
            <Card.Content>
              <Text style={styles.cardTitle}>Pending CA on Update</Text>
              <Text style={[styles.cardValue, dashboardData.pendingCAOnUpdate > 0 && styles.urgentValue]}>
                {dashboardData.pendingCAOnUpdate}
              </Text>
              <Text style={styles.cardSubtitle}>CAs who missed updates today</Text>
            </Card.Content>
          </Card>

          {/* Pending Enquiries To Update */}
          <Card style={[styles.card, dashboardData.pendingEnquiriesToUpdate > 0 && styles.urgentCard]}>
            <Card.Content>
              <Text style={styles.cardTitle}>Pending Enquiries To Update</Text>
              <Text style={[styles.cardValue, dashboardData.pendingEnquiriesToUpdate > 0 && styles.urgentValue]}>
                {dashboardData.pendingEnquiriesToUpdate}
              </Text>
              <Text style={styles.cardSubtitle}>Enquiries needing action</Text>
            </Card.Content>
          </Card>

          {/* Today's Booking Plan */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Today's Booking Plan</Text>
              <Text style={styles.cardValue}>{dashboardData.todaysBookingPlan}</Text>
              <Text style={styles.cardSubtitle}>EDB = Today</Text>
            </Card.Content>
          </Card>

          {/* Notifications Section */}
          {unreadCount > 0 && (
            <Card style={[styles.card, styles.notificationCard]}>
              <Card.Content>
                <View style={styles.notificationHeader}>
                  <Text style={styles.cardTitle}>Notifications</Text>
                  <Badge style={styles.badge}>{unreadCount}</Badge>
                </View>
                <View style={styles.notificationList}>
                  {notifications.slice(0, 3).map((notification) => (
                    <View key={notification.id} style={styles.notificationItem}>
                      <Icon 
                        source={
                          notification.type === 'BOOKED' ? 'check-circle' :
                          notification.type === 'LOST' ? 'close-circle' :
                          'alert-circle'
                        }
                        size={20}
                        color={
                          notification.type === 'BOOKED' ? '#10B981' :
                          notification.type === 'LOST' ? '#EF4444' :
                          '#F59E0B'
                        }
                      />
                      <Text style={styles.notificationText} numberOfLines={2}>
                        {notification.message}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Remark Review Section */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Remark Review</Text>
                {pendingRemarks.length > 0 && (
                  <Badge style={styles.badge}>{pendingRemarks.length}</Badge>
                )}
              </View>
              <Text style={styles.sectionSubtitle}>
                Review CA updates and provide feedback
              </Text>

              {loadingRemarks ? (
                <ActivityIndicator size="small" color="#3B82F6" style={styles.loader} />
              ) : pendingRemarks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No pending remarks to review</Text>
                </View>
              ) : (
                <View style={styles.remarksList}>
                  {pendingRemarks.slice(0, 5).map((remark) => (
                    <Card key={remark.id} style={styles.remarkCard}>
                      <Card.Content>
                        <View style={styles.remarkHeader}>
                          <View style={styles.remarkInfo}>
                            <Text style={styles.remarkCustomerName}>
                              {remark.customerName}
                            </Text>
                            <Text style={styles.remarkDetails}>
                              {remark.model && remark.variant 
                                ? `${remark.model} - ${remark.variant}`
                                : remark.variant || 'N/A'}
                            </Text>
                            <Text style={styles.remarkType}>
                              {remark.entityType === 'enquiry' ? 'Enquiry' : 'Booking'}
                            </Text>
                          </View>
                          {remark.escalationLevel && (
                            <Chip
                              style={[
                                styles.escalationChip,
                                { backgroundColor: getEscalationColor(remark.escalationLevel) + '20' },
                              ]}
                              textStyle={[
                                styles.escalationChipText,
                                { color: getEscalationColor(remark.escalationLevel) },
                              ]}
                              compact
                            >
                              {getEscalationLabel(remark.escalationLevel)}
                            </Chip>
                          )}
                        </View>

                        <View style={styles.remarkContent}>
                          <Text style={styles.remarkLabel}>Last Update:</Text>
                          <Text style={styles.remarkText}>
                            {remark.lastRemark.remark}
                          </Text>
                          <Text style={styles.remarkMeta}>
                            {remark.daysSinceLastUpdate} days ago
                          </Text>
                        </View>

                        <View style={styles.remarkActions}>
                          <Button
                            mode="outlined"
                            onPress={() => handleMarkAsReviewed(remark)}
                            style={styles.reviewButton}
                            compact
                          >
                            Reviewed
                          </Button>
                          <Button
                            mode="contained"
                            onPress={() => handleOpenCommentDialog(remark)}
                            style={styles.commentButton}
                            compact
                          >
                            Comment
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                  {pendingRemarks.length > 5 && (
                    <Text style={styles.moreText}>
                      +{pendingRemarks.length - 5} more pending remarks
                    </Text>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Comment Dialog */}
        <Portal>
          <Dialog
            visible={commentDialogVisible}
            onDismiss={handleCloseCommentDialog}
            style={styles.dialog}
          >
            <Dialog.Title>Add Comment</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogLabel}>
                Customer: {selectedRemark?.customerName}
              </Text>
              <TextInput
                label="Your Comment"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={4}
                mode="outlined"
                style={styles.commentInput}
                placeholder="Add your comment or feedback..."
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleCloseCommentDialog}>Cancel</Button>
              <Button
                onPress={handleSubmitComment}
                mode="contained"
                loading={submittingComment}
                disabled={!commentText.trim() || submittingComment}
              >
                Submit
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError(null)}
          duration={3000}
        >
          {error}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '900',
    color: '#0F172A',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 4,
  },
  urgentValue: {
    color: '#EF4444',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  notificationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#EF4444',
  },
  notificationList: {
    gap: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  remarksList: {
    gap: 12,
  },
  remarkCard: {
    marginBottom: 8,
    elevation: 1,
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  remarkInfo: {
    flex: 1,
  },
  remarkCustomerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  remarkDetails: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  remarkType: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  escalationChip: {
    marginLeft: 8,
  },
  escalationChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  remarkContent: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  remarkLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  remarkText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  remarkMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  remarkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewButton: {
    flex: 1,
  },
  commentButton: {
    flex: 1,
  },
  moreText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  dialog: {
    borderRadius: 12,
  },
  dialogLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
  },
});

