import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Divider,
  Switch,
  Avatar,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth, getRoleDisplayName } from '../../context/AuthContext';
import { theme, spacing } from '../../utils/theme';

/**
 * Profile Screen Component
 * Displays user profile, settings, and role management
 */
export function ProfileScreen(): React.JSX.Element {
  const { state, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const user = state.user;

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };


  /**
   * Handle settings action
   */
  const handleSettingsAction = (action: string) => {
    Alert.alert(
      'Settings',
      `This would open the ${action} settings. In the full implementation, this would navigate to the appropriate settings screen.`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium">User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header */}
        <Surface style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={getUserInitials()}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          />
          <Text variant="headlineSmall" style={styles.userName}>
            {user.name}
          </Text>
          <Text variant="titleMedium" style={styles.userRole}>
            {getRoleDisplayName(user.role.name)}
          </Text>
          <Text variant="bodyMedium" style={styles.userEmail}>
            {user.email}
          </Text>
          {user.department && (
            <Text variant="bodySmall" style={styles.userDepartment}>
              {user.department} Department
            </Text>
          )}
        </Surface>


        {/* App Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              App Settings
            </Text>
          </Card.Content>
          
          <List.Item
            title="Push Notifications"
            description="Receive notifications for new enquiries and updates"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Dark Mode"
            description="Use dark theme throughout the app"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Auto Sync"
            description="Automatically sync data when connected"
            left={props => <List.Icon {...props} icon="sync" />}
            right={() => (
              <Switch
                value={autoSyncEnabled}
                onValueChange={setAutoSyncEnabled}
                color={theme.colors.primary}
              />
            )}
          />
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <List.Item
            title="Performance Analytics"
            description="View your sales performance and metrics"
            left={props => <List.Icon {...props} icon="chart-line" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSettingsAction('analytics')}
          />
          
          <Divider />
          
          <List.Item
            title="Customer Management"
            description="Manage your customer database"
            left={props => <List.Icon {...props} icon="account-group" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSettingsAction('customers')}
          />
          
          <Divider />
          
          <List.Item
            title="Export Data"
            description="Export your data for reporting"
            left={props => <List.Icon {...props} icon="download" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSettingsAction('export')}
          />
          
          <Divider />
          
          <List.Item
            title="Help & Support"
            description="Get help and contact support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSettingsAction('support')}
          />
          
          <Divider />
          
          <List.Item
            title="About"
            description="App version and information"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSettingsAction('about')}
          />
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          textColor={theme.colors.error}
          buttonColor="transparent"
        >
          Logout
        </Button>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text variant="bodySmall" style={styles.appInfoText}>
            MotorSync v1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.appInfoText}>
            Built with React Native & Expo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    padding: spacing.lg,
    borderRadius: theme.roundness,
    alignItems: 'center',
    marginBottom: spacing.lg,
    elevation: 1,
  },
  avatar: {
    marginBottom: spacing.md,
  },
  userName: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userRole: {
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userEmail: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userDepartment: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  actionsCard: {
    marginBottom: spacing.lg,
    elevation: 2,
  },
  settingsCard: {
    marginBottom: spacing.lg,
    elevation: 2,
  },
  menuCard: {
    marginBottom: spacing.lg,
    elevation: 2,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  singleActionContainer: {
    alignItems: 'center',
  },
  singleActionButton: {
    minWidth: 200,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: spacing.xs,
  },
  logoutButton: {
    marginVertical: spacing.lg,
    borderColor: theme.colors.error,
  },
  logoutButtonContent: {
    paddingVertical: spacing.sm,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  appInfoText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});
