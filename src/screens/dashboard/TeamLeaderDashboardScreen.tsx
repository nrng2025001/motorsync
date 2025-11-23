/**
 * Team Leader Dashboard Screen
 * Phase 2: Displays TL-specific metrics and KPIs
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { dashboardAPI } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';

interface TLDashboardData {
  teamSize: number;
  totalHotInquiryCount: number;
  pendingCAOnUpdate: number;
  pendingEnquiriesToUpdate: number;
  todaysBookingPlan: number;
}

export function TeamLeaderDashboardScreen(): React.JSX.Element {
  const { state: authState } = useAuth();
  const userRole = getUserRole(authState.user);
  
  const [dashboardData, setDashboardData] = useState<TLDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify user is Team Lead
  useEffect(() => {
    if (userRole !== 'TEAM_LEAD') {
      setError('Access denied. This dashboard is only available for Team Leaders.');
      setLoading(false);
    }
  }, [userRole]);

  const fetchDashboardData = useCallback(async () => {
    if (userRole !== 'TEAM_LEAD') return;
    
    try {
      setError(null);
      const data = await dashboardAPI.getTeamLeaderDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching TL dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'TEAM_LEAD') {
      fetchDashboardData();
    }
  }, [fetchDashboardData, userRole]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoLinearGradient
        colors={['#F8FAFC', '#EFF6FF', '#F0F9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>
              Team Leader Dashboard
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Track your team's performance
            </Text>
          </View>

          {/* Team Size Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Team Size</Text>
              <Text style={styles.cardValue}>{dashboardData.teamSize}</Text>
              <Text style={styles.cardSubtitle}>Team Members</Text>
            </Card.Content>
          </Card>

          {/* Total Hot Inquiry Count */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Total Hot Inquiry Count</Text>
              <Text style={styles.cardValue}>{dashboardData.totalHotInquiryCount}</Text>
              <Text style={styles.cardSubtitle}>Active HOT Leads</Text>
            </Card.Content>
          </Card>

          {/* Pending CA on Update */}
          <Card style={[styles.card, dashboardData.pendingCAOnUpdate > 0 && styles.urgentCard]}>
            <Card.Content>
              <Text style={styles.cardTitle}>Pending CA on Update</Text>
              <Text style={[styles.cardValue, dashboardData.pendingCAOnUpdate > 0 && styles.urgentValue]}>
                {dashboardData.pendingCAOnUpdate}
              </Text>
              <Text style={styles.cardSubtitle}>CAs who missed updates today</Text>
            </Card.Content>
          </Card>

          {/* Pending Enquiries To Update */}
          <Card style={[styles.card, dashboardData.pendingEnquiriesToUpdate > 0 && styles.urgentCard]}>
            <Card.Content>
              <Text style={styles.cardTitle}>Pending Enquiries To Update</Text>
              <Text style={[styles.cardValue, dashboardData.pendingEnquiriesToUpdate > 0 && styles.urgentValue]}>
                {dashboardData.pendingEnquiriesToUpdate}
              </Text>
              <Text style={styles.cardSubtitle}>Enquiries needing action</Text>
            </Card.Content>
          </Card>

          {/* Today's Booking Plan */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Today's Booking Plan</Text>
              <Text style={styles.cardValue}>{dashboardData.todaysBookingPlan}</Text>
              <Text style={styles.cardSubtitle}>EDB = Today</Text>
            </Card.Content>
          </Card>
        </ScrollView>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError(null)}
          duration={3000}
        >
          {error}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '900',
    color: '#0F172A',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 4,
  },
  urgentValue: {
    color: '#EF4444',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});

