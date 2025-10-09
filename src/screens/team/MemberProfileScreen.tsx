import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTeam, type TeamMember } from '../../context/TeamContext';
import { getRoleDisplayName } from '../../context/AuthContext';
import { theme, spacing } from '../../utils/theme';
import { formatCurrency } from '../../utils/formatting';

/**
 * Member Profile Screen Component
 * Shows detailed team member information and performance
 */
export function MemberProfileScreen({ route, navigation }: any): React.JSX.Element {
  const memberId = route?.params?.memberId || '8';
  const { getTeamMember } = useTeam();
  const [member] = useState<TeamMember | null>(getTeamMember(memberId));

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium">Member not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Get performance color
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

  /**
   * Handle contact member
   */
  const handleContactMember = (method: 'email' | 'phone') => {
    if (method === 'email') {
      Alert.alert('Email', `This would open email client to contact ${member.email}`);
    } else {
      Alert.alert('Phone', `This would initiate call to ${member.contactInfo.phone}`);
    }
  };

  /**
   * Handle assign task
   */
  const handleAssignTask = () => {
    Alert.alert('Assign Task', `This would open task assignment for ${member.name}`);
  };

  /**
   * Calculate performance trend
   */
  const getPerformanceTrend = () => {
    const change = ((member.performance.thisMonthSales - member.performance.lastMonthSales) / member.performance.lastMonthSales) * 100;
    return {
      percentage: Math.abs(Math.round(change)),
      isPositive: change > 0,
    };
  };

  const performanceTrend = getPerformanceTrend();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineLarge" style={styles.headerTitle}>
          Team Member
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Text
                size={80}
                label={getUserInitials(member.name)}
                style={[styles.profileAvatar, { backgroundColor: theme.colors.primary }]}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.memberName}>
                  {member.name}
                </Text>
                <Text variant="titleMedium" style={styles.memberRole}>
                  {getRoleDisplayName(member.role)}
                </Text>
                <Text variant="bodyMedium" style={styles.memberDepartment}>
                  {member.department} Department
                </Text>
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: `${getStatusColor(member.status)}20` }]}
                  textStyle={[styles.statusChipText, { color: getStatusColor(member.status) }]}
                >
                  {member.status.replace('_', ' ').toUpperCase()}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Contact Information
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon source="email" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Email
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {member.email}
              </Text>
            </View>
            <Button
              mode="outlined"
              compact
              onPress={() => handleContactMember('email')}
              style={styles.contactButton}
            >
              Email
            </Button>
          </View>

          {member.contactInfo.phone && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon source="phone" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Phone
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {member.contactInfo.phone}
                  {member.contactInfo.extension && ` ext. ${member.contactInfo.extension}`}
                </Text>
              </View>
              <Button
                mode="outlined"
                compact
                onPress={() => handleContactMember('phone')}
                style={styles.contactButton}
              >
                Call
              </Button>
            </View>
          )}

          {member.contactInfo.location && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon source="map-marker" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Location
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {member.contactInfo.location}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Performance Metrics
          </Text>

          {/* Key Performance Cards */}
          <View style={styles.performanceGrid}>
            <Card style={styles.performanceCard}>
              <Card.Content style={styles.performanceCardContent}>
                <Icon source="account-group" size={24} color={theme.colors.primary} />
                <Text variant="headlineMedium" style={styles.performanceNumber}>
                  {member.performance.enquiriesHandled}
                </Text>
                <Text variant="bodySmall" style={styles.performanceLabel}>
                  Enquiries Handled
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.performanceCard}>
              <Card.Content style={styles.performanceCardContent}>
                <Icon source="file-document" size={24} color={theme.colors.tertiary} />
                <Text variant="headlineMedium" style={styles.performanceNumber}>
                  {member.performance.quotationsCreated}
                </Text>
                <Text variant="bodySmall" style={styles.performanceLabel}>
                  Quotations Created
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.performanceCard}>
              <Card.Content style={styles.performanceCardContent}>
                <Icon source="calendar-check" size={24} color={theme.colors.success} />
                <Text variant="headlineMedium" style={styles.performanceNumber}>
                  {member.performance.bookingsManaged}
                </Text>
                <Text variant="bodySmall" style={styles.performanceLabel}>
                  Bookings Managed
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.performanceCard}>
              <Card.Content style={styles.performanceCardContent}>
                <Icon source="trending-up" size={24} color={getPerformanceColor(member.performance.conversionRate)} />
                <Text variant="headlineMedium" style={[
                  styles.performanceNumber,
                  { color: getPerformanceColor(member.performance.conversionRate) }
                ]}>
                  {member.performance.conversionRate}%
                </Text>
                <Text variant="bodySmall" style={styles.performanceLabel}>
                  Conversion Rate
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Sales Performance */}
          <Card style={styles.salesCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.salesTitle}>
                Sales Performance
              </Text>
              
              <View style={styles.salesRow}>
                <View style={styles.salesItem}>
                  <Text variant="bodySmall" style={styles.salesLabel}>
                    This Month
                  </Text>
                  <Text variant="headlineSmall" style={styles.salesValue}>
                    {formatCurrency(member.performance.thisMonthSales)}
                  </Text>
                </View>
                
                <View style={styles.salesTrend}>
                  <Icon
                    source={performanceTrend.isPositive ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={performanceTrend.isPositive ? theme.colors.success : theme.colors.error}
                  />
                  <Text style={[
                    styles.trendText,
                    { color: performanceTrend.isPositive ? theme.colors.success : theme.colors.error }
                  ]}>
                    {performanceTrend.percentage}%
                  </Text>
                </View>
              </View>

              <Text variant="bodySmall" style={styles.lastMonthText}>
                Last Month: {formatCurrency(member.performance.lastMonthSales)}
              </Text>

              {/* Target Achievement */}
              <View style={styles.targetSection}>
                <View style={styles.targetHeader}>
                  <Text variant="bodyMedium" style={styles.targetLabel}>
                    Target Achievement
                  </Text>
                  <Text variant="titleMedium" style={[
                    styles.targetValue,
                    { color: getPerformanceColor(member.performance.targetAchievement) }
                  ]}>
                    {member.performance.targetAchievement}%
                  </Text>
                </View>
                <ProgressBar
                  progress={member.performance.targetAchievement / 100}
                  color={getPerformanceColor(member.performance.targetAchievement)}
                  style={styles.targetProgressBar}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Additional Metrics */}
          <Card style={styles.additionalCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.additionalTitle}>
                Additional Metrics
              </Text>
              
              <View style={styles.additionalRow}>
                <Text variant="bodyMedium" style={styles.additionalLabel}>
                  Average Response Time:
                </Text>
                <Text variant="bodyMedium" style={styles.additionalValue}>
                  {member.performance.avgResponseTime}
                </Text>
              </View>
              
              <View style={styles.additionalRow}>
                <Text variant="bodyMedium" style={styles.additionalLabel}>
                  Customer Rating:
                </Text>
                <View style={styles.ratingContainer}>
                  <Text variant="bodyMedium" style={styles.additionalValue}>
                    {member.performance.customerRating}/5.0
                  </Text>
                  <Icon source="star" size={16} color={theme.colors.tertiary} />
                </View>
              </View>
              
              <View style={styles.additionalRow}>
                <Text variant="bodyMedium" style={styles.additionalLabel}>
                  Join Date:
                </Text>
                <Text variant="bodyMedium" style={styles.additionalValue}>
                  {new Date(member.joinDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Actions
          </Text>

          <Button
            mode="contained"
            onPress={handleAssignTask}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="clipboard-plus"
          >
            Assign Task
          </Button>

          <Button
            mode="outlined"
            onPress={() => handleContactMember('email')}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="email-send"
          >
            Send Message
          </Button>

          <Button
            mode="outlined"
            onPress={() => Alert.alert('Schedule Meeting', `This would schedule a meeting with ${member.name}`)}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="calendar-plus"
          >
            Schedule Meeting
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  headerTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  profileContent: {
    padding: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  memberName: {
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  memberRole: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  memberDepartment: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  infoValue: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  contactButton: {
    borderRadius: 6,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  performanceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
  },
  performanceCardContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  performanceNumber: {
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
  performanceLabel: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  salesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  salesTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  salesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  salesItem: {
    flex: 1,
  },
  salesLabel: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  salesValue: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  salesTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  lastMonthText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  targetSection: {
    marginTop: spacing.md,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  targetLabel: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  targetValue: {
    fontWeight: '700',
  },
  targetProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  additionalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
  },
  additionalTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  additionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  additionalLabel: {
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  additionalValue: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
