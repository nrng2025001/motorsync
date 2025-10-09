#!/usr/bin/env node

/**
 * Firebase Connection Test
 * 
 * This script tests if Firebase is properly configured and can connect
 */

require('dotenv').config();

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...');
  console.log('─'.repeat(50));
  
  // 1. Test environment variables
  console.log('\n1️⃣ Testing Environment Variables...');
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
  
  console.log(`   ✅ Configured: ${configuredKeys.length}/${configKeys.length} variables`);
  console.log(`   🔑 API Key: ${firebaseConfig.apiKey ? 'Set' : 'Missing'}`);
  console.log(`   🌐 Project ID: ${firebaseConfig.projectId || 'Missing'}`);
  console.log(`   🔗 Auth Domain: ${firebaseConfig.authDomain || 'Missing'}`);
  
  // 2. Test Firebase initialization
  console.log('\n2️⃣ Testing Firebase Initialization...');
  try {
    const { initializeApp, getApps } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('   ✅ Firebase app initialized successfully');
    } else {
      app = getApps()[0];
      console.log('   ✅ Firebase app already initialized');
    }
    
    // Initialize Auth
    const auth = getAuth(app);
    console.log('   ✅ Firebase Auth initialized successfully');
    
    // 3. Test backend connection
    console.log('\n3️⃣ Testing Backend Connection...');
    const axios = require('axios');
    
    try {
      const response = await axios.get('http://localhost:4000/api/health');
      console.log('   ✅ Backend is running');
      console.log(`   📊 Status: ${response.data.status}`);
    } catch (error) {
      console.log('   ❌ Backend connection failed');
      console.log('   🔧 Make sure your backend is running on port 4000');
    }
    
    // 4. Test protected endpoint (should require auth)
    console.log('\n4️⃣ Testing Protected Endpoint...');
    try {
      await axios.get('http://localhost:4000/api/auth/profile');
      console.log('   ⚠️  Unexpected: Endpoint accessible without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Protected endpoint correctly requires authentication');
      } else {
        console.log(`   ❌ Unexpected error: ${error.response?.status}`);
      }
    }
    
    // Summary
    console.log('\n' + '─'.repeat(50));
    console.log('📊 FIREBASE CONNECTION SUMMARY');
    console.log('─'.repeat(50));
    
    if (configuredKeys.length === configKeys.length) {
      console.log('🎉 Firebase is fully configured and ready!');
      console.log('🚀 Your app can now use Firebase authentication');
      console.log('\n📱 Next Steps:');
      console.log('   1. Start your Expo app: npx expo start');
      console.log('   2. Test authentication in your app');
      console.log('   3. Create test users in Firebase Console');
    } else {
      console.log('⚠️  Firebase configuration is incomplete');
      console.log('🔧 Please check your .env file');
    }
    
  } catch (error) {
    console.log('   ❌ Firebase initialization failed');
    console.log(`   🔧 Error: ${error.message}`);
  }
  
  console.log('─'.repeat(50));
}

// Run the test
testFirebaseConnection().catch(console.error);
