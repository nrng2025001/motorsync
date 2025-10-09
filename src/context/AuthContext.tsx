import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../api/auth';
import { AuthService } from '../services/authService';
import { User as FirebaseUser } from 'firebase/auth';

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
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
      
      // Listen to Firebase auth state changes
      const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Get user profile from backend
            const userProfile = await AuthAPI.getProfile();
            dispatch({ type: 'LOGIN_SUCCESS', payload: userProfile });
          } catch (error) {
            console.error('Error getting user profile:', error);
            // If backend call fails, create user from Firebase data
            const user: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: 'CUSTOMER_ADVISOR', // Default role
            };
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          }
        } else {
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
      
      if (__DEV__) {
        console.log('🔐 Login attempt:', email.trim().toLowerCase());
      }
      
      // Sign in with Firebase
      const userCredential = await AuthService.signIn(email.trim().toLowerCase(), password);
      
      if (__DEV__) {
        console.log('✅ Firebase login successful');
        console.log('User UID:', userCredential.user.uid);
        console.log('Email:', userCredential.user.email);
      }
      
      // Get user profile from backend
      try {
        const userProfile = await AuthAPI.getProfile();
        
        if (__DEV__) {
          console.log('✅ Backend profile retrieved');
          console.log('User:', userProfile.name);
          console.log('Role:', userProfile.role);
        }
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: userProfile });
      } catch (error) {
        if (__DEV__) {
          console.warn('⚠️  Backend profile fetch failed, using Firebase data');
          console.error('Error:', error);
        }
        
        // If backend call fails, create user from Firebase data
        const user: User = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || 'User',
          email: userCredential.user.email || '',
          role: 'CUSTOMER_ADVISOR', // Default role
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      }
    } catch (error) {
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
      
      // Create user with Firebase
      const userCredential = await AuthService.signUp(email, password, name);
      
      // Get user profile from backend
      try {
        const userProfile = await AuthAPI.getProfile();
        dispatch({ type: 'SIGNUP_SUCCESS', payload: userProfile });
      } catch (error) {
        // If backend call fails, create user from Firebase data
        const user: User = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || name,
          email: userCredential.user.email || email,
          role: 'CUSTOMER_ADVISOR', // Default role
        };
        dispatch({ type: 'SIGNUP_SUCCESS', payload: user });
      }
    } catch (error) {
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
      // Sign out from Firebase
      await AuthService.signOut();
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if Firebase call fails, clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };


  /**
   * Clear authentication error
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    state,
    login,
    signup,
    logout,
    clearError,
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
 * Helper function to check if user has permission for certain actions
 */
export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}
