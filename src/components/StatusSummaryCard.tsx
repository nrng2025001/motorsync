/**
 * Status Summary Card Component
 * Displays analytics and status breakdown for bookings/enquiries
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../api/bookings';
import { enquiryAPI } from '../api/enquiries';

interface StatusSummaryCardProps {
  type: 'bookings' | 'enquiries';
  onRefresh?: () => void;
  style?: any;
}

interface SummaryData {
  totalBookings?: number;
  totalEnquiries?: number;
  recentBookings?: number;
  recentEnquiries?: number;
  pendingBookings?: number;
  hotEnquiries?: number;
  statusBreakdown?: Array<{
    status: string;
    count: number;
  }>;
  categoryBreakdown?: Array<{
    category: string;
    count: number;
  }>;
  overdueDeliveries?: number;
  overdueFollowUps?: number;
}

export const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({
  type,
  onRefresh,
  style,
}) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = type === 'bookings' 
        ? await bookingAPI.getBookingStatusSummary()
        : await enquiryAPI.getEnquiryStatusSummary();
        
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setError('Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
    onRefresh?.();
  };

  useEffect(() => {
    fetchSummary();
  }, [type]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': '#FF9500',
      'CONFIRMED': '#34C759',
      'DELIVERED': '#007AFF',
      'CANCELLED': '#FF3B30',
      'NEW': '#007AFF',
      'FOLLOW_UP': '#FF9500',
      'CONVERTED': '#34C759',
      'LOST': '#8E8E93',
      'HOT': '#FF3B30',
      'WARM': '#FF9500',
      'COLD': '#8E8E93',
    };
    return colors[status] || '#6B6B6B';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'NEW': 'New',
      'FOLLOW_UP': 'Follow Up',
      'CONVERTED': 'Converted',
      'LOST': 'Lost',
      'HOT': 'Hot',
      'WARM': 'Warm',
      'COLD': 'Cold',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error || 'Failed to load summary'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSummary}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const breakdown = summary.statusBreakdown || summary.categoryBreakdown || [];
  const total = summary.totalBookings || summary.totalEnquiries || 0;

  return (
    <ScrollView
      style={[styles.container, style]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {type === 'bookings' ? '📊 Booking Analytics' : '📈 Enquiry Analytics'}
        </Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {summary.recentBookings || summary.recentEnquiries || 0}
          </Text>
          <Text style={styles.statLabel}>Recent (7 days)</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {summary.pendingBookings || summary.hotEnquiries || 0}
          </Text>
          <Text style={styles.statLabel}>
            {type === 'bookings' ? 'Pending' : 'Hot'}
          </Text>
        </View>
      </View>

      {breakdown.length > 0 && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>
            {type === 'bookings' ? 'Status Breakdown' : 'Category Breakdown'}
          </Text>
          {breakdown.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            const status = item.status || item.category;
            
            return (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <View style={styles.breakdownLabelContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(status) },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>
                      {getStatusLabel(status)}
                    </Text>
                  </View>
                  <Text style={styles.breakdownCount}>{item.count}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: getStatusColor(status),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.percentageText}>{percentage}%</Text>
              </View>
            );
          })}
        </View>
      )}

      {(summary.overdueDeliveries || summary.overdueFollowUps) > 0 && (
        <View style={styles.alertContainer}>
          <Ionicons name="warning" size={20} color="#FF9500" />
          <Text style={styles.alertText}>
            {type === 'bookings' 
              ? `⚠️ ${summary.overdueDeliveries} overdue deliveries`
              : `⚠️ ${summary.overdueFollowUps} overdue follow-ups`
            }
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  refreshButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b6b6b',
    marginTop: 4,
    textAlign: 'center',
  },
  breakdownContainer: {
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  breakdownCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  alertContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertText: {
    color: '#856404',
    fontSize: 14,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default StatusSummaryCard;
