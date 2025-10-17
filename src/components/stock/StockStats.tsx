/**
 * StockStats Component
 * Displays stock statistics in a card
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Icon, ProgressBar } from 'react-native-paper';
import { StockStats as StockStatsType } from '../../types/stock';

interface StockStatsProps {
  stats: StockStatsType;
  loading?: boolean;
}

export function StockStats({ stats, loading = false }: StockStatsProps) {
  const stockPercentage = stats.totalVehicles > 0
    ? (stats.inStock / stats.totalVehicles)
    : 0;

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Icon source="chart-box" size={28} color="#3B82F6" />
          <Text variant="titleLarge" style={styles.title}>
            Stock Overview
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Icon source="warehouse" size={24} color="#3B82F6" />
            </View>
            <View style={styles.statTextContainer}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Vehicles
              </Text>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#3B82F6' }]}>
                {stats.totalVehicles}
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Icon source="check-circle" size={24} color="#10B981" />
            </View>
            <View style={styles.statTextContainer}>
              <Text variant="bodySmall" style={styles.statLabel}>
                In Stock
              </Text>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#10B981' }]}>
                {stats.inStock}
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FEF2F2' }]}>
              <Icon source="alert-circle" size={24} color="#EF4444" />
            </View>
            <View style={styles.statTextContainer}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Out of Stock
              </Text>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#EF4444' }]}>
                {stats.outOfStock}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text variant="bodyMedium" style={styles.progressLabel}>
              Stock Availability
            </Text>
            <Text variant="bodyMedium" style={styles.progressPercentage}>
              {Math.round(stockPercentage * 100)}%
            </Text>
          </View>
          <ProgressBar 
            progress={stockPercentage} 
            color="#10B981"
            style={styles.progressBar}
          />
        </View>

        {stats.topModels && stats.topModels.length > 0 && (
          <View style={styles.topModelsSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Top Models
            </Text>
            {stats.topModels.slice(0, 3).map((model, index) => (
              <View key={index} style={styles.topModelItem}>
                <View style={styles.topModelRank}>
                  <Text style={styles.topModelRankText}>{index + 1}</Text>
                </View>
                <Text variant="bodyMedium" style={styles.topModelName}>
                  {model.variant}
                </Text>
                <Text variant="bodySmall" style={styles.topModelStock}>
                  {model.totalStock} units
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontWeight: '700',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 8,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#374151',
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#10B981',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  topModelsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  topModelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  topModelRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topModelRankText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 14,
  },
  topModelName: {
    flex: 1,
    color: '#374151',
    fontWeight: '500',
  },
  topModelStock: {
    color: '#6B7280',
  },
});

