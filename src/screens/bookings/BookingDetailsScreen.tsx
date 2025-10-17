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
import { bookingAPI } from '../../api/bookings';
import { type Booking, BookingStatus } from '../../services/types';

/**
 * Role to remarks field mapping
 */
const remarksFieldMap: Record<string, keyof Booking> = {
  'CUSTOMER_ADVISOR': 'advisorRemarks',
  'TEAM_LEAD': 'advisorRemarks',
  'SALES_MANAGER': 'advisorRemarks',
  'GENERAL_MANAGER': 'advisorRemarks',
  'ADMIN': 'advisorRemarks',
};

/**
 * Booking Details Screen Component
 * Shows comprehensive booking information with role-specific remarks
 */
export function BookingDetailsScreen({ route, navigation }: any): React.JSX.Element {
  const { bookingId } = route?.params || {};
  const { state: authState } = useAuth();
  const userRole = authState.user?.role?.name || 'CUSTOMER_ADVISOR';
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Editable fields state
  const [editableRemarks, setEditableRemarks] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [editingFinance, setEditingFinance] = useState(false);
  const [financeData, setFinanceData] = useState({
    financeRequired: false,
    financerName: '',
    fileLoginDate: '',
    approvalDate: '',
  });

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
        
        // Initialize editable fields
        const userRemarksField = remarksFieldMap[userRole];
        setEditableRemarks((bookingData[userRemarksField] as string) || '');
        
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
   * Update advisor remarks
   */
  const handleUpdateRemarks = async () => {
    if (!booking) return;
    
    setUpdating(true);
    try {
      await bookingAPI.updateBooking(booking.id, {
        advisorRemarks: editableRemarks,
      });
      
      Alert.alert('Success', 'Remarks updated successfully');
      
      // Refresh booking data
      const response = await bookingAPI.getBookingById(booking.id);
      const responseData = response.data as any;
      const bookingData = responseData?.data?.booking || responseData?.booking || responseData;
      setBooking(bookingData);
    } catch (err: any) {
      console.error('Error updating remarks:', err);
      Alert.alert('Error', err.message || 'Failed to update remarks');
    } finally {
      setUpdating(false);
    }
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
      case 'BACK_ORDER': return '#795548';
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
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Back Order:</Text>
              <Text style={styles.infoValue}>{booking.backOrderStatus ? 'Yes' : 'No'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* ROLE-SPECIFIC REMARKS - All Visible, Only Own Editable */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              <Icon source="comment-text" size={20} /> Remarks by Role
            </Text>
            <Divider style={styles.divider} />
            
            {/* Customer Advisor Remarks - EDITABLE for Customer Advisors */}
            {userRole === 'CUSTOMER_ADVISOR' ? (
              <View style={[styles.remarksSection, styles.editableRemarksSection]}>
                <Text style={styles.roleLabel}>
                  <Icon source="account-tie" size={16} /> Customer Advisor (You):
                </Text>
                <TextInput
                  value={editableRemarks}
                  onChangeText={setEditableRemarks}
                  placeholder="Add your remarks here..."
                  multiline
                  numberOfLines={4}
                  style={styles.remarksInput}
                  mode="outlined"
                />
                <Button 
                  mode="contained" 
                  onPress={handleUpdateRemarks}
                  loading={updating}
                  disabled={updating}
                  style={styles.updateButton}
                >
                  Update My Remarks
                </Button>
              </View>
            ) : (
              booking.advisorRemarks && (
                <View style={styles.remarksSection}>
                  <Text style={styles.roleLabel}>
                    <Icon source="account-tie" size={16} /> Customer Advisor:
                  </Text>
                  <Text style={styles.remarksText}>{booking.advisorRemarks}</Text>
                </View>
              )
            )}

            {/* Note: Additional remarks fields (teamLeadRemarks, salesManagerRemarks, etc.) 
                 are not available in the current Booking interface */}
            
            {/* Show message if no remarks yet */}
            {!booking.advisorRemarks && userRole !== 'CUSTOMER_ADVISOR' && (
              <Text style={styles.noRemarksText}>No remarks have been added yet.</Text>
            )}
          </Card.Content>
        </Card>

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
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
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
});
