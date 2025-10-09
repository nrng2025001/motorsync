/**
 * Enhanced Enquiries Screen with Modern UI
 * Displays enquiries organized by HOT, LOST, and BOOKED categories
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Text,
  FAB,
  Searchbar,
  ActivityIndicator,
  Chip,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, G, Ellipse, Circle } from 'react-native-svg';

import { EnquiryCard } from '../../components/EnquiryCard';
import * as EnquiryService from '../../services/enquiry.service';
import { Enquiry, EnquiryCategory, AutoBookingResponse } from '../../services/types';
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
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EFF6FF" stopOpacity="1" />
          <Stop offset="50%" stopColor="#DBEAFE" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.3" />
        </LinearGradient>
        <LinearGradient id="orb1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
        </LinearGradient>
        <LinearGradient id="orb2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#4F46E5" stopOpacity="0.04" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bgGradient)" />
      
      {/* Decorative floating orbs with gradients */}
      <G opacity="1">
        <Circle cx={width * 0.2} cy={height * 0.15} r="120" fill="url(#orb1)" />
        <Circle cx={width * 0.85} cy={height * 0.25} r="160" fill="url(#orb2)" />
        <Circle cx={width * 0.5} cy={height * 0.85} r="100" fill="url(#orb1)" />
        <Circle cx={width * 0.1} cy={height * 0.7} r="80" fill="url(#orb2)" />
      </G>
      
      {/* Decorative accent shapes */}
      <G opacity="0.06">
        <Rect x={width * 0.7} y={height * 0.5} width="60" height="60" rx="12" fill="#3B82F6" />
        <Rect x={width * 0.15} y={height * 0.4} width="40" height="40" rx="8" fill="#6366F1" />
      </G>
    </Svg>
  </View>
);

export function EnquiriesScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [selectedCategory, setSelectedCategory] = useState<EnquiryCategory>(EnquiryCategory.HOT);
  const [allEnquiries, setAllEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

  // Fetch all enquiries (not filtered by category)
  const fetchEnquiries = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Fetch all enquiries without category filter
      const response = await EnquiryService.getMyEnquiries(1, 100);
      setAllEnquiries(response.enquiries || []);
    } catch (error: any) {
      console.error('Error fetching enquiries:', error);
      setSnackbar({
        visible: true,
        message: error.message || 'Failed to load enquiries',
        type: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load and category change
  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEnquiries(false);
  }, [fetchEnquiries]);


  // Edit enquiry
  const handleEditEnquiry = (enquiry: Enquiry) => {
    navigation.navigate('EnquiryDetails', { enquiryId: enquiry.id });
  };

  // Convert enquiry to booking
  const handleConvertToBooking = async (enquiry: Enquiry) => {
    try {
      setLoading(true);
      
      // Show confirmation dialog
      Alert.alert(
        'Convert to Booking',
        `Are you sure you want to convert "${enquiry.customerName}"'s enquiry to a booking? This will check stock availability and create a booking if the vehicle is in stock.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Convert',
            style: 'default',
            onPress: async () => {
              try {
                const result: AutoBookingResponse = await EnquiryService.convertEnquiryToBooking(enquiry.id);
                
                // Show success message with booking details
                let message = `Enquiry converted to booking successfully!`;
                if (result.booking) {
                  message += `\n\nBooking ID: ${result.booking.id || 'N/A'}`;
                }
                if (result.stockValidation) {
                  message += `\n\nStock Status: ${result.stockValidation.inStock ? 'In Stock' : 'Out of Stock'}`;
                }
                
                Alert.alert('Success', message, [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Refresh enquiries to show updated category
                      fetchEnquiries();
                    },
                  },
                ]);
              } catch (error: any) {
                console.error('Error converting enquiry to booking:', error);
                Alert.alert(
                  'Conversion Failed',
                  error.message || 'Failed to convert enquiry to booking. Please try again.'
                );
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error in convert to booking:', error);
      Alert.alert(
        'Error',
        'An error occurred while processing the conversion. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get enquiries for selected category
  const enquiries = allEnquiries.filter(e => e.category === selectedCategory);

  // Filter enquiries by search query
  const filteredEnquiries = enquiries.filter((enquiry) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      enquiry.customerName.toLowerCase().includes(query) ||
      enquiry.customerContact.includes(query) ||
      enquiry.model.toLowerCase().includes(query) ||
      enquiry.variant?.toLowerCase().includes(query)
    );
  });

  // Category stats (calculated from all enquiries)
  const getCategoryStats = () => {
    return {
      [EnquiryCategory.HOT]: allEnquiries.filter(e => e.category === EnquiryCategory.HOT).length,
      [EnquiryCategory.LOST]: allEnquiries.filter(e => e.category === EnquiryCategory.LOST).length,
      [EnquiryCategory.BOOKED]: allEnquiries.filter(e => e.category === EnquiryCategory.BOOKED).length,
    };
  };

  const renderCategoryTab = (category: EnquiryCategory, icon: string, label: string) => {
    const isSelected = selectedCategory === category;
    
    const colors = {
      [EnquiryCategory.HOT]: { primary: '#F97316', light: '#FED7AA', bg: '#FFF7ED' },
      [EnquiryCategory.LOST]: { primary: '#64748B', light: '#CBD5E1', bg: '#F8FAFC' },
      [EnquiryCategory.BOOKED]: { primary: '#10B981', light: '#86EFAC', bg: '#F0FDF4' },
    };

    const colorScheme = colors[category] || { primary: '#3B82F6', light: '#93C5FD', bg: '#EFF6FF' };

    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryTab,
          isSelected && { 
            backgroundColor: colorScheme.primary,
            borderWidth: 2,
            borderColor: colorScheme.primary,
          },
          !isSelected && {
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#E2E8F0',
          }
        ]}
        onPress={() => setSelectedCategory(category)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryTabContent}>
          <Text style={[styles.categoryTabIcon, { 
            color: isSelected ? '#FFFFFF' : '#64748B',
            opacity: isSelected ? 1 : 0.6,
          }]}>
            {icon}
          </Text>
          <Text style={[
            styles.categoryTabLabel,
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
      switch (selectedCategory) {
        case EnquiryCategory.HOT:
          return {
            icon: '🔥',
            title: 'No Hot Enquiries',
            message: 'Start by creating a new enquiry to track potential customers',
            color: '#F97316'
          };
        case EnquiryCategory.LOST:
          return {
            icon: '📉',
            title: 'No Lost Enquiries',
            message: 'Lost enquiries will appear here when marked',
            color: '#64748B'
          };
        case EnquiryCategory.BOOKED:
          return {
            icon: '🎉',
            title: 'No Booked Enquiries',
            message: 'Successfully converted bookings will appear here',
            color: '#10B981'
          };
        default:
          return {
            icon: '📋',
            title: 'No Enquiries',
            message: 'Create your first enquiry to get started',
            color: '#3B82F6'
          };
      }
    };

    const content = getEmptyStateContent();

    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIconContainer, { backgroundColor: content.color + '15' }]}>
          <Text style={styles.emptyIcon}>{content.icon}</Text>
        </View>
        <Text variant="headlineMedium" style={styles.emptyTitle}>
          {content.title}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyMessage}>
          {content.message}
        </Text>
        <TouchableOpacity 
          style={[styles.emptyActionButton, { backgroundColor: content.color }]}
          onPress={() => navigation.navigate('NewEnquiry')}
        >
          <Text style={styles.emptyActionText}>+ Create Enquiry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatsBar = () => {
    const stats = getCategoryStats();
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    
    return (
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F97316' }]}>
            {stats[EnquiryCategory.HOT]}
          </Text>
          <Text style={styles.statLabel}>Hot</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {stats[EnquiryCategory.BOOKED]}
          </Text>
          <Text style={styles.statLabel}>Booked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#64748B' }]}>
            {stats[EnquiryCategory.LOST]}
          </Text>
          <Text style={styles.statLabel}>Lost</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Gradient Background */}
      <ExpoLinearGradient
        colors={['#FFFFFF', '#F0F9FF', '#E0F2FE']}
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
                Enquiries
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Manage your sales pipeline
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📊</Text>
            </View>
          </View>
          
          {/* Stats Bar */}
          {renderStatsBar()}
        </View>

        {/* Enhanced Search Bar and Category Tabs */}
        <View style={styles.searchAndTabsContainer}>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search by name, contact, model..."
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
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {renderCategoryTab(EnquiryCategory.HOT, '', 'Hot')}
            {renderCategoryTab(EnquiryCategory.BOOKED, '', 'Booked')}
            {renderCategoryTab(EnquiryCategory.LOST, '', 'Lost')}
          </ScrollView>
        </View>

        {/* Enquiries List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text variant="bodyLarge" style={styles.loadingText}>
              Loading enquiries...
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
            {filteredEnquiries.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <View style={styles.listHeader}>
                  <Text style={styles.sectionTitle}>
                    {filteredEnquiries.length} {filteredEnquiries.length === 1 ? 'Enquiry' : 'Enquiries'}
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
                {filteredEnquiries.map((enquiry, index) => (
                  <Animated.View
                    key={enquiry.id}
                    style={[
                      styles.cardWrapper,
                      { opacity: 1, transform: [{ translateY: 0 }] }
                    ]}
                  >
                    <EnquiryCard
                      enquiry={enquiry}
                      onPress={() => handleEditEnquiry(enquiry)}
                      onEdit={() => handleEditEnquiry(enquiry)}
                      onConvertToBooking={
                        selectedCategory === EnquiryCategory.HOT
                          ? () => handleConvertToBooking(enquiry)
                          : undefined
                      }
                      showActions={true}
                    />
                  </Animated.View>
                ))}
              </>
            )}
          </ScrollView>
        )}

        {/* Enhanced FAB */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('NewEnquiry')}
          label="New Enquiry"
          color="#FFFFFF"
        />

        {/* Enhanced Snackbar */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3000}
          style={[
            styles.snackbar,
            snackbar.type === 'success' && styles.snackbarSuccess,
            snackbar.type === 'error' && styles.snackbarError,
          ]}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbar({ ...snackbar, visible: false }),
            textColor: '#FFFFFF',
          }}
        >
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
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
  categoryTabs: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  categoryTabsContent: {
    paddingHorizontal: 0,
    gap: 8,
  },
  categoryTab: {
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
  categoryTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryTabIcon: {
    fontSize: 18,
  },
  categoryTabLabel: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.3,
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
    elevation: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  searchInput: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#64748B',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  searchChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  searchChipText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 13,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  emptyMessage: {
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 32,
  },
  emptyActionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  snackbar: {
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  snackbarSuccess: {
    backgroundColor: '#10B981',
  },
  snackbarError: {
    backgroundColor: '#EF4444',
  },
  snackbarText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});