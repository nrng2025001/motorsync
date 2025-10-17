/**
 * StockCard Component
 * Displays a vehicle card in the stock list
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Icon } from 'react-native-paper';
import { Vehicle } from '../../types/stock';

interface StockCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
}

export function StockCard({ vehicle, onPress }: StockCardProps) {
  const isInStock = vehicle.availableStock > 0;
  const stockPercentage = vehicle.totalStock > 0 
    ? Math.round((vehicle.availableStock / vehicle.totalStock) * 100) 
    : 0;

  const getStockBadgeColor = () => {
    if (!isInStock) return '#EF4444'; // Red for out of stock
    if (stockPercentage <= 30) return '#F59E0B'; // Orange for low stock
    return '#10B981'; // Green for good stock
  };

  const getStockStatusText = () => {
    if (!isInStock) return 'Out of Stock';
    if (stockPercentage <= 30) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.variant}>
                {vehicle.variant}
              </Text>
              {vehicle.modelYear && (
                <Text variant="bodySmall" style={styles.modelYear}>
                  {vehicle.modelYear}
                </Text>
              )}
            </View>
            
            <Chip
              mode="flat"
              style={[styles.stockBadge, { backgroundColor: getStockBadgeColor() + '20' }]}
              textStyle={[styles.stockBadgeText, { color: getStockBadgeColor() }]}
              icon={() => (
                <Icon 
                  source={isInStock ? 'check-circle' : 'alert-circle'} 
                  size={16} 
                  color={getStockBadgeColor()} 
                />
              )}
            >
              {vehicle.availableStock}
            </Chip>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Icon source="palette" size={16} color="#6B7280" />
              <Text variant="bodySmall" style={styles.detailText}>
                {vehicle.color}
              </Text>
              
              <View style={styles.detailIcon}>
                <Icon source="gas-station" size={16} color="#6B7280" />
              </View>
              <Text variant="bodySmall" style={styles.detailText}>
                {vehicle.fuelType}
              </Text>
              
              <View style={styles.detailIcon}>
                <Icon source="car-cog" size={16} color="#6B7280" />
              </View>
              <Text variant="bodySmall" style={styles.detailText}>
                {vehicle.transmission}
              </Text>
            </View>

            {vehicle.dealerCode && (
              <View style={styles.detailRow}>
                <Icon source="map-marker" size={16} color="#6B7280" />
                <Text variant="bodySmall" style={styles.detailText}>
                  {vehicle.location || vehicle.dealerCode}
                </Text>
              </View>
            )}

            <View style={styles.stockInfo}>
              <View style={styles.stockInfoItem}>
                <Text variant="bodySmall" style={styles.stockLabel}>
                  Total
                </Text>
                <Text variant="bodyMedium" style={styles.stockValue}>
                  {vehicle.totalStock}
                </Text>
              </View>
              
              <View style={styles.stockInfoItem}>
                <Text variant="bodySmall" style={styles.stockLabel}>
                  Available
                </Text>
                <Text variant="bodyMedium" style={[styles.stockValue, { color: getStockBadgeColor() }]}>
                  {vehicle.availableStock}
                </Text>
              </View>
              
              {vehicle.allocatedStock !== undefined && vehicle.allocatedStock > 0 && (
                <View style={styles.stockInfoItem}>
                  <Text variant="bodySmall" style={styles.stockLabel}>
                    Allocated
                  </Text>
                  <Text variant="bodyMedium" style={styles.stockValue}>
                    {vehicle.allocatedStock}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Chip
              mode="outlined"
              compact
              style={[
                styles.statusChip,
                { borderColor: getStockBadgeColor() }
              ]}
              textStyle={[styles.statusChipText, { color: getStockBadgeColor() }]}
            >
              {getStockStatusText()}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  variant: {
    fontWeight: '600',
    color: '#111827',
  },
  modelYear: {
    color: '#6B7280',
    marginTop: 2,
  },
  stockBadge: {
    height: 32,
    borderRadius: 16,
  },
  stockBadgeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailIcon: {
    marginLeft: 12,
  },
  detailText: {
    color: '#6B7280',
    marginLeft: 6,
  },
  stockInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stockInfoItem: {
    flex: 1,
  },
  stockLabel: {
    color: '#6B7280',
    marginBottom: 2,
  },
  stockValue: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

