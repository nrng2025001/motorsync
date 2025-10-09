#!/usr/bin/env node

/**
 * Backend Integration Test Script
 * 
 * This script tests the connection to your car-dealership-backend
 * Run with: node test-integration.js
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000/api';

async function testEndpoint(method, endpoint, description) {
  try {
    console.log(`🧪 Testing: ${description}`);
    const response = await axios({
      method,
      url: `${BACKEND_URL}${endpoint}`,
      timeout: 5000,
    });
    
    console.log(`✅ ${description} - Status: ${response.status}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Backend Integration Tests...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log('─'.repeat(60));
  
  const tests = [
    { method: 'GET', endpoint: '/health', description: 'Health Check' },
    { method: 'GET', endpoint: '/version', description: 'Version Info' },
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
    const result = await testEndpoint(test.method, test.endpoint, test.description);
    results.push({ ...test, ...result });
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('─'.repeat(60));
  
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
  
  console.log('─'.repeat(60));
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Your backend integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check your backend configuration.');
  }
}

// Run the tests
runTests().catch(console.error);
