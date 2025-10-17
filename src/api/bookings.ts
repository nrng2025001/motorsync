import { apiClient } from './client';
import { 
  Booking, 
  BookingFilters, 
  PaginatedResponse, 
  ApiResponse,
  BookingStatus,
  BulkImportResponse,
  ImportProgress
} from '../services/types';

class BookingAPI {
  async getBookings(params?: BookingFilters): Promise<PaginatedResponse<Booking>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.timeline) queryParams.append('timeline', params.timeline);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return apiClient.get(`/bookings?${queryParams.toString()}`);
  }

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.get(`/bookings/${id}`);
  }

  async getMyBookings(params?: BookingFilters): Promise<PaginatedResponse<Booking>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.timeline) queryParams.append('timeline', params.timeline);

    return apiClient.get(`/bookings/advisor/my-bookings?${queryParams.toString()}`);
  }

  async createBooking(data: {
  customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    variant?: string;
    vcCode?: string;
    color?: string;
    fuelType?: string;
    transmission?: string;
    dealerCode: string;
    advisorId?: string;
    bookingDate?: string;
    expectedDeliveryDate?: string;
    financeRequired?: boolean;
  financerName?: string;
  remarks?: string;
  }): Promise<ApiResponse<Booking>> {
    return apiClient.post('/bookings', data);
  }

  async updateBooking(id: string, data: {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  variant?: string;
  vcCode?: string;
  color?: string;
  fuelType?: string;
  transmission?: string;
    status?: BookingStatus;
    advisorId?: string;
  bookingDate?: string;
  expectedDeliveryDate?: string;
    stockAvailability?: string;
  financeRequired?: boolean;
  financerName?: string;
  advisorRemarks?: string;
    teamLeadRemarks?: string;
    salesManagerRemarks?: string;
    generalManagerRemarks?: string;
    adminRemarks?: string;
  }): Promise<ApiResponse<Booking>> {
    return apiClient.put(`/bookings/${id}`, data);
  }

  async updateBookingStatus(id: string, data: {
  status?: BookingStatus;
    expectedDeliveryDate?: string;
  financeRequired?: boolean;
  financerName?: string;
  advisorRemarks?: string;
    stockAvailability?: string;
  }): Promise<ApiResponse<Booking>> {
    return apiClient.put(`/bookings/${id}/update-status`, data);
  }

  async deleteBooking(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/bookings/${id}`);
  }

  async bulkAssignBookings(bookingIds: string[], advisorId: string): Promise<ApiResponse<{
    successful: number;
    failed: number;
    assignments: Array<{
      bookingId: string;
      advisorId: string;
      advisorName: string;
      success: boolean;
      error?: string;
    }>;
  }>> {
    return apiClient.post('/bookings/bulk-assign', { bookingIds, advisorId });
  }

  async autoAssignBookings(bookingIds: string[], strategy: 'ROUND_ROBIN' | 'LEAST_LOAD' | 'RANDOM'): Promise<ApiResponse<{
    successful: number;
    failed: number;
    assignments: Array<{
      bookingId: string;
      advisorId: string;
      advisorName: string;
    }>;
  }>> {
    return apiClient.post('/bookings/auto-assign', { bookingIds, strategy });
  }

  async unassignBooking(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiClient.patch(`/bookings/${bookingId}/unassign`, {});
  }

  async uploadBulkBookings(file: any): Promise<BulkImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/bookings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getImportProgress(importId: string): Promise<ApiResponse<ImportProgress>> {
    return apiClient.get(`/bookings/imports/${importId}/progress`);
  }

  async getImportHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ImportProgress>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiClient.get(`/bookings/imports?${queryParams.toString()}`);
  }

  // Additional comprehensive methods from technical guide

  // Advanced search and filtering
  async searchBookings(query: string, filters?: {
    status?: BookingStatus;
    dateFrom?: string;
    dateTo?: string;
    advisorId?: string;
    variant?: string;
    color?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.advisorId) params.append('advisorId', filters.advisorId);
    if (filters?.variant) params.append('variant', filters.variant);
    if (filters?.color) params.append('color', filters.color);

    return apiClient.get(`/bookings/search?${params.toString()}`);
  }

  // Analytics and reporting
  async getBookingAnalytics(filters?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
    advisorId?: string;
  }): Promise<ApiResponse<{
    total: number;
    byStatus: Record<string, number>;
    byAdvisor: Record<string, number>;
    byVariant: Record<string, number>;
    revenue: {
      total: number;
      byMonth: Array<{ month: string; amount: number }>;
    };
    trends: Array<{ date: string; count: number }>;
  }>> {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);
    if (filters?.advisorId) params.append('advisorId', filters.advisorId);

    return apiClient.get(`/bookings/analytics?${params.toString()}`);
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<ApiResponse<{
    totalBookings: number;
    totalEnquiries: number;
    totalQuotations: number;
    enquiryStats: {
      byCategory: Record<string, number>;
      byStatus: Record<string, number>;
    };
    quotationStats: {
      byStatus: Record<string, number>;
    };
    recentActivities: Array<{
      type: 'booking' | 'enquiry' | 'quotation';
      id: string;
      customerName: string;
      variant: string;
      status: string;
      createdAt: string;
    }>;
  }>> {
    return apiClient.get('/dashboard/stats');
  }

  // Export functionality
  async exportBookings(filters?: {
    status?: BookingStatus;
    dateFrom?: string;
    dateTo?: string;
    advisorId?: string;
    format?: 'excel' | 'csv';
  }): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.advisorId) params.append('advisorId', filters.advisorId);
    if (filters?.format) params.append('format', filters.format);

    const response = await apiClient.get(`/bookings/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  // Bulk operations
  async bulkUpdateStatus(bookingIds: string[], status: BookingStatus): Promise<ApiResponse<{
    updated: number;
    failed: number;
    results: Array<{
      bookingId: string;
      status: 'updated' | 'failed';
      error?: string;
    }>;
  }>> {
    return apiClient.post('/bookings/bulk-update-status', { bookingIds, status });
  }

  async bulkUpdateRemarks(bookingIds: string[], remarks: {
    advisorRemarks?: string;
    teamLeadRemarks?: string;
    salesManagerRemarks?: string;
    generalManagerRemarks?: string;
    adminRemarks?: string;
  }): Promise<ApiResponse<{
    updated: number;
    failed: number;
    results: Array<{
      bookingId: string;
      status: 'updated' | 'failed';
      error?: string;
    }>;
  }>> {
    return apiClient.post('/bookings/bulk-update-remarks', { bookingIds, remarks });
  }
}

export const bookingAPI = new BookingAPI();
export default bookingAPI;