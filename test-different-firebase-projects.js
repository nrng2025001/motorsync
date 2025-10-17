#!/usr/bin/env node

/**
 * Test Different Firebase Projects
 * 
 * This script tests common Firebase project configurations
 * to find which one the backend expects
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Common Firebase project configurations that the backend might expect
const possibleFirebaseProjects = [
  {
    name: 'automotive-backend',
    config: {
      apiKey: "AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE", // Using your existing API key
      authDomain: "automotive-backend.firebaseapp.com",
      projectId: "automotive-backend",
      storageBucket: "automotive-backend.firebasestorage.app",
      messagingSenderId: "768479850678",
      appId: "1:768479850678:web:automotive-backend"
    }
  },
  {
    name: 'motorsync-backend',
    config: {
      apiKey: "AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE",
      authDomain: "motorsync-backend.firebaseapp.com",
      projectId: "motorsync-backend",
      storageBucket: "motorsync-backend.firebasestorage.app",
      messagingSenderId: "768479850678",
      appId: "1:768479850678:web:motorsync-backend"
    }
  },
  {
    name: 'automotive-crm',
    config: {
      apiKey: "AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE",
      authDomain: "automotive-crm.firebaseapp.com",
      projectId: "automotive-crm",
      storageBucket: "automotive-crm.firebasestorage.app",
      messagingSenderId: "768479850678",
      appId: "1:768479850678:web:automotive-crm"
    }
  },
  {
    name: 'car-dealership-backend',
    config: {
      apiKey: "AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE",
      authDomain: "car-dealership-backend.firebaseapp.com",
      projectId: "car-dealership-backend",
      storageBucket: "car-dealership-backend.firebasestorage.app",
      messagingSenderId: "768479850678",
      appId: "1:768479850678:web:car-dealership-backend"
    }
  }
];

async function testFirebaseProject(projectConfig) {
  try {
    console.log(`\n🔥 Testing Firebase Project: ${projectConfig.name}`);
    console.log(`📋 Project ID: ${projectConfig.config.projectId}`);
    
    // Initialize Firebase
    const app = initializeApp(projectConfig.config);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test credentials
    const testEmail = 'test@motorsync.com';
    const testPassword = 'TestPass123!';
    
    console.log('🔐 Attempting to sign in...');
    console.log('📧 Email:', testEmail);
    
    // Try to sign in
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Sign in successful!');
    console.log('👤 User ID:', userCredential.user.uid);
    
    // Get the ID token
    console.log('🎫 Getting ID token...');
    const token = await userCredential.user.getIdToken();
    console.log('✅ Token obtained!');
    
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
      console.log(`🎉 SUCCESS! ${projectConfig.name} is the correct Firebase project!`);
      return { success: true, project: projectConfig.name };
    } else {
      console.log(`❌ FAILED! Backend rejected token from ${projectConfig.name}`);
      return { success: false, project: projectConfig.name };
    }
    
  } catch (error) {
    console.log(`❌ Error with ${projectConfig.name}: ${error.message}`);
    return { success: false, project: projectConfig.name, error: error.message };
  }
}

async function testAllProjects() {
  console.log('🔍 Testing Different Firebase Projects...');
  console.log('🎯 Goal: Find which Firebase project the backend expects');
  
  const results = [];
  
  for (const projectConfig of possibleFirebaseProjects) {
    const result = await testFirebaseProject(projectConfig);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 RESULTS SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const successfulProjects = results.filter(r => r.success);
  
  if (successfulProjects.length > 0) {
    console.log('✅ SUCCESSFUL PROJECTS:');
    successfulProjects.forEach(r => {
      console.log(`   🎉 ${r.project}`);
    });
  } else {
    console.log('❌ NO SUCCESSFUL PROJECTS FOUND');
    console.log('🔍 This means the backend is configured for a different Firebase project');
    console.log('📝 You need to either:');
    console.log('   1. Find the correct Firebase project name');
    console.log('   2. Update the backend to use your Firebase project (car-dealership-app-9f2d5)');
  }
  
  console.log('\n🔍 ALL RESULTS:');
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`   ${status} ${r.project}: ${r.error || (r.success ? 'Success' : 'Failed')}`);
  });
}

// Run the test
testAllProjects();
