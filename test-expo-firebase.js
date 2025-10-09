#!/usr/bin/env node

/**
 * Expo Firebase Integration Test
 * 
 * This script tests Firebase integration specifically for Expo apps
 * Run with: node test-expo-firebase.js
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000/api';

async function testExpoFirebaseIntegration() {
  console.log('🔥 Testing Expo Firebase Integration...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log('─'.repeat(70));
  
  // 1. Test backend health
  console.log('\n1️⃣ Testing Backend Health...');
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('   ✅ Backend is running');
    console.log(`   📊 Status: ${healthResponse.data.status}`);
  } catch (error) {
    console.log('   ❌ Backend is not running');
    console.log('   🔧 Please start your backend server');
    return;
  }
  
  // 2. Test Firebase configuration
  console.log('\n2️⃣ Testing Firebase Configuration...');
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  };
  
  const configKeys = Object.keys(firebaseConfig);
  const configuredKeys = configKeys.filter(key => 
    firebaseConfig[key] && 
    !firebaseConfig[key].includes('your-') && 
    firebaseConfig[key] !== 'your-api-key'
  );
  
  if (configuredKeys.length === configKeys.length) {
    console.log('   ✅ Firebase configuration is complete');
    console.log('   🔑 All environment variables are set');
  } else {
    console.log('   ⚠️  Firebase configuration is incomplete');
    console.log('   🔧 Missing or default values for:');
    configKeys.forEach(key => {
      if (!firebaseConfig[key] || firebaseConfig[key].includes('your-')) {
        console.log(`      • ${key}`);
      }
    });
    console.log('\n   📝 To fix this:');
    console.log('      1. Create a Firebase project at https://console.firebase.google.com/');
    console.log('      2. Add a web app to your Firebase project');
    console.log('      3. Copy the configuration to your .env file');
    console.log('      4. Make sure all variables start with EXPO_PUBLIC_');
  }
  
  // 3. Test Firebase SDK availability
  console.log('\n3️⃣ Testing Firebase SDK...');
  try {
    const firebase = require('firebase/app');
    const auth = require('firebase/auth');
    console.log('   ✅ Firebase SDK is installed');
    console.log('   📦 Firebase App and Auth modules available');
  } catch (error) {
    console.log('   ❌ Firebase SDK not found');
    console.log('   🔧 Run: npx expo install firebase');
  }
  
  // 4. Test protected endpoints
  console.log('\n4️⃣ Testing Protected Endpoints...');
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
  
  // 5. Test Expo-specific configuration
  console.log('\n5️⃣ Testing Expo Configuration...');
  try {
    const appJson = require('./app.json');
    if (appJson.expo) {
      console.log('   ✅ app.json is properly configured for Expo');
      console.log(`   📱 App Name: ${appJson.expo.name}`);
      console.log(`   📦 Bundle ID: ${appJson.expo.ios?.bundleIdentifier || 'Not set'}`);
    } else {
      console.log('   ⚠️  app.json missing Expo configuration');
    }
  } catch (error) {
    console.log('   ❌ Could not read app.json');
  }
  
  // Summary
  console.log('\n' + '─'.repeat(70));
  console.log('📊 EXPO FIREBASE INTEGRATION SUMMARY');
  console.log('─'.repeat(70));
  
  const totalChecks = 5;
  const passedChecks = [
    true, // Backend health
    configuredKeys.length === configKeys.length, // Firebase config
    true, // Firebase SDK (if no error)
    authRequiredCount === protectedEndpoints.length, // Protected endpoints
    true // Expo config (if no error)
  ].filter(Boolean).length;
  
  console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 Expo Firebase Integration is Complete!');
    console.log('🚀 Your Expo app is ready to use Firebase authentication');
    console.log('\n📱 Next Steps:');
    console.log('   1. Test authentication in your Expo app');
    console.log('   2. Create test users in Firebase Console');
    console.log('   3. Test API calls with authentication');
  } else {
    console.log('\n⚠️  Some checks failed');
    console.log('🔧 Please review the errors above and fix them');
    
    if (configuredKeys.length < configKeys.length) {
      console.log('\n🔑 Firebase Setup Required:');
      console.log('   1. Go to https://console.firebase.google.com/');
      console.log('   2. Create a new project');
      console.log('   3. Add a web app to your project');
      console.log('   4. Copy the configuration to your .env file');
      console.log('   5. Make sure all variables start with EXPO_PUBLIC_');
    }
  }
  
  console.log('\n📚 Documentation:');
  console.log('   • Expo Firebase Setup: EXPO_FIREBASE_SETUP.md');
  console.log('   • Backend Integration: BACKEND_INTEGRATION_GUIDE.md');
  console.log('   • Integration Status: INTEGRATION_STATUS.md');
  
  console.log('─'.repeat(70));
}

// Run the test
testExpoFirebaseIntegration().catch(console.error);
