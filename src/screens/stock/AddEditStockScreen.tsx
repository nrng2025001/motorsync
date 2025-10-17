/**
 * Add/Edit Stock Screen
 * Form for creating and editing vehicle stock (Admin only)
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Icon,
  Menu,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { StockAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  Vehicle,
  CreateVehicleRequest,
  FuelType,
  TransmissionType,
} from '../../types/stock';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { theme } from '../../utils/theme';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const FUEL_TYPE_OPTIONS = [
  { label: 'Petrol', value: FuelType.PETROL },
  { label: 'Diesel', value: FuelType.DIESEL },
  { label: 'CNG', value: FuelType.CNG },
  { label: 'Electric', value: FuelType.ELECTRIC },
];

const TRANSMISSION_OPTIONS = [
  { label: 'Manual', value: TransmissionType.MANUAL },
  { label: 'Automatic', value: TransmissionType.AUTOMATIC },
];

export function AddEditStockScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { state: authState } = useAuth();
  const isAdmin = authState.user?.role?.name === 'ADMIN';

  const vehicleId = (route.params as any)?.vehicleId;
  const isEditMode = !!vehicleId;

  // State
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState<Partial<CreateVehicleRequest>>({
    variant: '',
    modelYear: '',
    color: '',
    fuelType: undefined,
    transmission: undefined,
    vinNumber: '',
    totalStock: 0,
    availableStock: 0,
    allocatedStock: 0,
    dealerCode: '',
    location: '',
  });

  // Menu visibility
  const [fuelMenuVisible, setFuelMenuVisible] = useState(false);
  const [transmissionMenuVisible, setTransmissionMenuVisible] = useState(false);

  /**
   * Check if user is admin
   */
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert(
        'Access Denied',
        'Only administrators can add or edit vehicles.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [isAdmin]);

  /**
   * Load vehicle data in edit mode
   */
  useEffect(() => {
    if (isEditMode) {
      loadVehicle();
    }
  }, [vehicleId]);

  /**
   * Load vehicle data
   */
  const loadVehicle = async () => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      const vehicle = await StockAPI.getVehicleById(vehicleId);
      setFormData({
        variant: vehicle.variant,
        modelYear: vehicle.modelYear || '',
        color: vehicle.color,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        vinNumber: vehicle.vinNumber || '',
        totalStock: vehicle.totalStock,
        availableStock: vehicle.availableStock,
        allocatedStock: vehicle.allocatedStock || 0,
        dealerCode: vehicle.dealerCode || '',
        location: vehicle.location || '',
      });
    } catch (err: any) {
      console.error('Error loading vehicle:', err);
      Alert.alert('Error', err.message || 'Failed to load vehicle details', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.variant?.trim()) {
      newErrors.variant = 'Variant name is required';
    }

    if (!formData.color?.trim()) {
      newErrors.color = 'Color is required';
    }

    if (!formData.fuelType) {
      newErrors.fuelType = 'Fuel type is required';
    }

    if (!formData.transmission) {
      newErrors.transmission = 'Transmission is required';
    }

    if (formData.totalStock === undefined || formData.totalStock < 0) {
      newErrors.totalStock = 'Total stock must be 0 or greater';
    }

    if (formData.availableStock === undefined || formData.availableStock < 0) {
      newErrors.availableStock = 'Available stock must be 0 or greater';
    }

    if (formData.totalStock !== undefined && formData.availableStock !== undefined) {
      const allocated = formData.allocatedStock || 0;
      if (formData.availableStock + allocated > formData.totalStock) {
        newErrors.availableStock = 'Available + Allocated cannot exceed Total stock';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix all errors before submitting');
      return;
    }

    try {
      setSaving(true);

      const requestData: CreateVehicleRequest = {
        variant: formData.variant!.trim(),
        color: formData.color!.trim(),
        fuelType: formData.fuelType!,
        transmission: formData.transmission!,
        totalStock: formData.totalStock!,
        availableStock: formData.availableStock!,
      };

      // Add optional fields
      if (formData.modelYear?.trim()) requestData.modelYear = formData.modelYear.trim();
      if (formData.vinNumber?.trim()) requestData.vinNumber = formData.vinNumber.trim();
      if (formData.allocatedStock !== undefined && formData.allocatedStock > 0) {
        requestData.allocatedStock = formData.allocatedStock;
      }
      if (formData.dealerCode?.trim()) requestData.dealerCode = formData.dealerCode.trim();
      if (formData.location?.trim()) requestData.location = formData.location.trim();

      if (isEditMode && vehicleId) {
        await StockAPI.updateVehicle(vehicleId, requestData);
        Alert.alert('Success', 'Vehicle updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await StockAPI.createVehicle(requestData);
        Alert.alert('Success', 'Vehicle created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err: any) {
      console.error('Error saving vehicle:', err);
      Alert.alert('Error', err.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading vehicle data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          {isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}
        </Text>
        <Button mode="contained" onPress={handleSubmit} loading={saving} disabled={saving}>
          Save
        </Button>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Basic Information
            </Text>

            <TextInput
              label="Variant Name *"
              value={formData.variant}
              onChangeText={(text) => {
                setFormData({ ...formData, variant: text });
                if (errors.variant) setErrors({ ...errors, variant: '' });
              }}
              mode="outlined"
              error={!!errors.variant}
              style={styles.input}
              left={<TextInput.Icon icon="car" />}
            />
            {errors.variant && <Text style={styles.errorText}>{errors.variant}</Text>}

            <TextInput
              label="Model Year (Optional)"
              value={formData.modelYear}
              onChangeText={(text) => setFormData({ ...formData, modelYear: text })}
              mode="outlined"
              placeholder="e.g., 2024"
              style={styles.input}
              left={<TextInput.Icon icon="calendar" />}
            />

            <TextInput
              label="Color *"
              value={formData.color}
              onChangeText={(text) => {
                setFormData({ ...formData, color: text });
                if (errors.color) setErrors({ ...errors, color: '' });
              }}
              mode="outlined"
              error={!!errors.color}
              style={styles.input}
              left={<TextInput.Icon icon="palette" />}
            />
            {errors.color && <Text style={styles.errorText}>{errors.color}</Text>}

            {/* Fuel Type Dropdown */}
            <Menu
              visible={fuelMenuVisible}
              onDismiss={() => setFuelMenuVisible(false)}
              anchor={
                <TextInput
                  label="Fuel Type *"
                  value={FUEL_TYPE_OPTIONS.find(o => o.value === formData.fuelType)?.label || ''}
                  editable={false}
                  mode="outlined"
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setFuelMenuVisible(true)}
                    />
                  }
                  onPressIn={() => setFuelMenuVisible(true)}
                  error={!!errors.fuelType}
                  style={styles.input}
                  left={<TextInput.Icon icon="gas-station" />}
                />
              }
            >
              {FUEL_TYPE_OPTIONS.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setFormData({ ...formData, fuelType: option.value });
                    setFuelMenuVisible(false);
                    if (errors.fuelType) setErrors({ ...errors, fuelType: '' });
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
            {errors.fuelType && <Text style={styles.errorText}>{errors.fuelType}</Text>}

            {/* Transmission Dropdown */}
            <Menu
              visible={transmissionMenuVisible}
              onDismiss={() => setTransmissionMenuVisible(false)}
              anchor={
                <TextInput
                  label="Transmission *"
                  value={TRANSMISSION_OPTIONS.find(o => o.value === formData.transmission)?.label || ''}
                  editable={false}
                  mode="outlined"
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setTransmissionMenuVisible(true)}
                    />
                  }
                  onPressIn={() => setTransmissionMenuVisible(true)}
                  error={!!errors.transmission}
                  style={styles.input}
                  left={<TextInput.Icon icon="car-cog" />}
                />
              }
            >
              {TRANSMISSION_OPTIONS.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setFormData({ ...formData, transmission: option.value });
                    setTransmissionMenuVisible(false);
                    if (errors.transmission) setErrors({ ...errors, transmission: '' });
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
            {errors.transmission && <Text style={styles.errorText}>{errors.transmission}</Text>}

            <TextInput
              label="VIN Number (Optional)"
              value={formData.vinNumber}
              onChangeText={(text) => setFormData({ ...formData, vinNumber: text })}
              mode="outlined"
              autoCapitalize="characters"
              style={styles.input}
              left={<TextInput.Icon icon="barcode" />}
            />
          </Card.Content>
        </Card>

        {/* Stock Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Stock Information
            </Text>

            <TextInput
              label="Total Stock *"
              value={formData.totalStock?.toString() || ''}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setFormData({ ...formData, totalStock: value });
                if (errors.totalStock) setErrors({ ...errors, totalStock: '' });
              }}
              mode="outlined"
              keyboardType="number-pad"
              error={!!errors.totalStock}
              style={styles.input}
              left={<TextInput.Icon icon="warehouse" />}
            />
            {errors.totalStock && <Text style={styles.errorText}>{errors.totalStock}</Text>}

            <TextInput
              label="Available Stock *"
              value={formData.availableStock?.toString() || ''}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setFormData({ ...formData, availableStock: value });
                if (errors.availableStock) setErrors({ ...errors, availableStock: '' });
              }}
              mode="outlined"
              keyboardType="number-pad"
              error={!!errors.availableStock}
              style={styles.input}
              left={<TextInput.Icon icon="check-circle" />}
            />
            {errors.availableStock && <Text style={styles.errorText}>{errors.availableStock}</Text>}

            <TextInput
              label="Allocated Stock (Optional)"
              value={formData.allocatedStock?.toString() || ''}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setFormData({ ...formData, allocatedStock: value });
              }}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
              left={<TextInput.Icon icon="cube-outline" />}
            />

            <Text variant="bodySmall" style={styles.helpText}>
              * Available + Allocated should not exceed Total Stock
            </Text>
          </Card.Content>
        </Card>

        {/* Location Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Location Information
            </Text>

            <TextInput
              label="Dealer Code (Optional)"
              value={formData.dealerCode}
              onChangeText={(text) => setFormData({ ...formData, dealerCode: text })}
              mode="outlined"
              autoCapitalize="characters"
              placeholder="e.g., ZAWL"
              style={styles.input}
              left={<TextInput.Icon icon="store" />}
            />

            <TextInput
              label="Location (Optional)"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              mode="outlined"
              placeholder="e.g., Zone A Warehouse"
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
            />
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.footerText}>
          * Required fields
        </Text>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsBar}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={saving}
          disabled={saving}
        >
          {isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
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
    marginTop: 8,
    marginLeft: 12,
  },
  footerText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsBar: {
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
    backgroundColor: '#3B82F6',
  },
});

