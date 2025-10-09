import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Icon } from 'react-native-paper';
import { theme, spacing } from '../utils/theme';

/**
 * Props for DashboardCard component
 */
interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: string;
  onPress?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Dashboard Card Component
 * Displays key metrics and statistics on the dashboard
 */
export function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color = theme.colors.primary,
  onPress,
  trend,
}: DashboardCardProps): React.JSX.Element {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      style={styles.touchable}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card style={[styles.card, onPress && styles.pressableCard]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <Icon source={icon} size={24} color={color} />
            </View>
            {trend && (
              <View style={styles.trendContainer}>
                <Icon
                  source={trend.isPositive ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={trend.isPositive ? '#4CAF50' : theme.colors.error}
                />
                <Text
                  variant="bodySmall"
                  style={[
                    styles.trendText,
                    {
                      color: trend.isPositive ? '#4CAF50' : theme.colors.error,
                    },
                  ]}
                >
                  {Math.abs(trend.value)}%
                </Text>
              </View>
            )}
          </View>

          <Text
  variant="headlineMedium"
  style={styles.value}
>
  {value}
</Text>

<Text
  variant="titleMedium"
  style={styles.title}
>
  {title}
</Text>

{subtitle && (
  <Text
    variant="bodySmall"
    style={styles.subtitle}
  >
    {subtitle}
  </Text>
)}
        </Card.Content>
      </Card>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    elevation: 2,
    margin: spacing.xs,
  },
  pressableCard: {
    elevation: 4,
  },
  content: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  value: {
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  
  title: {
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
});
