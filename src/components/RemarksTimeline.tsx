/**
 * Remarks Timeline Component
 * Enhanced remarks display with timeline view and user attribution
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Remark {
  id: string;
  remark: string;
  remarkType: string;
  createdAt: string;
  user: {
    name: string;
    role: { name: string };
  };
}

interface RemarksTimelineProps {
  entityType: 'enquiry' | 'booking';
  entityId: string;
  onAddRemark?: () => void;
  style?: any;
}

export const RemarksTimeline: React.FC<RemarksTimelineProps> = ({
  entityType,
  entityId,
  onAddRemark,
  style,
}) => {
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRemarks();
  }, [entityId]);

  const fetchRemarks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call
      // const response = await getRemarksHistory(entityType, entityId);
      // setRemarks(response.data.remarks);
      
      // Mock data
      const mockRemarks: Remark[] = [
        {
          id: '1',
          remark: 'Customer showed interest in the vehicle. Follow up scheduled for next week.',
          remarkType: 'ca_remarks',
          createdAt: new Date().toISOString(),
          user: { name: 'John Doe', role: { name: 'Customer Advisor' } },
        },
        {
          id: '2',
          remark: 'Good progress. Customer has budget approval.',
          remarkType: 'tl_remarks',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          user: { name: 'Jane Smith', role: { name: 'Team Lead' } },
        },
        {
          id: '3',
          remark: 'Customer requested additional financing options.',
          remarkType: 'ca_remarks',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          user: { name: 'John Doe', role: { name: 'Customer Advisor' } },
        },
      ];
      
      setRemarks(mockRemarks);
    } catch (error) {
      console.error('Failed to fetch remarks:', error);
      setError('Failed to load remarks');
    } finally {
      setLoading(false);
    }
  };

  const getRemarkTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'ca_remarks': '#007AFF',
      'tl_remarks': '#34C759',
      'sm_remarks': '#FF9500',
      'gm_remarks': '#FF3B30',
      'admin_remarks': '#8E8E93',
    };
    return colors[type] || '#6B6B6B';
  };

  const getRemarkTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'ca_remarks': 'CA',
      'tl_remarks': 'TL',
      'sm_remarks': 'SM',
      'gm_remarks': 'GM',
      'admin_remarks': 'Admin',
    };
    return labels[type] || 'General';
  };

  const getRemarkTypeFullLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'ca_remarks': 'Customer Advisor',
      'tl_remarks': 'Team Lead',
      'sm_remarks': 'Sales Manager',
      'gm_remarks': 'General Manager',
      'admin_remarks': 'Admin',
    };
    return labels[type] || 'General';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading remarks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRemarks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayRemarks = expanded ? remarks : remarks.slice(0, 3);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>📝 Remarks History</Text>
        <View style={styles.headerActions}>
          {remarks.length > 0 && (
            <Text style={styles.countText}>{remarks.length} remarks</Text>
          )}
          <TouchableOpacity onPress={onAddRemark} style={styles.addButton}>
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {remarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No remarks yet</Text>
          <TouchableOpacity style={styles.addFirstButton} onPress={onAddRemark}>
            <Text style={styles.addFirstButtonText}>Add First Remark</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.remarksContainer} showsVerticalScrollIndicator={false}>
          {displayRemarks.map((remark, index) => (
            <View key={remark.id} style={styles.remarkItem}>
              <View style={styles.remarkHeader}>
                <View style={styles.remarkMeta}>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRemarkTypeColor(remark.remarkType) },
                    ]}
                  >
                    <Text style={styles.roleText}>
                      {getRemarkTypeLabel(remark.remarkType)}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{remark.user.name}</Text>
                    <Text style={styles.userRole}>
                      {getRemarkTypeFullLabel(remark.remarkType)}
                    </Text>
                  </View>
                </View>
                <View style={styles.timestampContainer}>
                  <Text style={styles.timestamp}>{formatDate(remark.createdAt)}</Text>
                  <Text style={styles.timeText}>{formatTime(remark.createdAt)}</Text>
                </View>
              </View>
              <Text style={styles.remarkText}>{remark.remark}</Text>
            </View>
          ))}

          {remarks.length > 3 && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setExpanded(!expanded)}
            >
              <Text style={styles.expandText}>
                {expanded ? 'Show Less' : `Show ${remarks.length - 3} More`}
              </Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#007AFF"
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addButton: {
    padding: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addFirstButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  remarksContainer: {
    maxHeight: 400,
  },
  remarkItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  remarkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  userRole: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  remarkText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 4,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  expandText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RemarksTimeline;
