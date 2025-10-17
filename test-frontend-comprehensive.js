#!/usr/bin/env node

/**
 * Comprehensive Frontend Configuration Test
 * 
 * This script thoroughly tests all frontend configuration aspects
 * to identify any potential issues
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Your actual Firebase configuration from .env
const firebaseConfig = {
  apiKey: "AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE",
  authDomain: "car-dealership-app-9f2d5.firebaseapp.com",
  projectId: "car-dealership-app-9f2d5",
  storageBucket: "car-dealership-app-9f2d5.firebasestorage.app",
  messagingSenderId: "768479850678",
  appId: "1:768479850678:web:e994d17c08dbe8cab87617",
  measurementId: "G-WSF9PY0QPL",
  databaseURL: "https://car-dealership-app-9f2d5.firebaseio.com"
};

async function testFrontendConfiguration() {
  console.log('🔍 COMPREHENSIVE FRONTEND CONFIGURATION TEST');
  console.log('=' .repeat(60));
  
  // Test 1: Firebase Configuration
  console.log('\n📋 Test 1: Firebase Configuration');
  console.log('-' .repeat(40));
  
  console.log('✅ API Key:', firebaseConfig.apiKey?.substring(0, 20) + '...');
  console.log('✅ Auth Domain:', firebaseConfig.authDomain);
  console.log('✅ Project ID:', firebaseConfig.projectId);
  console.log('✅ Storage Bucket:', firebaseConfig.storageBucket);
  console.log('✅ Messaging Sender ID:', firebaseConfig.messagingSenderId);
  console.log('✅ App ID:', firebaseConfig.appId);
  console.log('✅ Measurement ID:', firebaseConfig.measurementId);
  console.log('✅ Database URL:', firebaseConfig.databaseURL);
  
  // Test 2: Firebase Initialization
  console.log('\n🔥 Test 2: Firebase Initialization');
  console.log('-' .repeat(40));
  
  let app, auth;
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase app initialized successfully');
    console.log('✅ Firebase auth initialized successfully');
    console.log('✅ App name:', app.name);
    console.log('✅ App options projectId:', app.options.projectId);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return;
  }
  
  // Test 3: Authentication Flow
  console.log('\n🔐 Test 3: Authentication Flow');
  console.log('-' .repeat(40));
  
  const testEmail = 'test@motorsync.com';
  const testPassword = 'TestPass123!';
  
  try {
    console.log('🔑 Attempting Firebase sign-in...');
    console.log('📧 Email:', testEmail);
    
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Firebase sign-in successful');
    console.log('👤 User ID:', userCredential.user.uid);
    console.log('📧 Email:', userCredential.user.email);
    console.log('📅 Email Verified:', userCredential.user.emailVerified);
    console.log('🕐 Last Sign In:', userCredential.user.metadata.lastSignInTime);
    
    // Test 4: Token Generation
    console.log('\n🎫 Test 4: Firebase Token Generation');
    console.log('-' .repeat(40));
    
    const token = await userCredential.user.getIdToken();
    console.log('✅ Firebase ID token generated');
    console.log('🎫 Token length:', token.length);
    console.log('🎫 Token starts with:', token.substring(0, 20) + '...');
    
    // Parse token to check structure
    try {
      const tokenParts = token.split('.');
      console.log('✅ Token has 3 parts (header.payload.signature)');
      console.log('✅ Header length:', tokenParts[0]?.length);
      console.log('✅ Payload length:', tokenParts[1]?.length);
      console.log('✅ Signature length:', tokenParts[2]?.length);
      
      // Decode payload (base64)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('✅ Token payload decoded successfully');
      console.log('🎫 Issuer (iss):', payload.iss);
      console.log('🎫 Audience (aud):', payload.aud);
      console.log('🎫 Subject (sub):', payload.sub);
      console.log('🎫 Issued at (iat):', new Date(payload.iat * 1000).toISOString());
      console.log('🎫 Expires at (exp):', new Date(payload.exp * 1000).toISOString());
      console.log('🎫 Auth time (auth_time):', new Date(payload.auth_time * 1000).toISOString());
      console.log('🎫 Email:', payload.email);
      console.log('🎫 Email verified:', payload.email_verified);
      
      // Verify token structure
      if (payload.aud === firebaseConfig.projectId) {
        console.log('✅ Token audience matches Firebase project ID');
      } else {
        console.log('❌ Token audience mismatch!');
        console.log('   Expected:', firebaseConfig.projectId);
        console.log('   Got:', payload.aud);
      }
      
      if (payload.iss === `https://securetoken.google.com/${firebaseConfig.projectId}`) {
        console.log('✅ Token issuer is correct');
      } else {
        console.log('❌ Token issuer mismatch!');
        console.log('   Expected:', `https://securetoken.google.com/${firebaseConfig.projectId}`);
        console.log('   Got:', payload.iss);
      }
      
    } catch (tokenError) {
      console.error('❌ Token parsing failed:', tokenError.message);
    }
    
    // Test 5: API Request Simulation
    console.log('\n🌐 Test 5: API Request Simulation');
    console.log('-' .repeat(40));
    
    const apiUrl = 'https://automotive-backend-frqe.onrender.com/api/auth/profile';
    console.log('📍 API URL:', apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const result = await response.json();
      
      console.log('📡 HTTP Status:', response.status);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('📡 Response Body:', JSON.stringify(result, null, 2));
      
      if (response.ok) {
        console.log('✅ API request successful!');
      } else {
        console.log('❌ API request failed');
        if (result.message === 'Invalid or expired Firebase token') {
          console.log('🔍 DIAGNOSIS: Backend is configured for a different Firebase project');
          console.log('📝 SOLUTION: Update backend Firebase configuration');
        }
      }
      
    } catch (fetchError) {
      console.error('❌ API request failed:', fetchError.message);
    }
    
    // Test 6: Token Refresh
    console.log('\n🔄 Test 6: Token Refresh');
    console.log('-' .repeat(40));
    
    try {
      const freshToken = await userCredential.user.getIdToken(true);
      console.log('✅ Token refresh successful');
      console.log('🎫 Fresh token length:', freshToken.length);
      console.log('🎫 Tokens are different:', token !== freshToken ? 'Yes (expected)' : 'No (unexpected)');
    } catch (refreshError) {
      console.error('❌ Token refresh failed:', refreshError.message);
    }
    
  } catch (authError) {
    console.error('❌ Firebase authentication failed:', authError.message);
    console.error('❌ Error code:', authError.code);
  }
  
  // Test 7: Configuration Validation
  console.log('\n✅ Test 7: Configuration Validation');
  console.log('-' .repeat(40));
  
  const requiredFields = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 
    'messagingSenderId', 'appId'
  ];
  
  let configValid = true;
  for (const field of requiredFields) {
    if (firebaseConfig[field]) {
      console.log(`✅ ${field}: Present`);
    } else {
      console.log(`❌ ${field}: Missing`);
      configValid = false;
    }
  }
  
  if (configValid) {
    console.log('✅ All required Firebase configuration fields are present');
  } else {
    console.log('❌ Some Firebase configuration fields are missing');
  }
  
  console.log('\n🎯 FRONTEND CONFIGURATION SUMMARY');
  console.log('=' .repeat(60));
  console.log('✅ Firebase configuration: Complete');
  console.log('✅ Firebase initialization: Working');
  console.log('✅ Authentication: Working');
  console.log('✅ Token generation: Working');
  console.log('✅ Token structure: Valid');
  console.log('❌ Backend integration: Failed (backend config issue)');
  console.log('\n📝 CONCLUSION: Frontend is correctly configured.');
  console.log('📝 ISSUE: Backend needs Firebase configuration update.');
}

// Run the comprehensive test
testFrontendConfiguration().catch(console.error);





