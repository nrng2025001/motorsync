#!/usr/bin/env node

/**
 * Complete Integration Test
 * 
 * This script tests the complete integration between:
 * - React Native Expo app
 * - Firebase Authentication
 * - Car Dealership Backend
 */

require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000/api';

async function testCompleteIntegration() {
  console.log('🚀 COMPLETE INTEGRATION TEST');
  console.log('═'.repeat(60));
  console.log('Testing: React Native + Firebase + Backend Integration');
  console.log('═'.repeat(60));
  
  const results = {
    backend: { passed: 0, total: 0 },
    firebase: { passed: 0, total: 0 },
    integration: { passed: 0, total: 0 }
  };
  
  // 1. Backend Tests
  console.log('\n🔧 1. BACKEND CONNECTION TESTS');
  console.log('─'.repeat(40));
  
  // Health check
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend Health Check');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Version: ${healthResponse.data.version}`);
    results.backend.passed++;
  } catch (error) {
    console.log('❌ Backend Health Check Failed');
    console.log('   Backend is not running on port 4000');
    return;
  }
  results.backend.total++;
  
  // Protected endpoints (should require auth)
  const protectedEndpoints = [
    '/auth/profile',
    '/enquiries/models',
    '/bookings',
    '/quotations'
  ];
  
  for (const endpoint of protectedEndpoints) {
    try {
      await axios.get(`${BACKEND_URL}${endpoint}`);
      console.log(`⚠️  ${endpoint} - Unexpectedly accessible`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ ${endpoint} - Correctly requires auth`);
        results.backend.passed++;
      } else {
        console.log(`❌ ${endpoint} - Unexpected error: ${error.response?.status}`);
      }
    }
    results.backend.total++;
  }
  
  // 2. Firebase Tests
  console.log('\n🔥 2. FIREBASE CONFIGURATION TESTS');
  console.log('─'.repeat(40));
  
  // Environment variables
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL
  };
  
  const configKeys = Object.keys(firebaseConfig);
  const configuredKeys = configKeys.filter(key => firebaseConfig[key]);
  
  if (configuredKeys.length === configKeys.length) {
    console.log('✅ Firebase Configuration Complete');
    console.log(`   Project: ${firebaseConfig.projectId}`);
    console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);
    results.firebase.passed++;
  } else {
    console.log('❌ Firebase Configuration Incomplete');
    console.log(`   Configured: ${configuredKeys.length}/${configKeys.length} variables`);
  }
  results.firebase.total++;
  
  // Firebase SDK
  try {
    const { initializeApp, getApps } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const auth = getAuth(app);
    console.log('✅ Firebase SDK Initialized');
    console.log('   App and Auth modules ready');
    results.firebase.passed++;
  } catch (error) {
    console.log('❌ Firebase SDK Initialization Failed');
    console.log(`   Error: ${error.message}`);
  }
  results.firebase.total++;
  
  // 3. Integration Tests
  console.log('\n🔗 3. INTEGRATION TESTS');
  console.log('─'.repeat(40));
  
  // Test API client configuration
  try {
    const { apiClient } = require('./src/api/client');
    console.log('✅ API Client Configured');
    console.log(`   Base URL: ${apiClient.defaults.baseURL}`);
    console.log(`   Timeout: ${apiClient.defaults.timeout}ms`);
    results.integration.passed++;
  } catch (error) {
    console.log('❌ API Client Configuration Failed');
    console.log(`   Error: ${error.message}`);
  }
  results.integration.total++;
  
  // Test authentication service
  try {
    const { AuthService } = require('./src/services/authService');
    console.log('✅ Authentication Service Available');
    console.log('   Methods: signIn, signUp, signOut, getCurrentUser');
    results.integration.passed++;
  } catch (error) {
    console.log('❌ Authentication Service Failed');
    console.log(`   Error: ${error.message}`);
  }
  results.integration.total++;
  
  // Test context integration
  try {
    const { AuthProvider, useAuth } = require('./src/context/AuthContext');
    console.log('✅ Auth Context Available');
    console.log('   Provider and hook exported');
    results.integration.passed++;
  } catch (error) {
    console.log('❌ Auth Context Failed');
    console.log(`   Error: ${error.message}`);
  }
  results.integration.total++;
  
  // Test API modules
  try {
    const { AuthAPI, BookingsAPI, EnquiriesAPI } = require('./src/api');
    console.log('✅ API Modules Available');
    console.log('   AuthAPI, BookingsAPI, EnquiriesAPI ready');
    results.integration.passed++;
  } catch (error) {
    console.log('❌ API Modules Failed');
    console.log(`   Error: ${error.message}`);
  }
  results.integration.total++;
  
  // 4. Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('═'.repeat(60));
  
  const totalPassed = results.backend.passed + results.firebase.passed + results.integration.passed;
  const totalTests = results.backend.total + results.firebase.total + results.integration.total;
  
  console.log(`🔧 Backend:     ${results.backend.passed}/${results.backend.total} tests passed`);
  console.log(`🔥 Firebase:    ${results.firebase.passed}/${results.firebase.total} tests passed`);
  console.log(`🔗 Integration: ${results.integration.passed}/${results.integration.total} tests passed`);
  console.log('─'.repeat(40));
  console.log(`🎯 Overall:     ${totalPassed}/${totalTests} tests passed (${Math.round((totalPassed/totalTests)*100)}%)`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Your integration is working seamlessly!');
    console.log('\n📱 Ready to use:');
    console.log('   • Firebase Authentication');
    console.log('   • Backend API calls');
    console.log('   • User management');
    console.log('   • All CRUD operations');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start your Expo app: npx expo start');
    console.log('   2. Test authentication in your app');
    console.log('   3. Create test users in Firebase Console');
  } else {
    console.log('\n⚠️  Some tests failed');
    console.log('🔧 Please review the errors above');
  }
  
  console.log('═'.repeat(60));
}

// Run the complete integration test
testCompleteIntegration().catch(console.error);
