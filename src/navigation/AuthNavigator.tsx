import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { LoginScreen } from '../screens/auth/LoginScreen';

/**
 * Authentication navigation parameter list
 */
export type AuthStackParamList = {
  Login: undefined;
  // Add more auth screens here if needed (Register, ForgotPassword, etc.)
};

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Authentication Navigator
 * Handles all authentication-related screens
 */
export function AuthNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FAFAFA' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
