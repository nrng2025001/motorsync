#!/usr/bin/env node

/**
 * Direct Backend Test Script
 * 
 * This script tests the backend without Firebase authentication
 * to understand what endpoints are available
 */

async function testBackendEndpoints() {
  const baseUrl = 'https://automotive-backend-frqe.onrender.com/api';
  
  console.log('🌐 Testing Backend Endpoints...');
  console.log('📍 Base URL:', baseUrl);
  
  const endpoints = [
    '/health',
    '/auth/profile',
    '/auth/sync',
    '/enquiries',
    '/bookings',
    '/quotations',
    '/stock'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`📄 Response:`, JSON.stringify(result, null, 2));
      
      if (response.status === 401) {
        console.log('🔒 This endpoint requires authentication');
      } else if (response.status === 404) {
        console.log('❌ Endpoint not found');
      } else if (response.ok) {
        console.log('✅ Endpoint accessible');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Test with fake Firebase token
  console.log('\n🔐 Testing with fake Firebase token...');
  try {
    const response = await fetch(`${baseUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer fake-firebase-token',
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run the test
testBackendEndpoints();
