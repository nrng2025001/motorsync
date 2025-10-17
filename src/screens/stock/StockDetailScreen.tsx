/**
 * Stock Detail Screen
 * Displays detailed information about a specific vehicle
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  ActivityIndicator,
  Icon,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { StockAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Vehicle } from '../../types/stock';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { theme } from '../../utils/theme';

type NavigationProp = StackNavigationProp<MainStackParamList>;

export function StockDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { state: authState } = useAuth();
  const isAdmin = authState.user?.role?.name === 'ADMIN';

  const vehicleId = (route.params as any)?.vehicleId;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /**
   * Fetch vehicle details
   */
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setError('No vehicle ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await StockAPI.getVehicleById(vehicleId);
        setVehicle(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching vehicle:', err);
        setError(err.message || 'Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  /**
   * Handle edit vehicle
   */
  const handleEdit = () => {
    navigation.navigate('AddEditStock', { vehicleId: vehicle?.id });
  };

  /**
   * Handle delete vehicle
   */
  const handleDelete = () => {
    if (!vehicle) return;

    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${vehicle.variant}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  /**
   * Confirm delete vehicle
   */
  const confirmDelete = async () => {
    if (!vehicle) return;

    try {
      setDeleting(true);
      await StockAPI.deleteVehicle(vehicle.id);
      Alert.alert('Success', 'Vehicle deleted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      console.error('Error deleting vehicle:', err);
      Alert.alert('Error', err.message || 'Failed to delete vehicle');
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Get stock status color
   */
  const getStockStatusColor = () => {
    if (vehicle && vehicle.availableStock === 0) return '#EF4444';
    if (vehicle && vehicle.availableStock / vehicle.totalStock <= 0.3) return '#F59E0B';
    return '#10B981';
  };

  /**
   * Get stock status text
   */
  const getStockStatusText = () => {
    if (!vehicle) return '';
    if (vehicle.availableStock === 0) return 'Out of Stock';
    if (vehicle.availableStock / vehicle.totalStock <= 0.3) return 'Low Stock';
    return 'In Stock';
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
            Vehicle Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading vehicle details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Vehicle Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={80} color="#EF4444" />
          <Text variant="titleLarge" style={styles.errorTitle}>
            Error Loading Vehicle
          </Text>
          <Text variant="bodyMedium" style={styles.errorText}>
            {error || 'Vehicle not found'}
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
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          {vehicle.variant}
        </Text>
        {isAdmin && (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
              <Icon source="pencil" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete} 
              style={styles.iconButton}
              disabled={deleting}
            >
              <Icon source="delete" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        {!isAdmin && <View style={styles.placeholder} />}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        <Card style={[styles.statusBanner, { backgroundColor: getStockStatusColor() + '20' }]}>
          <Card.Content style={styles.statusBannerContent}>
            <Icon source="package-variant" size={32} color={getStockStatusColor()} />
            <View style={styles.statusInfo}>
              <Text variant="titleLarge" style={[styles.statusTitle, { color: getStockStatusColor() }]}>
                {getStockStatusText()}
              </Text>
              <Text variant="bodyMedium" style={styles.statusSubtitle}>
                {vehicle.availableStock} of {vehicle.totalStock} units available
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Vehicle Information
            </Text>

            <View style={styles.infoRow}>
              <Icon source="car" size={20} color="#6B7280" />
              <Text variant="bodySmall" style={styles.infoLabel}>
                Variant
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {vehicle.variant}
              </Text>
            </View>

            {vehicle.modelYear && (
              <View style={styles.infoRow}>
                <Icon source="calendar" size={20} color="#6B7280" />
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Model Year
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {vehicle.modelYear}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Icon source="palette" size={20} color="#6B7280" />
              <Text variant="bodySmall" style={styles.infoLabel}>
                Color
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {vehicle.color}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon source="gas-station" size={20} color="#6B7280" />
              <Text variant="bodySmall" style={styles.infoLabel}>
                Fuel Type
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {vehicle.fuelType}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon source="car-cog" size={20} color="#6B7280" />
              <Text variant="bodySmall" style={styles.infoLabel}>
                Transmission
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {vehicle.transmission}
              </Text>
            </View>

            {vehicle.vinNumber && (
              <View style={styles.infoRow}>
                <Icon source="barcode" size={20} color="#6B7280" />
                <Text variant="bodySmall" style={styles.infoLabel}>
                  VIN Number
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {vehicle.vinNumber}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Stock Information */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Stock Information
            </Text>

            <View style={styles.stockGrid}>
              <View style={styles.stockCard}>
                <Text variant="bodySmall" style={styles.stockLabel}>
                  Total Stock
                </Text>
                <Text variant="displaySmall" style={[styles.stockValue, { color: '#3B82F6' }]}>
                  {vehicle.totalStock}
                </Text>
              </View>

              <View style={styles.stockCard}>
                <Text variant="bodySmall" style={styles.stockLabel}>
                  Available
                </Text>
                <Text variant="displaySmall" style={[styles.stockValue, { color: getStockStatusColor() }]}>
                  {vehicle.availableStock}
                </Text>
              </View>

              {vehicle.allocatedStock !== undefined && (
                <View style={styles.stockCard}>
                  <Text variant="bodySmall" style={styles.stockLabel}>
                    Allocated
                  </Text>
                  <Text variant="displaySmall" style={[styles.stockValue, { color: '#F59E0B' }]}>
                    {vehicle.allocatedStock}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Location Information */}
        {(vehicle.dealerCode || vehicle.location) && (
          <Card style={styles.section}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Location
              </Text>

              {vehicle.dealerCode && (
                <View style={styles.infoRow}>
                  <Icon source="store" size={20} color="#6B7280" />
                  <Text variant="bodySmall" style={styles.infoLabel}>
                    Dealer Code
                  </Text>
                  <Text variant="bodyLarge" style={styles.infoValue}>
                    {vehicle.dealerCode}
                  </Text>
                </View>
              )}

              {vehicle.location && (
                <View style={styles.infoRow}>
                  <Icon source="map-marker" size={20} color="#6B7280" />
                  <Text variant="bodySmall" style={styles.infoLabel}>
                    Location
                  </Text>
                  <Text variant="bodyLarge" style={styles.infoValue}>
                    {vehicle.location}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Timestamps */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Timestamps
            </Text>

            <View style={styles.infoRow}>
              <Icon source="clock-plus" size={20} color="#6B7280" />
              <Text variant="bodySmall" style={styles.infoLabel}>
                Created
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {formatDate(vehicle.createdAt)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon source="clock-edit" size={20} color="#6B7280" />
              <Text variant="bodySmall" style={styles.infoLabel}>
                Last Updated
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {formatDate(vehicle.updatedAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons (Admin Only) */}
      {isAdmin && (
        <View style={styles.actionsBar}>
          <Button
            mode="outlined"
            onPress={handleDelete}
            style={styles.deleteButton}
            textColor="#EF4444"
            icon="delete"
            loading={deleting}
            disabled={deleting}
          >
            Delete
          </Button>
          <Button
            mode="contained"
            onPress={handleEdit}
            style={styles.editButton}
            icon="pencil"
          >
            Edit Vehicle
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#EF4444',
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statusBanner: {
    marginBottom: 16,
    borderRadius: 16,
  },
  statusBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontWeight: '700',
  },
  statusSubtitle: {
    color: '#374151',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoLabel: {
    flex: 1,
    color: '#6B7280',
  },
  infoValue: {
    flex: 2,
    fontWeight: '500',
    color: '#111827',
  },
  stockGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  stockCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
  },
  stockLabel: {
    color: '#6B7280',
    marginBottom: 8,
  },
  stockValue: {
    fontWeight: '700',
  },
  actionsBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    flex: 1,
    borderColor: '#EF4444',
  },
  editButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
  },
});

