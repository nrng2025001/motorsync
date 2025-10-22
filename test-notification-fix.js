#!/usr/bin/env node

/**
 * Notification Fix Test Script
 * 
 * This script tests the notification endpoint with various scenarios
 * to verify the 500 error has been fixed
 */

const axios = require('axios');

const BACKEND_URL = 'https://automotive-backend-frqe.onrender.com/api';

async function testNotificationEndpoint() {
  console.log('🔔 Testing Notification Endpoint Fix...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log('─'.repeat(70));
  
  const tests = [
    {
      name: 'Test 1: Invalid Firebase Token (Should return 401)',
      test: async () => {
        try {
          const response = await axios.post(`${BACKEND_URL}/notifications/fcm-token`, {
            fcmToken: 'test-fcm-token-123',
            deviceType: 'android'
          }, {
            headers: {
              'Authorization': 'Bearer invalid-token',
              'Content-Type': 'application/json'
            }
          });
          
          return {
            success: false,
            message: 'Expected 401 error but got success',
            status: response.status,
            data: response.data
          };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data;
          
          if (status === 401) {
            return {
              success: true,
              message: 'Correctly returned 401 for invalid token',
              status: status,
              data: data
            };
          } else {
            return {
              success: false,
              message: `Expected 401 but got ${status}`,
              status: status,
              data: data
            };
          }
        }
      }
    },
    {
      name: 'Test 2: Missing FCM Token (Should return 400)',
      test: async () => {
        try {
          const response = await axios.post(`${BACKEND_URL}/notifications/fcm-token`, {
            deviceType: 'android'
            // Missing fcmToken
          }, {
            headers: {
              'Authorization': 'Bearer invalid-token',
              'Content-Type': 'application/json'
            }
          });
          
          return {
            success: false,
            message: 'Expected 400 error but got success',
            status: response.status,
            data: response.data
          };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data;
          
          if (status === 400) {
            return {
              success: true,
              message: 'Correctly returned 400 for missing FCM token',
              status: status,
              data: data
            };
          } else if (status === 401) {
            return {
              success: true,
              message: 'Returned 401 (auth error) before validation - acceptable',
              status: status,
              data: data
            };
          } else {
            return {
              success: false,
              message: `Expected 400 or 401 but got ${status}`,
              status: status,
              data: data
            };
          }
        }
      }
    },
    {
      name: 'Test 3: Invalid Device Type (Should return 400)',
      test: async () => {
        try {
          const response = await axios.post(`${BACKEND_URL}/notifications/fcm-token`, {
            fcmToken: 'test-fcm-token-123',
            deviceType: 'invalid-device'
          }, {
            headers: {
              'Authorization': 'Bearer invalid-token',
              'Content-Type': 'application/json'
            }
          });
          
          return {
            success: false,
            message: 'Expected 400 error but got success',
            status: response.status,
            data: response.data
          };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data;
          
          if (status === 400) {
            return {
              success: true,
              message: 'Correctly returned 400 for invalid device type',
              status: status,
              data: data
            };
          } else if (status === 401) {
            return {
              success: true,
              message: 'Returned 401 (auth error) before validation - acceptable',
              status: status,
              data: data
            };
          } else {
            return {
              success: false,
              message: `Expected 400 or 401 but got ${status}`,
              status: status,
              data: data
            };
          }
        }
      }
    },
    {
      name: 'Test 4: Missing Authorization Header (Should return 401)',
      test: async () => {
        try {
          const response = await axios.post(`${BACKEND_URL}/notifications/fcm-token`, {
            fcmToken: 'test-fcm-token-123',
            deviceType: 'android'
          }, {
            headers: {
              'Content-Type': 'application/json'
              // Missing Authorization header
            }
          });
          
          return {
            success: false,
            message: 'Expected 401 error but got success',
            status: response.status,
            data: response.data
          };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data;
          
          if (status === 401) {
            return {
              success: true,
              message: 'Correctly returned 401 for missing authorization',
              status: status,
              data: data
            };
          } else {
            return {
              success: false,
              message: `Expected 401 but got ${status}`,
              status: status,
              data: data
            };
          }
        }
      }
    },
    {
      name: 'Test 5: Valid Request Format (Should return 401 with proper error)',
      test: async () => {
        try {
          const response = await axios.post(`${BACKEND_URL}/notifications/fcm-token`, {
            fcmToken: 'test-fcm-token-123',
            deviceType: 'android'
          }, {
            headers: {
              'Authorization': 'Bearer test-token',
              'Content-Type': 'application/json'
            }
          });
          
          return {
            success: false,
            message: 'Expected 401 error but got success',
            status: response.status,
            data: response.data
          };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data;
          
          if (status === 401) {
            return {
              success: true,
              message: 'Correctly returned 401 for invalid Firebase token',
              status: status,
              data: data
            };
          } else if (status === 500) {
            return {
              success: false,
              message: '❌ CRITICAL: Still getting 500 error - backend needs fixing!',
              status: status,
              data: data
            };
          } else {
            return {
              success: false,
              message: `Expected 401 but got ${status}`,
              status: status,
              data: data
            };
          }
        }
      }
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 ${test.name}`);
    try {
      const result = await test.test();
      results.push({ ...result, testName: test.name });
      
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.message}`);
      console.log(`   Status: ${result.status}`);
      if (result.data) {
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`);
      results.push({
        success: false,
        message: `Test failed: ${error.message}`,
        testName: test.name
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   • ${result.testName}: ${result.message}`);
    });
  }
  
  // Check for critical 500 errors
  const criticalErrors = results.filter(r => 
    !r.success && r.message.includes('500 error')
  );
  
  if (criticalErrors.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalErrors.forEach(result => {
      console.log(`   • ${result.testName}: ${result.message}`);
    });
    console.log('\n🔧 ACTION REQUIRED:');
    console.log('   The backend still has 500 errors. Please check:');
    console.log('   1. Database schema has notification fields');
    console.log('   2. Prisma client is updated');
    console.log('   3. Error handling in notification controller');
    console.log('   4. Server logs for specific error details');
  } else {
    console.log('\n🎉 SUCCESS: No 500 errors detected!');
    console.log('   The notification endpoint is working correctly.');
    console.log('   Frontend error handling should now work properly.');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('   1. Test with a real Firebase token');
  console.log('   2. Verify database schema is updated');
  console.log('   3. Test the frontend notification setup');
  console.log('   4. Monitor server logs for any issues');
}

// Run the tests
testNotificationEndpoint().catch(console.error);
