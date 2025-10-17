import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../api/auth';
import { AuthService } from '../services/authService';
import { User as FirebaseUser } from 'firebase/auth';
import { Dealership } from '../types/dealership';

/**
 * User roles in the automotive CRM system
 * Each role has different permissions and access to features
 */
export type UserRole = 
  | 'ADMIN'              // Full system access, user management
  | 'GENERAL_MANAGER'    // Management oversight, bulk imports
  | 'SALES_MANAGER'      // Sales operations, team management
  | 'TEAM_LEAD'          // Team coordination, assignments
  | 'CUSTOMER_ADVISOR';  // Own bookings only, customer interactions

/**
 * User interface representing authenticated user data
 * Updated to match backend response structure
 */
export interface User {
  firebaseUid: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: UserRole;
  };
  dealershipId: string | null;
  dealership: {
    id: string;
    name: string;
    code: string;
    type: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber?: string | null;
    panNumber?: string | null;
    brands: string[];
    isActive: boolean;
    onboardingCompleted: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  employeeId: string | null;
  isActive: boolean;
  // Legacy fields for backward compatibility
  id?: string;
  avatar?: string;
  department?: string;
}

/**
 * Authentication state interface
 */
interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
}

/**
 * Authentication actions for state management
 */
type AuthAction =
  | { type: 'LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SIGNUP_SUCCESS'; payload: User }
  | { type: 'SIGNUP_FAILURE'; payload: string };

/**
 * Authentication context interface
 */
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  dealership?: Dealership;
  isAdmin: boolean;
}

// Initial state
const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Transform user profile to ensure it has the correct structure
 */
function transformUserProfile(userProfile: any): User {
  if (!userProfile || typeof userProfile !== 'object') {
    throw new Error('Invalid user profile: not an object');
  }
  
  // Handle nested user object structure from API response
  let actualUserProfile = userProfile;
  if (userProfile.user && typeof userProfile.user === 'object') {
    actualUserProfile = userProfile.user;
  }
  
  let transformedProfile = { ...actualUserProfile };
  
  // Handle different possible response structures
  if (typeof actualUserProfile.role === 'string') {
    console.log('🔄 Converting role string to object structure');
    transformedProfile.role = {
      id: 'unknown',
      name: actualUserProfile.role
    };
  }
  // Check if role is missing entirely
  else if (!actualUserProfile.role) {
    console.log('🔄 Adding default role structure');
    transformedProfile.role = {
      id: 'unknown',
      name: 'CUSTOMER_ADVISOR'
    };
  }
  
  // Ensure we have the required fields
  if (!transformedProfile.firebaseUid && actualUserProfile.id) {
    transformedProfile.firebaseUid = actualUserProfile.id;
  }
  
  // Ensure employeeId and dealership are properly extracted
  if (actualUserProfile.employeeId) {
    transformedProfile.employeeId = actualUserProfile.employeeId;
  }
  if (actualUserProfile.dealership) {
    transformedProfile.dealership = actualUserProfile.dealership;
  }
  
  // Final validation
  if (!transformedProfile.role || !transformedProfile.role.name) {
    console.error('❌ Invalid user profile structure from backend');
    console.error('   Expected: { role: { name: string } }');
    console.error('   Received:', JSON.stringify(userProfile, null, 2));
    throw new Error('Invalid user profile structure from backend');
  }
  
  return transformedProfile as User;
}


/**
 * Auth Provider component that manages authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  /**
   * Check if user is already authenticated (from Firebase)
   */
  const checkAuthState = async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      
      // First, try to restore user profile from AsyncStorage
      try {
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          console.log('🔄 Restored user profile from AsyncStorage:', parsedProfile);
          dispatch({ type: 'LOGIN_SUCCESS', payload: parsedProfile });
        }
      } catch (storageError) {
        console.warn('⚠️ Failed to restore user profile from AsyncStorage:', storageError);
      }
      
      // Listen to Firebase auth state changes
      const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            console.log('🔄 Firebase user detected, fetching profile from backend...');
            console.log('   Firebase UID:', firebaseUser.uid);
            console.log('   Email:', firebaseUser.email);
            
            // Get user profile from backend
            const userProfile = await AuthAPI.getProfile();
            
            console.log('✅ Backend profile retrieved successfully');
            console.log('   Full response:', JSON.stringify(userProfile, null, 2));
            
            // Check the actual structure
            const actualUser = userProfile.user || userProfile;
            console.log('   Role:', actualUser.role?.name);
            console.log('   Dealership:', actualUser.dealership?.name);
            console.log('   Employee ID:', actualUser.employeeId);
            
            // Transform user profile to ensure correct structure
            const transformedProfile = transformUserProfile(userProfile);
            
            // Store user data in AsyncStorage for persistence
            try {
              await AsyncStorage.setItem('userProfile', JSON.stringify(transformedProfile));
              console.log('✅ User profile stored in AsyncStorage');
            } catch (storageError) {
              console.warn('⚠️ Failed to store user profile in AsyncStorage:', storageError);
            }
            
            dispatch({ type: 'LOGIN_SUCCESS', payload: transformedProfile });
          } catch (error) {
            console.error('❌ Error getting user profile from backend:', error);
            console.error('   This means the user is not properly set up in the backend database');
            console.error('   User must be created in the backend first');
            
            // Don't create fallback user - this should fail
            dispatch({ 
              type: 'LOGIN_FAILURE', 
              payload: 'User not found in system. Please contact your administrator.' 
            });
          }
        } else {
          console.log('🔄 No Firebase user, clearing auth state');
          dispatch({ type: 'LOADING', payload: false });
        }
      });

      // Return cleanup function
      return unsubscribe;
    } catch (error) {
      console.error('Error checking auth state:', error);
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  /**
   * Login function using Firebase Auth
   */
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      
      console.log('🔐 Login attempt:', email.trim().toLowerCase());
      
      // Sign in with Firebase
      const userCredential = await AuthService.signIn(email.trim().toLowerCase(), password);
      
      console.log('✅ Firebase login successful');
      console.log('   User UID:', userCredential.user.uid);
      console.log('   Email:', userCredential.user.email);
      
      // Get user profile from backend
      console.log('🔄 Fetching profile from backend...');
      const userProfile = await AuthAPI.getProfile();
      
      console.log('✅ Backend profile retrieved successfully');
      console.log('   Full response:', JSON.stringify(userProfile, null, 2));
      console.log('   User:', userProfile.name);
      console.log('   Role:', userProfile.role?.name);
      console.log('   Dealership:', userProfile.dealership?.name);
      console.log('   Employee ID:', userProfile.employeeId);
      
      // Transform user profile to ensure correct structure
      const transformedProfile = transformUserProfile(userProfile);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: transformedProfile });
    } catch (error) {
      console.error('❌ Login failed:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  /**
   * Sign up function using Firebase Auth
   */
  const signup = async (email: string, password: string, name: string) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      
      console.log('🔐 Signup attempt:', email.trim().toLowerCase());
      
      // Create user with Firebase
      const userCredential = await AuthService.signUp(email, password, name);
      
      console.log('✅ Firebase signup successful');
      console.log('   User UID:', userCredential.user.uid);
      console.log('   Email:', userCredential.user.email);
      
      // Get user profile from backend
      console.log('🔄 Fetching profile from backend...');
      const userProfile = await AuthAPI.getProfile();
      
      console.log('✅ Backend profile retrieved successfully');
      console.log('   Full response:', JSON.stringify(userProfile, null, 2));
      console.log('   User:', userProfile.name);
      console.log('   Role:', userProfile.role?.name);
      console.log('   Dealership:', userProfile.dealership?.name);
      
      // Transform user profile to ensure correct structure
      const transformedProfile = transformUserProfile(userProfile);
      
      dispatch({ type: 'SIGNUP_SUCCESS', payload: transformedProfile });
    } catch (error) {
      console.error('❌ Signup failed:', error);
      dispatch({ 
        type: 'SIGNUP_FAILURE', 
        payload: error instanceof Error ? error.message : 'Sign up failed' 
      });
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      console.log('🔄 Logging out...');
      
      // Sign out from Firebase
      await AuthService.signOut();
      
      // Clear all cached data
      await AsyncStorage.clear();
      
      console.log('✅ Logged out and cleared cache');
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if Firebase call fails, clear local state
      await AsyncStorage.clear();
      dispatch({ type: 'LOGOUT' });
    }
  };


  /**
   * Clear authentication error
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  /**
   * Refresh user profile from backend
   */
  const refreshProfile = async () => {
    try {
      console.log('🔄 Refreshing profile from backend...');
      
      const userProfile = await AuthAPI.getProfile();
      
      console.log('✅ Profile refreshed successfully');
      console.log('   Full response:', JSON.stringify(userProfile, null, 2));
      console.log('   Role:', userProfile.role?.name);
      console.log('   Dealership:', userProfile.dealership?.name);
      console.log('   Employee ID:', userProfile.employeeId);
      
      // Transform user profile to ensure correct structure
      const transformedProfile = transformUserProfile(userProfile);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: transformedProfile });
      
      // Update cache
      await AsyncStorage.setItem('user', JSON.stringify(transformedProfile));
      
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Failed to refresh profile. Please try logging in again.' 
      });
    }
  };

  const contextValue: AuthContextType = {
    state,
    login,
    signup,
    logout,
    clearError,
    refreshProfile,
    dealership: state.user?.dealership,
    isAdmin: state.user?.role?.name === 'ADMIN' || state.user?.role?.name === 'GENERAL_MANAGER',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Helper function to get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    GENERAL_MANAGER: 'General Manager',
    SALES_MANAGER: 'Sales Manager',
    TEAM_LEAD: 'Team Lead',
    CUSTOMER_ADVISOR: 'Customer Advisor',
  };
  return roleNames[role];
}

/**
 * Helper function to get role display name from user object
 */
export function getUserRoleDisplayName(user: User): string {
  return getRoleDisplayName(user.role.name);
}

/**
 * Helper function to check if user has permission for certain actions
 */
export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}
