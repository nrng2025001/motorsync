import { apiClient, handleApiCall, ApiResponse, PaginatedResponse } from './client';

export type RoleName =
  | 'ADMIN'
  | 'GENERAL_MANAGER'
  | 'SALES_MANAGER'
  | 'TEAM_LEAD'
  | 'CUSTOMER_ADVISOR';

export interface Role {
  id: string;
  name: RoleName;
  permissions?: string[];
}

export interface User {
  firebaseUid: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  employeeId?: string;
  dealershipId?: string;
  createdAt: string;
  updatedAt: string;
}

class UsersAPI {
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: RoleName;
    isActive?: boolean;
  }): Promise<PaginatedResponse<User>> {
    const response = await handleApiCall(() =>
      apiClient.get<ApiResponse<{ users: User[]; pagination: any }>>('/auth/users', { params })
    );
    
    // Production backend returns: { success: true, message: "...", data: { users: [...], pagination: {...} } }
    // handleApiCall extracts the data field, so response = { users: [...], pagination: {...} }
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        enquiries: response.users || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
      }
    };
  }

  static async getUserById(firebaseUid: string): Promise<User> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<User>>(`/auth/users/${firebaseUid}`)
    );
  }

  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    roleName: RoleName;
  }): Promise<{ user: User; temporaryPassword?: string }> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<{ user: User; temporaryPassword?: string }>>(
        '/auth/users',
        data
      )
    );
  }

  static async updateUser(firebaseUid: string, data: {
    name?: string;
    email?: string;
    roleName?: RoleName;
    isActive?: boolean;
  }): Promise<User> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<User>>(`/auth/users/${firebaseUid}`, data)
    );
  }

  static async deleteUser(firebaseUid: string): Promise<void> {
    return handleApiCall(() =>
      apiClient.delete<ApiResponse<void>>(`/auth/users/${firebaseUid}`)
    );
  }

  static async resetUserPassword(firebaseUid: string, newPassword: string): Promise<{
    user: User;
    newPassword: string;
  }> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<{ user: User; newPassword: string }>>(
        `/auth/users/${firebaseUid}/reset-password`,
        { newPassword }
      )
    );
  }

  static async assignManager(firebaseUid: string, managerId: string): Promise<User> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<User>>(`/auth/users/${firebaseUid}/assign-manager`, {
        managerId,
      })
    );
  }
}

export const usersAPI = UsersAPI;
export default UsersAPI;


