/**
 * Debug Role Button Component
 * 
 * This component helps debug role fetching issues by testing the backend directly
 * and showing the actual response from the API.
 */

import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

export const DebugRoleButton: React.FC = () => {
  const { state: authState, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const testBackendRole = async () => {
    try {
      setLoading(true);
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'Not logged in');
        return;
      }
      
      console.log('🔍 Testing backend role fetching...');
      console.log('   Firebase UID:', user.uid);
      console.log('   Email:', user.email);
      
      // Force get fresh token
      const token = await user.getIdToken(true);
      console.log('   Token refreshed ✅');
      
      // Call backend directly
      const response = await fetch(
        'https://automotive-backend-frqe.onrender.com/api/auth/me',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      console.log('═══════════════════════════════════');
      console.log('BACKEND RESPONSE:');
      console.log(JSON.stringify(data, null, 2));
      console.log('═══════════════════════════════════');
      
      if (data.success && data.data?.user) {
        const backendRole = data.data.user.role.name;
        const backendRoleId = data.data.user.role.id;
        const backendDealership = data.data.user.dealership?.name;
        const backendEmployeeId = data.data.user.employeeId;
        
        Alert.alert(
          'Backend Test Results',
          `Email: ${data.data.user.email}\n` +
          `Name: ${data.data.user.name}\n` +
          `Role: ${backendRole}\n` +
          `Role ID: ${backendRoleId}\n` +
          `Employee ID: ${backendEmployeeId}\n` +
          `Dealership: ${backendDealership}`,
          [
            { 
              text: 'Update App State', 
              onPress: async () => {
                try {
                  await refreshProfile();
                  Alert.alert('Updated!', 'App state updated with backend data');
                } catch (error) {
                  Alert.alert('Error', 'Failed to update app state');
                }
              }
            },
            { text: 'Cancel' }
          ]
        );
      } else {
        Alert.alert('Error', data.error || data.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card style={{ margin: 16, padding: 16 }}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>
        🔍 Debug Role Testing
      </Text>
      
      <Text variant="bodySmall" style={{ marginBottom: 16, color: '#666' }}>
        Current App State:
      </Text>
      
      <Text variant="bodySmall" style={{ marginBottom: 4 }}>
        Role: {authState.user?.role?.name || 'undefined'}
      </Text>
      <Text variant="bodySmall" style={{ marginBottom: 4 }}>
        Employee ID: {authState.user?.employeeId || 'undefined'}
      </Text>
      <Text variant="bodySmall" style={{ marginBottom: 16 }}>
        Dealership: {authState.user?.dealership?.name || 'undefined'}
      </Text>
      
      <Button 
        mode="contained"
        onPress={testBackendRole}
        loading={loading}
        disabled={loading}
        style={{ marginBottom: 8 }}
      >
        Test Backend Role
      </Button>
      
      <Button 
        mode="outlined"
        onPress={refreshProfile}
        loading={authState.isLoading}
        disabled={authState.isLoading}
      >
        Refresh Profile
      </Button>
    </Card>
  );
};

export default DebugRoleButton;
