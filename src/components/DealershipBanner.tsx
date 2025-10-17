/**
 * DealershipBanner Component
 * Shows current dealership info at the top of screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/theme';
import { Dealership } from '../types/dealership';

interface DealershipBannerProps {
  compact?: boolean;
}

export function DealershipBanner({ compact = false }: DealershipBannerProps) {
  const { dealership, isAdmin } = useAuth();

  if (isAdmin || !dealership) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>
          {dealership.name} ({dealership.code})
        </Text>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.dealershipName}>{dealership.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{dealership.type}</Text>
            </View>
          </View>
          
          <View style={styles.details}>
            <Text style={styles.detailText}>Code: {dealership.code}</Text>
            <Text style={styles.detailText}>
              {dealership.city}, {dealership.state}
            </Text>
          </View>

          {dealership.brands && dealership.brands.length > 0 && (
            <View style={styles.brandsContainer}>
              <Text style={styles.brandsLabel}>Brands: </Text>
              <Text style={styles.brandsText}>
                {dealership.brands.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    elevation: 2,
  },
  container: {
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealershipName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  brandsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  brandsLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  brandsText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  compactContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  compactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});



