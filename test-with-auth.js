#!/usr/bin/env node

/**
 * Authenticated Backend Test Script
 * 
 * This script shows how to test your backend with Firebase authentication
 * You'll need to get a Firebase ID token to use this
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000/api';

async function testWithAuth(firebaseToken) {
  console.log('🔐 Testing Backend with Firebase Authentication...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log(`🔑 Using Firebase Token: ${firebaseToken ? 'Yes' : 'No'}`);
  console.log('─'.repeat(70));
  
  if (!firebaseToken) {
    console.log('❌ No Firebase token provided');
    console.log('\n🔧 To get a Firebase token:');
    console.log('   1. Set up Firebase Authentication in your React Native app');
    console.log('   2. Sign in a user');
    console.log('   3. Get the ID token from Firebase Auth');
    console.log('   4. Use: node test-with-auth.js YOUR_FIREBASE_TOKEN');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  };
  
  const tests = [
    { method: 'GET', endpoint: '/auth/profile', description: 'User Profile' },
    { method: 'GET', endpoint: '/enquiries/models', description: 'Enquiry Models' },
    { method: 'GET', endpoint: '/enquiries/variants', description: 'Enquiry Variants' },
    { method: 'GET', endpoint: '/enquiries/colors', description: 'Enquiry Colors' },
    { method: 'GET', endpoint: '/enquiries/sources', description: 'Enquiry Sources' },
    { method: 'GET', endpoint: '/bookings', description: 'Bookings List' },
    { method: 'GET', endpoint: '/quotations', description: 'Quotations List' },
    { method: 'GET', endpoint: '/bookings/imports', description: 'Import History' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.description}`);
      const response = await axios({
        method: test.method,
        url: `${BACKEND_URL}${test.endpoint}`,
        headers,
        timeout: 10000,
      });
      
      console.log(`✅ ${test.description} - Status: ${response.status}`);
      if (response.data) {
        console.log(`   📄 Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
      }
      
      results.push({ ...test, success: true, status: response.status, data: response.data });
    } catch (error) {
      const statusCode = error.response?.status;
      console.log(`❌ ${test.description} - Status: ${statusCode} - ${error.message}`);
      results.push({ ...test, success: false, status: statusCode, error: error.message });
    }
  }
  
  console.log('\n' + '─'.repeat(70));
  console.log('📊 AUTHENTICATED TEST SUMMARY');
  console.log('─'.repeat(70));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`   • ${r.description}: ${r.error}`));
  }
  
  if (passed === results.length) {
    console.log('\n🎉 All authenticated endpoints working perfectly!');
    console.log('🚀 Your React Native app integration is complete!');
  } else {
    console.log('\n⚠️  Some endpoints need attention');
    console.log('🔧 Check your backend logs for more details');
  }
  
  console.log('─'.repeat(70));
}

// Get Firebase token from command line argument
const firebaseToken = process.argv[2];

if (!firebaseToken) {
  console.log('🔐 Firebase Authentication Test');
  console.log('─'.repeat(50));
  console.log('This script tests your backend with Firebase authentication');
  console.log('\nUsage:');
  console.log('  node test-with-auth.js YOUR_FIREBASE_TOKEN');
  console.log('\nTo get a Firebase token:');
  console.log('  1. Set up Firebase in your React Native app');
  console.log('  2. Sign in a user');
  console.log('  3. Get the ID token from Firebase Auth');
  console.log('  4. Run this script with the token');
  console.log('\nExample:');
  console.log('  node test-with-auth.js eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...');
} else {
  testWithAuth(firebaseToken).catch(console.error);
}
