/**
 * API Configuration and Base Service
 * Handles authentication, request/response interceptors, and error handling
 */

import { getAuth } from 'firebase/auth';
import { ApiResponse } from './types';

export const API_URL = 'https://automotive-backend-frqe.onrender.com/api';

/**
 * Get Firebase ID Token for authentication
 */
export async function getAuthToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('Not authenticated. Please log in.');
  }
  
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Failed to get authentication token');
  }
}

/**
 * Generic API request handler with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const result: ApiResponse<T> = await response.json();
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Handle API-level errors
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    
    // Return the data
    return result.data as T;
  } catch (error: any) {
    console.error('API Request Error:', endpoint, error);
    
    // Handle specific error types
    if (error.message?.includes('Not authenticated')) {
      throw new Error('Session expired. Please log in again.');
    }
    
    if (error.message?.includes('Network request failed')) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
}

/**
 * Format date to ISO-8601 string for API
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO date string from API
 */
export function parseAPIDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

