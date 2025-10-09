/**
 * Booking Update Screen
 * Comprehensive form for updating booking details with all required fields
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Menu,
  Switch,
  HelperText,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { DatePickerISO } from '../../components/DatePickerISO';
import * as BookingService from '../../services/booking.service';
import { 
  Booking, 
  BookingStatus, 
  StockAvailability, 
  UpdateBookingRequest 
} from '../../services/types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { theme, spacing, shadows, borderRadius } from '../../utils/theme';

type NavigationProp = StackNavigationProp<MainStackParamList>;

interface BookingUpdateScreenProps {
  route: {
    params: {
      bookingId: string;
      booking?: Booking;
    };
  };
}

// Status options for dropdown
const STATUS_OPTIONS = [
  { label: 'Pending', value: BookingStatus.PENDING },
  { label: 'Assigned', value: BookingStatus.ASSIGNED },
  { label: 'Confirmed', value: BookingStatus.CONFIRMED },
  { label: 'Cancelled', value: BookingStatus.CANCELLED },
  { label: 'Delivered', value: BookingStatus.DELIVERED },
  { label: 'In Progress', value: BookingStatus.IN_PROGRESS },
  { label: 'No Show', value: BookingStatus.NO_SHOW },
  { label: 'Waitlisted', value: BookingStatus.WAITLISTED },
  { label: 'Rescheduled', value: BookingStatus.RESCHEDULED },
  { label: 'Back Order', value: BookingStatus.BACK_ORDER },
  { label: 'Approved', value: BookingStatus.APPROVED },
  { label: 'Rejected', value: BookingStatus.REJECTED },
];

// Stock availability options
const STOCK_OPTIONS = [
  { label: 'Vehicle Not Available (VNA)', value: StockAvailability.VNA },
  { label: 'Vehicle Available', value: StockAvailability.VEHICLE_AVAILABLE },
];

export function BookingUpdateScreen({ route }: BookingUpdateScreenProps): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { bookingId, booking: initialBooking } = route.params;

  // State for booking data
  const [booking, setBooking] = useState<Booking | null>(initialBooking || null);
  const [loading, setLoading] = useState(!initialBooking);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateBookingRequest>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Menu visibility states
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [stockMenuVisible, setStockMenuVisible] = useState(false);

  // Load booking data
  useEffect(() => {
    if (!initialBooking) {
      loadBooking();
    } else {
      initializeFormData(initialBooking);
    }
  }, [bookingId, initialBooking]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const bookingData = await BookingService.getBookingById(bookingId);
      setBooking(bookingData);
      initializeFormData(bookingData);
    } catch (error: any) {
      console.error('Error loading booking:', error);
      setError(error.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (bookingData: Booking) => {
    setFormData({
      status: bookingData.status,
      expectedDeliveryDate: bookingData.expectedDeliveryDate,
      financeRequired: bookingData.financeRequired,
      financerName: bookingData.financerName || '',
      fileLoginDate: bookingData.fileLoginDate,
      approvalDate: bookingData.approvalDate,
      stockAvailability: bookingData.stockAvailability,
      backOrderStatus: bookingData.backOrderStatus,
      rtoDate: bookingData.rtoDate,
      advisorRemarks: bookingData.advisorRemarks || '',
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.expectedDeliveryDate) {
      const deliveryDate = new Date(formData.expectedDeliveryDate);
      const today = new Date();
      if (deliveryDate < today) {
        newErrors.expectedDeliveryDate = 'Delivery date cannot be in the past';
      }
    }

    if (formData.financeRequired && !formData.financerName?.trim()) {
      newErrors.financerName = 'Financer name is required when finance is needed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
      setUpdating(true);
      
      // Filter out undefined values
      const updateData: UpdateBookingRequest = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined)
      );

      await BookingService.updateBooking(bookingId, updateData);
      
      Alert.alert(
        'Success',
        'Booking updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating booking:', error);
      Alert.alert(
        'Update Failed',
        error.message || 'Failed to update booking. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle date changes
  const handleDateChange = (field: keyof UpdateBookingRequest, date: string) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle text input changes
  const handleTextChange = (field: keyof UpdateBookingRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle boolean changes
  const handleBooleanChange = (field: keyof UpdateBookingRequest, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Render status menu
  const renderStatusMenu = () => (
    <Menu
      visible={statusMenuVisible}
      onDismiss={() => setStatusMenuVisible(false)}
      anchor={
        <TextInput
          label="Status *"
          value={STATUS_OPTIONS.find(opt => opt.value === formData.status)?.label || ''}
          editable={false}
          mode="outlined"
          right={<TextInput.Icon icon="chevron-down" onPress={() => setStatusMenuVisible(true)} />}
          onPressIn={() => setStatusMenuVisible(true)}
          error={!!errors.status}
          style={styles.input}
        />
      }
    >
      {STATUS_OPTIONS.map((option) => (
        <Menu.Item
          key={option.value}
          onPress={() => {
            setFormData(prev => ({ ...prev, status: option.value }));
            setStatusMenuVisible(false);
            if (errors.status) setErrors(prev => ({ ...prev, status: '' }));
          }}
          title={option.label}
        />
      ))}
    </Menu>
  );

  // Render stock availability menu
  const renderStockMenu = () => (
    <Menu
      visible={stockMenuVisible}
      onDismiss={() => setStockMenuVisible(false)}
      anchor={
        <TextInput
          label="Stock Availability"
          value={STOCK_OPTIONS.find(opt => opt.value === formData.stockAvailability)?.label || ''}
          editable={false}
          mode="outlined"
          right={<TextInput.Icon icon="chevron-down" onPress={() => setStockMenuVisible(true)} />}
          onPressIn={() => setStockMenuVisible(true)}
          style={styles.input}
        />
      }
    >
      {STOCK_OPTIONS.map((option) => (
        <Menu.Item
          key={option.value}
          onPress={() => {
            setFormData(prev => ({ ...prev, stockAvailability: option.value }));
            setStockMenuVisible(false);
          }}
          title={option.label}
        />
      ))}
    </Menu>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading booking details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>
            {error || 'Booking not found'}
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Update Booking
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Customer Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Customer Information
            </Text>
            <Text variant="bodyMedium" style={styles.customerInfo}>
              {booking.customerName} • {booking.customerPhone}
            </Text>
            <Text variant="bodyMedium" style={styles.vehicleInfo}>
              {booking.variant} • {booking.color || 'No color specified'}
            </Text>
            {booking.source && (
              <Text variant="bodySmall" style={styles.sourceInfo}>
                Source: {booking.source === 'MOBILE' ? '📱 Mobile App' : '📊 Bulk Import'}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Status Update */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Status & Timeline
            </Text>
            {renderStatusMenu()}
            {errors.status && <HelperText type="error">{errors.status}</HelperText>}

            <DatePickerISO
              label="Expected Delivery Date"
              value={formData.expectedDeliveryDate}
              onDateChange={(date) => handleDateChange('expectedDeliveryDate', date)}
              error={!!errors.expectedDeliveryDate}
              style={styles.input}
            />
            {errors.expectedDeliveryDate && (
              <HelperText type="error">{errors.expectedDeliveryDate}</HelperText>
            )}

            <DatePickerISO
              label="File Login Date"
              value={formData.fileLoginDate}
              onDateChange={(date) => handleDateChange('fileLoginDate', date)}
              style={styles.input}
            />

            <DatePickerISO
              label="Approval Date"
              value={formData.approvalDate}
              onDateChange={(date) => handleDateChange('approvalDate', date)}
              style={styles.input}
            />

            <DatePickerISO
              label="RTO Date"
              value={formData.rtoDate}
              onDateChange={(date) => handleDateChange('rtoDate', date)}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Finance Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Finance Information
            </Text>
            
            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Finance Required</Text>
              <Switch
                value={formData.financeRequired || false}
                onValueChange={(value) => handleBooleanChange('financeRequired', value)}
              />
            </View>

            {formData.financeRequired && (
              <TextInput
                label="Financer Name *"
                value={formData.financerName || ''}
                onChangeText={(value) => handleTextChange('financerName', value)}
                mode="outlined"
                error={!!errors.financerName}
                style={styles.input}
              />
            )}
            {errors.financerName && <HelperText type="error">{errors.financerName}</HelperText>}
          </Card.Content>
        </Card>

        {/* Stock Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Stock Information
            </Text>
            
            {renderStockMenu()}

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Back Order Status</Text>
              <Switch
                value={formData.backOrderStatus || false}
                onValueChange={(value) => handleBooleanChange('backOrderStatus', value)}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Advisor Remarks */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Advisor Remarks
            </Text>
            <TextInput
              label="Remarks"
              value={formData.advisorRemarks || ''}
              onChangeText={(value) => handleTextChange('advisorRemarks', value)}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={updating}
            disabled={updating}
            style={styles.saveButton}
          >
            {updating ? 'Updating...' : 'Update Booking'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    color: '#0F172A',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#EF4444',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...shadows.small,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  customerInfo: {
    color: '#374151',
    marginBottom: 4,
  },
  vehicleInfo: {
    color: '#6B7280',
    marginBottom: 4,
  },
  sourceInfo: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
