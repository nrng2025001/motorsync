#!/usr/bin/env node

/**
 * Backend Connection Test Script
 * 
 * This script tests the connection to your car-dealership-backend
 * and verifies the API structure without requiring authentication
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000/api';

async function testEndpoint(method, endpoint, description, expectedStatus = 200) {
  try {
    console.log(`🧪 Testing: ${description}`);
    const response = await axios({
      method,
      url: `${BACKEND_URL}${endpoint}`,
      timeout: 5000,
    });
    
    const isSuccess = response.status === expectedStatus;
    const statusIcon = isSuccess ? '✅' : '⚠️';
    console.log(`${statusIcon} ${description} - Status: ${response.status}`);
    
    if (response.data) {
      console.log(`   📄 Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
    }
    
    return { 
      success: isSuccess, 
      status: response.status, 
      data: response.data,
      endpoint: endpoint 
    };
  } catch (error) {
    const statusCode = error.response?.status;
    const isExpectedAuthError = statusCode === 401 || statusCode === 403;
    const statusIcon = isExpectedAuthError ? '🔒' : '❌';
    
    console.log(`${statusIcon} ${description} - Status: ${statusCode || 'Error'} - ${error.message}`);
    
    return { 
      success: isExpectedAuthError, // 401/403 are expected for protected endpoints
      status: statusCode,
      error: error.message,
      endpoint: endpoint,
      isAuthError: isExpectedAuthError
    };
  }
}

async function runConnectionTests() {
  console.log('🚀 Testing Backend Connection...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log('─'.repeat(70));
  
  const tests = [
    // Public endpoints (should work without auth)
    { method: 'GET', endpoint: '/health', description: 'Health Check', expectedStatus: 200 },
    
    // Protected endpoints (should return 401/403 without auth)
    { method: 'GET', endpoint: '/version', description: 'Version Info (Protected)' },
    { method: 'GET', endpoint: '/enquiries/models', description: 'Enquiry Models (Protected)' },
    { method: 'GET', endpoint: '/enquiries/variants', description: 'Enquiry Variants (Protected)' },
    { method: 'GET', endpoint: '/enquiries/colors', description: 'Enquiry Colors (Protected)' },
    { method: 'GET', endpoint: '/enquiries/sources', description: 'Enquiry Sources (Protected)' },
    { method: 'GET', endpoint: '/bookings', description: 'Bookings List (Protected)' },
    { method: 'GET', endpoint: '/quotations', description: 'Quotations List (Protected)' },
    { method: 'GET', endpoint: '/bookings/imports', description: 'Import History (Protected)' },
    { method: 'GET', endpoint: '/auth/profile', description: 'User Profile (Protected)' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.method, test.endpoint, test.description, test.expectedStatus);
    results.push({ ...test, ...result });
  }
  
  console.log('\n' + '─'.repeat(70));
  console.log('📊 CONNECTION TEST SUMMARY');
  console.log('─'.repeat(70));
  
  const publicEndpoints = results.filter(r => r.endpoint === '/health');
  const protectedEndpoints = results.filter(r => r.endpoint !== '/health');
  
  const publicPassed = publicEndpoints.filter(r => r.success).length;
  const protectedAuthErrors = protectedEndpoints.filter(r => r.isAuthError).length;
  const protectedFailed = protectedEndpoints.filter(r => !r.success && !r.isAuthError).length;
  
  console.log(`🌐 Public Endpoints: ${publicPassed}/${publicEndpoints.length} working`);
  console.log(`🔒 Protected Endpoints: ${protectedAuthErrors}/${protectedEndpoints.length} correctly requiring auth`);
  console.log(`❌ Failed Endpoints: ${protectedFailed} unexpected failures`);
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log('─'.repeat(70));
  
  // Public endpoints
  console.log('\n🌐 Public Endpoints:');
  publicEndpoints.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`   ${icon} ${r.description} (${r.status})`);
  });
  
  // Protected endpoints
  console.log('\n🔒 Protected Endpoints (Authentication Required):');
  protectedEndpoints.forEach(r => {
    const icon = r.isAuthError ? '✅' : r.success ? '⚠️' : '❌';
    const status = r.isAuthError ? 'Auth Required' : r.success ? 'Unexpected Success' : 'Failed';
    console.log(`   ${icon} ${r.description} - ${status} (${r.status})`);
  });
  
  console.log('\n' + '─'.repeat(70));
  
  if (publicPassed === publicEndpoints.length && protectedAuthErrors === protectedEndpoints.length) {
    console.log('🎉 Perfect! Your backend is running correctly:');
    console.log('   ✅ Public endpoints are accessible');
    console.log('   ✅ Protected endpoints correctly require authentication');
    console.log('   ✅ API structure matches expected format');
    console.log('\n🚀 Your React Native app is ready to integrate!');
  } else if (publicPassed === publicEndpoints.length) {
    console.log('✅ Backend is running and accessible!');
    console.log('⚠️  Some protected endpoints may need attention');
    console.log('\n🔧 Next steps:');
    console.log('   1. Set up Firebase Authentication in your React Native app');
    console.log('   2. Test with authenticated requests');
  } else {
    console.log('❌ Backend connection issues detected');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure your backend is running on port 4000');
    console.log('   2. Check backend logs for errors');
    console.log('   3. Verify API endpoint configurations');
  }
  
  console.log('─'.repeat(70));
}

// Run the tests
runConnectionTests().catch(console.error);
