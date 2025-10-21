import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-paper';

import { useAuth, type UserRole } from '../context/AuthContext';
import { getUserRole } from '../utils/roleUtils';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { EnquiriesScreen } from '../screens/enquiries/EnquiriesScreen';
import { EnquiryDetailsScreen } from '../screens/enquiries/EnquiryDetailsScreen';
import { NewEnquiryScreen } from '../screens/enquiries/NewEnquiryScreen';
import { QuotationsScreen } from '../screens/quotations/QuotationsScreen';
import { QuotationGeneratorScreen } from '../screens/quotations/QuotationGeneratorScreen';
import { QuotationDetailsScreen } from '../screens/quotations/QuotationDetailsScreen';
import { BookingsScreen } from '../screens/bookings/BookingsScreen';
import { BookingDetailsScreen } from '../screens/bookings/BookingDetailsScreen';
import { BookingUpdateScreen } from '../screens/bookings/BookingUpdateScreen';
import { TeamScreen } from '../screens/team/TeamScreen';
import { MemberProfileScreen } from '../screens/team/MemberProfileScreen';
import { AIAssistantScreen } from '../screens/ai/AIAssistantScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { BackendTestScreen } from '../screens/diagnostics/BackendTestScreen';
import { StockScreen } from '../screens/stock/StockScreen';
import { StockDetailScreen } from '../screens/stock/StockDetailScreen';
import { AddEditStockScreen } from '../screens/stock/AddEditStockScreen';
import { theme } from '../utils/theme';

/**
 * Main navigation parameter list for authenticated users
 */
export type MainTabParamList = {
  Dashboard: undefined;
  Enquiries: undefined;
  AIAssistant: undefined;
  QuotationGenerator: undefined;
  Profile: undefined;
  BackendTest: undefined;
};

/**
 * Stack navigation parameter list for main app screens
 */
export type MainStackParamList = {
  MainTabs: undefined;
  Notifications: undefined;
  EnquiryDetails: { enquiryId: string };
  BookingDetails: { bookingId: string };
  BookingUpdate: { bookingId: string; booking?: any };
  QuotationDetails: { quotationId: string };
  MemberProfile: { memberId: string };
  NewEnquiry: undefined;
  BackendTest: undefined;
  Stock: undefined;
  StockDetail: { vehicleId: string };
  AddEditStock: { vehicleId?: string };
  Bookings: undefined;
  Team: undefined;
  Quotations: undefined;
  QuotationGenerator: undefined;
  AIAssistant: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

/**
 * Get tab configuration based on user role
 * Different roles see different tabs and features
 */
function getTabsForRole(role: UserRole) {
  // Base tabs for all users
  const baseTabs: Array<{ name: keyof MainTabParamList; icon: string; label: string }> = [
    { name: 'Dashboard', icon: 'view-dashboard', label: 'Dashboard' },
    { name: 'Enquiries', icon: 'account-group', label: 'Enquiries' },
    { name: 'AIAssistant', icon: 'robot', label: 'AI Assistant' },
    { name: 'QuotationGenerator', icon: 'file-document', label: 'Quotations' },
    { name: 'Profile', icon: 'account', label: 'Profile' },
  ];

  // Add role-specific tabs
  // Users tab removed as it was causing issues

  if (role === 'ADMIN') {
    baseTabs.push({ name: 'BackendTest', icon: 'bug', label: 'Debug' });
  }

  return baseTabs;
}

/**
 * Main Tab Navigator with role-based tabs
 */
function MainTabNavigator(): React.JSX.Element {
  const { state } = useAuth();
  const userRole = getUserRole(state.user);
  const tabs = getTabsForRole(userRole);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const tab = tabs.find(t => t.name === route.name);
          const iconName = tab?.icon || 'help';
          
          return (
            <Icon
              source={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E3F2FD',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 12,
          height: 72,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false, // This hides the header titles
      })}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={getScreenComponent(tab.name)}
          options={{
            title: tab.label,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

/**
 * Get the appropriate screen component for each tab
 */
function getScreenComponent(tabName: string) {
  switch (tabName) {
    case 'Dashboard':
      return DashboardScreen;
    case 'Enquiries':
      return EnquiriesScreen;
    case 'AIAssistant':
      return AIAssistantScreen;
    case 'QuotationGenerator':
      return QuotationGeneratorScreen;
    case 'BackendTest':
      return BackendTestScreen;
    case 'Profile':
      return ProfileScreen;
    default:
      return DashboardScreen;
  }
}

/**
 * Main Navigator with stack structure
 * Wraps the tab navigator and can add modal screens
 */
export function MainNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EnquiryDetails" 
        component={EnquiryDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="BookingDetails" 
        component={BookingDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="BookingUpdate" 
        component={BookingUpdateScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="QuotationDetails" 
        component={QuotationDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="MemberProfile" 
        component={MemberProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Team" 
        component={TeamScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Quotations" 
        component={QuotationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="QuotationGenerator" 
        component={QuotationGeneratorScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="NewEnquiry" 
        component={NewEnquiryScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="BackendTest" 
        component={BackendTestScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Stock" 
        component={StockScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="AIAssistant" 
        component={AIAssistantScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="StockDetail" 
        component={StockDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="AddEditStock" 
        component={AddEditStockScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}