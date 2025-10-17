#!/usr/bin/env node

/**
 * Firebase Token Test Script
 * 
 * This script tests Firebase authentication and token generation
 * to debug the backend authentication issue
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration from your app
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

async function testFirebaseToken() {
  try {
    console.log('🔥 Testing Firebase Authentication...');
    console.log('📋 Project ID:', firebaseConfig.projectId);
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test credentials (try both users)
    const testUsers = [
      { email: 'advisor.new@test.com', password: 'testpassword123' },
      { email: 'test@motorsync.com', password: 'TestPass123!' }
    ];
    
    console.log('🔐 Attempting to sign in...');
    
    let userCredential = null;
    let successfulUser = null;
    
    // Try different users
    for (const user of testUsers) {
      try {
        console.log(`🔑 Trying user: ${user.email}`);
        userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
        successfulUser = user;
        console.log('✅ Sign in successful!');
        break;
      } catch (error) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          console.log(`❌ Failed with user: ${user.email} - ${error.code}`);
          continue;
        } else {
          throw error;
        }
      }
    }
    
    if (!userCredential) {
      throw new Error('Could not sign in with any of the tested users');
    }
    console.log('✅ Sign in successful!');
    console.log('👤 User ID:', userCredential.user.uid);
    console.log('📧 Email:', userCredential.user.email);
    
    // Get the ID token
    console.log('🎫 Getting ID token...');
    const token = await userCredential.user.getIdToken();
    console.log('✅ Token obtained!');
    console.log('🎫 Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Test the token with the backend
    console.log('🌐 Testing token with backend...');
    const response = await fetch('https://automotive-backend-frqe.onrender.com/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('📡 Backend response status:', response.status);
    console.log('📡 Backend response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('🎉 SUCCESS! Token is valid and backend accepts it!');
    } else {
      console.log('❌ FAILED! Backend rejected the token.');
      console.log('🔍 This means the backend is configured for a different Firebase project.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n📝 SOLUTION:');
      console.log('1. Go to: https://console.firebase.google.com/');
      console.log('2. Select project: car-dealership-app-9f2d5');
      console.log('3. Go to Authentication → Users');
      console.log('4. Click "Add user"');
      console.log('5. Email: advisor@test.com');
      console.log('6. Password: TestPass123!');
      console.log('7. Click "Add user"');
    } else if (error.code === 'auth/wrong-password') {
      console.log('\n📝 SOLUTION:');
      console.log('1. Go to Firebase Console');
      console.log('2. Authentication → Users');
      console.log('3. Find advisor@test.com');
      console.log('4. Click ⋮ menu → Reset password');
      console.log('5. Set password: TestPass123!');
    }
  }
}

// Run the test
testFirebaseToken();
