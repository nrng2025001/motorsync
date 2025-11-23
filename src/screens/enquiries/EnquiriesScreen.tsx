/**
 * Enhanced Enquiries Screen with Modern UI
 * Displays enquiries organized by HOT, LOST, and BOOKED categories
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Menu,
  Button,
  Card,
  Divider,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, G, Ellipse, Circle } from 'react-native-svg';

import { EnquiryCard } from '../../components/EnquiryCard';
import { DownloadButton } from '../../components/DownloadButton';
import { UploadButton } from '../../components/UploadButton';
import * as EnquiryService from '../../services/enquiry.service';
import { enquiryAPI } from '../../api/enquiries';
import { Enquiry, EnquiryCategory, EnquiryStatus, EnquirySource, AutoBookingResponse } from '../../services/types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { theme, spacing, shadows, borderRadius } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';
import { useDealership } from '../../context/DealershipContext';
import { getDataFilterOptions, canSeeUserData, getRoleDisplayNameWithHierarchy, filterEnquiriesByHierarchy } from '../../utils/hierarchyUtils';

const { width, height } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<MainStackParamList>;

const isLikelyUuid = (id?: string | null) =>
  !!id &&
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

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
  const route = useRoute<any>();
  const { state: authState } = useAuth();
  const { dealership } = useDealership();

  // Get user role and permissions - will throw error if role is missing
  const userRole = getUserRole(authState.user);
  const currentUserId = (authState.user as any)?.user?.firebaseUid || authState.user?.firebaseUid;
  
  // Get hierarchical data access permissions
  const dataFilterOptions = getDataFilterOptions(userRole);

  // State
  const [selectedCategory, setSelectedCategory] = useState<EnquiryCategory | 'ALL'>(EnquiryCategory.HOT);
  const [selectedStatus, setSelectedStatus] = useState<EnquiryStatus | 'ALL'>('ALL');
  const [allEnquiries, setAllEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });
  const [pendingFilterIds, setPendingFilterIds] = useState<string[] | null>(null);
  
  // Filter and menu states
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'customerName' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const pendingIdsSet = useMemo(() => {
    return pendingFilterIds ? new Set(pendingFilterIds) : null;
  }, [pendingFilterIds]);

  const pendingFilterActive = !!(pendingIdsSet && pendingIdsSet.size > 0);

  const resolvedDealershipId = React.useMemo(() => {
    return (
      dealership?.id ||
      authState.user?.dealership?.id ||
      authState.user?.dealershipId ||
      null
    );
  }, [
    dealership?.id,
    authState.user?.dealership?.id,
    authState.user?.dealershipId,
  ]);

  const resolvedDealershipCode = React.useMemo(() => {
    const userDealership = authState.user?.dealership as any;
    return (
      dealership?.code ||
      userDealership?.code ||
      (authState.user as any)?.dealershipCode ||
      null
    );
  }, [dealership?.code, authState.user?.dealership, authState.user]);

  // Role-based permission functions
  const canCreateEnquiry = () => {
    // Only Customer Advisors can create enquiries
    // Team Leads, Sales Managers, and General Managers can only view and manage enquiries
    return userRole === 'CUSTOMER_ADVISOR';
  };

  const canEditEnquiry = (enquiry: Enquiry) => {
    // Only Customer Advisors can edit enquiries
    // Team Leads, Sales Managers, and General Managers can only view enquiries
    if (userRole === 'CUSTOMER_ADVISOR') {
      return enquiry.createdByUserId === currentUserId || enquiry.assignedToUserId === currentUserId;
    }
    // Higher roles can only view, not edit
    return false;
  };

  const canDeleteEnquiry = () => {
    // Only Customer Advisors can delete their own enquiries
    // Higher roles can only view, not delete
    return userRole === 'CUSTOMER_ADVISOR';
  };

  const canAssignEnquiry = () => {
    // Only Customer Advisors can assign enquiries
    // Higher roles can only view, not assign
    return userRole === 'CUSTOMER_ADVISOR';
  };

  const canConvertToBooking = (enquiry: Enquiry) => {
    // Only Customer Advisors can convert enquiries to bookings
    // Higher roles can only view, not convert
    if (userRole === 'CUSTOMER_ADVISOR') {
      return enquiry.createdByUserId === currentUserId || enquiry.assignedToUserId === currentUserId;
    }
    return false;
  };

  const canSeeEnquiry = (enquiry: Enquiry) => {
    // Can see own enquiries
    if (enquiry.createdByUserId === currentUserId || enquiry.assignedToUserId === currentUserId) {
      return true;
    }
    
    // Higher roles can see team enquiries
    if (dataFilterOptions.canSeeAll) {
      return true;
    }
    
    if (dataFilterOptions.canSeeTeam) {
      // TODO: Implement team hierarchy check when backend provides team structure
      // For now, show all enquiries for team roles
      return true;
    }
    
    return false;
  };

  // Enhanced filtering and sorting with hierarchical data access
  const getFilteredEnquiries = () => {
    let filtered = [...allEnquiries];

    // Apply hierarchical data access filter first
    filtered = filtered.filter(enquiry => canSeeEnquiry(enquiry));

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(enquiry => 
        enquiry.customerName.toLowerCase().includes(query) ||
        enquiry.customerContact.includes(query) ||
        (enquiry.customerEmail && enquiry.customerEmail.toLowerCase().includes(query)) ||
        enquiry.model.toLowerCase().includes(query) ||
        (enquiry.variant && enquiry.variant.toLowerCase().includes(query)) ||
        (enquiry.location && enquiry.location.toLowerCase().includes(query)) ||
        (enquiry.source && enquiry.source.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(enquiry => enquiry.status === selectedStatus);
    }

    if (pendingIdsSet && pendingIdsSet.size > 0) {
      filtered = filtered.filter((enquiry) => pendingIdsSet.has(enquiry.id));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'customerName':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Fetch all enquiries (not filtered by category)
  const fetchEnquiries = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // ✅ Allow both UUID and non-UUID dealership IDs (e.g., "default-dealership-001")
      if (!resolvedDealershipId || !resolvedDealershipCode) {
        console.warn(
          '[EnquiriesScreen] Missing dealership context, skipping fetch until available',
          { resolvedDealershipId, resolvedDealershipCode }
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Phase 2: Fetch enquiries - Auto-hide Booked/Lost by default (show only HOT/OPEN)
      console.log('🔄 [EnquiriesScreen] Fetching enquiries...');
      // Handle both possible structures: flat and nested
      const userData = (authState.user as any)?.user || authState.user;
      console.log('🔍 [EnquiriesScreen] Current user ID:', userData?.firebaseUid);
      const requestParams: any = {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        dealershipId: resolvedDealershipId,
        dealershipCode: resolvedDealershipCode,
      };
      requestParams.scope =
        userRole === 'CUSTOMER_ADVISOR'
          ? 'advisor'
          : dataFilterOptions.canSeeTeam
          ? 'team'
          : 'dealership';

      // Phase 2: Default to HOT/OPEN if no category/status selected
      if (selectedCategory === 'ALL' && selectedStatus === 'ALL') {
        requestParams.category = EnquiryCategory.HOT;
        requestParams.status = EnquiryStatus.OPEN;
      } else {
        if (selectedCategory !== 'ALL') {
          requestParams.category = selectedCategory;
        }
        if (selectedStatus !== 'ALL') {
          requestParams.status = selectedStatus;
        }
      }

      const response = await enquiryAPI.getEnquiries(requestParams);
      console.log('📊 [EnquiriesScreen] Response received:', response);
      console.log('📊 [EnquiriesScreen] Response.data:', response?.data);
      console.log('📊 [EnquiriesScreen] Response.data.enquiries:', (response?.data as any)?.enquiries);
      console.log('📊 [EnquiriesScreen] Response.data.data:', (response?.data as any)?.data);
      
      // Extract data from responses - handle nested data structure (same as dashboard)
      const allEnquiriesFromBackend = (response?.data as any)?.enquiries || (response?.data as any)?.data?.enquiries || [];
      
      console.log('📊 [EnquiriesScreen] Enquiries array:', allEnquiriesFromBackend);
      console.log('📊 [EnquiriesScreen] Enquiries count:', allEnquiriesFromBackend.length);
      console.log('📊 [EnquiriesScreen] First enquiry (if any):', allEnquiriesFromBackend[0]);
      
      // Filter enquiries by current user
      const currentUserId = userData?.firebaseUid;
      console.log('🔍 [EnquiriesScreen] Current user ID for filtering:', currentUserId);
      
      console.log('📊 [EnquiriesScreen] All enquiries from backend:', allEnquiriesFromBackend.length);
      
      // Debug: Check if we have enquiries
      if (allEnquiriesFromBackend.length > 0) {
        console.log('🔍 [EnquiriesScreen] Sample enquiry from backend:', allEnquiriesFromBackend[0]);
        console.log('🔍 [EnquiriesScreen] Current user ID:', currentUserId);
        console.log('🔍 [EnquiriesScreen] Sample enquiry createdByUserId:', allEnquiriesFromBackend[0].createdByUserId);
        console.log('🔍 [EnquiriesScreen] Sample enquiry assignedToUserId:', allEnquiriesFromBackend[0].assignedToUserId);
      } else {
        console.log('⚠️ [EnquiriesScreen] No enquiries returned from backend');
      }
      
      // Apply hierarchical filtering for managers
      let filteredEnquiries = allEnquiriesFromBackend;
      
      if (['TEAM_LEAD', 'SALES_MANAGER', 'GENERAL_MANAGER'].includes(userRole)) {
        // Filter enquiries based on hierarchy
        const currentUserId = userData?.firebaseUid;
        if (currentUserId) {
          filteredEnquiries = filterEnquiriesByHierarchy(allEnquiriesFromBackend, userRole, currentUserId, []);
        }
        console.log('🔍 [EnquiriesScreen] Applied hierarchical filtering:', {
          originalCount: allEnquiriesFromBackend.length,
          filteredCount: filteredEnquiries.length,
          userRole
        });
      }
      
      setAllEnquiries(filteredEnquiries);
      console.log('✅ [EnquiriesScreen] User enquiries set in state');
      
      // Debug: Show all enquiries by category
      const categoryBreakdown = allEnquiriesFromBackend.reduce((acc: Record<string, number>, enquiry: any) => {
        acc[enquiry.category] = (acc[enquiry.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 [EnquiriesScreen] All enquiries by category:', categoryBreakdown);
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
      if (!resolvedDealershipId || !resolvedDealershipCode) {
        setLoading(false);
      }
    }
  }, [
    authState.user,
    dataFilterOptions.canSeeTeam,
    resolvedDealershipCode,
    resolvedDealershipId,
    selectedCategory,
    selectedStatus,
    userRole,
  ]);

  useEffect(() => {
    if (route.params?.pendingIds) {
      const idsParam = route.params.pendingIds;
      const ids = Array.isArray(idsParam) ? idsParam : [idsParam];
      const cleanedIds = ids.filter(Boolean);
      if (cleanedIds.length > 0) {
        setPendingFilterIds(cleanedIds);
        setSelectedCategory('ALL');
        setSelectedStatus('ALL');
        setSearchQuery('');
      }
      navigation.setParams({ pendingIds: undefined });
    }
  }, [route.params?.pendingIds, navigation]);

  useEffect(() => {
    if (route.params?.initialCategory) {
      const categoryParam = route.params.initialCategory;
      if (categoryParam === 'ALL' || Object.values(EnquiryCategory).includes(categoryParam)) {
        setSelectedCategory(categoryParam);
      }
      navigation.setParams({ initialCategory: undefined });
    }
  }, [route.params?.initialCategory, navigation]);

  // Initial load and category change
  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Refresh enquiries when screen comes into focus (e.g., returning from NewEnquiryScreen)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 [EnquiriesScreen] Screen focused, refreshing enquiries...');
      fetchEnquiries(false); // Don't show loading spinner on focus
    }, [fetchEnquiries])
  );

  // Debug user role
  useEffect(() => {
    console.log('📊 Current user role:', authState.user?.role?.name);
    console.log('📊 FAB should be visible:', !!authState.user?.role);
  }, [authState.user?.role]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEnquiries(false);
  }, [fetchEnquiries]);

  // Status update functions
  const handleUpdateStatus = async (enquiryId: string, newStatus: EnquiryStatus) => {
    try {
      await enquiryAPI.updateStatus(enquiryId, newStatus);
      setSnackbar({
        visible: true,
        message: `Enquiry status updated to ${newStatus}`,
        type: 'success',
      });
      fetchEnquiries(false);
    } catch (error: any) {
      setSnackbar({
        visible: true,
        message: error.message || 'Failed to update status',
        type: 'error',
      });
    }
  };

  const handleUpdateCategory = async (enquiryId: string, newCategory: EnquiryCategory) => {
    try {
      await enquiryAPI.updateCategory(enquiryId, newCategory);
      setSnackbar({
        visible: true,
        message: `Enquiry category updated to ${newCategory}`,
        type: 'success',
      });
      fetchEnquiries(false);
    } catch (error: any) {
      setSnackbar({
        visible: true,
        message: error.message || 'Failed to update category',
        type: 'error',
      });
    }
  };

  const handleDeleteEnquiry = async (enquiryId: string) => {
    Alert.alert(
      'Delete Enquiry',
      'Are you sure you want to delete this enquiry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await enquiryAPI.deleteEnquiry(enquiryId);
              setSnackbar({
                visible: true,
                message: 'Enquiry deleted successfully',
                type: 'success',
              });
              fetchEnquiries(false);
            } catch (error: any) {
              setSnackbar({
                visible: true,
                message: error.message || 'Failed to delete enquiry',
                type: 'error',
              });
            }
          },
        },
      ]
    );
  };


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

  const clearPendingFilter = useCallback(() => {
    setPendingFilterIds(null);
  }, []);

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
        {authState.user?.role && (
          <TouchableOpacity 
            style={[styles.emptyActionButton, { backgroundColor: content.color }]}
            onPress={() => navigation.navigate('NewEnquiry')}
          >
            <Text style={styles.emptyActionText}>+ Create Enquiry</Text>
          </TouchableOpacity>
        )}
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
              <Text variant="headlineLarge" style={styles.overviewTitle}>
                Hot Enquiry Overview
              </Text>
              <Text variant="bodyMedium" style={styles.overviewSubtitle}>
                TRACK & MANAGE YOUR ENQUIRY
              </Text>
              {/* Phase 2: Header format - Employee name, Dealership name, Employee code */}
              <View style={styles.userMeta}>
                <Text style={styles.userMetaText}>
                  {authState.user?.name || 'Employee'}, {authState.user?.dealership?.name || 'Dealership'}, {authState.user?.employeeId || 'Code: —'}
                </Text>
              </View>
            </View>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📊</Text>
            </View>
          </View>
          
          {/* Download & Upload Buttons */}
          <View style={styles.downloadContainer}>
            <DownloadButton 
              type="enquiries" 
              onDownloadStart={() => console.log('Download started')}
              onDownloadComplete={(result) => console.log('Download completed', result)}
              style={styles.downloadButton}
            />
            {/* Upload Button - Admin Only */}
            {userRole === 'ADMIN' && (
              <UploadButton
                type="enquiries"
                onUploadStart={() => {
                  console.log('Upload started');
                }}
                onUploadComplete={(result) => {
                  console.log('Upload completed', result);
                  // Refresh enquiries after successful upload
                  fetchEnquiries(true);
                  Alert.alert(
                    'Upload Successful',
                    `Successfully uploaded ${result?.successfulRows || 0} enquiries.`,
                    [{ text: 'OK' }]
                  );
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                }}
                style={styles.uploadButton}
              />
            )}
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
            {getFilteredEnquiries().length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <View style={styles.listHeader}>
                  <Text style={styles.sectionTitle}>
                    {getFilteredEnquiries().length} {getFilteredEnquiries().length === 1 ? 'Enquiry' : 'Enquiries'}
                  </Text>
                  <View style={styles.listHeaderChips}>
                    {pendingFilterActive && (
                      <Chip
                        mode="flat"
                        icon="alert-circle"
                        onClose={clearPendingFilter}
                        style={styles.pendingFilterChip}
                        textStyle={styles.pendingFilterChipText}
                      >
                        Pending Updates
                      </Chip>
                    )}
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
                </View>
                {getFilteredEnquiries().map((enquiry, index) => (
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
                      onEdit={canEditEnquiry(enquiry) ? () => handleEditEnquiry(enquiry) : undefined}
                      onConvertToBooking={
                        canConvertToBooking(enquiry) && selectedCategory === EnquiryCategory.HOT
                          ? () => handleConvertToBooking(enquiry)
                          : undefined
                      }
                      showActions={canEditEnquiry(enquiry) || canConvertToBooking(enquiry)}
                      showCreatorInfo={dataFilterOptions.canSeeTeam || dataFilterOptions.canSeeAll}
                      userRole={userRole}
                    />
                  </Animated.View>
                ))}
              </>
            )}
          </ScrollView>
        )}

        {/* Enhanced FAB - Available for all roles */}
        {canCreateEnquiry() && (
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => {
              console.log('🎯 FAB pressed, navigating to NewEnquiry');
              navigation.navigate('NewEnquiry');
            }}
            label="New Enquiry"
            color="#FFFFFF"
          />
        )}
        

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
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  headerIconText: {
    fontSize: 24,
  },
  overviewTitle: {
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 34,
    textTransform: 'capitalize',
  },
  overviewSubtitle: {
    color: '#3B82F6',
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  userMeta: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  userMetaPrimary: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  userMetaSecondary: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.small,
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
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 16,
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
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.small,
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
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    ...shadows.small,
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
  listHeaderChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  pendingFilterChip: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  pendingFilterChipText: {
    color: '#EA580C',
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
    paddingVertical: spacing.xxxl * 1.25,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  emptyMessage: {
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyActionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: borderRadius.round,
    backgroundColor: '#3B82F6',
    ...shadows.large,
  },
  snackbar: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
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
  // Enhanced Filter Controls Styles
  filterControls: {
    marginTop: 12,
    marginBottom: 8,
  },
  filterScrollView: {
    maxHeight: 50,
  },
  filterScrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  filterButton: {
    marginRight: 8,
    borderRadius: 20,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  filterButtonContent: {
    height: 36,
    paddingHorizontal: 12,
  },
  clearFiltersButton: {
    marginLeft: 8,
    borderRadius: 20,
  },
  downloadContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  uploadButton: {
    flex: 1,
  },
});