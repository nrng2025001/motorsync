import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Divider,
  IconButton,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, spacing, shadows, borderRadius } from '../../utils/theme';

/**
 * Quotation item interface
 */
interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Vehicle options for quick selection
 */
const vehicleOptions = [
  '2024 Toyota Camry',
  '2024 Honda Accord', 
  '2024 BMW X5',
  '2024 Mercedes C-Class',
  '2024 Audi A4',
  '2024 Ford F-150',
  '2024 Chevrolet Silverado',
  '2024 Tesla Model 3',
];

/**
 * Quotation Generator Screen
 * Allows users to create new quotations with line items
 */
export function QuotationGeneratorScreen({ navigation }: any): React.JSX.Element {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      description: 'Vehicle Base Price',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);
  const [validityDays, setValidityDays] = useState('30');
  const [notes, setNotes] = useState('');
  const [vehicleMenuVisible, setVehicleMenuVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Add new item to quotation
   */
  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  /**
   * Remove item from quotation
   */
  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  /**
   * Update item details
   */
  const updateItem = (itemId: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  /**
   * Calculate quotation totals
   */
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  /**
   * Generate quotation
   */
  const generateQuotation = () => {
    if (!customerName.trim() || !customerEmail.trim() || !vehicleDetails.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const totals = calculateTotals();
    
    Alert.alert(
      'Quotation Generated',
      `Quotation for ${customerName} has been generated successfully!\nTotal: $${totals.total.toFixed(2)}`,
      [
        {
          text: 'Generate PDF',
          onPress: () => Alert.alert('PDF Generated', 'PDF has been saved to your device'),
        },
        {
          text: 'Send Email',
          onPress: () => Alert.alert('Email Sent', `Quotation sent to ${customerEmail}`),
        },
        { text: 'OK' },
      ]
    );
  };

  const totals = calculateTotals();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Quotation Generator
          </Text>
        </View>

        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Customer Information
            </Text>
            
            <TextInput
              mode="outlined"
              label="Customer Name *"
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.input}
            />
            
            <TextInput
              mode="outlined"
              label="Email Address *"
              value={customerEmail}
              onChangeText={setCustomerEmail}
              keyboardType="email-address"
              style={styles.input}
            />
            
            <TextInput
              mode="outlined"
              label="Phone Number"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
            
            <TextInput
              mode="outlined"
              label="Vehicle Details *"
              value={vehicleDetails}
              onChangeText={setVehicleDetails}
              placeholder="e.g., 2024 Toyota Camry Hybrid LE"
              style={styles.input}
              left={<TextInput.Icon icon="car" />}
            />
            
            {/* Quick Vehicle Selection */}
            <Text variant="bodySmall" style={styles.quickSelectLabel}>
              Quick Select Popular Vehicles:
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.vehicleScrollView}
            >
              <View style={styles.vehicleChipsRow}>
                {vehicleOptions.slice(0, 6).map((vehicle) => (
                  <Chip
                    key={vehicle}
                    mode="outlined"
                    onPress={() => setVehicleDetails(vehicle)}
                    style={styles.vehicleChip}
                    textStyle={styles.vehicleChipText}
                  >
                    {vehicle}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Quotation Items */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.itemsHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Quotation Items
              </Text>
              <Button
                mode="outlined"
                icon="plus"
                onPress={addItem}
                compact
              >
                Add Item
              </Button>
            </View>

            {items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <Text variant="labelMedium" style={styles.itemNumber}>
                  {index + 1}.
                </Text>
                
                <View style={styles.itemInputs}>
                  <TextInput
                    mode="outlined"
                    label="Description"
                    value={item.description}
                    onChangeText={(value) => updateItem(item.id, 'description', value)}
                    style={[styles.input, styles.descriptionInput]}
                  />
                  
                  <View style={styles.itemNumbers}>
                    <TextInput
                      mode="outlined"
                      label="Qty"
                      value={item.quantity.toString()}
                      onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 0)}
                      keyboardType="numeric"
                      style={[styles.input, styles.quantityInput]}
                    />
                    
                    <TextInput
                      mode="outlined"
                      label="Unit Price"
                      value={item.unitPrice.toString()}
                      onChangeText={(value) => updateItem(item.id, 'unitPrice', parseFloat(value) || 0)}
                      keyboardType="numeric"
                      style={[styles.input, styles.priceInput]}
                    />
                    
                    <View style={styles.totalContainer}>
                      <Text variant="labelMedium" style={styles.totalLabel}>
                        Total
                      </Text>
                      <Text variant="titleMedium" style={styles.totalValue}>
                        ${item.total.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {items.length > 1 && (
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => removeItem(item.id)}
                    style={styles.deleteButton}
                  />
                )}
              </View>
            ))}

            <Divider style={styles.divider} />

            {/* Totals */}
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text variant="bodyMedium">Subtotal:</Text>
                <Text variant="bodyMedium">${totals.subtotal.toFixed(2)}</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text variant="bodyMedium">Tax (10%):</Text>
                <Text variant="bodyMedium">${totals.tax.toFixed(2)}</Text>
              </View>
              
              <Divider style={styles.totalDivider} />
              
              <View style={styles.totalRow}>
                <Text variant="titleMedium" style={styles.grandTotalLabel}>
                  Total:
                </Text>
                <Text variant="titleMedium" style={styles.grandTotalValue}>
                  ${totals.total.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Additional Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Additional Information
            </Text>
            
            <TextInput
              mode="outlined"
              label="Valid for (days)"
              value={validityDays}
              onChangeText={setValidityDays}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              mode="outlined"
              label="Notes & Terms"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Enter any additional notes or terms and conditions..."
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => Alert.alert('Draft Saved', 'Quotation saved as draft')}
          >
            Save Draft
          </Button>
          
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={generateQuotation}
          >
            Generate Quotation
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Very subtle blue tint
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
    fontSize: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.medium,
    borderLeftWidth: 3,
    borderLeftColor: '#E3F2FD', // Light blue accent
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemNumber: {
    marginTop: spacing.md,
    marginRight: spacing.sm,
    minWidth: 20,
  },
  itemInputs: {
    flex: 1,
  },
  descriptionInput: {
    marginBottom: spacing.sm,
  },
  itemNumbers: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  quantityInput: {
    flex: 1,
    maxWidth: 80,
  },
  priceInput: {
    flex: 2,
  },
  totalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  totalLabel: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  totalValue: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  totalsSection: {
    paddingTop: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalDivider: {
    marginVertical: spacing.sm,
  },
  grandTotalLabel: {
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  grandTotalValue: {
    fontWeight: '700',
    color: theme.colors.primary,
    fontSize: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  quickSelectLabel: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  vehicleScrollView: {
    marginBottom: spacing.md,
  },
  vehicleChipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  vehicleChip: {
    borderRadius: 20,
  },
  vehicleChipText: {
    fontSize: 11,
  },
});
