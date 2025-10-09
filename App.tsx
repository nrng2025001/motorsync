import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { TeamProvider } from './src/context/TeamContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/utils/theme';

/**
 * Main App component that sets up the navigation, theme, and context providers
 * This is the root component of the Automotive CRM application
 */
export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <TeamProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </TeamProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
