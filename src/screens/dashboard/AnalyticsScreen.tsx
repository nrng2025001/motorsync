/**
 * Analytics Dashboard Screen
 * Displays comprehensive analytics for bookings and enquiries
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, G, Ellipse, Circle } from 'react-native-svg';

import { StatusSummaryCard } from '../../components/StatusSummaryCard';
import { theme, spacing, shadows, borderRadius } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';
import { getDataFilterOptions, getRoleDisplayNameWithHierarchy } from '../../utils/hierarchyUtils';

const { width, height } = Dimensions.get('window');

/**
 * Enhanced Background Pattern with Animated Elements
 */
const BackgroundPattern = () => (
  <View style={styles.backgroundPatternContainer}>
    <Svg height={height} width={width} style={styles.backgroundSvg}>
      <Defs>
        {/* Primary gradient for base layer */}
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.8" />
          <Stop offset="50%" stopColor="#EFF6FF" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#F0F9FF" stopOpacity="0.4" />
        </LinearGradient>
        
        {/* Secondary gradient for overlay elements */}
        <LinearGradient id="overlayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
        </LinearGradient>
      </Defs>
      
      {/* Base gradient background */}
      <Rect width="100%" height="100%" fill="url(#bgGradient)" />
      
      {/* Floating geometric shapes */}
      <G opacity="0.3">
        <Circle cx={width * 0.15} cy={height * 0.2} r="40" fill="url(#overlayGradient)" />
        <Circle cx={width * 0.85} cy={height * 0.3} r="60" fill="url(#overlayGradient)" />
        <Circle cx={width * 0.2} cy={height * 0.7} r="30" fill="url(#overlayGradient)" />
        <Circle cx={width * 0.8} cy={height * 0.8} r="50" fill="url(#overlayGradient)" />
      </G>
      
      {/* Subtle grid pattern */}
      <G opacity="0.1">
        <Path
          d={`M0,0 L${width},0 L${width},${height} L0,${height} Z`}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1"
        />
        {Array.from({ length: Math.floor(width / 50) }, (_, i) => (
          <Path
            key={`v-${i}`}
            d={`M${i * 50},0 L${i * 50},${height}`}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: Math.floor(height / 50) }, (_, i) => (
          <Path
            key={`h-${i}`}
            d={`M0,${i * 50} L${width},${i * 50}`}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.5"
          />
        ))}
      </G>
    </Svg>
  </View>
);

const AnalyticsScreen: React.FC = () => {
  const { state } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const userRole = getUserRole(state.user);
  const dataFilterOptions = getDataFilterOptions(userRole);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDataRefresh = () => {
    console.log('Data refreshed');
  };

  return (
    <View style={styles.container}>
      {/* Rich Gradient Background */}
      <ExpoLinearGradient
        colors={['#F8FAFC', '#EFF6FF', '#F0F9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Background Pattern Overlay */}
      <View style={styles.backgroundContainer}>
        <BackgroundPattern />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text variant="displaySmall" style={styles.title}>
                📊 Analytics Dashboard
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Comprehensive insights and performance metrics
              </Text>
              <Text variant="bodySmall" style={styles.roleIndicator}>
                {getRoleDisplayNameWithHierarchy(userRole)} • {dataFilterOptions.canSeeAll ? 'All Data' : dataFilterOptions.canSeeTeam ? 'Team Data' : 'Own Data'}
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📈</Text>
            </View>
          </View>
        </View>

        {/* Analytics Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Bookings Analytics */}
          <StatusSummaryCard 
            type="bookings" 
            onRefresh={handleDataRefresh}
            style={styles.analyticsCard}
          />

          {/* Enquiries Analytics */}
          <StatusSummaryCard 
            type="enquiries" 
            onRefresh={handleDataRefresh}
            style={styles.analyticsCard}
          />

          {/* Performance Insights */}
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>💡 Key Insights</Text>
            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>🎯</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Conversion Rate</Text>
                <Text style={styles.insightDescription}>
                  Track enquiry to booking conversion rates
                </Text>
              </View>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>⏱️</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Response Time</Text>
                <Text style={styles.insightDescription}>
                  Monitor average response times
                </Text>
              </View>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>📅</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Delivery Tracking</Text>
                <Text style={styles.insightDescription}>
                  Track delivery timelines and delays
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>⚡ Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <View style={styles.quickActionItem}>
                <Text style={styles.quickActionIcon}>📊</Text>
                <Text style={styles.quickActionText}>Export Data</Text>
              </View>
              <View style={styles.quickActionItem}>
                <Text style={styles.quickActionIcon}>📈</Text>
                <Text style={styles.quickActionText}>View Trends</Text>
              </View>
              <View style={styles.quickActionItem}>
                <Text style={styles.quickActionIcon}>🎯</Text>
                <Text style={styles.quickActionText}>Set Goals</Text>
              </View>
              <View style={styles.quickActionItem}>
                <Text style={styles.quickActionIcon}>📋</Text>
                <Text style={styles.quickActionText}>Reports</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundPatternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  roleIndicator: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIconText: {
    fontSize: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  analyticsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  insightsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
