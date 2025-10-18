import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  Chip,
  Icon,
  ProgressBar,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth, getRoleDisplayName } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';
import { useTeam, type TeamMember, canManageTeam } from '../../context/TeamContext';
import { theme, spacing } from '../../utils/theme';
import { formatCurrency } from '../../utils/formatting';

/**
 * Team Screen Component
 * Shows team hierarchy and member performance for managers
 */
export function TeamScreen({ navigation }: any): React.JSX.Element {
  const { state } = useAuth();
  const { getTeamHierarchy, getDirectReports } = useTeam();
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = state.user;
  const canManage = canManageTeam(getUserRole(currentUser));

  // Get team data
  const teamHierarchy = currentUser ? getTeamHierarchy(currentUser.firebaseUid) : null;
  const directReports = currentUser ? getDirectReports(currentUser.firebaseUid) : [];

  /**
   * Handle pull to refresh
   */
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  /**
   * Handle member profile view
   */
  const handleViewMemberProfile = (member: TeamMember) => {
    navigation.navigate('MemberProfile', { memberId: member.id });
  };

  /**
   * Get performance color based on target achievement
   */
  const getPerformanceColor = (achievement: number) => {
    if (achievement >= 90) return theme.colors.success;
    if (achievement >= 75) return theme.colors.warning;
    return theme.colors.error;
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'inactive': return theme.colors.error;
      case 'on_leave': return theme.colors.warning;
      default: return theme.colors.outline;
    }
  };

  /**
   * Get user initials
   */
  const getUserInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  if (!canManage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noAccessContainer}>
          <Icon source="account-lock" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleLarge" style={styles.noAccessTitle}>
            Access Restricted
          </Text>
          <Text variant="bodyMedium" style={styles.noAccessMessage}>
            Team management is only available for managers and team leads.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            My Team
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {getRoleDisplayName(getUserRole(currentUser))}
          </Text>
        </View>

        {/* Team Overview */}
        {teamHierarchy && (
          <Card style={styles.overviewCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.overviewTitle}>
                Team Overview
              </Text>
              
              <View style={styles.overviewMetrics}>
                <View style={styles.metricItem}>
                  <Text variant="headlineMedium" style={styles.metricValue}>
                    {teamHierarchy.totalTeamSize}
                  </Text>
                  <Text variant="bodySmall" style={styles.metricLabel}>
                    Team Members
                  </Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text variant="headlineMedium" style={styles.metricValue}>
                    {Math.round(teamHierarchy.teamPerformance.avgConversionRate)}%
                  </Text>
                  <Text variant="bodySmall" style={styles.metricLabel}>
                    Avg Conversion
                  </Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text variant="headlineMedium" style={styles.metricValue}>
                    {formatCurrency(teamHierarchy.teamPerformance.totalSales)}
                  </Text>
                  <Text variant="bodySmall" style={styles.metricLabel}>
                    Team Sales
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Team Members */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Team Members ({directReports.length})
          </Text>
          
          {directReports.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon source="account-group" size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No Team Members
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtitle}>
                  You don't have any direct reports at this time.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            directReports.map((member) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => handleViewMemberProfile(member)}
                activeOpacity={0.7}
              >
                <Card style={styles.memberCard}>
                  <Card.Content style={styles.memberContent}>
                    <View style={styles.memberRow}>
                      {/* Avatar */}
                      <Avatar.Text
                        size={56}
                        label={getUserInitials(member.name)}
                        style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                      />
                      
                      {/* Member Info */}
                      <View style={styles.memberInfo}>
                        <View style={styles.memberHeader}>
                          <Text variant="titleMedium" style={styles.memberName}>
                            {member.name}
                          </Text>
                          <Chip
                            mode="flat"
                            style={[styles.statusChip, { backgroundColor: `${getStatusColor(member.status)}20` }]}
                            textStyle={[styles.statusChipText, { color: getStatusColor(member.status) }]}
                          >
                            {member.status.replace('_', ' ').toUpperCase()}
                          </Chip>
                        </View>
                        
                        <Text variant="bodyMedium" style={styles.memberRole}>
                          {getRoleDisplayName(member.role)}
                        </Text>
                        
                        <Text variant="bodySmall" style={styles.memberLocation}>
                          📍 {member.contactInfo.location}
                        </Text>

                        {/* Performance Metrics */}
                        <View style={styles.performanceSection}>
                          <View style={styles.performanceRow}>
                            <View style={styles.performanceItem}>
                              <Text variant="bodySmall" style={styles.performanceLabel}>
                                Enquiries
                              </Text>
                              <Text variant="titleSmall" style={styles.performanceValue}>
                                {member.performance.enquiriesHandled}
                              </Text>
                            </View>
                            
                            <View style={styles.performanceItem}>
                              <Text variant="bodySmall" style={styles.performanceLabel}>
                                Conversion
                              </Text>
                              <Text variant="titleSmall" style={[
                                styles.performanceValue,
                                { color: getPerformanceColor(member.performance.conversionRate) }
                              ]}>
                                {member.performance.conversionRate}%
                              </Text>
                            </View>
                            
                            <View style={styles.performanceItem}>
                              <Text variant="bodySmall" style={styles.performanceLabel}>
                                Sales
                              </Text>
                              <Text variant="titleSmall" style={styles.performanceValue}>
                                {formatCurrency(member.performance.thisMonthSales)}
                              </Text>
                            </View>
                          </View>

                          {/* Target Achievement Progress */}
                          <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                              <Text variant="bodySmall" style={styles.progressLabel}>
                                Target Achievement
                              </Text>
                              <Text variant="bodySmall" style={[
                                styles.progressValue,
                                { color: getPerformanceColor(member.performance.targetAchievement) }
                              ]}>
                                {member.performance.targetAchievement}%
                              </Text>
                            </View>
                            <ProgressBar
                              progress={member.performance.targetAchievement / 100}
                              color={getPerformanceColor(member.performance.targetAchievement)}
                              style={styles.progressBar}
                            />
                          </View>
                        </View>

                        <View style={styles.memberFooter}>
                          <Text variant="bodySmall" style={styles.memberJoinDate}>
                            Joined: {new Date(member.joinDate).toLocaleDateString()}
                          </Text>
                          <Button
                            mode="outlined"
                            compact
                            onPress={() => handleViewMemberProfile(member)}
                            style={styles.viewProfileButton}
                            contentStyle={styles.viewProfileContent}
                          >
                            View Profile
                          </Button>
                        </View>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Team Performance Summary */}
        {teamHierarchy && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Team Performance Summary
              </Text>
              
              <View style={styles.summaryMetrics}>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Total Enquiries Handled:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {teamHierarchy.teamPerformance.totalEnquiries}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Total Quotations Created:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {teamHierarchy.teamPerformance.totalQuotations}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Total Bookings Managed:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {teamHierarchy.teamPerformance.totalBookings}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Team Sales This Month:
                  </Text>
                  <Text variant="titleMedium" style={styles.summaryTotalValue}>
                    {formatCurrency(teamHierarchy.teamPerformance.totalSales)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  overviewTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  overviewMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 2,
  },
  memberContent: {
    padding: spacing.lg,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  memberName: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  memberRole: {
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  memberLocation: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  performanceSection: {
    marginBottom: spacing.md,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceLabel: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  performanceValue: {
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  progressValue: {
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  memberFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  memberJoinDate: {
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  viewProfileButton: {
    borderRadius: 6,
  },
  viewProfileContent: {
    paddingHorizontal: spacing.sm,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  summaryMetrics: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  summaryValue: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  summaryTotalValue: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  noAccessTitle: {
    color: theme.colors.onSurface,
    marginVertical: spacing.md,
  },
  noAccessMessage: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    marginVertical: spacing.md,
  },
  emptySubtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
