import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { appConfig } from '../config/env';

/**
 * API Client Configuration
 * 
 * Production-ready axios client with comprehensive features:
 * - Automatic Firebase authentication token injection
 * - Token refresh on 401 errors
 * - Request/response logging (development only)
 * - Comprehensive error handling
 * - Network error detection
 * - Request debouncing utility
 */

const BASE_URL = appConfig.apiUrl;

/**
 * Create the main axios instance with production-ready configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout for production
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: (status) => {
    // Accept status codes between 200-299 and 304 (Not Modified)
    return (status >= 200 && status < 300) || status === 304;
  },
});

/**
 * Request interceptor to add Firebase authentication token
 * Automatically adds the Firebase ID token to all requests if user is authenticated
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get Firebase ID token from current user
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        
        // Debug logging for token
        if (__DEV__) {
          console.log('🔑 Firebase token obtained:', token ? 'YES' : 'NO');
          console.log('🔑 Token length:', token ? token.length : 0);
        }
      } else {
        if (__DEV__) {
          console.warn('⚠️ No Firebase user found for API request');
        }
      }
      
      // Log the request in development only
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
          console.log('📤 Request Data:', JSON.stringify(config.data).substring(0, 200));
        }
      }
      
      return config;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error in request interceptor:', error);
      }
      // Return config even if token fetch fails
      return config;
    }
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling responses and errors
 * Production-ready with comprehensive error handling
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development only
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      if (response.data) {
        console.log('📄 Response data structure:', {
          success: response.data.success,
          hasData: !!response.data.data,
          dataKeys: response.data.data ? Object.keys(response.data.data) : 'none'
        });
      }
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Log errors in development only
    if (__DEV__) {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
      console.error('Error details:', error.response?.data);
      console.error('Request data that failed:', error.config?.data);
      console.error('Full error object:', error);
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          await AsyncStorage.setItem('@auth_token', newToken);
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } else {
          // No user, clear stored data and reject
          await AsyncStorage.removeItem('@auth_token');
          await AsyncStorage.removeItem('@auth_user');
          return Promise.reject({
            ...error,
            message: 'Session expired. Please log in again.',
          });
        }
      } catch (refreshError) {
        if (__DEV__) {
          console.error('❌ Token refresh failed:', refreshError);
        }
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@auth_user');
        return Promise.reject({
          ...error,
          message: 'Authentication failed. Please log in again.',
        });
      }
    }
    
    // Handle network errors
    if (!error.response) {
      const networkError = {
        ...error,
        message: 'Network error. Please check your internet connection and try again.',
        isNetworkError: true,
      };
      if (__DEV__) {
        console.error('🌐 Network error:', error.message);
      }
      return Promise.reject(networkError);
    }
    
    // Handle other HTTP errors with user-friendly messages
    const errorMessage = getErrorMessage(error);
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

/**
 * Extract user-friendly error messages from API responses
 */
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    
    // Handle different error response formats
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (typeof data === 'string') return data;
  }
  
  // Fallback error messages based on status code
  switch (error.response?.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'Access denied. You don\'t have permission for this action.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict. The resource already exists or is in use.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Debounce utility for preventing rapid-fire API calls
 * Useful for search inputs and other user interactions
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generic API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    enquiries?: T[];
    bookings?: T[];
    quotations?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Utility function to handle API calls with consistent error handling
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> {
  try {
    const response = await apiCall();
    const apiResponse = response.data;
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API call failed');
    }
    
    return apiResponse.data as T;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Health check endpoint to verify API connectivity
 */
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  return handleApiCall(() => apiClient.get('/health'));
};

export default apiClient;
