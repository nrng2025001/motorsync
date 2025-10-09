import React, { useState } from 'react';
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
  Chip,
  Icon,
  Divider,
  DataTable,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, spacing } from '../../utils/theme';

/**
 * Mock quotation details data
 */
const mockQuotationDetails = {
  id: '1',
  quotationNumber: 'QUO-2024-001',
  customerName: 'Ethan Carter',
  customerEmail: 'ethan.carter@email.com',
  customerPhone: '+1 (555) 123-4567',
  vehicleDetails: '2023 BMW X5 xDrive40i',
  status: 'sent',
  validUntil: '2024-02-15T23:59:59Z',
  createdAt: '2024-01-15T10:30:00Z',
  createdBy: 'Mike Chen',
  lastModified: '2024-01-15T14:20:00Z',
  notes: 'Customer interested in premium package and extended warranty',
  items: [
    { id: '1', description: '2023 BMW X5 xDrive40i', quantity: 1, unitPrice: 65000, total: 65000 },
    { id: '2', description: 'Premium Package', quantity: 1, unitPrice: 3500, total: 3500 },
    { id: '3', description: 'Extended Warranty (5 years)', quantity: 1, unitPrice: 2500, total: 2500 },
    { id: '4', description: 'Paint Protection Package', quantity: 1, unitPrice: 1200, total: 1200 },
  ],
  subtotal: 72200,
  tax: 7220,
  total: 79420,
  terms: 'This quotation is valid for 30 days. All prices include delivery and documentation fees.',
};

/**
 * Quotation Details Screen Component
 * Shows comprehensive quotation information and actions
 */
export function QuotationDetailsScreen({ route, navigation }: any): React.JSX.Element {
  const quotationId = route?.params?.quotationId || '1';
  const [quotation] = useState(mockQuotationDetails);

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return theme.colors.onSurfaceVariant;
      case 'sent': return theme.colors.info;
      case 'viewed': return theme.colors.warning;
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'expired': return theme.colors.onSurfaceVariant;
      default: return theme.colors.outline;
    }
  };

  /**
   * Handle status update
   */
  const handleUpdateStatus = () => {
    Alert.alert(
      'Update Quotation Status',
      'Choose new status for this quotation',
      [
        { text: 'Draft', onPress: () => updateStatus('Draft') },
        { text: 'Send to Customer', onPress: () => updateStatus('Sent') },
        { text: 'Approved', onPress: () => updateStatus('Approved') },
        { text: 'Rejected', onPress: () => updateStatus('Rejected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  /**
   * Update quotation status
   */
  const updateStatus = (newStatus: string) => {
    Alert.alert('Status Updated', `Quotation status updated to: ${newStatus}`);
  };

  /**
   * Handle generate PDF
   */
  const handleGeneratePDF = () => {
    Alert.alert('PDF Generated', 'Quotation PDF has been generated and saved');
  };

  /**
   * Handle send email
   */
  const handleSendEmail = () => {
    Alert.alert('Email Sent', `Quotation sent to ${quotation.customerEmail}`);
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
   * Check if quotation is expiring soon
   */
  const isExpiringSoon = () => {
    const expiryDate = new Date(quotation.validUntil);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return expiryDate <= threeDaysFromNow;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          Quotation Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quotation Overview */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.quotationHeader}>
              <View style={styles.quotationInfo}>
                <Text variant="headlineSmall" style={styles.quotationNumber}>
                  {quotation.quotationNumber}
                </Text>
                <Text variant="bodyLarge" style={styles.customerName}>
                  {quotation.customerName}
                </Text>
                <Text variant="bodyMedium" style={styles.vehicleDetails}>
                  {quotation.vehicleDetails}
                </Text>
              </View>
              <View style={styles.statusSection}>
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: `${getStatusColor(quotation.status)}20` }]}
                  textStyle={[styles.statusChipText, { color: getStatusColor(quotation.status) }]}
                >
                  {quotation.status.toUpperCase()}
                </Chip>
                <Text variant="headlineMedium" style={styles.totalAmount}>
                  {formatCurrency(quotation.total)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Customer Information
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="email" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Email
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {quotation.customerEmail}
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
                {quotation.customerPhone}
              </Text>
            </View>
          </View>
        </View>

        {/* Quotation Items */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quotation Items
          </Text>

          <Card style={styles.itemsCard}>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title textStyle={styles.tableHeader}>Description</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.tableHeader}>Qty</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.tableHeader}>Price</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.tableHeader}>Total</DataTable.Title>
              </DataTable.Header>

              {quotation.items.map((item) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell textStyle={styles.tableCell}>
                    {item.description}
                  </DataTable.Cell>
                  <DataTable.Cell numeric textStyle={styles.tableCell}>
                    {item.quantity}
                  </DataTable.Cell>
                  <DataTable.Cell numeric textStyle={styles.tableCell}>
                    {formatCurrency(item.unitPrice)}
                  </DataTable.Cell>
                  <DataTable.Cell numeric textStyle={styles.tableCell}>
                    {formatCurrency(item.total)}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

              <Divider style={styles.tableDivider} />

              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text variant="bodyMedium" style={styles.totalLabel}>Subtotal:</Text>
                  <Text variant="bodyMedium" style={styles.totalValue}>
                    {formatCurrency(quotation.subtotal)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text variant="bodyMedium" style={styles.totalLabel}>Tax (10%):</Text>
                  <Text variant="bodyMedium" style={styles.totalValue}>
                    {formatCurrency(quotation.tax)}
                  </Text>
                </View>
                <Divider style={styles.finalDivider} />
                <View style={styles.totalRow}>
                  <Text variant="titleMedium" style={styles.grandTotalLabel}>Total:</Text>
                  <Text variant="titleMedium" style={styles.grandTotalValue}>
                    {formatCurrency(quotation.total)}
                  </Text>
                </View>
              </View>
            </DataTable>
          </Card>
        </View>

        {/* Quotation Details */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quotation Information
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="calendar" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Valid Until
              </Text>
              <Text variant="bodyLarge" style={[
                styles.infoValue,
                isExpiringSoon() && { color: theme.colors.error }
              ]}>
                {formatDate(quotation.validUntil)}
                {isExpiringSoon() && ' (Expires Soon)'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="account-tie" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Created By
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {quotation.createdBy}
              </Text>
              <Text variant="bodySmall" style={styles.infoSubValue}>
                {formatDate(quotation.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms & Notes */}
        {(quotation.notes || quotation.terms) && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Terms & Notes
            </Text>
            
            {quotation.notes && (
              <Card style={styles.notesCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.notesTitle}>Notes</Text>
                  <Text variant="bodyMedium" style={styles.notesText}>
                    {quotation.notes}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {quotation.terms && (
              <Card style={styles.notesCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.notesTitle}>Terms & Conditions</Text>
                  <Text variant="bodyMedium" style={styles.notesText}>
                    {quotation.terms}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}

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
            onPress={handleGeneratePDF}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="file-pdf-box"
          >
            Generate PDF
          </Button>

          <Button
            mode="outlined"
            onPress={handleSendEmail}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="email-send"
          >
            Send to Customer
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  quotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quotationInfo: {
    flex: 1,
  },
  quotationNumber: {
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  customerName: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  vehicleDetails: {
    color: theme.colors.onSurfaceVariant,
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: spacing.md,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalAmount: {
    color: theme.colors.success,
    fontWeight: '700',
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
  infoSubValue: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
  },
  tableHeader: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    fontSize: 12,
  },
  tableCell: {
    color: theme.colors.onSurface,
    fontSize: 14,
  },
  tableDivider: {
    marginVertical: spacing.sm,
  },
  totalsSection: {
    padding: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    color: theme.colors.onSurface,
  },
  totalValue: {
    color: theme.colors.onSurface,
  },
  finalDivider: {
    marginVertical: spacing.sm,
  },
  grandTotalLabel: {
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  grandTotalValue: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 1,
  },
  notesTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  notesText: {
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm,
  },
});
