import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Badge,
  Icon,
  ActivityIndicator,
  Searchbar,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * Vehicle interface
 */
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  color: string;
  fuelType: string;
  transmission: string;
  imageUrl?: string;
}

/**
 * Stock statistics interface
 */
interface StockStats {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  soldVehicles: number;
  totalValue: number;
  averagePrice: number;
}

/**
 * Stock Screen Component
 */
export function StockScreen({ navigation }: any): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'AVAILABLE' | 'RESERVED' | 'SOLD'>('ALL');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stockStats, setStockStats] = useState<StockStats>({
    totalVehicles: 0,
    availableVehicles: 0,
    reservedVehicles: 0,
    soldVehicles: 0,
    totalValue: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Mock data for demonstration
   */
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      price: 28500,
      mileage: 15000,
      status: 'AVAILABLE',
      color: 'Silver',
      fuelType: 'Gasoline',
      transmission: 'Automatic',
    },
    {
      id: '2',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      price: 24500,
      mileage: 22000,
      status: 'AVAILABLE',
      color: 'Blue',
      fuelType: 'Gasoline',
      transmission: 'CVT',
    },
    {
      id: '3',
      make: 'Ford',
      model: 'F-150',
      year: 2023,
      price: 45000,
      mileage: 8500,
      status: 'RESERVED',
      color: 'Black',
      fuelType: 'Gasoline',
      transmission: 'Automatic',
    },
    {
      id: '4',
      make: 'BMW',
      model: 'X5',
      year: 2021,
      price: 52000,
      mileage: 18000,
      status: 'SOLD',
      color: 'White',
      fuelType: 'Gasoline',
      transmission: 'Automatic',
    },
    {
      id: '5',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      price: 42000,
      mileage: 12000,
      status: 'AVAILABLE',
      color: 'Red',
      fuelType: 'Electric',
      transmission: 'Automatic',
    },
  ];

  /**
   * Fetch vehicles data
   */
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would be an API call
      setVehicles(mockVehicles);
      
      // Calculate stock statistics
      const stats: StockStats = {
        totalVehicles: mockVehicles.length,
        availableVehicles: mockVehicles.filter(v => v.status === 'AVAILABLE').length,
        reservedVehicles: mockVehicles.filter(v => v.status === 'RESERVED').length,
        soldVehicles: mockVehicles.filter(v => v.status === 'SOLD').length,
        totalValue: mockVehicles.reduce((sum, v) => sum + v.price, 0),
        averagePrice: mockVehicles.reduce((sum, v) => sum + v.price, 0) / mockVehicles.length,
      };
      
      setStockStats(stats);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      Alert.alert('Error', 'Failed to load vehicle stock');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle pull to refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVehicles();
    setRefreshing(false);
  }, [fetchVehicles]);

  /**
   * Load data on component mount
   */
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  /**
   * Filter vehicles based on search and status
   */
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.year.toString().includes(searchQuery);
    
    const matchesFilter = selectedFilter === 'ALL' || vehicle.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#10B981';
      case 'RESERVED': return '#F59E0B';
      case 'SOLD': return '#EF4444';
      default: return '#6B7280';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'check-circle';
      case 'RESERVED': return 'clock';
      case 'SOLD': return 'check';
      default: return 'help-circle';
    }
  };

  /**
   * Handle vehicle press
   */
  const handleVehiclePress = (vehicle: Vehicle) => {
    Alert.alert(
      vehicle.make + ' ' + vehicle.model,
      `Year: ${vehicle.year}\nPrice: ₹${vehicle.price.toLocaleString()}\nMileage: ${vehicle.mileage.toLocaleString()} miles\nColor: ${vehicle.color}\nFuel: ${vehicle.fuelType}\nTransmission: ${vehicle.transmission}`,
      [{ text: 'OK' }]
    );
  };

  if (loading && vehicles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading vehicle stock...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <ExpoLinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1565C0']}
              tintColor="#1565C0"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              MotorSync Stock
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Manage your vehicle inventory
            </Text>
          </View>

          {/* Stock Overview Cards */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Icon source="car" size={24} color="#1565C0" />
                <Text variant="headlineSmall" style={styles.statValue}>
                  {stockStats.totalVehicles}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Total Vehicles
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Icon source="check-circle" size={24} color="#10B981" />
                <Text variant="headlineSmall" style={[styles.statValue, { color: '#10B981' }]}>
                  {stockStats.availableVehicles}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Available
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Icon source="clock" size={24} color="#F59E0B" />
                <Text variant="headlineSmall" style={[styles.statValue, { color: '#F59E0B' }]}>
                  {stockStats.reservedVehicles}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Reserved
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Icon source="currency-inr" size={24} color="#8B5CF6" />
                <Text variant="headlineSmall" style={[styles.statValue, { color: '#8B5CF6' }]}>
                  ₹{(stockStats.totalValue / 1000000).toFixed(1)}M
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Total Value
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search vehicles..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
            >
              {(['ALL', 'AVAILABLE', 'RESERVED', 'SOLD'] as const).map((filter) => (
                <Chip
                  key={filter}
                  selected={selectedFilter === filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter && styles.filterChipSelected
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextSelected
                  ]}
                >
                  {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Vehicles List */}
          <View style={styles.vehiclesContainer}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Vehicles ({filteredVehicles.length})
            </Text>

            {filteredVehicles.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon source="car-off" size={48} color="#9CA3AF" />
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    No vehicles found
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptySubtext}>
                    {searchQuery ? 'Try adjusting your search terms' : 'Add vehicles to your inventory'}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} style={styles.vehicleCard}>
                  <TouchableOpacity
                    onPress={() => handleVehiclePress(vehicle)}
                    activeOpacity={0.7}
                  >
                    <Card.Content style={styles.vehicleContent}>
                      <View style={styles.vehicleHeader}>
                        <View style={styles.vehicleInfo}>
                          <Text variant="titleMedium" style={styles.vehicleTitle}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </Text>
                          <Text variant="bodyMedium" style={styles.vehiclePrice}>
                            ₹{vehicle.price.toLocaleString()}
                          </Text>
                        </View>
                        
                        <Badge
                          style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) }]}
                          textStyle={styles.statusBadgeText}
                        >
                          <Icon 
                            source={getStatusIcon(vehicle.status)} 
                            size={16} 
                            color="white" 
                          />
                          {' ' + vehicle.status}
                        </Badge>
                      </View>

                      <View style={styles.vehicleDetails}>
                        <View style={styles.detailItem}>
                          <Icon source="speedometer" size={16} color="#6B7280" />
                          <Text variant="bodySmall" style={styles.detailText}>
                            {vehicle.mileage.toLocaleString()} miles
                          </Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                          <Icon source="palette" size={16} color="#6B7280" />
                          <Text variant="bodySmall" style={styles.detailText}>
                            {vehicle.color}
                          </Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                          <Icon source="fuel" size={16} color="#6B7280" />
                          <Text variant="bodySmall" style={styles.detailText}>
                            {vehicle.fuelType}
                          </Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                          <Icon source="cog" size={16} color="#6B7280" />
                          <Text variant="bodySmall" style={styles.detailText}>
                            {vehicle.transmission}
                          </Text>
                        </View>
                      </View>
                    </Card.Content>
                  </TouchableOpacity>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontWeight: '700',
    color: '#1565C0',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#6B7280',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  filterChipSelected: {
    backgroundColor: '#1565C0',
  },
  filterChipText: {
    color: '#6B7280',
  },
  filterChipTextSelected: {
    color: 'white',
  },
  vehiclesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vehicleContent: {
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehiclePrice: {
    fontWeight: '700',
    color: '#1565C0',
    fontSize: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  vehicleDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  detailText: {
    marginLeft: 6,
    color: '#6B7280',
  },
});
