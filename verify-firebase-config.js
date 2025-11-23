/**
 * Firebase Configuration Verification Script
 * Compares Expo app config with expected backend config
 */

const expoConfig = {
  projectId: 'car-dealership-app-9f2d5',
  apiKey: 'AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE',
  authDomain: 'car-dealership-app-9f2d5.firebaseapp.com',
  storageBucket: 'car-dealership-app-9f2d5.firebasestorage.app',
  messagingSenderId: '768479850678',
  appId: '1:768479850678:web:e994d17c08dbe8cab87617',
};

console.log('🔥 Firebase Configuration Verification\n');
console.log('═══════════════════════════════════════════════════════\n');

console.log('✅ EXPO APP CONFIGURATION:');
console.log('   Project ID:', expoConfig.projectId);
console.log('   Auth Domain:', expoConfig.authDomain);
console.log('   API Key:', expoConfig.apiKey.substring(0, 20) + '...');
console.log('');

console.log('⚠️  BACKEND SHOULD HAVE THESE ENVIRONMENT VARIABLES:');
console.log('   FIREBASE_PROJECT_ID =', expoConfig.projectId);
console.log('   FIREBASE_PRIVATE_KEY = [From Firebase Service Account]');
console.log('   FIREBASE_CLIENT_EMAIL = [From Firebase Service Account]');
console.log('');

console.log('📋 VERIFICATION STEPS:');
console.log('   1. Check backend environment variables match project ID above');
console.log('   2. Ensure service account credentials are from the same project');
console.log('   3. Restart backend after updating environment variables');
console.log('   4. Test token validation from Expo app');
console.log('');

console.log('🔗 GET SERVICE ACCOUNT CREDENTIALS:');
console.log('   https://console.firebase.google.com/project/' + expoConfig.projectId + '/settings/serviceaccounts/adminsdk');
console.log('');

console.log('═══════════════════════════════════════════════════════\n');
