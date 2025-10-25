/**
 * Bookings Screen with Status Filter
 * Displays bookings filtered by status categories
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Text,
  Chip,
  Searchbar,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, G, Ellipse, Circle } from 'react-native-svg';

import { BookingCard } from '../../components/BookingCard';
import { DownloadButton } from '../../components/DownloadButton';
import * as BookingService from '../../services/booking.service';
import { Booking, TimelineCategory } from '../../services/types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { theme, spacing, shadows, borderRadius } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';
import { getDataFilterOptions, canSeeUserData, getRoleDisplayNameWithHierarchy, filterBookingsByHierarchy } from '../../utils/hierarchyUtils';

const { width, height } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<MainStackParamList>;

/**
 * Enhanced Background Pattern with Animated Elements
 */
const BackgroundPattern = () => (
  <View style={styles.backgroundPatternContainer}>
    <Svg height={height} width={width} style={styles.backgroundSvg}>
      <Defs>
        {/* Primary gradient for base layer */}
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.05" />
          <Stop offset="50%" stopColor="#3B82F6" stopOpacity="0.03" />
          <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.04" />
        </LinearGradient>
        
        {/* Gradient for orbs */}
        <LinearGradient id="orb1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
        </LinearGradient>
        
        <LinearGradient id="orb2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#818CF8" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.04" />
        </LinearGradient>
        
        <LinearGradient id="orb3" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#1E40AF" stopOpacity="0.03" />
        </LinearGradient>
      </Defs>
      
      {/* Base layer */}
      <Rect width="100%" height="100%" fill="url(#bgGradient)" />
      
      {/* Decorative floating orbs with gradients */}
      <G opacity="1">
        <Ellipse cx={width * 0.15} cy={height * 0.12} rx="120" ry="120" fill="url(#orb1)" />
        <Ellipse cx={width * 0.85} cy={height * 0.25} rx="150" ry="150" fill="url(#orb2)" />
        <Ellipse cx={width * 0.5} cy={height * 0.85} rx="100" ry="100" fill="url(#orb3)" />
      </G>
      
      {/* Accent shapes */}
      <G opacity="0.03">
        <Circle cx={width * 0.3} cy={height * 0.5} r="60" fill="#3B82F6" />
        <Circle cx={width * 0.75} cy={height * 0.6} r="80" fill="#6366F1" />
        <Circle cx={width * 0.1} cy={height * 0.75} r="50" fill="#2563EB" />
      </G>
    </Svg>
  </View>
);

type StatusFilter = 'all' | 'pending' | 'retailed' | 'cancelled';

export function BookingsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { state: authState } = useAuth();

  // Get user role and hierarchical permissions
  const userRole = getUserRole(authState.user);
  const dataFilterOptions = getDataFilterOptions(userRole);

  // State
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  // Fetch bookings by timeline
  const fetchBookings = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const currentUserId = authState.user?.firebaseUid || authState.user?.id;
      const response = await BookingService.getMyBookings(undefined, undefined, userRole, currentUserId);
      
      // Ensure we have a valid bookings array
      let bookingsArray = response.bookings || [];
      if (!Array.isArray(bookingsArray)) {
        bookingsArray = [];
      }
      
      // Apply hierarchical filtering for managers
      if (['TEAM_LEAD', 'SALES_MANAGER', 'GENERAL_MANAGER'].includes(userRole)) {
        // For now, we'll use a simplified approach since we don't have all users loaded
        // In a real implementation, you'd fetch all users and filter based on hierarchy
        const currentUserId = authState.user?.firebaseUid || authState.user?.id;
        
        // Filter bookings based on hierarchy
        if (currentUserId) {
          bookingsArray = filterBookingsByHierarchy(bookingsArray, userRole, currentUserId, []);
        }
      }
      
      setBookings(bookingsArray);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      setSnackbar({
        visible: true,
        message: error.message || 'Failed to load bookings',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authState.user?.role, authState.user?.firebaseUid, authState.user?.id, userRole]);

  // Initial load and timeline change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings(false);
  }, [fetchBookings]);

  // Navigate to booking details
  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  // Navigate to update booking
  const handleUpdateBooking = (booking: Booking) => {
    navigation.navigate('BookingUpdate', { bookingId: booking.id, booking });
  };

  // Filter bookings by search query
  const filteredBookings = bookings.filter((booking) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        booking.customerName.toLowerCase().includes(query) ||
        booking.customerPhone.includes(query) ||
        booking.variant.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Status filter
    if (selectedStatus !== 'all') {
      switch (selectedStatus) {
        case 'pending':
          return ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'CONFIRMED', 'APPROVED'].includes(booking.status);
        case 'retailed':
          return booking.status === 'DELIVERED';
        case 'cancelled':
          return ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(booking.status);
        default:
          return true;
      }
    }

    return true;
  });


  // Basic stats
  const getStats = () => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'CONFIRMED', 'APPROVED'].includes(b.status)).length,
      retailed: bookings.filter(b => b.status === 'DELIVERED').length,
      cancelled: bookings.filter(b => ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(b.status)).length,
    };
  };

  const renderStatsBar = () => {
    const stats = getStats();
    
    return (
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.all}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {stats.pending}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {stats.retailed}
          </Text>
          <Text style={styles.statLabel}>Retailed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {stats.cancelled}
          </Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>
    );
  };


  const renderStatusTab = (
    status: StatusFilter,
    icon: string,
    label: string,
    color: string
  ) => {
    const isSelected = selectedStatus === status;

    return (
      <TouchableOpacity
        key={status}
        style={[
          styles.statusTab,
          { 
            backgroundColor: isSelected ? color : '#FFFFFF',
            borderWidth: isSelected ? 2 : 1.5,
            borderColor: isSelected ? color : '#E2E8F0',
          }
        ]}
        onPress={() => setSelectedStatus(status)}
        activeOpacity={0.7}
      >
        <View style={styles.statusTabContent}>
          <Text style={[styles.statusTabIcon, { 
            color: isSelected ? '#FFFFFF' : '#64748B',
            opacity: isSelected ? 1 : 0.6,
          }]}>
            {icon}
          </Text>
          <Text style={[
            styles.statusTabLabel,
            { color: isSelected ? '#FFFFFF' : '#64748B' }
          ]}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const getEmptyStateContent = () => {
      switch (selectedStatus) {
        case 'all':
          return {
            icon: '📋',
            title: 'No Bookings',
            message: 'Bookings assigned to you will appear here'
          };
        case 'pending':
          return {
            icon: '⏳',
            title: 'No Pending Bookings',
            message: 'No pending bookings found'
          };
        case 'retailed':
          return {
            icon: '✅',
            title: 'No Retailed Bookings',
            message: 'No retailed bookings found'
          };
        case 'cancelled':
          return {
            icon: '❌',
            title: 'No Cancelled Bookings',
            message: 'No cancelled bookings found'
          };
        default:
          return {
            icon: '📋',
            title: 'No Bookings',
            message: 'Bookings will appear here'
          };
      }
    };

    const content = getEmptyStateContent();

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>{content.icon}</Text>
        <Text variant="headlineMedium" style={styles.emptyTitle}>
          {content.title}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyMessage}>
          {content.message}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Rich Gradient Background */}
      <ExpoLinearGradient
        colors={['#F8FAFC', '#EFF6FF', '#F0F9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Background Pattern Overlay */}
      <View style={styles.backgroundContainer}>
        <BackgroundPattern />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text variant="displaySmall" style={styles.title}>
                Bookings
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Track your vehicle bookings
              </Text>
              <Text variant="bodySmall" style={styles.roleIndicator}>
                {getRoleDisplayNameWithHierarchy(userRole)} • {dataFilterOptions.canSeeAll ? 'All Data' : dataFilterOptions.canSeeTeam ? 'Team Data' : 'Own Data'}
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🚗</Text>
            </View>
          </View>
          
          {/* Download Button */}
          <View style={styles.downloadContainer}>
            <DownloadButton 
              type="bookings" 
              onDownloadStart={() => console.log('Download started')}
              onDownloadComplete={(result) => console.log('Download completed', result)}
              style={styles.downloadButton}
            />
          </View>
          
          {/* Stats Bar */}
          {renderStatsBar()}
        </View>

        {/* Enhanced Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search by name, phone, variant..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#3B82F6"
          />
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.statusFilterContainer}>
          <Text style={styles.statusFilterTitle}>Filter by Status</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusTabsContainer}
          >
            {renderStatusTab('all', '📋', 'All', '#3B82F6')}
            {renderStatusTab('pending', '⏳', 'Pending', '#F59E0B')}
            {renderStatusTab('retailed', '✅', 'Retailed', '#10B981')}
            {renderStatusTab('cancelled', '❌', 'Cancelled', '#EF4444')}
          </ScrollView>
        </View>

        {/* Bookings List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text variant="bodyLarge" style={styles.loadingText}>
              Loading bookings...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor="#3B82F6"
                colors={['#3B82F6']}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredBookings.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <View style={styles.listHeader}>
                  <Text style={styles.sectionTitle}>
                    {filteredBookings.length} {filteredBookings.length === 1 ? 'Booking' : 'Bookings'}
                  </Text>
                  {searchQuery ? (
                    <Chip
                      mode="flat"
                      onClose={() => setSearchQuery('')}
                      style={styles.searchChip}
                      textStyle={styles.searchChipText}
                    >
                      Filtered
                    </Chip>
                  ) : null}
                </View>
                {filteredBookings.map((booking, index) => (
                  <Animated.View
                    key={booking.id}
                    style={[
                      styles.cardWrapper,
                      { opacity: 1, transform: [{ translateY: 0 }] }
                    ]}
                  >
                    <BookingCard
                      booking={booking}
                      onPress={() => handleBookingPress(booking)}
                      onUpdate={() => handleUpdateBooking(booking)}
                      showActions={true}
                      userRole={authState.user?.role?.name}
                    />
                  </Animated.View>
                ))}
              </>
            )}
          </ScrollView>
        )}

        {/* Snackbar */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3000}
        >
          {snackbar.message}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundPatternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerIconText: {
    fontSize: 24,
  },
  title: {
    fontWeight: '900',
    color: '#0F172A',
    fontSize: 32,
    letterSpacing: -1,
    lineHeight: 38,
  },
  subtitle: {
    color: '#64748B',
    marginTop: 4,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  roleIndicator: {
    color: '#3B82F6',
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  searchAndTabsContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    fontSize: 15,
    color: '#0F172A',
  },
  timelineTabs: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  timelineTabsContent: {
    paddingHorizontal: 0,
    gap: 8,
  },
  timelineTab: {
    minWidth: 100,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timelineTabIcon: {
    fontSize: 18,
  },
  timelineTabLabel: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.3,
  },
  statusFilterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  statusFilterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusTabsContainer: {
    paddingRight: 20,
  },
  statusTab: {
    minWidth: 100,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusTabIcon: {
    fontSize: 18,
  },
  statusTabLabel: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  searchChip: {
    height: 32,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  searchChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  cardWrapper: {
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptyMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  downloadContainer: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  downloadButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
