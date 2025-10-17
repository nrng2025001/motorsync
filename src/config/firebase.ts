/**
 * Firebase Configuration for Expo
 * 
 * Production-ready Firebase configuration and initialization
 * for the automotive CRM app using Expo
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  Auth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { appConfig } from './env';

// Firebase configuration from environment
const firebaseConfig = appConfig.firebase;

// Initialize Firebase with error handling
let app: FirebaseApp;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    if (__DEV__) {
      console.log('✅ Firebase initialized successfully');
    }
  } else {
    app = getApps()[0];
    if (__DEV__) {
      console.log('✅ Using existing Firebase instance');
    }
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw new Error('Firebase initialization failed. Please check your configuration.');
}

// Initialize Firebase Auth with AsyncStorage persistence
let auth: Auth;
try {
  // Initialize auth with AsyncStorage persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  if (__DEV__) {
    console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
  }
} catch (error) {
  // If already initialized, get the existing instance
  if (__DEV__) {
    console.log('ℹ️ Firebase Auth already initialized, using existing instance');
  }
  auth = getAuth(app);
}

export { auth, app };
export default app;
