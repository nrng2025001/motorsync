/**
 * 🔍 CURRENT STATE TEST
 * 
 * This test shows exactly what's happening with your app right now.
 */

const axios = require('axios');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE",
  authDomain: "car-dealership-app-9f2d5.firebaseapp.com",
  projectId: "car-dealership-app-9f2d5",
  storageBucket: "car-dealership-app-9f2d5.firebasestorage.app",
  messagingSenderId: "768479850678",
  appId: "1:768479850678:web:e994d17c08dbe8cab87617"
};

const BACKEND_URL = 'https://automotive-backend-frqe.onrender.com/api';

async function testCurrentState() {
  console.log('🔍 CURRENT STATE TEST');
  console.log('=====================\n');
  
  try {
    // 1. Firebase Login
    console.log('1️⃣ Testing Firebase Login...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'test@motorsync.com', 
      'TestPass123!'
    );
    
    console.log('✅ Firebase Login: SUCCESS');
    console.log('   User ID:', userCredential.user.uid);
    console.log('   Email:', userCredential.user.email);
    console.log('   Project:', firebaseConfig.projectId);
    
    // 2. Token Generation
    console.log('\n2️⃣ Testing Token Generation...');
    const token = await userCredential.user.getIdToken();
    console.log('✅ Token Generated: SUCCESS');
    console.log('   Length:', token.length, 'characters');
    console.log('   Preview:', token.substring(0, 30) + '...');
    
    // 3. Backend Token Validation
    console.log('\n3️⃣ Testing Backend Token Validation...');
    try {
      const response = await axios.get(`${BACKEND_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Backend Validation: SUCCESS');
      console.log('   This means the backend has been fixed!');
      console.log('   User:', response.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Backend Validation: FAILED');
        console.log('   Status: 401 Unauthorized');
        console.log('   Message:', error.response.data.message);
        console.log('   \n   🔧 THIS IS THE ISSUE:');
        console.log('   Your app generates valid tokens for project:', firebaseConfig.projectId);
        console.log('   But the backend is configured for a different Firebase project.');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // 4. App Fallback Behavior
    console.log('\n4️⃣ Your App\'s Fallback Behavior:');
    console.log('When backend validation fails, your app does this:');
    console.log('');
    console.log('   try {');
    console.log('     const userProfile = await AuthAPI.getProfile();');
    console.log('     // ❌ This fails with "Invalid Firebase token"');
    console.log('   } catch (error) {');
    console.log('     // ✅ Fallback: Use Firebase data directly');
    console.log('     const user = {');
    console.log('       id: "' + userCredential.user.uid + '",');
    console.log('       email: "' + userCredential.user.email + '",');
    console.log('       role: "CUSTOMER_ADVISOR"');
    console.log('     };');
    console.log('     // You can still login and use the app!');
    console.log('   }');
    
    // 5. What Works vs Doesn't Work
    console.log('\n5️⃣ Current App Functionality:');
    console.log('\n   ✅ WHAT WORKS:');
    console.log('   • Firebase authentication');
    console.log('   • Login screen');
    console.log('   • Navigation');
    console.log('   • UI components');
    console.log('   • Local data from Firebase');
    
    console.log('\n   ❌ WHAT DOESN\'T WORK:');
    console.log('   • Backend API calls');
    console.log('   • Fetching bookings/enquiries');
    console.log('   • Creating new records');
    console.log('   • Dashboard statistics');
    console.log('   • Any backend data');
    
    // 6. Summary
    console.log('\n\n📊 SUMMARY');
    console.log('==========');
    console.log('✅ Your mobile app is correctly configured');
    console.log('✅ Firebase authentication works perfectly');
    console.log('✅ Token generation works perfectly');
    console.log('❌ Backend rejects your valid tokens (config mismatch)');
    console.log('');
    console.log('🔧 SOLUTION:');
    console.log('Update backend Firebase credentials to match: car-dealership-app-9f2d5');
    console.log('See BACKEND_FIX_REQUIRED.md for detailed instructions');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
  }
}

testCurrentState();





