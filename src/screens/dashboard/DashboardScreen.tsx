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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, G, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

/**
 * Rich Background Pattern with Gradient
 */
const BackgroundPattern = () => (
  <View style={styles.backgroundPatternContainer}>
    <Svg height={height} width={width} style={styles.backgroundSvg}>
      <Defs>
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.08" />
          <Stop offset="50%" stopColor="#3B82F6" stopOpacity="0.04" />
          <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.06" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGradient)" />
      
      {/* Decorative floating orbs */}
      <G opacity="0.04">
        <Ellipse cx={width * 0.15} cy={height * 0.1} rx="100" ry="100" fill="#3B82F6" />
        <Ellipse cx={width * 0.9} cy={height * 0.2} rx="130" ry="130" fill="#6366F1" />
        <Ellipse cx={width * 0.5} cy={height * 0.9} rx="90" ry="90" fill="#1E40AF" />
      </G>
    </Svg>
  </View>
);

import { useAuth, type UserRole, getRoleDisplayName } from '../../context/AuthContext';
import { useTeam, canManageTeam } from '../../context/TeamContext';
import { DashboardCard } from '../../components/DashboardCard';
import { theme, spacing, shadows, borderRadius } from '../../utils/theme';
import { EnquiriesAPI, QuotationsAPI, BookingsAPI, StockAPI } from '../../api';

/**
 * Dashboard data interface
 */
interface DashboardData {
  enquiries: {
    total: number;
    hot: number;
    booked: number;
    lost: number;
  };
  followUps: {
    today: number;
    thisWeek: number;
    overdue: number;
  };
  bookings: {
    total: number;
    today: number;
    thisWeek: number;
    confirmed: number;
  };
  quotations: {
    total: number;
    generated: number;
    pending: number;
    approved: number;
  };
  sales: {
    monthlyTotal: string;
    monthlyTarget: string;
    progress: number;
    lastMonth: string;
  };
  stock: {
    totalVehicles: number;
    availableVehicles: number;
    reservedVehicles: number;
    soldVehicles: number;
    totalValue: string;
  };
}

/**
 * Loading and error states
 */
interface DashboardState {
  loading: boolean;
  error: string | null;
  data: DashboardData | null;
}

/**
 * Default empty dashboard data
 */
const getEmptyDashboardData = (): DashboardData => ({
  enquiries: { total: 0, hot: 0, booked: 0, lost: 0 },
  followUps: { today: 0, thisWeek: 0, overdue: 0 },
  bookings: { total: 0, today: 0, thisWeek: 0, confirmed: 0 },
  quotations: { total: 0, generated: 0, pending: 0, approved: 0 },
  sales: { 
    monthlyTotal: '₹0', 
    monthlyTarget: '₹0', 
    progress: 0, 
    lastMonth: '₹0' 
  },
  stock: {
    totalVehicles: 0,
    availableVehicles: 0,
    reservedVehicles: 0,
    soldVehicles: 0,
    totalValue: '₹0',
  },
});

/**
 * Dashboard Screen Component
 * Shows role-specific metrics and quick actions
 */
export function DashboardScreen({ navigation }: any): React.JSX.Element {
  const { state } = useAuth();
  const { getTeamHierarchy, getDirectReports } = useTeam();
  
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    loading: true,
    error: null,
    data: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  const userRole = state.user?.role || 'CUSTOMER_ADVISOR';
  const userName = state.user?.name || 'User';
  const canManageTeams = canManageTeam(userRole);
  
  // Get team data for managers
  const teamHierarchy = state.user ? getTeamHierarchy(state.user.id) : null;
  const directReports = state.user ? getDirectReports(state.user.id) : [];

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch advisor-specific data (all advisors can only see their own data)
      const [enquiries, bookings] = await Promise.all([
        EnquiriesAPI.getEnquiries({ page: 1, limit: 1000 }), // Get all advisor's enquiries
        BookingsAPI.getMyBookings(), // Get advisor's assigned bookings
      ]);
      
      console.log('📊 Dashboard data fetched:', { enquiries: enquiries.length, bookings: bookings.length });
      
      // Process enquiries data
      const enquiriesByCategory = {
        total: enquiries.length,
        hot: enquiries.filter((e: any) => e.category === 'HOT').length,
        booked: enquiries.filter((e: any) => e.category === 'BOOKED').length,
        lost: enquiries.filter((e: any) => e.category === 'LOST').length,
      };
      
      console.log('📈 Enquiries by category:', enquiriesByCategory);

      // Process bookings data
      const bookingsByStatus = {
        total: bookings.length,
        today: bookings.filter((b: any) => {
          const today = new Date().toISOString().split('T')[0];
          return b.expectedDeliveryDate && b.expectedDeliveryDate.split('T')[0] === today;
        }).length,
        thisWeek: bookings.filter((b: any) => {
          const bookingDate = new Date(b.bookingDate);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return bookingDate >= weekAgo;
        }).length,
        confirmed: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
      };

      // Calculate sales data from quotations (if any)
      const quotations = enquiries.flatMap((e: any) => e.quotations || []);
      const totalQuotationValue = quotations.reduce((sum: number, q: any) => sum + (q.amount || 0), 0);

      // Process the data into dashboard format
      const dashboardData: DashboardData = {
        enquiries: enquiriesByCategory,
        followUps: {
          today: 0, // TODO: Implement follow-ups if needed
          thisWeek: 0,
          overdue: 0,
        },
        bookings: bookingsByStatus,
        quotations: {
          total: quotations.length,
          generated: quotations.filter((q: any) => q.status === 'SENT').length,
          pending: quotations.filter((q: any) => q.status === 'PENDING').length,
          approved: quotations.filter((q: any) => q.status === 'ACCEPTED').length,
        },
        sales: {
          monthlyTotal: `₹${totalQuotationValue.toLocaleString()}`,
          monthlyTarget: `₹${(totalQuotationValue * 1.2).toLocaleString()}`, // 20% above current
          progress: totalQuotationValue > 0 ? Math.round((totalQuotationValue / (totalQuotationValue * 1.2)) * 100) : 0,
          lastMonth: `₹${(totalQuotationValue * 0.8).toLocaleString()}`, // 20% below current
        },
        stock: {
          totalVehicles: 0, // Advisors don't have access to stock stats
          availableVehicles: 0,
          reservedVehicles: 0,
          soldVehicles: 0,
          totalValue: '₹0',
        },
      };

      // Debug logging for processed data
      console.log('📈 Processed Dashboard Data (Advisor-specific):', dashboardData);
      console.log('🎯 Final enquiries counts:', dashboardData.enquiries);

      setDashboardState({
        loading: false,
        error: null,
        data: dashboardData,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setDashboardState({
        loading: false,
        error: error.message || 'Failed to load dashboard data',
        data: getEmptyDashboardData(),
      });
    }
  }, [userRole]);

  /**
   * Handle pull to refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  /**
   * Load data on component mount
   */
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Get welcome message based on time of day
   */
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Show loading state
  if (dashboardState.loading && !dashboardState.data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (dashboardState.error && !dashboardState.data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={48} color={theme.colors.error} />
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Unable to Load Dashboard
          </Text>
          <Text variant="bodyMedium" style={styles.errorMessage}>
            {dashboardState.error}
          </Text>
          <Button 
            mode="contained" 
            onPress={fetchDashboardData}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const dashboardData = dashboardState.data || getEmptyDashboardData();

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

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
        {/* Enquiries Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Enquiries Overview
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            Track and manage customer enquiries by category
          </Text>
          
          <View style={styles.categoryGrid}>
            {/* Hot Enquiries Card */}
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#FFF7ED', borderLeftColor: '#FF6F00' }]}
              onPress={() => navigation.navigate('Enquiries', { initialCategory: 'HOT', filterBy: 'category' })}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardHeader}>
                <Icon source="fire" size={24} color="#FF6F00" />
                <Text variant="headlineSmall" style={[styles.categoryValue, { color: '#FF6F00' }]}>
                  {dashboardData.enquiries.hot}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                Hot Enquiries
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtitle}>
                High priority leads
              </Text>
            </TouchableOpacity>

            {/* Booked Enquiries Card */}
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#F0F9FF', borderLeftColor: '#3B82F6' }]}
              onPress={() => navigation.navigate('Enquiries', { initialCategory: 'BOOKED', filterBy: 'category' })}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardHeader}>
                <Icon source="check-circle" size={24} color="#3B82F6" />
                <Text variant="headlineSmall" style={[styles.categoryValue, { color: '#3B82F6' }]}>
                  {dashboardData.enquiries.booked}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                Booked Enquiries
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtitle}>
                Successfully converted
              </Text>
            </TouchableOpacity>

            {/* Lost Enquiries Card */}
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#FEF2F2', borderLeftColor: '#EF4444' }]}
              onPress={() => navigation.navigate('Enquiries', { initialCategory: 'LOST', filterBy: 'category' })}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardHeader}>
                <Icon source="close-circle" size={24} color="#EF4444" />
                <Text variant="headlineSmall" style={[styles.categoryValue, { color: '#EF4444' }]}>
                  {dashboardData.enquiries.lost}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                Lost Enquiries
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtitle}>
                Opportunity lost
              </Text>
            </TouchableOpacity>

            {/* Total Enquiries Card */}
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#F0FDF4', borderLeftColor: '#10B981' }]}
              onPress={() => navigation.navigate('Enquiries', { initialCategory: 'ALL', filterBy: 'category' })}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardHeader}>
                <Icon source="chart-line" size={24} color="#10B981" />
                <Text variant="headlineSmall" style={[styles.categoryValue, { color: '#10B981' }]}>
                  {dashboardData.enquiries.total}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                Total Enquiries
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtitle}>
                All enquiries
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bookings Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Bookings Overview
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            Monitor booking status and confirmations
          </Text>
          
          <View style={styles.categoryGrid}>
            {/* Pending Bookings Card */}
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }]}
              onPress={() => navigation.navigate('Bookings', { initialStatus: 'PENDING', filterBy: 'status' })}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardHeader}>
                <Icon source="clock" size={24} color="#F59E0B" />
                <Text variant="headlineSmall" style={[styles.categoryValue, { color: '#F59E0B' }]}>
                  {dashboardData.bookings.today}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                Pending Bookings
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtitle}>
                Awaiting confirmation
              </Text>
            </TouchableOpacity>

            {/* Assigned Bookings Card */}
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#E0E7FF', borderLeftColor: '#6366F1' }]}
              onPress={() => navigation.navigate('Bookings', { initialStatus: 'ASSIGNED', filterBy: 'status' })}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardHeader}>
                <Icon source="account-check" size={24} color="#6366F1" />
                <Text variant="headlineSmall" style={[styles.categoryValue, { color: '#6366F1' }]}>
                  {dashboardData.bookings.thisWeek}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                Assigned Bookings
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtitle}>
                In progress
              </Text>
            </TouchableOpacity>

            {/* Confirmed Bookings Card */}
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#D1FAE5', borderLeftColor: '#10B981' }]}
              onPress={() => navigation.navigate('Bookings', { initialStatus: 'CONFIRMED', filterBy: 'status' })}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardHeader}>
                <Icon source="check-circle" size={24} color="#10B981" />
                <Text variant="headlineSmall" style={[styles.categoryValue, { color: '#10B981' }]}>
                  {dashboardData.bookings.confirmed}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                Confirmed Bookings
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtitle}>
                Ready for delivery
              </Text>
            </TouchableOpacity>

            {/* Total Bookings Card */}
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#F3F4F6', borderLeftColor: '#6B7280' }]}
              onPress={() => navigation.navigate('Bookings', { initialStatus: 'ALL', filterBy: 'status' })}
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardHeader}>
                <Icon source="bookmark-multiple" size={24} color="#6B7280" />
                <Text variant="headlineSmall" style={[styles.categoryValue, { color: '#6B7280' }]}>
                  {dashboardData.bookings.total}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                Total Bookings
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtitle}>
                All bookings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stock Overview Card */}
        <Card style={styles.stockCard}>
          <Card.Content style={styles.stockContent}>
            <View style={styles.stockHeader}>
              <Text variant="titleLarge" style={styles.stockTitle}>
                MotorSync Stock
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Stock')}
                style={styles.viewStockButton}
              >
                <Text variant="bodySmall" style={styles.viewStockText}>
                  View All
                </Text>
                <Icon source="chevron-right" size={16} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            
            <Text variant="displaySmall" style={styles.stockValue}>
              {dashboardData.stock.totalVehicles}
            </Text>
            <Text variant="bodyMedium" style={styles.stockLabel}>
              Total Vehicles in Stock
            </Text>
            
            <View style={styles.stockBreakdown}>
              <View style={styles.stockItem}>
                <View style={[styles.stockIndicator, { backgroundColor: '#10B981' }]} />
                <Text variant="bodySmall" style={styles.stockItemLabel}>
                  Available: {dashboardData.stock.availableVehicles}
                </Text>
              </View>
              <View style={styles.stockItem}>
                <View style={[styles.stockIndicator, { backgroundColor: '#F59E0B' }]} />
                <Text variant="bodySmall" style={styles.stockItemLabel}>
                  Reserved: {dashboardData.stock.reservedVehicles}
                </Text>
              </View>
              <View style={styles.stockItem}>
                <View style={[styles.stockIndicator, { backgroundColor: '#3B82F6' }]} />
                <Text variant="bodySmall" style={styles.stockItemLabel}>
                  Sold: {dashboardData.stock.soldVehicles}
                </Text>
              </View>
            </View>
            
            <View style={styles.stockValueSection}>
              <Text variant="bodyMedium" style={styles.stockValueLabel}>
                Total Stock Value
              </Text>
              <Text variant="titleLarge" style={styles.stockValueAmount}>
                {dashboardData.stock.totalValue}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Team Management Section - Only for Managers */}
        {canManageTeams && teamHierarchy && (
          <Card style={styles.teamCard}>
            <Card.Content>
              <View style={styles.teamHeader}>
                <Text variant="titleLarge" style={styles.teamTitle}>
                  My Team ({directReports.length})
                </Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => navigation.navigate('Team')}
                  style={styles.viewTeamButton}
                >
                  View All
                </Button>
              </View>
              
              <Text variant="bodyMedium" style={styles.teamSubtitle}>
                Team performance overview
              </Text>

              <View style={styles.teamMetrics}>
                <View style={styles.teamMetricItem}>
                  <Text variant="titleMedium" style={styles.teamMetricValue}>
                    {Math.round(teamHierarchy.teamPerformance.avgConversionRate)}%
                  </Text>
                  <Text variant="bodySmall" style={styles.teamMetricLabel}>
                    Avg Conversion
                  </Text>
                </View>
                
                <View style={styles.teamMetricItem}>
                  <Text variant="titleMedium" style={styles.teamMetricValue}>
                    {teamHierarchy.teamPerformance.totalEnquiries}
                  </Text>
                  <Text variant="bodySmall" style={styles.teamMetricLabel}>
                    Team Enquiries
                  </Text>
                </View>
                
                <View style={styles.teamMetricItem}>
                  <Text variant="titleMedium" style={styles.teamMetricValue}>
                    {teamHierarchy.teamPerformance.totalQuotations}
                  </Text>
                  <Text variant="bodySmall" style={styles.teamMetricLabel}>
                    Team Quotations
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Access Features */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Access
          </Text>
          
          <View style={styles.featureGrid}>
            {/* Quotations Card - Only for authorized roles */}
            {['general_manager', 'sales_manager', 'team_lead'].includes(userRole) && (
              <TouchableOpacity
                style={styles.featureCard}
                onPress={() => navigation.navigate('Quotations')}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIcon, { backgroundColor: '#1565C020' }]}>
                  <Icon source="file-document" size={28} color="#1565C0" />
                </View>
                <Text variant="titleMedium" style={styles.featureTitle}>
                  Quotations
                </Text>
                <Text variant="bodySmall" style={styles.featureSubtitle}>
                  {dashboardData.quotations.generated} generated • {dashboardData.quotations.pending} pending
                </Text>
              </TouchableOpacity>
            )}

            {/* Team Management - Only for managers */}
            {canManageTeams && (
              <TouchableOpacity
                style={styles.featureCard}
                onPress={() => navigation.navigate('Team')}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIcon, { backgroundColor: '#2E7D3220' }]}>
                  <Icon source="account-supervisor" size={28} color="#2E7D32" />
                </View>
                <Text variant="titleMedium" style={styles.featureTitle}>
                  My Team
                </Text>
                <Text variant="bodySmall" style={styles.featureSubtitle}>
                  {directReports.length} members • {teamHierarchy ? Math.round(teamHierarchy.teamPerformance.avgConversionRate) : 0}% avg conversion
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </View>

        {/* Recent Activity - Placeholder for future API integration */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          
          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.emptyStateContainer}>
                <Icon source="clock-outline" size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyLarge" style={styles.emptyStateText}>
                  No recent activity
                </Text>
                <Text variant="bodyMedium" style={styles.emptyStateSubtext}>
                  Activity will appear here as you work with enquiries and quotations
                </Text>
              </View>

              <Button
                mode="text"
                onPress={() => navigation.navigate('Notifications')}
                style={styles.viewAllButton}
              >
                View All Activity
              </Button>
            </Card.Content>
          </Card>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerSection: {
    marginBottom: spacing.xxl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  roleText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EFF6FF',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    borderLeftWidth: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: spacing.md,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryValue: {
    fontWeight: '900',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  categoryTitle: {
    color: '#1E293B',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  categorySubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  stockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: spacing.xl,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFF6FF',
  },
  stockContent: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stockTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 20,
  },
  viewStockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  viewStockText: {
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  stockValue: {
    color: '#3B82F6',
    fontWeight: '900',
    fontSize: 48,
    lineHeight: 54,
    marginBottom: spacing.xs,
    letterSpacing: -1.5,
  },
  stockLabel: {
    color: '#64748B',
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  stockBreakdown: {
    marginBottom: spacing.lg,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stockIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  stockItemLabel: {
    color: '#475569',
    fontWeight: '500',
  },
  stockValueSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stockValueLabel: {
    color: '#64748B',
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  stockValueAmount: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 24,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    color: '#0F172A',
    marginBottom: spacing.sm,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: '#64748B',
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  cardSpacer: {
    flex: 1,
    margin: spacing.xs,
  },
  actionsCard: {
    elevation: 2,
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  actionsTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  divider: {
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: spacing.xs,
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: spacing.xl,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F9FF',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  teamTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 18,
  },
  viewTeamButton: {
    borderRadius: 8,
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  teamSubtitle: {
    color: '#64748B',
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
  teamMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
  },
  teamMetricItem: {
    alignItems: 'center',
  },
  teamMetricValue: {
    color: '#3B82F6',
    fontWeight: '800',
    marginBottom: spacing.xs,
    fontSize: 24,
  },
  teamMetricLabel: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F9FF',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  featureSubtitle: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F9FF',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  activityContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  activityText: {
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  activityTime: {
    color: theme.colors.onSurfaceVariant,
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: spacing.sm,
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
  },
  errorTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  errorMessage: {
    marginBottom: spacing.lg,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.7,
  },
});
