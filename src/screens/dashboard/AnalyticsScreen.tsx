import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  useTheme,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { StatusSummaryCard } from '../../components/StatusSummaryCard';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalEnquiries: number;
  totalBookings: number;
  conversionRate: number;
  revenue: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}

export const AnalyticsScreen: React.FC = () => {
  const theme = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API call
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalyticsData({
        totalEnquiries: 156,
        totalBookings: 89,
        conversionRate: 57.1,
        revenue: 2450000,
        averageResponseTime: 2.3,
        customerSatisfaction: 4.7,
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
          Analytics Dashboard
        </Title>
        <Paragraph style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Performance insights and key metrics
        </Paragraph>
      </View>

      {analyticsData && (
        <View style={styles.content}>
          {/* Key Metrics Row */}
          <View style={styles.metricsRow}>
            <StatusSummaryCard
              title="Total Enquiries"
              value={analyticsData.totalEnquiries}
              subtitle="This month"
              color={theme.colors.primary}
              trend={{ value: 12, isPositive: true }}
            />
            <StatusSummaryCard
              title="Total Bookings"
              value={analyticsData.totalBookings}
              subtitle="This month"
              color={theme.colors.secondary}
              trend={{ value: 8, isPositive: true }}
            />
          </View>

          {/* Conversion Metrics Row */}
          <View style={styles.metricsRow}>
            <StatusSummaryCard
              title="Conversion Rate"
              value={`${analyticsData.conversionRate}%`}
              subtitle="Enquiry to booking"
              color={theme.colors.tertiary}
              trend={{ value: 3, isPositive: true }}
            />
            <StatusSummaryCard
              title="Revenue"
              value={formatCurrency(analyticsData.revenue)}
              subtitle="This month"
              color={theme.colors.primary}
              trend={{ value: 15, isPositive: true }}
            />
          </View>

          {/* Performance Metrics Row */}
          <View style={styles.metricsRow}>
            <StatusSummaryCard
              title="Avg Response Time"
              value={`${analyticsData.averageResponseTime}h`}
              subtitle="To enquiries"
              color={theme.colors.secondary}
              trend={{ value: 5, isPositive: false }}
            />
            <StatusSummaryCard
              title="Customer Satisfaction"
              value={`${analyticsData.customerSatisfaction}/5`}
              subtitle="Average rating"
              color={theme.colors.tertiary}
              trend={{ value: 2, isPositive: true }}
            />
          </View>

          {/* Additional Analytics Cards */}
          <Card style={[styles.insightsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={[styles.insightsTitle, { color: theme.colors.onSurface }]}>
                Key Insights
              </Title>
              <View style={styles.insightsList}>
                <View style={styles.insightItem}>
                  <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>
                    • Conversion rate improved by 3% this month
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>
                    • Response time needs improvement
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>
                    • Customer satisfaction remains high
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightsCard: {
    marginTop: 8,
    elevation: 2,
    borderRadius: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});