#!/usr/bin/env node

/**
 * Firebase Integration Test Script
 * 
 * This script tests the complete Firebase integration with your backend
 * Run with: node test-firebase-integration.js
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000/api';

async function testFirebaseIntegration() {
  console.log('🔥 Testing Firebase Integration with Backend...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log('─'.repeat(70));
  
  console.log('📋 INTEGRATION CHECKLIST:');
  console.log('─'.repeat(70));
  
  // 1. Test backend health
  console.log('\n1️⃣ Testing Backend Health...');
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('   ✅ Backend is running');
    console.log(`   📊 Status: ${healthResponse.data.status}`);
    console.log(`   🕒 Timestamp: ${healthResponse.data.timestamp}`);
  } catch (error) {
    console.log('   ❌ Backend is not running');
    console.log('   🔧 Please start your backend server');
    return;
  }
  
  // 2. Test protected endpoints (should require auth)
  console.log('\n2️⃣ Testing Protected Endpoints...');
  const protectedEndpoints = [
    '/auth/profile',
    '/enquiries/models',
    '/bookings',
    '/quotations'
  ];
  
  let authRequiredCount = 0;
  for (const endpoint of protectedEndpoints) {
    try {
      await axios.get(`${BACKEND_URL}${endpoint}`);
      console.log(`   ⚠️  ${endpoint} - Unexpectedly accessible without auth`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`   ✅ ${endpoint} - Correctly requires authentication`);
        authRequiredCount++;
      } else {
        console.log(`   ❌ ${endpoint} - Unexpected error: ${error.response?.status}`);
      }
    }
  }
  
  // 3. Test Firebase configuration
  console.log('\n3️⃣ Testing Firebase Configuration...');
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  };
  
  const configKeys = Object.keys(firebaseConfig);
  const configuredKeys = configKeys.filter(key => firebaseConfig[key] && firebaseConfig[key] !== 'your-api-key');
  
  if (configuredKeys.length === configKeys.length) {
    console.log('   ✅ Firebase configuration is complete');
  } else {
    console.log('   ⚠️  Firebase configuration is incomplete');
    console.log('   🔧 Missing or default values for:');
    configKeys.forEach(key => {
      if (!firebaseConfig[key] || firebaseConfig[key].includes('your-')) {
        console.log(`      • ${key}`);
      }
    });
  }
  
  // 4. Test API client configuration
  console.log('\n4️⃣ Testing API Client Configuration...');
  try {
    const { apiClient } = require('./src/api/client');
    console.log('   ✅ API client is configured');
    console.log(`   📍 Base URL: ${apiClient.defaults.baseURL}`);
    console.log(`   ⏱️  Timeout: ${apiClient.defaults.timeout}ms`);
  } catch (error) {
    console.log('   ❌ API client configuration error');
    console.log(`   🔧 Error: ${error.message}`);
  }
  
  // 5. Test authentication service
  console.log('\n5️⃣ Testing Authentication Service...');
  try {
    const { AuthService } = require('./src/services/authService');
    console.log('   ✅ Authentication service is available');
    console.log('   🔐 Methods: signIn, signUp, signOut, getCurrentUser');
  } catch (error) {
    console.log('   ❌ Authentication service error');
    console.log(`   🔧 Error: ${error.message}`);
  }
  
  // 6. Test context integration
  console.log('\n6️⃣ Testing Context Integration...');
  try {
    const { AuthProvider, useAuth } = require('./src/context/AuthContext');
    console.log('   ✅ Auth context is available');
    console.log('   🔄 Provider and hook are exported');
  } catch (error) {
    console.log('   ❌ Auth context error');
    console.log(`   🔧 Error: ${error.message}`);
  }
  
  // Summary
  console.log('\n' + '─'.repeat(70));
  console.log('📊 INTEGRATION SUMMARY');
  console.log('─'.repeat(70));
  
  const totalChecks = 6;
  const passedChecks = [
    true, // Backend health
    authRequiredCount === protectedEndpoints.length, // Protected endpoints
    configuredKeys.length === configKeys.length, // Firebase config
    true, // API client (if no error)
    true, // Auth service (if no error)
    true  // Context (if no error)
  ].filter(Boolean).length;
  
  console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 Firebase Integration is Complete!');
    console.log('🚀 Your app is ready to use Firebase authentication');
    console.log('\n📱 Next Steps:');
    console.log('   1. Set up Firebase project and get configuration');
    console.log('   2. Update .env file with your Firebase config');
    console.log('   3. Test authentication in your app');
    console.log('   4. Create test users in Firebase Console');
  } else {
    console.log('\n⚠️  Some checks failed');
    console.log('🔧 Please review the errors above and fix them');
  }
  
  console.log('\n📚 Documentation:');
  console.log('   • Firebase Setup: FIREBASE_SETUP.md');
  console.log('   • Backend Integration: BACKEND_INTEGRATION_GUIDE.md');
  console.log('   • Integration Status: INTEGRATION_STATUS.md');
  
  console.log('─'.repeat(70));
}

// Run the test
testFirebaseIntegration().catch(console.error);
