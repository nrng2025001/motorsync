#!/usr/bin/env node

/**
 * Quick Integration Test
 * 
 * This script quickly verifies that your integration is ready
 * Run with: node quick-test.js
 */

require('dotenv').config();
const axios = require('axios');

async function quickTest() {
  console.log('🚀 QUICK INTEGRATION TEST');
  console.log('═'.repeat(50));
  
  let passed = 0;
  let total = 0;
  
  // 1. Backend Health
  console.log('\n1️⃣ Backend Health Check...');
  try {
    const response = await axios.get('http://localhost:4000/api/health');
    console.log('✅ Backend is running');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Version: ${response.data.version}`);
    passed++;
  } catch (error) {
    console.log('❌ Backend is not running');
    console.log('   Please start your backend server');
    return;
  }
  total++;
  
  // 2. Firebase Configuration
  console.log('\n2️⃣ Firebase Configuration...');
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  };
  
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain) {
    console.log('✅ Firebase is configured');
    console.log(`   Project: ${firebaseConfig.projectId}`);
    passed++;
  } else {
    console.log('❌ Firebase configuration incomplete');
  }
  total++;
  
  // 3. Protected Endpoints
  console.log('\n3️⃣ Protected Endpoints...');
  const endpoints = ['/auth/profile', '/enquiries/models', '/bookings'];
  let authRequired = 0;
  
  for (const endpoint of endpoints) {
    try {
      await axios.get(`http://localhost:4000/api${endpoint}`);
      console.log(`⚠️  ${endpoint} - Unexpectedly accessible`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ ${endpoint} - Requires authentication`);
        authRequired++;
      }
    }
  }
  
  if (authRequired === endpoints.length) {
    console.log('✅ All protected endpoints require authentication');
    passed++;
  } else {
    console.log('⚠️  Some endpoints may not be properly protected');
  }
  total++;
  
  // 4. Firebase SDK
  console.log('\n4️⃣ Firebase SDK...');
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
    console.log('✅ Firebase SDK is ready');
    passed++;
  } catch (error) {
    console.log('❌ Firebase SDK error');
    console.log(`   Error: ${error.message}`);
  }
  total++;
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('═'.repeat(50));
  console.log(`✅ Passed: ${passed}/${total} tests`);
  console.log(`📈 Success Rate: ${Math.round((passed/total)*100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Your integration is ready!');
    console.log('\n📱 Next steps:');
    console.log('   1. Run: npx expo start');
    console.log('   2. Test authentication in your app');
    console.log('   3. Create test users in Firebase Console');
  } else {
    console.log('\n⚠️  Some tests failed');
    console.log('🔧 Please check the errors above');
  }
  
  console.log('═'.repeat(50));
}

// Run the quick test
quickTest().catch(console.error);
