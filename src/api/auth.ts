import { apiClient, handleApiCall, ApiResponse } from './client';
import type { User } from '../context/AuthContext';

/**
 * Authentication API endpoints
 * 
 * This file contains all authentication-related API calls for Firebase Auth integration:
 * - Firebase user sync
 * - User profile management
 * - Role-based access control
 * - User management (Admin only)
 */

/**
 * Firebase user sync request interface
 */
export interface FirebaseSyncRequest {
  firebaseUid: string;
  email: string;
  name: string;
  roleName?: string;
}

/**
 * Firebase sync response interface
 */
export interface FirebaseSyncResponse {
  user: User;
  message: string;
  isNewUser: boolean;
}

/**
 * User creation request interface (Admin only)
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleName: string;
}

/**
 * User role update request interface (Admin only)
 */
export interface UpdateUserRoleRequest {
  roleName: string;
}

/**
 * User management response interface
 */
export interface UserManagementResponse {
  user: User;
  message: string;
}


/**
 * Authentication API class
 * Contains all authentication-related API methods for Firebase Auth integration
 */
export class AuthAPI {
  /**
   * Sync Firebase user to backend database
   * 
   * @param syncData - Firebase user sync data
   * @returns Promise<FirebaseSyncResponse>
   * 
   * Example usage:
   * ```typescript
   * try {
   *   const response = await AuthAPI.syncFirebaseUser({
   *     firebaseUid: 'firebase-uid-123',
   *     email: 'user@example.com',
   *     name: 'John Doe',
   *     roleName: 'CUSTOMER_ADVISOR'
   *   });
   *   console.log('User synced:', response.user);
   * } catch (error) {
   *   console.error('Sync failed:', error.message);
   * }
   * ```
   */
  static async syncFirebaseUser(syncData: FirebaseSyncRequest): Promise<FirebaseSyncResponse> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<FirebaseSyncResponse>>('/auth/sync', syncData)
    );
  }

  /**
   * Get current user profile
   * 
   * @returns Promise<User>
   */
  static async getProfile(): Promise<User> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<User>>('/auth/profile')
    );
  }

  /**
   * Create new user in system (Admin only)
   * 
   * @param userData - User creation data
   * @returns Promise<UserManagementResponse>
   */
  static async createUser(userData: CreateUserRequest): Promise<UserManagementResponse> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<UserManagementResponse>>('/auth/users', userData)
    );
  }

  /**
   * Get all users (Admin/Manager only)
   * 
   * @returns Promise<User[]>
   */
  static async getUsers(): Promise<User[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<User[]>>('/auth/users')
    );
  }

  /**
   * Update user role (Admin only)
   * 
   * @param uid - User Firebase UID
   * @param roleData - Role update data
   * @returns Promise<UserManagementResponse>
   */
  static async updateUserRole(uid: string, roleData: UpdateUserRoleRequest): Promise<UserManagementResponse> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<UserManagementResponse>>(`/auth/users/${uid}/role`, roleData)
    );
  }

  /**
   * Deactivate user (Admin only)
   * 
   * @param uid - User Firebase UID
   * @returns Promise<UserManagementResponse>
   */
  static async deactivateUser(uid: string): Promise<UserManagementResponse> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<UserManagementResponse>>(`/auth/users/${uid}/deactivate`)
    );
  }

  /**
   * Activate user (Admin only)
   * 
   * @param uid - User Firebase UID
   * @returns Promise<UserManagementResponse>
   */
  static async activateUser(uid: string): Promise<UserManagementResponse> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<UserManagementResponse>>(`/auth/users/${uid}/activate`)
    );
  }
}

export default AuthAPI;
