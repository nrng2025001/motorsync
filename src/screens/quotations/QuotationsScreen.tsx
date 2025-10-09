import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  FAB,
  Searchbar,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { theme, spacing } from '../../utils/theme';
import { QuotationsAPI, type Quotation, type QuotationStatus } from '../../api';

/**
 * Loading and error states
 */
interface QuotationsState {
  loading: boolean;
  error: string | null;
  data: Quotation[];
}

/**
 * Mock quotations data
 */
const getEmptyQuotations = (): Quotation[] => [];

/**
 * Get status chip color based on quotation status
 */
function getStatusColor(status: QuotationStatus): string {
  switch (status) {
    case 'draft':
      return theme.colors.outline;
    case 'sent':
      return theme.colors.info;
    case 'viewed':
      return theme.colors.warning;
    case 'approved':
      return theme.colors.success;
    case 'rejected':
      return theme.colors.error;
    case 'expired':
      return theme.colors.onSurfaceVariant;
    default:
      return theme.colors.outline;
  }
}

/**
 * Check if quotation is expiring soon (within 3 days)
 */
function isExpiringSoon(validUntil: string): boolean {
  const expiryDate = new Date(validUntil);
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  return expiryDate <= threeDaysFromNow;
}

/**
 * Quotations Screen Component
 * Displays and manages quotations
 */
export function QuotationsScreen({ navigation }: any): React.JSX.Element {
  const { state } = useAuth();
  
  const [quotationsState, setQuotationsState] = useState<QuotationsState>({
    loading: true,
    error: null,
    data: [],
  });
  
  const userRole = state.user?.role || 'customer_advisor';
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');

  /**
   * Fetch quotations from API
   */
  const fetchQuotations = useCallback(async () => {
    try {
      setQuotationsState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if user has permission to access quotations
      if (userRole === 'CUSTOMER_ADVISOR') {
        setQuotationsState({
          loading: false,
          error: 'Access denied: Customer Advisors cannot view quotations',
          data: getEmptyQuotations(),
        });
        return;
      }
      
      const response = await QuotationsAPI.getQuotations({
        page: 1,
        limit: 100, // Get all quotations for now
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setQuotationsState({
        loading: false,
        error: null,
        data: response.data || [],
      });
    } catch (error: any) {
      console.error('Error fetching quotations:', error);
      
      // Handle permission errors specifically
      if (error.response?.status === 403) {
        setQuotationsState({
          loading: false,
          error: 'Access denied: You do not have permission to view quotations',
          data: getEmptyQuotations(),
        });
      } else {
        setQuotationsState({
          loading: false,
          error: error.message || 'Failed to load quotations',
          data: getEmptyQuotations(),
        });
      }
    }
  }, [userRole]);

  /**
   * Filter quotations based on search query and status
   */
  const filteredQuotations = quotationsState.data.filter(quotation => {
    const matchesSearch = quotation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quotation.vehicleDetails.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  /**
   * Handle pull to refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQuotations();
    setRefreshing(false);
  }, [fetchQuotations]);

  /**
   * Load data on component mount
   */
  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  /**
   * Handle new quotation creation
   */
  const handleNewQuotation = () => {
    Alert.alert(
      'New Quotation',
      'This would open the quotation builder. In the full implementation, this would navigate to a form screen.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle quotation action
   */
  const handleQuotationAction = (quotation: Quotation, action: string) => {
    if (action === 'View') {
      navigation.navigate('QuotationDetails', { quotationId: quotation.id });
    } else {
      Alert.alert(
        `${action} Quotation`,
        `This would ${action.toLowerCase()} quotation ${quotation.quotationNumber}. In the full implementation, this would make an API call.`,
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show loading state
  if (quotationsState.loading && quotationsState.data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading quotations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (quotationsState.error && quotationsState.data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Unable to Load Quotations
          </Text>
          <Text variant="bodyMedium" style={styles.errorMessage}>
            {quotationsState.error}
          </Text>
          <Button 
            mode="contained" 
            onPress={fetchQuotations}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search quotations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ backgroundColor: 'transparent' }}
          elevation={0}
        />
        
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="filter-variant"
              onPress={() => setFilterMenuVisible(true)}
              style={styles.filterButton}
            >
              Filter
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setStatusFilter('all');
              setFilterMenuVisible(false);
            }}
            title="All Status"
            leadingIcon={statusFilter === 'all' ? 'check' : undefined}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setStatusFilter('draft');
              setFilterMenuVisible(false);
            }}
            title="Draft"
            leadingIcon={statusFilter === 'draft' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('sent');
              setFilterMenuVisible(false);
            }}
            title="Sent"
            leadingIcon={statusFilter === 'sent' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('approved');
              setFilterMenuVisible(false);
            }}
            title="Approved"
            leadingIcon={statusFilter === 'approved' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('rejected');
              setFilterMenuVisible(false);
            }}
            title="Rejected"
            leadingIcon={statusFilter === 'rejected' ? 'check' : undefined}
          />
        </Menu>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredQuotations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No quotations found
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search or filter criteria' : 'New quotations will appear here'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredQuotations.map((quotation) => (
            <Card key={quotation.id} style={styles.quotationCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.quotationInfo}>
                    <Text variant="titleMedium" style={styles.quotationNumber}>
                      {quotation.quotationNumber}
                    </Text>
                    <Text variant="bodyMedium" style={styles.customerName}>
                      {quotation.customerName}
                    </Text>
                    <Text variant="bodySmall" style={styles.vehicleDetails}>
                      {quotation.vehicleDetails}
                    </Text>
                  </View>
                  <View style={styles.amountSection}>
                    <Text variant="headlineSmall" style={styles.amount}>
                      {formatCurrency(quotation.totalAmount)}
                    </Text>
                    <Chip
                      mode="flat"
                      textStyle={{ fontSize: 10 }}
                      style={[styles.statusChip, { backgroundColor: `${getStatusColor(quotation.status)}20` }]}
                    >
                      {quotation.status.toUpperCase()}
                    </Chip>
                  </View>
                </View>

                <View style={styles.validitySection}>
                  <Text variant="bodySmall" style={styles.validityText}>
                    Valid until: {formatDate(quotation.validUntil)}
                  </Text>
                  {isExpiringSoon(quotation.validUntil) && (
                    <Chip
                      mode="flat"
                      textStyle={{ fontSize: 10 }}
                      style={[styles.warningChip, { backgroundColor: `${theme.colors.warning}20` }]}
                    >
                      EXPIRES SOON
                    </Chip>
                  )}
                </View>

                {quotation.notes && (
                  <Text variant="bodySmall" style={styles.notes}>
                    {quotation.notes}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.createdInfo}>
                    <Text variant="bodySmall" style={styles.createdText}>
                      Created by {quotation.createdBy}
                    </Text>
                    <Text variant="bodySmall" style={styles.dateText}>
                      {formatDate(quotation.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <Button
                      mode="text"
                      compact
                      onPress={() => handleQuotationAction(quotation, 'View')}
                    >
                      View
                    </Button>
                    <Button
                      mode="text"
                      compact
                      onPress={() => handleQuotationAction(quotation, 'Edit')}
                    >
                      Edit
                    </Button>
                    <Button
                      mode="text"
                      compact
                      onPress={() => handleQuotationAction(quotation, 'Send')}
                    >
                      Send
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleNewQuotation}
        label="New Quote"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchbar: {
    flex: 1,
  },
  filterButton: {
    minWidth: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  quotationCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  quotationInfo: {
    flex: 1,
  },
  quotationNumber: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  customerName: {
    color: theme.colors.onSurface,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  vehicleDetails: {
    color: theme.colors.onSurfaceVariant,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    color: theme.colors.success,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusChip: {
    height: 24,
  },
  validitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  validityText: {
    color: theme.colors.onSurfaceVariant,
  },
  warningChip: {
    height: 20,
  },
  notes: {
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.outline,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  createdInfo: {
    flex: 1,
  },
  createdText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  dateText: {
    color: theme.colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
  },
  emptyCard: {
    marginTop: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
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
});
