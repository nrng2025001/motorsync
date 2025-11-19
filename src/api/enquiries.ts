import { apiClient } from './client';
import {
  Enquiry,
  EnquiryFilters,
  PaginatedResponse,
  ApiResponse,
  EnquiryCategory,
  EnquiryStatus,
  CreateEnquiryRequest,
  UpdateEnquiryRequest,
} from '../services/types';

class EnquiryAPI {
  async getEnquiries(params?: EnquiryFilters): Promise<PaginatedResponse<Enquiry>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.dealershipId) queryParams.append('dealershipId', params.dealershipId);
    if (params?.dealershipCode) queryParams.append('dealershipCode', params.dealershipCode);
    if (params?.scope) queryParams.append('scope', params.scope);

    return apiClient.get(`/enquiries?${queryParams.toString()}`);
  }

  async getEnquiryById(id: string): Promise<ApiResponse<Enquiry>> {
    return apiClient.get(`/enquiries/${id}`);
  }


  async createEnquiry(data: CreateEnquiryRequest): Promise<ApiResponse<Enquiry>> {
    return apiClient.post('/enquiries', data);
}

  async updateEnquiry(id: string, data: UpdateEnquiryRequest): Promise<ApiResponse<Enquiry>> {
    return apiClient.put(`/enquiries/${id}`, data);
  }

  async deleteEnquiry(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/enquiries/${id}`);
  }

  async getEnquiryStats(): Promise<ApiResponse<{
  total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
  }>> {
    return apiClient.get('/enquiries/stats');
  }

  // Additional methods for enquiry management
  async getVariants(model?: string): Promise<string[]> {
    const response = await apiClient.get('/enquiries/variants', {
      params: model ? { model } : {}
    });
    return response.data || [];
  }

  async getModels(): Promise<{ modelsByBrand: { [brand: string]: string[] } }> {
    const response = await apiClient.get('/enquiries/models');
    return response.data || { modelsByBrand: {} };
  }

  async getColors(): Promise<string[]> {
    const response = await apiClient.get('/enquiries/colors');
    return response.data || [];
  }

  async getSources(): Promise<string[]> {
    const response = await apiClient.get('/enquiries/sources');
    return response.data || [];
  }

  async updateCategory(id: string, category: EnquiryCategory): Promise<ApiResponse<Enquiry>> {
    return apiClient.put(`/enquiries/${id}`, { category });
  }

  async updateStatus(id: string, status: EnquiryStatus): Promise<ApiResponse<Enquiry>> {
    return apiClient.put(`/enquiries/${id}`, { status });
  }

  async addNotes(id: string, notes: string): Promise<ApiResponse<Enquiry>> {
    return apiClient.post(`/enquiries/${id}/notes`, { notes });
  }

  async assignEnquiry(id: string, assignedToUserId: string): Promise<ApiResponse<Enquiry>> {
    return apiClient.post(`/enquiries/${id}/assign`, { assignedToUserId });
  }

  async unassignEnquiry(id: string): Promise<ApiResponse<Enquiry>> {
    return apiClient.post(`/enquiries/${id}/unassign`);
  }

  // Additional comprehensive methods from technical guide
  async getAvailableModels(): Promise<ApiResponse<{ modelsByBrand: { [brand: string]: string[] } }>> {
    return apiClient.get('/enquiries/available-models');
  }

  async getAvailableVariants(model?: string): Promise<ApiResponse<string[]>> {
    const params = model ? { model } : {};
    return apiClient.get('/enquiries/available-variants', { params });
  }

  async getAvailableColors(): Promise<ApiResponse<string[]>> {
    return apiClient.get('/enquiries/available-colors');
  }

  async getEnquirySources(): Promise<ApiResponse<string[]>> {
    return apiClient.get('/enquiries/sources');
  }

  // Bulk operations
  async bulkUpdateStatus(enquiryIds: string[], status: EnquiryStatus): Promise<ApiResponse<{ updated: number; failed: number }>> {
    return apiClient.post('/enquiries/bulk-update-status', { enquiryIds, status });
  }

  async bulkUpdateCategory(enquiryIds: string[], category: EnquiryCategory): Promise<ApiResponse<{ updated: number; failed: number }>> {
    return apiClient.post('/enquiries/bulk-update-category', { enquiryIds, category });
  }

  // Advanced filtering and search
  async searchEnquiries(query: string, filters?: {
    status?: EnquiryStatus;
    category?: EnquiryCategory;
    dateFrom?: string;
    dateTo?: string;
    assignedTo?: string;
  }): Promise<PaginatedResponse<Enquiry>> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

    return apiClient.get(`/enquiries/search?${params.toString()}`);
  }

  // Analytics and reporting
  async getEnquiryAnalytics(filters?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    trends: Array<{ date: string; count: number }>;
  }>> {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    return apiClient.get(`/enquiries/analytics?${params.toString()}`);
  }

  // Export functionality
  async exportEnquiries(filters?: EnquiryFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/enquiries/export?${queryParams.toString()}`, {
        responseType: 'blob'
    });
    
    return response.data;
  }

  // Download enquiries with filters
  async downloadEnquiries(filters: any = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (filters.format) queryParams.append('format', filters.format);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.search) queryParams.append('search', filters.search);

    const response = await apiClient.get(`/enquiries/download?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get enquiry status summary
  async getEnquiryStatusSummary(): Promise<ApiResponse<any>> {
    return apiClient.get('/enquiries/status-summary');
  }
}

export const enquiryAPI = new EnquiryAPI();
export default enquiryAPI;