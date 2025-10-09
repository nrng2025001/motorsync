/**
 * New Enquiry Screen
 * Create new enquiry with backend-compatible validation
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { DatePickerISO } from '../../components/DatePickerISO';
import * as EnquiryService from '../../services/enquiry.service';
import { EnquirySource, CreateEnquiryRequest } from '../../services/types';
import { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = StackNavigationProp<MainStackParamList>;

// Source options matching backend enum
const SOURCE_OPTIONS = [
  { label: 'Showroom Visit', value: EnquirySource.SHOWROOM },
  { label: 'Website', value: EnquirySource.WEBSITE },
  { label: 'Phone Call', value: EnquirySource.PHONE },
  { label: 'Referral', value: EnquirySource.REFERRAL },
  { label: 'Walk In', value: EnquirySource.WALK_IN },
];

// Common vehicle models (Indian market)
const VEHICLE_MODELS = [
  'Tata Nexon',
  'Tata Harrier',
  'Tata Safari',
  'Tata Punch',
  'Tata Altroz',
  'Maruti Suzuki Swift',
  'Maruti Suzuki Brezza',
  'Hyundai Creta',
  'Hyundai Venue',
  'Mahindra Scorpio',
  'Mahindra XUV700',
  'Other',
];

export function NewEnquiryScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  // Form state
  const [formData, setFormData] = useState<Partial<CreateEnquiryRequest>>({
    customerName: '',
    customerContact: '',
    customerEmail: '',
    model: '',
    variant: '',
    color: '',
    source: EnquirySource.SHOWROOM,
    expectedBookingDate: '',
    caRemarks: '',
    dealerCode: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const [modelMenuVisible, setModelMenuVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName?.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerContact?.trim()) {
      newErrors.customerContact = 'Contact number is required';
    } else if (!/^\+?[1-9]\d{9,14}$/.test(formData.customerContact.replace(/\s/g, ''))) {
      newErrors.customerContact = 'Please enter a valid phone number with country code (e.g., +919876543210)';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!formData.model?.trim()) {
      newErrors.model = 'Vehicle model is required';
    }

    if (!formData.source) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API (remove empty optional fields)
      const requestData: CreateEnquiryRequest = {
        customerName: formData.customerName!,
        customerContact: formData.customerContact!,
        model: formData.model!,
        source: formData.source!,
      };

      // Add optional fields if provided
      if (formData.customerEmail) requestData.customerEmail = formData.customerEmail;
      if (formData.variant) requestData.variant = formData.variant;
      if (formData.color) requestData.color = formData.color;
      if (formData.expectedBookingDate) requestData.expectedBookingDate = formData.expectedBookingDate;
      if (formData.caRemarks) requestData.caRemarks = formData.caRemarks;
      if (formData.dealerCode) requestData.dealerCode = formData.dealerCode;

      await EnquiryService.createEnquiry(requestData);

      Alert.alert(
        'Success',
        'Enquiry created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating enquiry:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create enquiry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSourceMenu = () => (
    <Menu
      visible={sourceMenuVisible}
      onDismiss={() => setSourceMenuVisible(false)}
      anchor={
        <TextInput
          label="Source *"
          value={SOURCE_OPTIONS.find(o => o.value === formData.source)?.label}
          editable={false}
          mode="outlined"
          right={<TextInput.Icon icon="chevron-down" onPress={() => setSourceMenuVisible(true)} />}
          onPressIn={() => setSourceMenuVisible(true)}
          error={!!errors.source}
          style={styles.input}
        />
      }
    >
      {SOURCE_OPTIONS.map((option) => (
        <Menu.Item
          key={option.value}
          onPress={() => {
            setFormData({ ...formData, source: option.value });
            setSourceMenuVisible(false);
            if (errors.source) setErrors({ ...errors, source: '' });
          }}
          title={option.label}
        />
      ))}
    </Menu>
  );

  const renderModelMenu = () => (
    <Menu
      visible={modelMenuVisible}
      onDismiss={() => setModelMenuVisible(false)}
      anchor={
        <TextInput
          label="Vehicle Model *"
          value={formData.model}
          editable={false}
          mode="outlined"
          right={<TextInput.Icon icon="chevron-down" onPress={() => setModelMenuVisible(true)} />}
          onPressIn={() => setModelMenuVisible(true)}
          error={!!errors.model}
          style={styles.input}
        />
      }
    >
      {VEHICLE_MODELS.map((model) => (
        <Menu.Item
          key={model}
          onPress={() => {
            setFormData({ ...formData, model });
            setModelMenuVisible(false);
            if (errors.model) setErrors({ ...errors, model: '' });
          }}
          title={model}
        />
      ))}
      <Divider />
      <Menu.Item
        onPress={() => {
          setModelMenuVisible(false);
          // Allow custom input
        }}
        title="Type custom model..."
      />
    </Menu>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Customer Information
            </Text>

            <TextInput
              label="Customer Name *"
              value={formData.customerName}
              onChangeText={(text) => {
                setFormData({ ...formData, customerName: text });
                if (errors.customerName) setErrors({ ...errors, customerName: '' });
              }}
              mode="outlined"
              error={!!errors.customerName}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
            {errors.customerName && (
              <Text style={styles.errorText}>{errors.customerName}</Text>
            )}

            <TextInput
              label="Contact Number *"
              value={formData.customerContact}
              onChangeText={(text) => {
                setFormData({ ...formData, customerContact: text });
                if (errors.customerContact) setErrors({ ...errors, customerContact: '' });
              }}
              mode="outlined"
              keyboardType="phone-pad"
              placeholder="+919876543210"
              error={!!errors.customerContact}
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />
            {errors.customerContact && (
              <Text style={styles.errorText}>{errors.customerContact}</Text>
            )}

            <TextInput
              label="Email (Optional)"
              value={formData.customerEmail}
              onChangeText={(text) => {
                setFormData({ ...formData, customerEmail: text });
                if (errors.customerEmail) setErrors({ ...errors, customerEmail: '' });
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.customerEmail}
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />
            {errors.customerEmail && (
              <Text style={styles.errorText}>{errors.customerEmail}</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Vehicle Information
            </Text>

            {renderModelMenu()}
            {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}

            <TextInput
              label="Variant (Optional)"
              value={formData.variant}
              onChangeText={(text) => setFormData({ ...formData, variant: text })}
              mode="outlined"
              placeholder="e.g., XZ+ Petrol"
              style={styles.input}
              left={<TextInput.Icon icon="car" />}
            />

            <TextInput
              label="Color (Optional)"
              value={formData.color}
              onChangeText={(text) => setFormData({ ...formData, color: text })}
              mode="outlined"
              placeholder="e.g., Blue"
              style={styles.input}
              left={<TextInput.Icon icon="palette" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Additional Details
            </Text>

            {renderSourceMenu()}
            {errors.source && <Text style={styles.errorText}>{errors.source}</Text>}

            <DatePickerISO
              label="Expected Booking Date (Optional)"
              value={formData.expectedBookingDate}
              onChange={(date) => setFormData({ ...formData, expectedBookingDate: date })}
              minimumDate={new Date()}
            />

            <TextInput
              label="Dealer Code (Optional)"
              value={formData.dealerCode}
              onChangeText={(text) => setFormData({ ...formData, dealerCode: text })}
              mode="outlined"
              placeholder="e.g., TATA001"
              style={styles.input}
              left={<TextInput.Icon icon="store" />}
            />

            <TextInput
              label="Remarks (Optional)"
              value={formData.caRemarks}
              onChangeText={(text) => setFormData({ ...formData, caRemarks: text })}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Add any additional notes..."
              style={styles.input}
              left={<TextInput.Icon icon="text" />}
            />
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.helpText}>
          * Required fields
        </Text>
        <Text variant="bodySmall" style={styles.helpText}>
          Note: New enquiries will be automatically categorized as "HOT"
        </Text>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Creating...' : 'Create Enquiry'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
  helpText: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
