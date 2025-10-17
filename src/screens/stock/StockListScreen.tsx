/**
 * Stock List Screen
 * Displays list of all vehicles with filtering and search
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Searchbar,
  FAB,
  ActivityIndicator,
  Button,
  Icon,
  Chip,
  Menu,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { StockCard } from '../../components/stock/StockCard';
import { StockStats } from '../../components/stock/StockStats';
import { StockAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { 
  Vehicle, 
  StockStats as StockStatsType, 
  FuelType, 
  TransmissionType 
} from '../../types/stock';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useDebounce } from '../../hooks/useDebounce';

type NavigationProp = StackNavigationProp<MainStackParamList>;

export function StockListScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { state: authState } = useAuth();
  const isAdmin = authState.user?.role?.name === 'ADMIN';

  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<StockStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType | undefined>();
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | undefined>();
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  
  // Menu visibility
  const [fuelMenuVisible, setFuelMenuVisible] = useState(false);
  const [transmissionMenuVisible, setTransmissionMenuVisible] = useState(false);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

  /**
   * Fetch vehicles and stats
   */
  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const filters: any = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (selectedFuelType) filters.fuelType = selectedFuelType;
      if (selectedTransmission) filters.transmission = selectedTransmission;
      if (showInStockOnly) filters.availability = 'IN_STOCK';

      const [vehiclesResponse, statsResponse] = await Promise.all([
        StockAPI.getVehicles(filters),
        StockAPI.getStats(),
      ]);

      setVehicles(vehiclesResponse.vehicles || []);
      setStats(statsResponse);
    } catch (err: any) {
      console.error('Error fetching stock data:', err);
      setError(err.message || 'Failed to load stock data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, selectedFuelType, selectedTransmission, showInStockOnly]);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(false);
  };

  /**
   * Handle vehicle press
   */
  const handleVehiclePress = (vehicle: Vehicle) => {
    navigation.navigate('StockDetail', { vehicleId: vehicle.id });
  };

  /**
   * Handle add vehicle
   */
  const handleAddVehicle = () => {
    navigation.navigate('AddEditStock');
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFuelType(undefined);
    setSelectedTransmission(undefined);
    setShowInStockOnly(false);
  };

  /**
   * Check if filters are active
   */
  const hasActiveFilters = 
    !!searchQuery || 
    !!selectedFuelType || 
    !!selectedTransmission || 
    showInStockOnly;

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon source="package-variant-closed" size={80} color="#D1D5DB" />
      <Text variant="titleLarge" style={styles.emptyTitle}>
        No Vehicles Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {hasActiveFilters
          ? 'Try adjusting your filters or search query'
          : 'Start by adding vehicles to your inventory'}
      </Text>
      {hasActiveFilters && (
        <Button mode="outlined" onPress={clearFilters} style={styles.clearButton}>
          Clear Filters
        </Button>
      )}
      {isAdmin && !hasActiveFilters && (
        <Button mode="contained" onPress={handleAddVehicle} style={styles.addButton}>
          Add First Vehicle
        </Button>
      )}
    </View>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon source="alert-circle" size={80} color="#EF4444" />
      <Text variant="titleLarge" style={styles.errorTitle}>
        Error Loading Stock
      </Text>
      <Text variant="bodyMedium" style={styles.errorText}>
        {error}
      </Text>
      <Button mode="contained" onPress={() => fetchData()} style={styles.retryButton}>
        Retry
      </Button>
    </View>
  );

  /**
   * Render list header
   */
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {/* Stats Card */}
      {stats && <StockStats stats={stats} />}

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search vehicles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#3B82F6"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        {/* Fuel Type Filter */}
        <Menu
          visible={fuelMenuVisible}
          onDismiss={() => setFuelMenuVisible(false)}
          anchor={
            <Chip
              mode={selectedFuelType ? 'flat' : 'outlined'}
              selected={!!selectedFuelType}
              onPress={() => setFuelMenuVisible(true)}
              style={styles.filterChip}
              icon="gas-station"
            >
              {selectedFuelType || 'Fuel Type'}
            </Chip>
          }
        >
          <Menu.Item onPress={() => { setSelectedFuelType(undefined); setFuelMenuVisible(false); }} title="All" />
          <Menu.Item onPress={() => { setSelectedFuelType(FuelType.PETROL); setFuelMenuVisible(false); }} title="Petrol" />
          <Menu.Item onPress={() => { setSelectedFuelType(FuelType.DIESEL); setFuelMenuVisible(false); }} title="Diesel" />
          <Menu.Item onPress={() => { setSelectedFuelType(FuelType.CNG); setFuelMenuVisible(false); }} title="CNG" />
          <Menu.Item onPress={() => { setSelectedFuelType(FuelType.ELECTRIC); setFuelMenuVisible(false); }} title="Electric" />
        </Menu>

        {/* Transmission Filter */}
        <Menu
          visible={transmissionMenuVisible}
          onDismiss={() => setTransmissionMenuVisible(false)}
          anchor={
            <Chip
              mode={selectedTransmission ? 'flat' : 'outlined'}
              selected={!!selectedTransmission}
              onPress={() => setTransmissionMenuVisible(true)}
              style={styles.filterChip}
              icon="car-cog"
            >
              {selectedTransmission || 'Transmission'}
            </Chip>
          }
        >
          <Menu.Item onPress={() => { setSelectedTransmission(undefined); setTransmissionMenuVisible(false); }} title="All" />
          <Menu.Item onPress={() => { setSelectedTransmission(TransmissionType.MANUAL); setTransmissionMenuVisible(false); }} title="Manual" />
          <Menu.Item onPress={() => { setSelectedTransmission(TransmissionType.AUTOMATIC); setTransmissionMenuVisible(false); }} title="Automatic" />
        </Menu>

        {/* In Stock Only */}
        <Chip
          mode={showInStockOnly ? 'flat' : 'outlined'}
          selected={showInStockOnly}
          onPress={() => setShowInStockOnly(!showInStockOnly)}
          style={styles.filterChip}
          icon="check-circle"
        >
          In Stock Only
        </Chip>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Chip
            mode="outlined"
            onPress={clearFilters}
            style={styles.clearFilterChip}
            icon="close"
          >
            Clear
          </Chip>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsSection}>
        <Text variant="bodyMedium" style={styles.resultsText}>
          {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found
        </Text>
      </View>
    </View>
  );

  // Show loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading stock...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing && vehicles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StockCard vehicle={item} onPress={() => handleVehiclePress(item)} />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="'#3B82F6'"
            colors={['#3B82F6']}
          />
        }
        contentContainerStyle={
          vehicles.length === 0 ? styles.emptyListContent : styles.listContent
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add Vehicle FAB (Admin Only) */}
      {isAdmin && (
        <FAB
          icon="plus"
          label="Add Vehicle"
          style={styles.fab}
          onPress={handleAddVehicle}
          color="#FFFFFF"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  listHeader: {
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 0,
  },
  filtersSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
  },
  clearFilterChip: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  resultsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  clearButton: {
    marginTop: 8,
  },
  addButton: {
    marginTop: 8,
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
  retryButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
});

