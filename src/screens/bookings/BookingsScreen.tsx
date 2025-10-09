/**
 * Bookings Screen with Timeline Tabs
 * Displays bookings organized by timeline categories
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
import * as BookingService from '../../services/booking.service';
import { Booking, TimelineCategory } from '../../services/types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { theme, spacing, shadows, borderRadius } from '../../utils/theme';

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

type TimelineTab = 'all' | TimelineCategory;

export function BookingsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineTab>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  // Fetch bookings by timeline
  const fetchBookings = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const timeline = selectedTimeline === 'all' ? undefined : selectedTimeline;
      const response = await BookingService.getMyBookings(timeline);
      setBookings(response.bookings || []);
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
  }, [selectedTimeline]);

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
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      booking.customerName.toLowerCase().includes(query) ||
      booking.customerPhone.includes(query) ||
      booking.variant.toLowerCase().includes(query)
    );
  });

  // Timeline stats
  const getTimelineStats = () => {
    return {
      all: bookings.length,
      today: bookings.filter(b => b.timeline === 'today').length,
      delivery_today: bookings.filter(b => b.timeline === 'delivery_today').length,
      pending_update: bookings.filter(b => b.timeline === 'pending_update').length,
      overdue: bookings.filter(b => b.timeline === 'overdue').length,
    };
  };

  const renderStatsBar = () => {
    const stats = getTimelineStats();
    
    return (
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.all}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>
            {stats.today}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {stats.delivery_today}
          </Text>
          <Text style={styles.statLabel}>Delivery</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {stats.pending_update}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {stats.overdue}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>
    );
  };

  const renderTimelineTab = (
    timeline: TimelineTab,
    icon: string,
    label: string,
    color: string
  ) => {
    const isSelected = selectedTimeline === timeline;

    return (
      <TouchableOpacity
        key={timeline}
        style={[
          styles.timelineTab,
          { 
            backgroundColor: isSelected ? color : '#FFFFFF',
            borderWidth: isSelected ? 2 : 1.5,
            borderColor: isSelected ? color : '#E2E8F0',
          }
        ]}
        onPress={() => setSelectedTimeline(timeline)}
        activeOpacity={0.7}
      >
        <View style={styles.timelineTabContent}>
          <Text style={[styles.timelineTabIcon, { 
            color: isSelected ? '#FFFFFF' : '#64748B',
            opacity: isSelected ? 1 : 0.6,
          }]}>
            {icon}
          </Text>
          <Text style={[
            styles.timelineTabLabel,
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
      switch (selectedTimeline) {
        case 'all':
          return {
            icon: '📋',
            title: 'No Bookings',
            message: 'Bookings assigned to you will appear here'
          };
        case 'today':
          return {
            icon: '📅',
            title: 'No Actions Today',
            message: 'No actions scheduled for today'
          };
        case 'delivery_today':
          return {
            icon: '🚗',
            title: 'No Deliveries Today',
            message: 'No deliveries scheduled for today'
          };
        case 'pending_update':
          return {
            icon: '⏰',
            title: 'No Pending Updates',
            message: 'All bookings are up to date'
          };
        case 'overdue':
          return {
            icon: '✅',
            title: 'No Overdue Bookings',
            message: 'Great! No overdue bookings'
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
            </View>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🚗</Text>
            </View>
          </View>
          
          {/* Stats Bar */}
          {renderStatsBar()}
        </View>

        {/* Enhanced Search Bar and Timeline Tabs */}
        <View style={styles.searchAndTabsContainer}>
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
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.timelineTabs}
            contentContainerStyle={styles.timelineTabsContent}
          >
            {renderTimelineTab('all', '', 'All', '#3B82F6')}
            {renderTimelineTab('today', '', 'Today', '#3B82F6')}
            {renderTimelineTab('delivery_today', '', 'Delivery', '#10B981')}
            {renderTimelineTab('pending_update', '', 'Pending', '#F59E0B')}
            {renderTimelineTab('overdue', '', 'Overdue', '#EF4444')}
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
});
