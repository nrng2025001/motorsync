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
import { bookingAPI } from '../../api/bookings';
import { 
  Booking, 
  BookingStatus, 
  StockAvailability
} from '../../services/types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { theme, spacing, shadows, borderRadius } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';

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
  const { state: authState } = useAuth();
  const { bookingId, booking: initialBooking } = route.params;
  
  const userRole = getUserRole(authState.user);

  // Allow access to Customer Advisors and higher-level roles for remarks
  const allowedRoles = ['CUSTOMER_ADVISOR', 'TEAM_LEAD', 'SALES_MANAGER', 'GENERAL_MANAGER', 'ADMIN'];
  if (!allowedRoles.includes(userRole)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Text variant="headlineMedium" style={styles.restrictedTitle}>
            Access Restricted
          </Text>
          <Text variant="bodyLarge" style={styles.restrictedMessage}>
            You don't have permission to access this screen.
          </Text>
          <Text variant="bodyMedium" style={styles.restrictedSubMessage}>
            Contact your administrator for access.
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // State for booking data
  const [booking, setBooking] = useState<Booking | null>(initialBooking || null);
  const [loading, setLoading] = useState(!initialBooking);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check if a field should be editable
  const isFieldEditable = (fieldName: keyof Booking, currentValue: any): boolean => {
    if (!booking) return false;
    
    // Customer Advisors can edit ALL booking fields
    if (userRole === 'CUSTOMER_ADVISOR') {
      return true;
    }
    
    // Higher-level roles (Team Lead, Sales Manager, General Manager, Admin) can ONLY edit their respective remarks
    const remarksFields = ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks', 'generalManagerRemarks', 'adminRemarks'];
    if (remarksFields.includes(fieldName as string)) {
      return canEditRemarks(fieldName as string);
    }
    
    // ALL other fields are strictly read-only for higher-level roles
    return false;
  };

  // Helper function to check if user can edit remarks
  const canEditRemarks = (remarksType: string): boolean => {
    const rolePermissions: Record<string, string[]> = {
      'CUSTOMER_ADVISOR': ['advisorRemarks'],
      'TEAM_LEAD': ['teamLeadRemarks'],
      'SALES_MANAGER': ['salesManagerRemarks'],
      'GENERAL_MANAGER': ['generalManagerRemarks'],
      'ADMIN': ['adminRemarks'],
    };
    
    return rolePermissions[userRole]?.includes(remarksType) || false;
  };

  // Form state - matching the comprehensive API structure
  const [formData, setFormData] = useState<{
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    variant?: string;
    vcCode?: string;
    color?: string;
    fuelType?: string;
    transmission?: string;
    status?: BookingStatus;
    advisorId?: string;
    bookingDate?: string;
    expectedDeliveryDate?: string;
    stockAvailability?: string;
    financeRequired?: boolean;
    financerName?: string;
    dealerCode?: string;
    zone?: string;
    region?: string;
    fileLoginDate?: string;
    approvalDate?: string;
    backOrderStatus?: boolean;
    rtoDate?: string;
    advisorRemarks?: string;
    teamLeadRemarks?: string;
    salesManagerRemarks?: string;
    generalManagerRemarks?: string;
    adminRemarks?: string;
  }>({});
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
      const response = await bookingAPI.getBookingById(bookingId);
      
      console.log('🔍 [BookingUpdateScreen] Raw API response:', response);
      console.log('🔍 [BookingUpdateScreen] Response data:', response.data);
      
      // Handle nested response structure: {data: {data: {booking: {...}}}}
      const responseData = response.data as any;
      const bookingData = responseData?.data?.booking || responseData?.booking || responseData;
      
      console.log('🔍 [BookingUpdateScreen] Extracted booking data:', bookingData);
      console.log('🔍 [BookingUpdateScreen] Booking remarks:', {
        advisorRemarks: bookingData?.advisorRemarks,
        teamLeadRemarks: bookingData?.teamLeadRemarks,
        salesManagerRemarks: bookingData?.salesManagerRemarks,
        generalManagerRemarks: bookingData?.generalManagerRemarks,
        adminRemarks: bookingData?.adminRemarks,
      });
      
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
    console.log('🔍 [BookingUpdateScreen] Initializing form data with booking:', bookingData);
    console.log('🔍 [BookingUpdateScreen] Remarks data:', {
      advisorRemarks: bookingData.advisorRemarks,
      teamLeadRemarks: bookingData.teamLeadRemarks,
      salesManagerRemarks: bookingData.salesManagerRemarks,
      generalManagerRemarks: bookingData.generalManagerRemarks,
      adminRemarks: bookingData.adminRemarks,
    });
    
    setFormData({
      customerName: bookingData.customerName || '',
      customerPhone: bookingData.customerPhone || '',
      customerEmail: bookingData.customerEmail || '',
      variant: bookingData.variant || '',
      vcCode: bookingData.vcCode || '',
      color: bookingData.color || '',
      fuelType: bookingData.fuelType || '',
      transmission: bookingData.transmission || '',
      status: bookingData.status,
      advisorId: bookingData.advisorId || '',
      bookingDate: bookingData.bookingDate || '',
      expectedDeliveryDate: bookingData.expectedDeliveryDate,
      stockAvailability: bookingData.stockAvailability,
      financeRequired: bookingData.financeRequired,
      financerName: bookingData.financerName || '',
      dealerCode: bookingData.dealerCode || '',
      zone: bookingData.zone || '',
      region: bookingData.region || '',
      fileLoginDate: bookingData.fileLoginDate || '',
      approvalDate: bookingData.approvalDate || '',
      backOrderStatus: bookingData.backOrderStatus || false,
      rtoDate: bookingData.rtoDate || '',
      advisorRemarks: bookingData.advisorRemarks || '',
      teamLeadRemarks: bookingData.teamLeadRemarks || '',
      salesManagerRemarks: bookingData.salesManagerRemarks || '',
      generalManagerRemarks: bookingData.generalManagerRemarks || '',
      adminRemarks: bookingData.adminRemarks || '',
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (userRole === 'CUSTOMER_ADVISOR') {
      // Customer Advisors - validate all booking fields
      if (!formData.customerName?.trim()) {
        newErrors.customerName = 'Customer name is required';
      }

      if (!formData.customerPhone?.trim()) {
        newErrors.customerPhone = 'Customer phone is required';
      }

      if (!formData.variant?.trim()) {
        newErrors.variant = 'Vehicle variant is required';
      }

      // Date validation
      if (formData.expectedDeliveryDate) {
        const deliveryDate = new Date(formData.expectedDeliveryDate);
        const today = new Date();
        if (deliveryDate < today) {
          newErrors.expectedDeliveryDate = 'Delivery date cannot be in the past';
        }
      }

      if (formData.bookingDate) {
        const bookingDate = new Date(formData.bookingDate);
        const today = new Date();
        if (bookingDate > today) {
          newErrors.bookingDate = 'Booking date cannot be in the future';
        }
      }

      // Finance validation
      if (formData.financeRequired && !formData.financerName?.trim()) {
        newErrors.financerName = 'Financer name is required when finance is needed';
      }

      // Email validation
      if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Please enter a valid email address';
      }
    } else {
      // Higher-level roles - only validate their remarks field
      const remarksFields = ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks', 'generalManagerRemarks', 'adminRemarks'];
      const allowedField = remarksFields.find(field => canEditRemarks(field));
      
      if (allowedField && formData[allowedField as keyof typeof formData]) {
        const remarksValue = formData[allowedField as keyof typeof formData];
        if (remarksValue && remarksValue.toString().trim().length > 500) {
          newErrors[allowedField] = 'Remarks cannot exceed 500 characters';
        }
      }
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
      
      let updateData: any = {};
      
      if (userRole === 'CUSTOMER_ADVISOR') {
        // Customer Advisors can update all fields
        updateData = Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => value !== undefined)
        );
        
        // Format expectedDeliveryDate as YYYY-MM-DD if present
        if (updateData.expectedDeliveryDate && typeof updateData.expectedDeliveryDate === 'string') {
          const date = new Date(updateData.expectedDeliveryDate);
          updateData.expectedDeliveryDate = date.toISOString().split('T')[0];
        }
      } else {
        // Higher-level roles can only update their respective remarks
        const remarksFields = ['advisorRemarks', 'teamLeadRemarks', 'salesManagerRemarks', 'generalManagerRemarks', 'adminRemarks'];
        const allowedField = remarksFields.find(field => canEditRemarks(field));
        
        if (allowedField && formData[allowedField as keyof typeof formData]) {
          updateData[allowedField] = formData[allowedField as keyof typeof formData];
        }
      }

      // Use the comprehensive updateBooking API
      const response = await bookingAPI.updateBooking(bookingId, updateData);
      
      Alert.alert(
        'Success',
        userRole === 'CUSTOMER_ADVISOR' ? 'Booking updated successfully!' : 'Remarks added successfully!',
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
  const handleDateChange = (field: keyof typeof formData, date: string) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle text input changes
  const handleTextChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle boolean changes
  const handleBooleanChange = (field: keyof typeof formData, value: boolean) => {
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
          right={isFieldEditable('status', formData.status) ? <TextInput.Icon icon="chevron-down" onPress={() => setStatusMenuVisible(true)} /> : null}
          onPressIn={isFieldEditable('status', formData.status) ? () => setStatusMenuVisible(true) : undefined}
          error={!!errors.status}
          style={[styles.input, !isFieldEditable('status', formData.status) && styles.disabledInput]}
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
          right={isFieldEditable('stockAvailability', formData.stockAvailability) ? <TextInput.Icon icon="chevron-down" onPress={() => setStockMenuVisible(true)} /> : null}
          onPressIn={isFieldEditable('stockAvailability', formData.stockAvailability) ? () => setStockMenuVisible(true) : undefined}
          style={[styles.input, !isFieldEditable('stockAvailability', formData.stockAvailability) && styles.disabledInput]}
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
        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Customer Information
            </Text>
            
            <TextInput
              label="Customer Name *"
              value={formData.customerName || ''}
              onChangeText={(value) => handleTextChange('customerName', value)}
              mode="outlined"
              error={!!errors.customerName}
              editable={isFieldEditable('customerName', booking?.customerName)}
              style={styles.input}
            />
            {errors.customerName && <HelperText type="error">{errors.customerName}</HelperText>}
            {!isFieldEditable('customerName', booking?.customerName) && (
              <HelperText type="info">Customer name is already set and cannot be changed</HelperText>
            )}

            <TextInput
              label="Customer Phone *"
              value={formData.customerPhone || ''}
              onChangeText={(value) => handleTextChange('customerPhone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.customerPhone}
              editable={isFieldEditable('customerPhone', booking?.customerPhone)}
              style={styles.input}
            />
            {errors.customerPhone && <HelperText type="error">{errors.customerPhone}</HelperText>}
            {!isFieldEditable('customerPhone', booking?.customerPhone) && (
              <HelperText type="info">Customer phone is already set and cannot be changed</HelperText>
            )}

            <TextInput
              label="Customer Email"
              value={formData.customerEmail || ''}
              onChangeText={(value) => handleTextChange('customerEmail', value)}
              mode="outlined"
              keyboardType="email-address"
              error={!!errors.customerEmail}
              editable={isFieldEditable('customerEmail', booking?.customerEmail)}
              style={styles.input}
            />
            {errors.customerEmail && <HelperText type="error">{errors.customerEmail}</HelperText>}
            {!isFieldEditable('customerEmail', booking?.customerEmail) && (
              <HelperText type="info">Customer email is already set and cannot be changed</HelperText>
            )}
          </Card.Content>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Vehicle Information
            </Text>
            
            <TextInput
              label="Vehicle Variant *"
              value={formData.variant || ''}
              onChangeText={(value) => handleTextChange('variant', value)}
              mode="outlined"
              error={!!errors.variant}
              editable={isFieldEditable('variant', booking?.variant)}
              style={styles.input}
            />
            {errors.variant && <HelperText type="error">{errors.variant}</HelperText>}
            {!isFieldEditable('variant', booking?.variant) && (
              <HelperText type="info">Vehicle variant is already set and cannot be changed</HelperText>
            )}

            <TextInput
              label="VC Code"
              value={formData.vcCode || ''}
              onChangeText={(value) => handleTextChange('vcCode', value)}
              mode="outlined"
              editable={isFieldEditable('vcCode', booking?.vcCode)}
              style={styles.input}
            />
            {!isFieldEditable('vcCode', booking?.vcCode) && (
              <HelperText type="info">VC Code is already set and cannot be changed</HelperText>
            )}

            <TextInput
              label="Color"
              value={formData.color || ''}
              onChangeText={(value) => handleTextChange('color', value)}
              mode="outlined"
              editable={isFieldEditable('color', booking?.color)}
              style={styles.input}
            />
            {!isFieldEditable('color', booking?.color) && (
              <HelperText type="info">Color is already set and cannot be changed</HelperText>
            )}

            <TextInput
              label="Fuel Type"
              value={formData.fuelType || ''}
              onChangeText={(value) => handleTextChange('fuelType', value)}
              mode="outlined"
              editable={isFieldEditable('fuelType', booking?.fuelType)}
              style={styles.input}
            />
            {!isFieldEditable('fuelType', booking?.fuelType) && (
              <HelperText type="info">Fuel type is already set and cannot be changed</HelperText>
            )}

            <TextInput
              label="Transmission"
              value={formData.transmission || ''}
              onChangeText={(value) => handleTextChange('transmission', value)}
              mode="outlined"
              editable={isFieldEditable('transmission', booking?.transmission)}
              style={styles.input}
            />
            {!isFieldEditable('transmission', booking?.transmission) && (
              <HelperText type="info">Transmission is already set and cannot be changed</HelperText>
            )}
          </Card.Content>
        </Card>

        {/* Dealer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Dealer Information
            </Text>
            
            <TextInput
              label="Dealer Code"
              value={formData.dealerCode || ''}
              onChangeText={(value) => handleTextChange('dealerCode', value)}
              mode="outlined"
              editable={isFieldEditable('dealerCode', formData.dealerCode)}
              style={styles.input}
            />
            {!isFieldEditable('dealerCode', formData.dealerCode) && (
              <HelperText type="info">Dealer code is already set and cannot be changed</HelperText>
            )}

            <TextInput
              label="Zone"
              value={formData.zone || ''}
              onChangeText={(value) => handleTextChange('zone', value)}
              mode="outlined"
              editable={isFieldEditable('zone', formData.zone)}
              style={styles.input}
            />
            {!isFieldEditable('zone', formData.zone) && (
              <HelperText type="info">Zone is already set and cannot be changed</HelperText>
            )}

            <TextInput
              label="Region"
              value={formData.region || ''}
              onChangeText={(value) => handleTextChange('region', value)}
              mode="outlined"
              editable={isFieldEditable('region', formData.region)}
              style={styles.input}
            />
            {!isFieldEditable('region', formData.region) && (
              <HelperText type="info">Region is already set and cannot be changed</HelperText>
            )}
          </Card.Content>
        </Card>

        {/* Booking Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Booking Information
            </Text>
            
            <TextInput
              label="Advisor ID"
              value={formData.advisorId || ''}
              onChangeText={(value) => handleTextChange('advisorId', value)}
              mode="outlined"
              editable={isFieldEditable('advisorId', booking?.advisorId)}
              style={styles.input}
            />
            {!isFieldEditable('advisorId', booking?.advisorId) && (
              <HelperText type="info">Advisor ID is already set and cannot be changed</HelperText>
            )}

            <DatePickerISO
              label="Booking Date"
              value={formData.bookingDate}
              onChange={(date) => handleDateChange('bookingDate', date)}
              error={errors.bookingDate}
              disabled={!isFieldEditable('bookingDate', formData.bookingDate)}
              style={styles.input}
            />
            {errors.bookingDate && (
              <HelperText type="error">{errors.bookingDate}</HelperText>
            )}
            {!isFieldEditable('bookingDate', booking?.bookingDate) && (
              <HelperText type="info">Booking date is already set and cannot be changed</HelperText>
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
              onChange={(date) => handleDateChange('expectedDeliveryDate', date)}
              error={errors.expectedDeliveryDate}
              disabled={!isFieldEditable('expectedDeliveryDate', formData.expectedDeliveryDate)}
              style={styles.input}
            />
            {errors.expectedDeliveryDate && (
              <HelperText type="error">{errors.expectedDeliveryDate}</HelperText>
            )}

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
                disabled={!isFieldEditable('financeRequired', formData.financeRequired)}
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
          </Card.Content>
        </Card>

        {/* Additional Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Additional Information
            </Text>
            
            <DatePickerISO
              label="File Login Date"
              value={formData.fileLoginDate}
              onChange={(date) => handleDateChange('fileLoginDate', date)}
              style={styles.input}
            />

            <DatePickerISO
              label="Approval Date"
              value={formData.approvalDate}
              onChange={(date) => handleDateChange('approvalDate', date)}
              style={styles.input}
            />

            <DatePickerISO
              label="RTO Date"
              value={formData.rtoDate}
              onChange={(date) => handleDateChange('rtoDate', date)}
              style={styles.input}
            />

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Back Order Status</Text>
              <Switch
                value={formData.backOrderStatus || false}
                onValueChange={(value) => handleBooleanChange('backOrderStatus', value)}
                disabled={!isFieldEditable('backOrderStatus', formData.backOrderStatus)}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Remarks Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Remarks & Notes
            </Text>
            
            {/* Debug info */}
            {__DEV__ && (
              <Text style={{ fontSize: 10, color: '#666', marginBottom: 10 }}>
                Debug - Form Data Remarks: {JSON.stringify({
                  advisorRemarks: formData.advisorRemarks,
                  teamLeadRemarks: formData.teamLeadRemarks,
                  salesManagerRemarks: formData.salesManagerRemarks,
                  generalManagerRemarks: formData.generalManagerRemarks,
                  adminRemarks: formData.adminRemarks,
                })}
              </Text>
            )}
            
            {/* Advisor Remarks - Always editable for CUSTOMER_ADVISOR */}
            <TextInput
              label={`Advisor Remarks ${formData.advisorRemarks ? `(${formData.advisorRemarks.length} chars)` : '(empty)'}`}
              value={formData.advisorRemarks || ''}
              onChangeText={(value) => handleTextChange('advisorRemarks', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              editable={canEditRemarks('advisorRemarks')}
              style={styles.input}
            />
            {!canEditRemarks('advisorRemarks') && (
              <HelperText type="info">Only Customer Advisors can edit advisor remarks</HelperText>
            )}

            {/* Team Lead Remarks */}
            <TextInput
              label={`Team Lead Remarks ${formData.teamLeadRemarks ? `(${formData.teamLeadRemarks.length} chars)` : '(empty)'}`}
              value={formData.teamLeadRemarks || ''}
              onChangeText={(value) => handleTextChange('teamLeadRemarks', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              editable={canEditRemarks('teamLeadRemarks')}
              style={styles.input}
            />
            {!canEditRemarks('teamLeadRemarks') && (
              <HelperText type="info">Only Team Leads can edit team lead remarks</HelperText>
            )}

            {/* Sales Manager Remarks */}
            <TextInput
              label={`Sales Manager Remarks ${formData.salesManagerRemarks ? `(${formData.salesManagerRemarks.length} chars)` : '(empty)'}`}
              value={formData.salesManagerRemarks || ''}
              onChangeText={(value) => handleTextChange('salesManagerRemarks', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              editable={canEditRemarks('salesManagerRemarks')}
              style={styles.input}
            />
            {!canEditRemarks('salesManagerRemarks') && (
              <HelperText type="info">Only Sales Managers can edit sales manager remarks</HelperText>
            )}

            {/* General Manager Remarks */}
            <TextInput
              label={`General Manager Remarks ${formData.generalManagerRemarks ? `(${formData.generalManagerRemarks.length} chars)` : '(empty)'}`}
              value={formData.generalManagerRemarks || ''}
              onChangeText={(value) => handleTextChange('generalManagerRemarks', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              editable={canEditRemarks('generalManagerRemarks')}
              style={styles.input}
            />
            {!canEditRemarks('generalManagerRemarks') && (
              <HelperText type="info">Only General Managers can edit general manager remarks</HelperText>
            )}

            {/* Admin Remarks */}
            <TextInput
              label={`Admin Remarks ${formData.adminRemarks ? `(${formData.adminRemarks.length} chars)` : '(empty)'}`}
              value={formData.adminRemarks || ''}
              onChangeText={(value) => handleTextChange('adminRemarks', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              editable={canEditRemarks('adminRemarks')}
              style={styles.input}
            />
            {!canEditRemarks('adminRemarks') && (
              <HelperText type="info">Only Admins can edit admin remarks</HelperText>
            )}
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
  disabledInput: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
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
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  restrictedTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#EF4444',
  },
  restrictedMessage: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#374151',
  },
  restrictedSubMessage: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
