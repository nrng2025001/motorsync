import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Icon,
  Divider,
  ActivityIndicator,
  TextInput,
  Menu,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, spacing } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';
import { bookingAPI } from '../../api/bookings';
import { type Booking, BookingStatus, StockAvailability, RemarkHistoryEntry } from '../../services/types';
import { AuthAPI } from '../../api/auth';
import { remarksAPI } from '../../api/remarks';
import { Dialog, Portal } from 'react-native-paper';
import { useMemo } from 'react';
import { formatDateTime, formatDate } from '../../utils/formatting';

/**
 * Role to remarks field mapping
 */
const remarksFieldMap: Record<string, keyof Booking> = {
  'CUSTOMER_ADVISOR': 'advisorRemarks',
  'TEAM_LEAD': 'teamLeadRemarks',
  'SALES_MANAGER': 'salesManagerRemarks',
  'GENERAL_MANAGER': 'generalManagerRemarks',
  'ADMIN': 'adminRemarks',
};

/**
 * Extract clean remarks content without timestamp
 */
const extractCleanRemarks = (remarks: string): string => {
  if (!remarks) return '';
  // Check if remarks end with a timestamp pattern (format: " - Jan 15, 2024, 02:30 PM")
  const timestampPattern = /\s-\s[A-Z][a-z]{2}\s\d{1,2},\s\d{4},\s\d{1,2}:\d{2}\s(AM|PM)$/;
  return remarks.replace(timestampPattern, '').trim();
};

/**
 * Append timestamp to remarks content
 */
const appendTimestampToRemarks = (remarks: string): string => {
  const cleanRemarks = extractCleanRemarks(remarks);
  if (!cleanRemarks) return '';
  
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return `${cleanRemarks} - ${timestamp}`;
};

/**
 * Extract timestamp from remarks content
 */
const extractTimestampFromRemarks = (remarks: string): string => {
  if (!remarks) return '';
  const timestampPattern = /\s-\s([A-Z][a-z]{2}\s\d{1,2},\s\d{4},\s\d{1,2}:\d{2}\s(AM|PM))$/;
  const match = remarks.match(timestampPattern);
  return match ? match[1] : '';
};

/**
 * Booking Details Screen Component
 * Shows comprehensive booking information with role-specific remarks
 */
export function BookingDetailsScreen({ route, navigation }: any): React.JSX.Element {
  const { bookingId } = route?.params || {};
  const { state: authState } = useAuth();
  const userRole = getUserRole(authState.user);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Phase 2: Timeline-based remarks (same as enquiry)
  const [remarkHistory, setRemarkHistory] = useState<RemarkHistoryEntry[]>([]);
  const [remarkInput, setRemarkInput] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [remarkError, setRemarkError] = useState<string | null>(null);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [cancellingRemark, setCancellingRemark] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [remarkToCancel, setRemarkToCancel] = useState<RemarkHistoryEntry | null>(null);
  
  // Legacy editable fields state (kept for backward compatibility)
  const [editableRemarks, setEditableRemarks] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [editingFinance, setEditingFinance] = useState(false);
  const [financeData, setFinanceData] = useState({
    financeRequired: false,
    financerName: '',
    fileLoginDate: '',
    approvalDate: '',
  });
  
  // Assignment and audit log state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [loadingAuditLog, setLoadingAuditLog] = useState(false);
  
  // Helper functions for remark cancellation (same as enquiry)
  const currentUserId = useMemo(() => {
    return (
      (authState.user as any)?.firebaseUid ||
      (authState.user as any)?.user?.firebaseUid ||
      authState.user?.firebaseUid ||
      authState.user?.id ||
      ''
    );
  }, [authState.user]);

  const currentUserRole = authState.user?.role?.name || '';

  const canCancelRemark = (remark: RemarkHistoryEntry): boolean => {
    if (!remark || remark.cancelled) return false;
    if (!currentUserId) return false;

    const elevatedRoles = ['ADMIN', 'GENERAL_MANAGER', 'SALES_MANAGER', 'TEAM_LEAD'];
    if (elevatedRoles.includes(currentUserRole)) {
      return true;
    }

    return remark.createdBy?.id === currentUserId;
  };

  const openCancelRemarkDialog = (remark: RemarkHistoryEntry) => {
    setRemarkToCancel(remark);
    setCancelReason('');
    setCancelDialogVisible(true);
  };

  /**
   * Fetch booking details
   */
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await bookingAPI.getBookingById(bookingId);
        
        // Handle nested response structure: {data: {data: {booking: {...}}}}
        const responseData = response.data as any;
        const bookingData = responseData?.data?.booking || responseData?.booking || responseData;
        
        console.log('✅ Booking Data received:', responseData);
        console.log('✅ Booking ID:', bookingData?.id);
        
        if (!bookingData || !bookingData.id) {
          console.error('❌ Invalid booking data - missing ID or data:', { 
            hasData: !!bookingData, 
            hasId: !!bookingData?.id,
            data: bookingData 
          });
          throw new Error('Invalid booking data received');
        }
        
        setBooking(bookingData);
        
        // Phase 2: Initialize timeline-based remarks (same as enquiry)
        if (Array.isArray(bookingData.remarkHistory)) {
          // Show last 3-5 remarks (chronological, not by date)
          const filteredRemarks = bookingData.remarkHistory
            .filter((entry: RemarkHistoryEntry) => !entry.cancelled)
            .sort((a: RemarkHistoryEntry, b: RemarkHistoryEntry) => {
              try {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                  return 0;
                }
                return dateB.getTime() - dateA.getTime();
              } catch (error) {
                return 0;
              }
            })
            .slice(0, 5); // Show last 5 remarks
          setRemarkHistory(filteredRemarks);
        } else {
          setRemarkHistory([]);
        }
        
        // Legacy: Initialize editable fields - extract clean remarks without timestamp
        const userRemarksField = remarksFieldMap[userRole];
        const rawRemarks = (bookingData[userRemarksField] as string) || '';
        setEditableRemarks(extractCleanRemarks(rawRemarks));
        
        setFinanceData({
          financeRequired: bookingData.financeRequired || false,
          financerName: bookingData.financerName || '',
          fileLoginDate: bookingData.fileLoginDate || '',
          approvalDate: bookingData.approvalDate || '',
        });
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, userRole]);

  /**
   * Phase 2: Handle adding a new remark (same as enquiry)
   */
  const handleAddRemark = async () => {
    if (!booking) return;

    const trimmedRemark = remarkInput.trim();
    if (!trimmedRemark) {
      setRemarkError('Please enter a remark before submitting.');
      return;
    }

    // Phase 2: Check 20 remark limit
    const currentRemarkCount = (booking.remarkHistory || []).filter(r => !r.cancelled).length;
    if (currentRemarkCount >= 20) {
      Alert.alert(
        'Limit Reached',
        'Maximum 20 remarks allowed per booking. Please contact admin to remove old remarks.'
      );
      return;
    }

    try {
      setSubmittingRemark(true);
      const newRemark = await remarksAPI.addBookingRemark(booking.id, trimmedRemark);
      
      // Phase 2: Show last 3-5 remarks (chronological, not by date)
      const updatedRemarks = [newRemark, ...remarkHistory]
        .filter((entry) => !entry.cancelled)
        .sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 5); // Show last 5 remarks
      
      setRemarkHistory(updatedRemarks);
      setBooking((prev) =>
        prev
          ? {
              ...prev,
              remarkHistory: [newRemark, ...(prev.remarkHistory || [])],
            }
          : prev
      );
      setRemarkInput('');
      setRemarkError(null);
      Alert.alert('Success', 'Remark added successfully.');
    } catch (err: any) {
      console.error('❌ Error adding remark:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add remark. Please try again.';
      
      // Phase 2: Handle 20 remark limit error
      if (errorMessage.includes('Maximum 20 remarks') || errorMessage.includes('remark limit')) {
        Alert.alert(
          'Limit Reached',
          'Maximum 20 remarks allowed per booking. Please contact admin to remove old remarks.'
        );
      } else {
        setRemarkError(errorMessage);
      }
    } finally {
      setSubmittingRemark(false);
    }
  };

  /**
   * Phase 2: Handle cancelling a remark (same as enquiry)
   */
  const handleCancelRemark = async () => {
    if (!remarkToCancel) return;
    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      Alert.alert('Cancellation Reason', 'Please provide a reason for cancelling this remark.');
      return;
    }

    try {
      setCancellingRemark(true);
      await remarksAPI.cancelRemark(remarkToCancel.id, trimmedReason);

      // Phase 2: Update remark history - show last 3-5 remarks (chronological)
      setRemarkHistory((prev) =>
        prev
          .filter((entry) => entry.id !== remarkToCancel.id)
          .filter((entry) => !entry.cancelled)
          .sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, 5) // Show last 5 remarks
      );

      setBooking((prev) =>
        prev
          ? {
              ...prev,
              remarkHistory: (prev.remarkHistory || []).map((entry) =>
                entry.id === remarkToCancel.id
                  ? { ...entry, cancelled: true, cancellationReason: trimmedReason }
                  : entry
              ),
            }
          : prev
      );

      setCancelDialogVisible(false);
      setRemarkToCancel(null);
      setCancelReason('');
      Alert.alert('Remark Cancelled', 'The remark has been cancelled successfully.');
    } catch (err: any) {
      console.error('❌ Error cancelling remark:', err);
      Alert.alert('Error', err.message || 'Failed to cancel remark. Please try again.');
    } finally {
      setCancellingRemark(false);
    }
  };

  /**
   * Close cancel dialog
   */
  const closeCancelDialog = () => {
    if (cancellingRemark) return;
    setCancelDialogVisible(false);
    setRemarkToCancel(null);
    setCancelReason('');
  };

  /**
   * Legacy: Update remarks based on user role (kept for backward compatibility)
   */
  const handleUpdateRemarks = async () => {
    if (!booking) return;
    
    setUpdating(true);
    try {
      const userRemarksField = remarksFieldMap[userRole];
      // Append timestamp to remarks content
      const remarksWithTimestamp = appendTimestampToRemarks(editableRemarks);
      const updateData = {
        [userRemarksField]: remarksWithTimestamp,
      };
      
      await bookingAPI.updateBooking(booking.id, updateData);
      
      Alert.alert('Success', 'Remarks updated successfully');
      
      // Refresh booking data
      const response = await bookingAPI.getBookingById(booking.id);
      const responseData = response.data as any;
      const bookingData = responseData?.data?.booking || responseData?.booking || responseData;
      setBooking(bookingData);
      
      // Update the editable remarks with clean value (without timestamp)
      const rawRemarks = (bookingData[userRemarksField] as string) || '';
      setEditableRemarks(extractCleanRemarks(rawRemarks));
    } catch (err: any) {
      console.error('Error updating remarks:', err);
      Alert.alert('Error', err.message || 'Failed to update remarks');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Phase 2: Helper functions for remarks display (same as enquiry)
   */
  const isToday = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    } catch (error) {
      return false;
    }
  };

  const isYesterday = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      );
    } catch (error) {
      return false;
    }
  };

  const formatDayLabel = (dayKey: string): string => {
    if (!dayKey) return 'Unknown date';
    try {
      const testDate = new Date(dayKey);
      if (isNaN(testDate.getTime())) {
        return 'Invalid date';
      }
      if (isToday(testDate.toISOString())) {
        return 'Today';
      }
      if (isYesterday(testDate.toISOString())) {
        return 'Yesterday';
      }
      return formatDate(dayKey, { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (error) {
      console.warn('Error formatting day label:', dayKey, error);
      return 'Invalid date';
    }
  };

  const groupRemarksByDay = (remarks: RemarkHistoryEntry[]) => {
    const grouped: { [key: string]: RemarkHistoryEntry[] } = {};
    
    remarks.forEach((remark) => {
      if (!remark.createdAt) return;
      try {
        const date = new Date(remark.createdAt);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date in remark:', remark.createdAt);
          return;
        }
        date.setHours(0, 0, 0, 0);
        const dayKey = date.toISOString().split('T')[0];
        if (!grouped[dayKey]) {
          grouped[dayKey] = [];
        }
        grouped[dayKey].push(remark);
      } catch (error) {
        console.warn('Error processing remark date:', remark.createdAt, error);
      }
    });
    
    const sortedDays = Object.keys(grouped).sort((a, b) => {
      return b.localeCompare(a);
    });
    
    return { grouped, sortedDays };
  };

  /**
   * Update booking status
   */
  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    if (!booking) return;
    
    setStatusMenuVisible(false);
    setUpdating(true);
    
    try {
      await bookingAPI.updateBooking(booking.id, {
        status: newStatus,
      });
      
      Alert.alert('Success', `Status updated to ${newStatus}`);
      
      // Refresh booking data
      const response = await bookingAPI.getBookingById(booking.id);
      const responseData = response.data as any;
      const bookingData = responseData?.data?.booking || responseData?.booking || responseData;
      setBooking(bookingData);
    } catch (err: any) {
      console.error('Error updating status:', err);
      Alert.alert('Error', err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Update finance details
   */
  const handleUpdateFinance = async () => {
    if (!booking) return;
    
    setUpdating(true);
    try {
      await bookingAPI.updateBooking(booking.id, financeData);
      
      Alert.alert('Success', 'Finance details updated successfully');
      setEditingFinance(false);
      
      // Refresh booking data
      const response = await bookingAPI.getBookingById(booking.id);
      const responseData = response.data as any;
      const bookingData = responseData?.data?.booking || responseData?.booking || responseData;
      setBooking(bookingData);
    } catch (err: any) {
      console.error('Error updating finance:', err);
      Alert.alert('Error', err.message || 'Failed to update finance details');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case 'PENDING': return '#FF9800';
      case 'ASSIGNED': return '#2196F3';
      case 'IN_PROGRESS': return '#9C27B0';
      case 'CONFIRMED': return '#4CAF50';
      case 'DELIVERED': return '#8BC34A';
      case 'CANCELLED': return '#F44336';
      case 'NO_SHOW': return '#9E9E9E';
      case 'WAITLISTED': return '#FF5722';
      case 'RESCHEDULED': return '#607D8B';
      case 'APPROVED': return '#00BCD4';
      case 'REJECTED': return '#E91E63';
      default: return '#9E9E9E';
    }
  };

  /**
   * Get role label
   */
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'CUSTOMER_ADVISOR': return 'Customer Advisor';
      case 'TEAM_LEAD': return 'Team Lead';
      case 'SALES_MANAGER': return 'Sales Manager';
      case 'GENERAL_MANAGER': return 'General Manager';
      case 'ADMIN': return 'Admin';
      default: return role;
    }
  };

  /**
   * Handle booking assignment (for managers)
   */
  const handleAssignBooking = async () => {
    if (!booking) return;
    
    try {
      // Get available advisors
      const usersResponse = await AuthAPI.getUsers();
      const advisors = usersResponse.filter((user: any) => 
        user.role?.name === 'CUSTOMER_ADVISOR' && user.isActive
      );
      
      if (advisors.length === 0) {
        Alert.alert('No Advisors', 'No active customer advisors found.');
        return;
      }
      
      // Create advisor selection options
      const advisorOptions = advisors.map((advisor: any) => ({
        text: `${advisor.name} (${advisor.employeeId || 'N/A'})`,
        onPress: async () => {
          try {
            setUpdating(true);
            console.log('🔄 Assigning booking to:', advisor.name);
            await bookingAPI.assignBooking(booking.id, advisor.firebaseUid);
            
            // Refresh booking data
            const response = await bookingAPI.getBookingById(booking.id);
            const responseData = response.data as any;
            const bookingData = responseData?.data?.booking || responseData?.booking || responseData;
            setBooking(bookingData);
            
            Alert.alert('Success', `Booking assigned to ${advisor.name} successfully!`);
          } catch (error: any) {
            console.error('❌ Error assigning booking:', error);
            Alert.alert(
              'Error', 
              `Failed to assign booking: ${error.message || 'Please try again.'}`
            );
          } finally {
            setUpdating(false);
          }
        }
      }));
      
      // Add unassign option if booking is already assigned
      if (booking.advisorId) {
        advisorOptions.push({
          text: 'Unassign',
          style: 'destructive' as const,
          onPress: async () => {
            try {
              setUpdating(true);
              await bookingAPI.unassignBooking(booking.id);
              
              // Refresh booking data
              const response = await bookingAPI.getBookingById(booking.id);
              const responseData = response.data as any;
              const bookingData = responseData?.data?.booking || responseData?.booking || responseData;
              setBooking(bookingData);
              
              Alert.alert('Success', 'Booking unassigned successfully!');
            } catch (error: any) {
              console.error('❌ Error unassigning booking:', error);
              Alert.alert(
                'Error', 
                `Failed to unassign booking: ${error.message || 'Please try again.'}`
              );
            } finally {
              setUpdating(false);
            }
          }
        });
      }
      
      Alert.alert(
        'Assign Booking',
        'Select an advisor to assign this booking to:',
        advisorOptions
      );
    } catch (error: any) {
      console.error('❌ Error fetching advisors:', error);
      Alert.alert('Error', 'Failed to load advisors. Please try again.');
    }
  };

  /**
   * Fetch booking audit log
   */
  const fetchAuditLog = async () => {
    if (!booking) return;
    
    try {
      setLoadingAuditLog(true);
      const response = await bookingAPI.getBookingAuditLog(booking.id);
      const responseData = response.data as any;
      const logs = responseData?.data?.auditLogs || responseData?.auditLogs || [];
      setAuditLogs(logs);
      setShowAuditLog(true);
    } catch (error: any) {
      console.error('❌ Error fetching audit log:', error);
      Alert.alert('Error', 'Failed to load audit log. Please try again.');
    } finally {
      setLoadingAuditLog(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Booking Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading booking details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Booking Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={48} color={theme.colors.error} />
          <Text variant="titleMedium" style={styles.errorText}>
            {error || 'Booking not found'}
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const statusOptions: BookingStatus[] = [
    BookingStatus.PENDING, 
    BookingStatus.IN_PROGRESS, 
    BookingStatus.CONFIRMED, 
    BookingStatus.DELIVERED, 
    BookingStatus.CANCELLED
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          Booking Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusBanner}>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
            textStyle={styles.statusChipText}
          >
            {booking.status}
          </Chip>
          {userRole === 'CUSTOMER_ADVISOR' ? (
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={() => setStatusMenuVisible(true)}
                  disabled={updating}
                >
                  Change Status
                </Button>
              }
            >
              {statusOptions.map((status) => (
                <Menu.Item
                  key={status}
                  onPress={() => handleUpdateStatus(status)}
                  title={status}
                />
              ))}
            </Menu>
          ) : (
            <Text style={styles.readOnlyLabel}>Read-Only</Text>
          )}
        </View>

        {/* Customer Information */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              <Icon source="account" size={20} /> Customer Information
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{booking.customerName || 'Not available'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{booking.customerPhone || 'Not available'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{booking.customerEmail || 'Not available'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              <Icon source="car" size={20} /> Vehicle Information
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Variant:</Text>
              <Text style={styles.infoValue}>{booking.variant || 'Not available'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Color:</Text>
              <Text style={styles.infoValue}>{booking.color || 'Not available'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fuel Type:</Text>
              <Text style={styles.infoValue}>{booking.fuelType || 'Not available'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Transmission:</Text>
              <Text style={styles.infoValue}>{booking.transmission || 'Not available'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Finance Information - EDITABLE */}
        <Card style={styles.section}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                <Icon source="cash" size={20} /> Finance Information
              </Text>
              {userRole === 'CUSTOMER_ADVISOR' && (
                <Button 
                  mode="text" 
                  compact 
                  onPress={() => setEditingFinance(!editingFinance)}
                  disabled={updating}
                >
                  {editingFinance ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </View>
            <Divider style={styles.divider} />
            
            {editingFinance && userRole === 'CUSTOMER_ADVISOR' ? (
              <>
                <View style={styles.switchRow}>
                  <Text style={styles.infoLabel}>Finance Required:</Text>
                  <Button
                    mode={financeData.financeRequired ? 'contained' : 'outlined'}
                    compact
                    onPress={() => setFinanceData(prev => ({ ...prev, financeRequired: !prev.financeRequired }))}
                  >
                    {financeData.financeRequired ? 'Yes' : 'No'}
                  </Button>
                </View>
                
                {financeData.financeRequired && (
                  <>
                    <TextInput
                      label="Financer Name"
                      value={financeData.financerName}
                      onChangeText={(text) => setFinanceData(prev => ({ ...prev, financerName: text }))}
                      style={styles.textInput}
                      mode="outlined"
                    />
                    
                    <TextInput
                      label="File Login Date"
                      value={financeData.fileLoginDate}
                      onChangeText={(text) => setFinanceData(prev => ({ ...prev, fileLoginDate: text }))}
                      placeholder="YYYY-MM-DD"
                      style={styles.textInput}
                      mode="outlined"
                    />
                    
                    <TextInput
                      label="Approval Date"
                      value={financeData.approvalDate}
                      onChangeText={(text) => setFinanceData(prev => ({ ...prev, approvalDate: text }))}
                      placeholder="YYYY-MM-DD"
                      style={styles.textInput}
                      mode="outlined"
                    />
                  </>
                )}
                
                <Button 
                  mode="contained" 
                  onPress={handleUpdateFinance}
                  loading={updating}
                  disabled={updating}
                  style={styles.updateButton}
                >
                  Update Finance Details
                </Button>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Finance Required:</Text>
                  <Text style={styles.infoValue}>{booking.financeRequired ? 'Yes' : 'No'}</Text>
                </View>
                
                {booking.financeRequired && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Financer:</Text>
                      <Text style={styles.infoValue}>{booking.financerName || 'Not specified'}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>File Login Date:</Text>
                      <Text style={styles.infoValue}>
                        {booking.fileLoginDate ? new Date(booking.fileLoginDate).toLocaleDateString() : 'Not set'}
                      </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Approval Date:</Text>
                      <Text style={styles.infoValue}>
                        {booking.approvalDate ? new Date(booking.approvalDate).toLocaleDateString() : 'Not set'}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Stock & Delivery Information */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              <Icon source="truck-delivery" size={20} /> Stock & Delivery
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stock Availability:</Text>
              <Chip style={styles.stockChip}>
                {booking.stockAvailability}
              </Chip>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expected Delivery:</Text>
              <Text style={styles.infoValue}>
                {booking.expectedDeliveryDate ? new Date(booking.expectedDeliveryDate).toLocaleDateString() : 'Not set'}
              </Text>
            </View>
            
            {booking.rtoDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>RTO Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date(booking.rtoDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {/* Phase 2: Vahan Date */}
            {booking.vahanDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vahan Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date(booking.vahanDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {booking.stockAvailability === StockAvailability.VEHICLE_AVAILABLE
                  ? 'Chassis Number:'
                  : 'Allocation / Order Number:'}
              </Text>
              <Text style={styles.infoValue}>
                {booking.stockAvailability === StockAvailability.VEHICLE_AVAILABLE
                  ? booking.chassisNumber || 'Not assigned'
                  : booking.allocationOrderNumber || 'Not assigned'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Phase 2: Timeline-based Remarks (same as enquiry) */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Remarks (Last 3-5)
            </Text>

            {remarkHistory.length === 0 ? (
              <View style={styles.remarkEmptyState}>
                <Text style={styles.remarkEmptyText}>No remarks yet.</Text>
              </View>
            ) : (
              <View style={styles.remarksList}>
                {(() => {
                  const { grouped, sortedDays } = groupRemarksByDay(remarkHistory);
                  return sortedDays.map((dayKey, dayIndex) => (
                    <View key={dayKey} style={styles.remarkDayGroup}>
                      {/* Day Header */}
                      <View style={styles.remarkDayHeader}>
                        <View style={styles.remarkDayHeaderLine} />
                        <Text style={styles.remarkDayLabel}>{formatDayLabel(dayKey)}</Text>
                        <View style={styles.remarkDayHeaderLine} />
                      </View>
                      
                      {/* Remarks for this day */}
                      {grouped[dayKey].map((remark, remarkIndex) => (
                        <View
                          key={remark.id || `${remark.createdAt}-${remarkIndex}`}
                          style={[
                            styles.remarkItem,
                            remarkIndex === grouped[dayKey].length - 1 && dayIndex === sortedDays.length - 1 && styles.remarkItemLast,
                          ]}
                        >
                          <View style={styles.remarkHeaderRow}>
                            <View style={styles.remarkAuthorContainer}>
                              <Text style={styles.remarkAuthor}>
                                {remark.createdBy?.name || 'Team Member'}
                              </Text>
                              {remark.createdBy?.role?.name && (
                                <Text style={styles.remarkRole}>{remark.createdBy.role.name}</Text>
                              )}
                            </View>
                            <Text style={styles.remarkTimestamp}>
                              {formatDateTime(remark.createdAt)}
                            </Text>
                          </View>
                          <Text style={styles.remarkBody}>{remark.remark}</Text>
                          {remark.cancelled && (
                            <Text style={styles.remarkCancelled}>
                              Cancelled{remark.cancellationReason ? `: ${remark.cancellationReason}` : ''}
                            </Text>
                          )}
                          {!remark.cancelled && canCancelRemark(remark) && (
                            <TouchableOpacity
                              style={styles.remarkCancelButton}
                              onPress={() => openCancelRemarkDialog(remark)}
                            >
                              <Text style={styles.remarkCancelButtonText}>Cancel Remark</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  ));
                })()}
              </View>
            )}

            <Divider style={styles.remarkDivider} />

            <View style={styles.remarkForm}>
              <TextInput
                label="Add a remark"
                value={remarkInput}
                onChangeText={(text) => {
                  setRemarkInput(text);
                  if (remarkError) setRemarkError(null);
                }}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Share an update or next step..."
                style={styles.remarkInput}
              />
              {remarkError && <Text style={styles.remarkErrorText}>{remarkError}</Text>}
              <Button
                mode="contained"
                onPress={handleAddRemark}
                loading={submittingRemark}
                disabled={submittingRemark || !remarkInput.trim()}
              >
                Add Remark
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Booking Assignment (Managers Only) */}
        {['TEAM_LEAD', 'SALES_MANAGER', 'GENERAL_MANAGER', 'ADMIN'].includes(userRole) && (
          <Card style={styles.section}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                <Icon source="account-switch" size={20} /> Assignment
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Assigned Advisor:</Text>
                <Text style={styles.infoValue}>
                  {booking.advisorId ? (booking as any).advisor?.name || 'Assigned' : 'Not assigned'}
                </Text>
              </View>
              
              {booking.advisorId && (booking as any).advisor && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Advisor Email:</Text>
                  <Text style={styles.infoValue}>
                    {(booking as any).advisor.email || 'N/A'}
                  </Text>
                </View>
              )}
              
              <Button 
                mode="contained" 
                onPress={handleAssignBooking}
                loading={updating}
                disabled={updating}
                icon="account-switch"
                style={styles.updateButton}
              >
                {booking.advisorId ? 'Reassign Advisor' : 'Assign Advisor'}
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Audit Log (Managers Only) */}
        {['TEAM_LEAD', 'SALES_MANAGER', 'GENERAL_MANAGER', 'ADMIN'].includes(userRole) && (
          <Card style={styles.section}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  <Icon source="history" size={20} /> Change History
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={fetchAuditLog}
                  loading={loadingAuditLog}
                  disabled={loadingAuditLog}
                  icon="history"
                  compact
                >
                  {showAuditLog ? 'Refresh' : 'View History'}
                </Button>
              </View>
              <Divider style={styles.divider} />
              
              {showAuditLog ? (
                auditLogs.length > 0 ? (
                  <View>
                    {auditLogs.map((log, index) => (
                      <View key={log.id || index} style={styles.auditLogItem}>
                        <View style={styles.auditLogHeader}>
                          <Text style={styles.auditLogAction}>{log.action}</Text>
                          <Text style={styles.auditLogDate}>
                            {new Date(log.createdAt).toLocaleString()}
                          </Text>
                        </View>
                        <Text style={styles.auditLogUser}>
                          By: {log.user?.name || log.changedBy} ({log.user?.role?.name || 'Unknown'})
                        </Text>
                        {log.oldValue && log.newValue && (
                          <View style={styles.auditLogChange}>
                            <Text style={styles.auditLogChangeLabel}>Changed:</Text>
                            <Text style={styles.auditLogChangeText}>
                              {JSON.stringify(log.oldValue)} → {JSON.stringify(log.newValue)}
                            </Text>
                          </View>
                        )}
                        {log.changeReason && (
                          <Text style={styles.auditLogReason}>
                            Reason: {log.changeReason}
                          </Text>
                        )}
                        {index < auditLogs.length - 1 && <Divider style={styles.auditLogDivider} />}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noRemarksText}>No change history available.</Text>
                )
              ) : (
                <Text style={styles.noRemarksText}>Click "View History" to see audit log.</Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Booking Metadata */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              <Icon source="information" size={20} /> Additional Information
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Booking Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(booking.bookingDate).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zone:</Text>
              <Text style={styles.infoValue}>{booking.zone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Region:</Text>
              <Text style={styles.infoValue}>{booking.region}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dealer Code:</Text>
              <Text style={styles.infoValue}>{booking.dealerCode}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>
                {new Date(booking.createdAt).toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>
                {new Date(booking.updatedAt).toLocaleString()}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Phase 2: Cancel Remark Dialog (same as enquiry) */}
      <Portal>
        <Dialog visible={cancelDialogVisible} onDismiss={closeCancelDialog}>
          <Dialog.Title>Cancel Remark</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.cancelDialogDescription}>
              Provide a reason for cancelling this remark. This reason will be stored with the
              remark history.
            </Text>
            <TextInput
              mode="outlined"
              label="Cancellation Reason"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              style={styles.cancelDialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeCancelDialog} disabled={cancellingRemark}>
              Dismiss
            </Button>
            <Button onPress={handleCancelRemark} loading={cancellingRemark} disabled={cancellingRemark}>
              Submit
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusChip: {
    height: 32,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    marginBottom: spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  divider: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: theme.colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  textInput: {
    marginBottom: spacing.md,
  },
  remarksInput: {
    marginVertical: spacing.sm,
    minHeight: 100,
  },
  updateButton: {
    marginTop: spacing.sm,
  },
  stockChip: {
    backgroundColor: '#E3F2FD',
  },
  remarksSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9E9E9E',
  },
  editableRemarksSection: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#4CAF50',
  },
  remarksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
    flex: 1,
  },
  remarksTimestamp: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  remarksText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  noRemarksText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: theme.colors.onSurfaceVariant,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
  readOnlyLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  auditLogItem: {
    paddingVertical: spacing.sm,
  },
  auditLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  auditLogAction: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  auditLogDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  auditLogUser: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  auditLogChange: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  auditLogChangeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  auditLogChangeText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    fontFamily: 'monospace',
  },
  auditLogReason: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  auditLogDivider: {
    marginTop: spacing.sm,
  },
  // Phase 2: Remark styles (same as enquiry)
  remarksList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: spacing.sm,
  },
  remarkItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  remarkItemLast: {
    borderBottomWidth: 0,
  },
  remarkDayGroup: {
    marginBottom: spacing.md,
  },
  remarkDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  remarkDayHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  remarkDayLabel: {
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remarkHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  remarkAuthorContainer: {
    flex: 1,
  },
  remarkAuthor: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  remarkRole: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  remarkTimestamp: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  remarkBody: {
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  remarkCancelButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  remarkCancelButtonText: {
    color: '#B91C1C',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  remarkCancelled: {
    marginTop: spacing.xs,
    color: theme.colors.error,
    fontSize: 12,
    fontStyle: 'italic',
  },
  remarkDivider: {
    marginVertical: spacing.md,
  },
  remarkForm: {
    gap: spacing.sm,
  },
  remarkInput: {
    backgroundColor: '#FFFFFF',
  },
  remarkErrorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginLeft: 4,
  },
  cancelDialogDescription: {
    marginBottom: spacing.md,
    color: theme.colors.onSurfaceVariant,
  },
  cancelDialogInput: {
    backgroundColor: '#FFFFFF',
  },
  remarkEmptyState: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  remarkEmptyText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
  },
});
