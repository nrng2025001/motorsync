/**
 * Environment Configuration Validator
 * Production-ready environment variable validation and management
 */

export interface AppConfig {
  apiUrl: string;
  backendUrl: string;
  environment: 'development' | 'staging' | 'production';
  debugMode: boolean;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
    databaseURL?: string;
  };
}

/**
 * Validate required environment variables
 */
function validateEnv(): void {
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missing = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0 && __DEV__) {
    console.warn(
      `⚠️ Missing environment variables: ${missing.join(', ')}\n` +
      'Using default values. For production, set these in your .env file.'
    );
  }
}

/**
 * Get application configuration
 * Validates and returns typed configuration object
 */
export function getConfig(): AppConfig {
  // Validate environment variables in development
  if (__DEV__) {
    validateEnv();
  }

  // For local development, set EXPO_PUBLIC_API_URL to your local IP:
  // Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
  // To find your local IP: ifconfig | grep "inet " | grep -v 127.0.0.1 (Mac/Linux)
  // Or run 'npm run local-ip' in the backend directory
  const config: AppConfig = {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://automotive-backend-frqe.onrender.com/api',
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://automotive-backend-frqe.onrender.com',
    environment: (process.env.EXPO_PUBLIC_APP_ENV as any) || 'development',
    debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || __DEV__,
    // Firebase Configuration
    // IMPORTANT: Backend must use the SAME Firebase project for token validation
    // Backend needs: FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
    // See FIREBASE_CONFIG_CHECK.md for verification steps
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'car-dealership-app-9f2d5.firebaseapp.com',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'car-dealership-app-9f2d5',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'car-dealership-app-9f2d5.firebasestorage.app',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '768479850678',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:768479850678:web:e994d17c08dbe8cab87617',
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-WSF9PY0QPL',
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'https://car-dealership-app-9f2d5.firebaseio.com',
    },
  };

  // Log configuration in development
  if (__DEV__) {
    console.log('📋 App Configuration:');
    console.log('  Environment:', config.environment);
    console.log('  API URL:', config.apiUrl);
    console.log('  Debug Mode:', config.debugMode);
  }

  return config;
}

/**
 * Singleton configuration instance
 */
export const appConfig = getConfig();

export default appConfig;


