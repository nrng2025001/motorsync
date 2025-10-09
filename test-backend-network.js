/**
 * Backend Network Connection Tester
 * Tests connection to backend server at 10.69.245.247:4000
 */

const axios = require('axios');

const BACKEND_IP = '10.69.245.247';
const BACKEND_PORT = '4000';
const BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}/api`;

console.log('🧪 Testing Backend Connection...');
console.log(`📡 Backend Server: ${BASE_URL}\n`);

// Test endpoints
const tests = [
  {
    name: 'Health Check',
    url: `${BASE_URL}/health`,
    method: 'GET'
  },
  {
    name: 'Create Test User',
    url: `${BASE_URL}/auth/test-user`,
    method: 'POST',
    data: {
      role: 'CUSTOMER_ADVISOR',
      email: 'advisor@test.com',
      name: 'Test Advisor'
    }
  },
  {
    name: 'List Enquiries',
    url: `${BASE_URL}/enquiries`,
    method: 'GET'
  },
  {
    name: 'List Bookings',
    url: `${BASE_URL}/bookings`,
    method: 'GET'
  },
  {
    name: 'Get Stock',
    url: `${BASE_URL}/stock`,
    method: 'GET'
  },
  {
    name: 'Get Quotations',
    url: `${BASE_URL}/quotations`,
    method: 'GET'
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.name}`);
      console.log(`   ${test.method} ${test.url}`);
      
      const config = {
        method: test.method,
        url: test.url,
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status
      };

      if (test.data) {
        config.data = test.data;
        config.headers = { 'Content-Type': 'application/json' };
      }

      const response = await axios(config);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`   ✅ SUCCESS - Status: ${response.status}`);
        if (response.data) {
          console.log(`   📦 Response:`, JSON.stringify(response.data).substring(0, 200));
        }
        passed++;
      } else {
        console.log(`   ⚠️  UNEXPECTED STATUS - ${response.status}`);
        console.log(`   Response:`, JSON.stringify(response.data).substring(0, 200));
        passed++;
      }
    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Backend server may not be accessible from this network`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`   💡 Connection timeout - check network connectivity`);
      }
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (passed > 0) {
    console.log('\n✅ Backend server is accessible!');
    console.log(`\n📱 Your React Native app should use:`);
    console.log(`   API URL: ${BASE_URL}`);
    console.log(`\n🔧 Configuration already set in .env file`);
  } else {
    console.log('\n❌ Cannot connect to backend server');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if backend server is running');
    console.log('   2. Verify IP address is correct (10.69.245.247)');
    console.log('   3. Ensure both machines are on same network');
    console.log('   4. Check firewall settings on backend machine');
    console.log('   5. Verify backend is listening on 0.0.0.0 (not just localhost)');
  }
}

runTests();

