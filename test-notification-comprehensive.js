#!/usr/bin/env node

/**
 * Comprehensive Notification Test Script
 * 
 * This script tests all notification endpoints to identify 500 errors
 * and verify proper error handling
 */

const axios = require('axios');

const BACKEND_URL = 'https://automotive-backend-frqe.onrender.com/api';

async function testNotificationEndpoints() {
  console.log('🔔 Comprehensive Notification System Test');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log('─'.repeat(80));
  
  const tests = [
    {
      name: 'Test 1: FCM Token Update - Invalid Token (Should return 401)',
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
              message: '✅ Correctly returned 401 for invalid Firebase token',
              status: status,
              data: data
            };
          } else if (status === 500) {
            return {
              success: false,
              message: '❌ CRITICAL: Got 500 error - backend needs fixing!',
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
      name: 'Test 2: FCM Token Update - Missing Token (Should return 400 or 401)',
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
            message: 'Expected 400/401 error but got success',
            status: response.status,
            data: response.data
          };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data;
          
          if (status === 400) {
            return {
              success: true,
              message: '✅ Correctly returned 400 for missing FCM token',
              status: status,
              data: data
            };
          } else if (status === 401) {
            return {
              success: true,
              message: '✅ Returned 401 (auth error) before validation - acceptable',
              status: status,
              data: data
            };
          } else if (status === 500) {
            return {
              success: false,
              message: '❌ CRITICAL: Got 500 error - backend needs fixing!',
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
      name: 'Test 3: FCM Token Update - Invalid Device Type (Should return 400 or 401)',
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
            message: 'Expected 400/401 error but got success',
            status: response.status,
            data: response.data
          };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data;
          
          if (status === 400) {
            return {
              success: true,
              message: '✅ Correctly returned 400 for invalid device type',
              status: status,
              data: data
            };
          } else if (status === 401) {
            return {
              success: true,
              message: '✅ Returned 401 (auth error) before validation - acceptable',
              status: status,
              data: data
            };
          } else if (status === 500) {
            return {
              success: false,
              message: '❌ CRITICAL: Got 500 error - backend needs fixing!',
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
      name: 'Test 4: FCM Token Update - Missing Authorization (Should return 401)',
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
              message: '✅ Correctly returned 401 for missing authorization',
              status: status,
              data: data
            };
          } else if (status === 500) {
            return {
              success: false,
              message: '❌ CRITICAL: Got 500 error - backend needs fixing!',
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
      name: 'Test 5: Notification History - Invalid Token (Should return 401)',
      test: async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/notifications/history`, {
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
              message: '✅ Correctly returned 401 for invalid token',
              status: status,
              data: data
            };
          } else if (status === 500) {
            return {
              success: false,
              message: '❌ CRITICAL: Got 500 error - backend needs fixing!',
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
      name: 'Test 6: Notification Stats - Invalid Token (Should return 401)',
      test: async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/notifications/stats`, {
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
              message: '✅ Correctly returned 401 for invalid token',
              status: status,
              data: data
            };
          } else if (status === 500) {
            return {
              success: false,
              message: '❌ CRITICAL: Got 500 error - backend needs fixing!',
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
      name: 'Test 7: Test Notification - Invalid Token (Should return 401)',
      test: async () => {
        try {
          const response = await axios.post(`${BACKEND_URL}/notifications/test`, {
            title: 'Test Notification',
            body: 'This is a test notification'
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
              message: '✅ Correctly returned 401 for invalid token',
              status: status,
              data: data
            };
          } else if (status === 500) {
            return {
              success: false,
              message: '❌ CRITICAL: Got 500 error - backend needs fixing!',
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
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const criticalErrors = results.filter(r => 
    !r.success && r.message.includes('500 error')
  );
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);
  
  if (criticalErrors.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalErrors.forEach(result => {
      console.log(`   • ${result.testName}: ${result.message}`);
    });
    console.log('\n🔧 ACTION REQUIRED:');
    console.log('   The backend has 500 errors that need immediate fixing:');
    console.log('   1. Check database schema for notification fields');
    console.log('   2. Verify Prisma client is updated');
    console.log('   3. Check error handling in notification controller');
    console.log('   4. Review server logs for specific error details');
  } else {
    console.log('\n🎉 SUCCESS: No 500 errors detected!');
    console.log('   All notification endpoints are working correctly.');
    console.log('   The system returns proper HTTP status codes.');
  }
  
  if (failed > 0 && criticalErrors.length === 0) {
    console.log('\n⚠️ NON-CRITICAL ISSUES:');
    results.filter(r => !r.success && !r.message.includes('500 error')).forEach(result => {
      console.log(`   • ${result.testName}: ${result.message}`);
    });
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('   1. If 500 errors found: Fix backend database schema and error handling');
  console.log('   2. If no 500 errors: Test with real Firebase tokens');
  console.log('   3. Verify frontend error handling works properly');
  console.log('   4. Monitor server logs for any issues');
  
  return {
    totalTests: results.length,
    passed,
    failed,
    criticalErrors: criticalErrors.length,
    has500Errors: criticalErrors.length > 0
  };
}

// Run the tests
testNotificationEndpoints()
  .then(result => {
    if (result.has500Errors) {
      process.exit(1); // Exit with error code if 500 errors found
    } else {
      process.exit(0); // Exit successfully if no 500 errors
    }
  })
  .catch(console.error);
