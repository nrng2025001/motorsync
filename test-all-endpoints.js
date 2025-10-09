#!/usr/bin/env node

/**
 * Comprehensive API Endpoints Test
 * 
 * This script tests all API endpoints to identify issues
 */

require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000/api';

async function testAllEndpoints() {
  console.log('🔍 TESTING ALL API ENDPOINTS');
  console.log('═'.repeat(60));
  
  const results = {
    working: [],
    failing: [],
    missing: []
  };
  
  // Test endpoints
  const endpoints = [
    // Health endpoints
    { method: 'GET', path: '/health', auth: false, name: 'Health Check' },
    { method: 'GET', path: '/version', auth: false, name: 'Version Info' },
    
    // Auth endpoints
    { method: 'GET', path: '/auth/profile', auth: true, name: 'User Profile' },
    { method: 'GET', path: '/auth/users', auth: true, name: 'Users List' },
    
    // Enquiry endpoints
    { method: 'GET', path: '/enquiries', auth: true, name: 'Enquiries List' },
    { method: 'GET', path: '/enquiries/models', auth: true, name: 'Enquiry Models' },
    { method: 'GET', path: '/enquiries/variants', auth: true, name: 'Enquiry Variants' },
    { method: 'GET', path: '/enquiries/colors', auth: true, name: 'Enquiry Colors' },
    { method: 'GET', path: '/enquiries/sources', auth: true, name: 'Enquiry Sources' },
    
    // Booking endpoints
    { method: 'GET', path: '/bookings', auth: true, name: 'Bookings List' },
    { method: 'GET', path: '/bookings/advisor/my-bookings', auth: true, name: 'Advisor Bookings' },
    { method: 'GET', path: '/bookings/imports', auth: true, name: 'Import History' },
    
    // Quotation endpoints
    { method: 'GET', path: '/quotations', auth: true, name: 'Quotations List' },
    
    // Stock endpoints
    { method: 'GET', path: '/stock', auth: true, name: 'Stock List' },
    
    // File endpoints
    { method: 'GET', path: '/files', auth: true, name: 'Files List' },
  ];
  
  console.log(`\n🧪 Testing ${endpoints.length} endpoints...\n`);
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${BACKEND_URL}${endpoint.path}`,
        timeout: 5000
      });
      
      if (endpoint.auth && response.status === 200) {
        results.working.push({
          ...endpoint,
          status: response.status,
          issue: 'Should require authentication but returned 200'
        });
      } else if (!endpoint.auth && response.status === 200) {
        results.working.push({
          ...endpoint,
          status: response.status,
          issue: null
        });
      }
      
    } catch (error) {
      const status = error.response?.status;
      
      if (endpoint.auth && status === 401) {
        // This is expected for protected endpoints
        results.working.push({
          ...endpoint,
          status: 401,
          issue: null
        });
      } else if (status === 404) {
        results.missing.push({
          ...endpoint,
          status: 404,
          issue: 'Endpoint not found'
        });
      } else {
        results.failing.push({
          ...endpoint,
          status: status || 'ERROR',
          issue: error.message
        });
      }
    }
  }
  
  // Summary
  console.log('═'.repeat(60));
  console.log('📊 ENDPOINT TEST RESULTS');
  console.log('═'.repeat(60));
  
  console.log(`\n✅ Working Endpoints: ${results.working.length}`);
  results.working.forEach(endpoint => {
    const status = endpoint.status === 401 ? '🔒' : '✅';
    console.log(`   ${status} ${endpoint.method} ${endpoint.path} (${endpoint.status})`);
    if (endpoint.issue) {
      console.log(`      ⚠️  ${endpoint.issue}`);
    }
  });
  
  console.log(`\n❌ Failing Endpoints: ${results.failing.length}`);
  results.failing.forEach(endpoint => {
    console.log(`   ❌ ${endpoint.method} ${endpoint.path} (${endpoint.status})`);
    console.log(`      🔧 ${endpoint.issue}`);
  });
  
  console.log(`\n🔍 Missing Endpoints: ${results.missing.length}`);
  results.missing.forEach(endpoint => {
    console.log(`   ❓ ${endpoint.method} ${endpoint.path} (${endpoint.status})`);
    console.log(`      🔧 ${endpoint.issue}`);
  });
  
  // Recommendations
  console.log('\n' + '═'.repeat(60));
  console.log('🔧 RECOMMENDATIONS');
  console.log('═'.repeat(60));
  
  if (results.missing.length > 0) {
    console.log('\n📝 Missing Endpoints:');
    console.log('   These endpoints are not implemented in your backend:');
    results.missing.forEach(endpoint => {
      console.log(`   • ${endpoint.method} ${endpoint.path}`);
    });
    console.log('\n   💡 Either implement these endpoints or remove them from your API client');
  }
  
  if (results.failing.length > 0) {
    console.log('\n🚨 Failing Endpoints:');
    console.log('   These endpoints have errors:');
    results.failing.forEach(endpoint => {
      console.log(`   • ${endpoint.method} ${endpoint.path}: ${endpoint.issue}`);
    });
  }
  
  const totalWorking = results.working.length;
  const totalEndpoints = endpoints.length;
  const successRate = Math.round((totalWorking / totalEndpoints) * 100);
  
  console.log(`\n📈 Success Rate: ${successRate}% (${totalWorking}/${totalEndpoints})`);
  
  if (successRate >= 80) {
    console.log('\n🎉 Most endpoints are working well!');
  } else if (successRate >= 60) {
    console.log('\n⚠️  Some endpoints need attention');
  } else {
    console.log('\n🚨 Many endpoints have issues that need fixing');
  }
  
  console.log('═'.repeat(60));
}

// Run the test
testAllEndpoints().catch(console.error);
