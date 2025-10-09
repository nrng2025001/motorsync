import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  Icon,
  Chip,
  ActivityIndicator,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, spacing } from '../../utils/theme';
import { EnquiriesAPI, type Enquiry, type EnquiryStatus } from '../../api';
import { useAuth } from '../../context/AuthContext';

// Define EnquiryCategory type locally since it might not be exported from api index
type EnquiryCategory = 'HOT' | 'LOST' | 'BOOKED';


/**
 * Get category from status for grouping (legacy function - now using enquiry.category directly)
 */
function getCategoryFromStatus(status: EnquiryStatus): EnquiryCategory {
  switch (status) {
    case 'OPEN':
    case 'IN_PROGRESS':
      return 'HOT';
    case 'CLOSED':
      return 'BOOKED'; // CLOSED enquiries are successfully booked
    default:
      return 'HOT';
  }
}

/**
 * Get category color scheme
 */
function getCategoryColor(category: EnquiryCategory): { 
  primary: string; 
  light: string; 
  icon: string; 
  emoji: string;
  description: string;
} {
  switch (category) {
    case 'HOT':
      return { 
        primary: '#FF6B6B', 
        light: '#FFE5E5', 
        icon: 'fire', 
        emoji: '🔥',
        description: 'High priority leads'
      };
    case 'LOST':
      return { 
        primary: '#95A5A6', 
        light: '#E8E8E8', 
        icon: 'close-circle', 
        emoji: '❌',
        description: 'Lost opportunities'
      };
    case 'BOOKED':
      return { 
        primary: '#2ECC71', 
        light: '#E8F8F0', 
        icon: 'check-circle', 
        emoji: '✅',
        description: 'Successfully converted'
      };
    default:
      return { 
        primary: '#FF6B6B', 
        light: '#FFE5E5', 
        icon: 'fire', 
        emoji: '🔥',
        description: 'High priority leads'
      };
  }
}

/**
 * Get status badge info
 */
function getStatusBadge(status: EnquiryStatus): { label: string; color: string } {
  switch (status) {
    case 'OPEN':
      return { label: 'Open', color: '#EF4444' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', color: '#3B82F6' };
    case 'CLOSED':
      return { label: 'Closed', color: '#6B7280' };
    default:
      return { label: status, color: '#6B7280' };
  }
}

/**
 * Category Picker Component
 */
const CategoryPicker = ({ 
  currentCategory, 
  onCategoryChange,
  disabled = false
}: {
  currentCategory: EnquiryCategory;
  onCategoryChange: (category: EnquiryCategory, remarks?: string) => void;
  disabled?: boolean;
}) => {
  const [showRemarksInput, setShowRemarksInput] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EnquiryCategory | null>(null);

  const categories: Array<{
    value: EnquiryCategory;
    label: string;
    emoji: string;
    color: string;
    bgColor: string;
  }> = [
    { 
      value: 'HOT', 
      label: 'Hot Lead', 
      emoji: '🔥',
      color: '#FF6B6B',
      bgColor: '#FFE5E5'
    },
    { 
      value: 'LOST', 
      label: 'Lost', 
      emoji: '❌',
      color: '#95A5A6',
      bgColor: '#E8E8E8'
    },
    { 
      value: 'BOOKED', 
      label: 'Booked', 
      emoji: '✅',
      color: '#2ECC71',
      bgColor: '#E8F8F0'
    }
  ];

  const handleCategorySelect = (category: EnquiryCategory) => {
    if (category === 'LOST' || category === 'BOOKED') {
      setSelectedCategory(category);
      setShowRemarksInput(true);
    } else {
      onCategoryChange(category);
    }
  };

  const handleConfirmRemarks = () => {
    if (selectedCategory) {
      onCategoryChange(selectedCategory, remarks);
      setShowRemarksInput(false);
      setRemarks('');
      setSelectedCategory(null);
    }
  };

  return (
    <View style={styles.categoryPickerContainer}>
      <Text style={styles.categoryPickerLabel}>Enquiry Category:</Text>
      <View style={styles.categoriesRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.value}
            disabled={disabled}
            onPress={() => handleCategorySelect(cat.value)}
            style={[
              styles.categoryButton,
              {
                backgroundColor: currentCategory === cat.value 
                  ? cat.color 
                  : cat.bgColor,
                opacity: disabled ? 0.5 : 1
              }
            ]}
          >
            <Text style={[
              styles.categoryButtonText,
              { color: currentCategory === cat.value ? '#fff' : cat.color }
            ]}>
              {cat.emoji} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Remarks Input Modal */}
      {showRemarksInput && (
        <View style={styles.remarksInputContainer}>
          <Card style={styles.remarksCard}>
            <Card.Content>
              <Text style={styles.remarksTitle}>
                Why is this enquiry being marked as {selectedCategory}?
              </Text>
              <View style={styles.remarksInput}>
                <TextInput
                  mode="outlined"
                  placeholder="Add remarks..."
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  numberOfLines={3}
                  style={styles.remarksTextInput}
                />
              </View>
              <View style={styles.remarksActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowRemarksInput(false);
                    setRemarks('');
                    setSelectedCategory(null);
                  }}
                  style={styles.remarksCancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirmRemarks}
                  style={styles.remarksConfirmButton}
                  disabled={!remarks.trim()}
                >
                  Confirm
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};

/**
 * Enquiry Details Screen Component
 * Shows comprehensive enquiry information and allows actions
 */
export function EnquiryDetailsScreen({ route, navigation }: any): React.JSX.Element {
  const { state: authState } = useAuth();
  const enquiryId = route?.params?.enquiryId;
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  console.log('🔍 EnquiryDetailsScreen mounted with route params:', route?.params);
  console.log('🔍 Enquiry ID from route:', enquiryId);
  console.log('🔍 Auth state:', authState);

  /**
   * Handle category change
   */
  const handleCategoryChange = async (newCategory: EnquiryCategory, remarks?: string) => {
    if (!enquiry) return;
    
    setUpdating(true);
    try {
      await EnquiriesAPI.updateCategory(enquiry.id, newCategory, remarks);
      
      // Update local state
      setEnquiry(prev => prev ? { ...prev, category: newCategory } : null);
      
      Alert.alert(
        'Success', 
        `Enquiry marked as ${newCategory} successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error updating category:', error);
      Alert.alert(
        'Error', 
        `Failed to update category: ${error.message || 'Please try again.'}`
      );
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Fetch enquiry details
   */
  useEffect(() => {
    const fetchEnquiry = async () => {
      console.log('🔍 Fetching enquiry with ID:', enquiryId);
      console.log('🔍 User authenticated:', authState.isAuthenticated);
      console.log('🔍 User:', authState.user);
      
      if (!enquiryId) {
        console.error('❌ No enquiry ID provided');
        setError('No enquiry ID provided');
        setLoading(false);
        return;
      }

      if (!authState.isAuthenticated) {
        console.error('❌ User not authenticated');
        setError('Please log in to view enquiry details');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🚀 Calling EnquiriesAPI.getEnquiry...');
        const response = await EnquiriesAPI.getEnquiry(enquiryId);
        
        console.log('📦 Raw API response:', response);
        
        // Handle response - it might be wrapped in a data property or enquiry property
        let enquiryData = (response as any).data || response;
        
        // Check if the data is nested in an 'enquiry' property
        if (enquiryData && enquiryData.enquiry) {
          enquiryData = enquiryData.enquiry;
        }
        
        console.log('📋 Processed enquiry data:', enquiryData);
        
        if (!enquiryData || !enquiryData.id) {
          console.error('❌ Invalid enquiry data received:', enquiryData);
          setError('Invalid enquiry data received');
          return;
        }
        
        setEnquiry(enquiryData);
        setError(null);
        console.log('✅ Enquiry data set successfully');
      } catch (err: any) {
        console.error('❌ Error fetching enquiry:', err);
        setError(err.message || 'Failed to load enquiry details');
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, [enquiryId, authState.isAuthenticated]);

  /**
   * Handle status update
   */
  const handleUpdateStatus = () => {
    Alert.alert(
      'Update Status',
      'Choose new status for this enquiry',
      [
        { text: 'Open', onPress: () => updateStatus('Open') },
        { text: 'In Progress', onPress: () => updateStatus('In Progress') },
        { text: 'Quoted', onPress: () => updateStatus('Quoted') },
        { text: 'Closed', onPress: () => updateStatus('Closed') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  /**
   * Update enquiry status
   */
  const updateStatus = (newStatus: string) => {
    Alert.alert('Status Updated', `Enquiry status updated to: ${newStatus}`);
  };

  /**
   * Handle add note
   */
  const handleAddNote = () => {
    Alert.alert('Add Note', 'This would open a form to add notes to the enquiry');
  };

  /**
   * Handle assign to staff
   */
  const handleAssignToStaff = () => {
    Alert.alert('Assign to Staff', 'This would open a staff selection screen');
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#EF4444';
      case 'IN_PROGRESS': return '#3B82F6';
      case 'CLOSED': return '#6B7280';
      default: return theme.colors.outline;
    }
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
            Enquiry Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading enquiry details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !enquiry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Enquiry Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={48} color={theme.colors.error} />
          <Text variant="titleMedium" style={styles.errorText}>
            {error || 'Enquiry not found'}
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const categoryColors = getCategoryColor(enquiry.category);
  const statusBadge = getStatusBadge(enquiry.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          Enquiry Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Banner */}
        <View style={[styles.categoryBanner, { backgroundColor: categoryColors.light }]}>
          <Icon source={categoryColors.icon} size={32} color={categoryColors.primary} />
          <View style={styles.categoryBannerContent}>
            <Text variant="titleLarge" style={[styles.categoryTitle, { color: categoryColors.primary }]}>
              {enquiry.category} Enquiry
            </Text>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusBadge.color + '20' }]}
              textStyle={[styles.statusChipText, { color: statusBadge.color }]}
              compact
            >
              {statusBadge.label}
            </Chip>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Customer Information
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="account" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Customer Name
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {enquiry.customerName || 'Not provided'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="email" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Email
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {enquiry.customerEmail || 'Not provided'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="phone" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Phone
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {enquiry.customerContact || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle of Interest */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Vehicle of Interest
          </Text>

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon source="car" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Vehicle Model
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {enquiry.model || 'Not specified'}
                </Text>
              </View>
            </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="information" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Source
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {enquiry.source || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Management */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Category Management
          </Text>
          
          <CategoryPicker
            currentCategory={enquiry.category}
            onCategoryChange={handleCategoryChange}
            disabled={updating}
          />
        </View>

        {/* Enquiry Status */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Enquiry Status
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="clock" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Status
              </Text>
              <Text variant="bodyLarge" style={[styles.infoValue, { color: getStatusColor(enquiry.status) }]}>
                {enquiry.status}
              </Text>
            </View>
          </View>
        </View>


        {/* Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Actions
          </Text>

          <Button
            mode="contained"
            onPress={handleUpdateStatus}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Update Status
          </Button>

          <Button
            mode="outlined"
            onPress={handleAddNote}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Add Note
          </Button>

          <Button
            mode="outlined"
            onPress={handleAssignToStaff}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Assign to Staff
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  headerTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  infoValue: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  communicationItem: {
    marginBottom: spacing.sm,
  },
  communicationType: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  communicationTimestamp: {
    color: theme.colors.primary,
    marginBottom: spacing.xs,
  },
  communicationDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  communicationDetails: {
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  actionButton: {
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm,
  },
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  categoryBannerContent: {
    flex: 1,
    gap: spacing.xs,
  },
  categoryTitle: {
    fontWeight: '700',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
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
  // Category Picker Styles
  categoryPickerContainer: {
    marginTop: spacing.md,
  },
  categoryPickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  categoryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  remarksInputContainer: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  remarksCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
  },
  remarksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  remarksTextInput: {
    minHeight: 80,
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlignVertical: 'top',
  },
  remarksActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  remarksCancelButton: {
    flex: 1,
  },
  remarksConfirmButton: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
});
