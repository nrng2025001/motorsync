/**
 * Firebase Authentication Service
 * 
 * This service handles all Firebase authentication operations
 * and integrates with the backend API
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthAPI } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication service class
 */
export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      if (__DEV__) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 AuthService: Starting Firebase sign-in...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Firebase Configuration:');
        console.log('  Project ID:', auth.app.options.projectId);
        console.log('  Auth Domain:', auth.app.options.authDomain);
        console.log('  API Key:', auth.app.options.apiKey?.substring(0, 20) + '...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Login Credentials:');
        console.log('  Original Email:', email);
        console.log('  Password Length:', password.length);
      }
      
      // Ensure email is trimmed and lowercase
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      
      if (__DEV__) {
        console.log('  Cleaned Email:', cleanEmail);
        console.log('  Email Changed:', email !== cleanEmail);
        console.log('  Password Trimmed:', password !== cleanPassword);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 Calling Firebase signInWithEmailAndPassword...');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      
      if (__DEV__) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Firebase Authentication SUCCESS!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 User Information:');
        console.log('  UID:', userCredential.user.uid);
        console.log('  Email:', userCredential.user.email);
        console.log('  Email Verified:', userCredential.user.emailVerified);
        console.log('  Display Name:', userCredential.user.displayName || 'Not set');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      
      // Sync user with backend (don't fail login if this fails)
      try {
        if (__DEV__) {
          console.log('🔄 Syncing user with backend...');
        }
        await this.syncUserWithBackend(userCredential.user);
        if (__DEV__) {
          console.log('✅ Backend sync successful');
        }
      } catch (syncError) {
        if (__DEV__) {
          console.warn('⚠️  Backend sync failed (continuing with login)');
          console.error('Sync Error:', syncError);
        }
      }
      
      // Store auth token
      if (__DEV__) {
        console.log('🔑 Getting and storing auth token...');
      }
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('@auth_token', token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(userCredential.user));
      
      if (__DEV__) {
        console.log('✅ Auth token stored successfully');
        console.log('  Token Preview:', token.substring(0, 30) + '...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 LOGIN PROCESS COMPLETE!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      
      return userCredential;
    } catch (error: any) {
      if (__DEV__) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ FIREBASE AUTHENTICATION FAILED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Provide specific guidance based on error
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
          console.log('⚠️  DIAGNOSIS: User does not exist in Firebase');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📝 SOLUTION:');
          console.log('1. Go to: https://console.firebase.google.com/');
          console.log('2. Select project: car-dealership-app-9f2d5');
          console.log('3. Go to Authentication → Users');
          console.log('4. Click "Add user"');
          console.log('5. Email: advisor@test.com');
          console.log('6. Password: TestPass123!');
          console.log('7. Click "Add user"');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else if (error.code === 'auth/wrong-password') {
          console.log('⚠️  DIAGNOSIS: Password is incorrect');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📝 SOLUTION:');
          console.log('1. Go to Firebase Console');
          console.log('2. Authentication → Users');
          console.log('3. Find advisor@test.com');
          console.log('4. Click ⋮ menu → Reset password');
          console.log('5. Set password: TestPass123!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else if (error.code === 'auth/network-request-failed') {
          console.log('⚠️  DIAGNOSIS: Network connection issue');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📝 SOLUTION: Check internet connection');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
      }
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Create new user account
   */
  static async signUp(email: string, password: string, name: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(userCredential.user, { displayName: name });
      
      // Sync user with backend
      await this.syncUserWithBackend(userCredential.user);
      
      // Store auth token
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('@auth_token', token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(userCredential.user));
      
      return userCredential;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      // Clear stored data
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@auth_user');
      
      // Sign out from Firebase
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Get current user's ID token
   */
  static async getCurrentUserToken(): Promise<string | null> {
    try {
      const user = this.getCurrentUser();
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Sync Firebase user with backend
   */
  private static async syncUserWithBackend(user: User): Promise<void> {
    try {
      const token = await user.getIdToken();
      
      // Update API client with new token
      // This will be handled by the API client interceptor
      
      // Sync user data with backend
      // Note: Role assignment should be handled by backend admin, not hardcoded here
      let roleName: string | undefined;
      try {
        const cachedProfile = await AsyncStorage.getItem('userProfile');
        if (cachedProfile) {
          const parsedProfile = JSON.parse(cachedProfile);
          roleName =
            parsedProfile?.role?.name ||
            parsedProfile?.roleName ||
            parsedProfile?.assignedRole ||
            undefined;
        }
      } catch (error) {
        console.warn('⚠️ Failed to read cached profile for role resolution:', error);
      }

      if (!roleName) {
        roleName = 'CUSTOMER_ADVISOR';
      }

      await AuthAPI.syncFirebaseUser({
        firebaseUid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        roleName,
      });
      
      console.log('User synced with backend successfully');
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
      // Don't throw error here as user is still authenticated
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const user = this.getCurrentUser();
      if (user) {
        const token = await user.getIdToken(true); // Force refresh
        await AsyncStorage.setItem('@auth_token', token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * Get user-friendly error messages
   */
  private static getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'User not found. Please contact your administrator to create your account.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials or contact your administrator.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or contact your administrator.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address format';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again in a few minutes.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      default:
        return error.message || 'Authentication failed. Please try again or contact support.';
    }
  }
}

export default AuthService;
