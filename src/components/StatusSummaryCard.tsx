import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, useTheme } from 'react-native-paper';

interface StatusSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}) => {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Title style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Title>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: color || theme.colors.primary }]}>
              {/* You can add an icon here if needed */}
            </View>
          )}
        </View>
        
        <Paragraph style={[styles.value, { color: color || theme.colors.primary }]}>
          {value}
        </Paragraph>
        
        {subtitle && (
          <Paragraph style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Paragraph>
        )}
        
        {trend && (
          <View style={styles.trendContainer}>
            <Paragraph style={[
              styles.trend,
              { 
                color: trend.isPositive ? theme.colors.primary : theme.colors.error 
              }
            ]}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Paragraph>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 8,
    elevation: 2,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
  },
});
