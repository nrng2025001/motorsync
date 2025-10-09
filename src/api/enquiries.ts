import { apiClient, handleApiCall, ApiResponse, PaginatedResponse } from './client';

/**
 * Enquiries API endpoints
 * 
 * This file contains all enquiry-related API calls:
 * - CRUD operations for enquiries
 * - Status management
 * - Assignment operations
 * - Search and filtering
 */

/**
 * Enquiry status types
 */
export type EnquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

/**
 * Enquiry category types
 */
export type EnquiryCategory = 'HOT' | 'LOST' | 'BOOKED';

/**
 * Enquiry source types
 */
export type EnquirySource = 'SHOWROOM' | 'WEBSITE' | 'PHONE' | 'REFERRAL' | 'WALK_IN';

/**
 * Enquiry interface
 */
export interface Enquiry {
  id: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  model: string;
  variant: string;
  color: string;
  source: EnquirySource;
  status: EnquiryStatus;
  category: EnquiryCategory; // NEW FIELD - defaults to HOT
  expectedBookingDate?: string;
  caRemarks?: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  bookings?: any[];
  quotations?: any[];
}

/**
 * Create enquiry request interface
 */
export interface CreateEnquiryRequest {
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  model: string;
  variant?: string;
  color?: string;
  source: EnquirySource;
  expectedBookingDate?: string;
  caRemarks?: string;
  dealerCode?: string;
}

/**
 * Update enquiry request interface
 */
export interface UpdateEnquiryRequest {
  customerName?: string;
  customerContact?: string;
  customerEmail?: string;
  model?: string;
  variant?: string;
  color?: string;
  source?: EnquirySource;
  status?: EnquiryStatus;
  category?: EnquiryCategory; // NEW FIELD - for category updates
  expectedBookingDate?: string;
  caRemarks?: string;
  assignedToId?: string;
}

/**
 * Enquiry filters interface
 */
export interface EnquiryFilters {
  status?: EnquiryStatus[];
  category?: EnquiryCategory; // Changed to single category instead of array
  source?: EnquirySource[];
  assignedTo?: string[];
  model?: string[];
  variant?: string[];
  color?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * Enquiry list parameters interface
 */
export interface EnquiryListParams extends EnquiryFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'customerName' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Assignment request interface
 */
export interface AssignEnquiryRequest {
  assignedToId: string;
  notes?: string;
}

/**
 * Enquiry statistics interface
 */
export interface EnquiryStats {
  total: number;
  new: number;
  assigned: number;
  inProgress: number;
  quoted: number;
  closed: number;
  cancelled: number;
  conversionRate: number;
  avgResponseTime: number; // in hours
}

/**
 * Enquiries API class
 * Contains all enquiry-related API methods
 */
export class EnquiriesAPI {
  /**
   * Get list of enquiries with optional filtering and pagination
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<Enquiry>>
   * 
   * Example usage:
   * ```typescript
   * const enquiries = await EnquiriesAPI.getEnquiries({
   *   status: ['new', 'assigned'],
   *   page: 1,
   *   limit: 20,
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  static async getEnquiries(params?: EnquiryListParams): Promise<Enquiry[]> {
    const response = await handleApiCall(() =>
      apiClient.get<any>('/enquiries', { params })
    ) as any;
    return response.enquiries || response.data || [];
  }

  /**
   * Get a specific enquiry by ID
   * 
   * @param id - Enquiry ID
   * @returns Promise<Enquiry>
   * 
   * Note: Backend returns data in format: { enquiry: {...} }
   */
  static async getEnquiry(id: string): Promise<Enquiry> {
    const response = await handleApiCall(() =>
      apiClient.get<any>(`/enquiries/${id}`)
    );
    return response.enquiry || response.data || response;
  }

  /**
   * Create a new enquiry
   * 
   * @param enquiryData - Enquiry creation data
   * @returns Promise<Enquiry>
   * 
   * Example usage:
   * ```typescript
   * const newEnquiry = await EnquiriesAPI.createEnquiry({
   *   customerName: 'John Doe',
   *   customerEmail: 'john@example.com',
   *   customerPhone: '+1-555-0123',
   *   vehicleInterest: '2024 Toyota Camry',
   *   source: 'website',
   *   priority: 'medium'
   * });
   * ```
   */
  static async createEnquiry(enquiryData: CreateEnquiryRequest): Promise<Enquiry> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Enquiry>>('/enquiries', enquiryData)
    );
  }

  /**
   * Update an existing enquiry
   * 
   * @param id - Enquiry ID
   * @param enquiryData - Enquiry update data
   * @returns Promise<Enquiry>
   */
  static async updateEnquiry(id: string, enquiryData: UpdateEnquiryRequest): Promise<Enquiry> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<Enquiry>>(`/enquiries/${id}`, enquiryData)
    );
  }

  /**
   * Update enquiry category (handles auto-booking when category is BOOKED)
   * 
   * @param id - Enquiry ID
   * @param category - New category
   * @returns Promise<{enquiry: Enquiry, booking?: any, stockValidation?: any}>
   */
  static async updateEnquiryCategory(id: string, category: EnquiryCategory): Promise<{enquiry: Enquiry, booking?: any, stockValidation?: any}> {
    try {
      const result = await handleApiCall(() =>
        apiClient.put<ApiResponse<{enquiry: Enquiry, booking?: any, stockValidation?: any}>>(`/enquiries/${id}`, { category })
      );
      return result;
    } catch (error: any) {
      // Handle stock validation errors
      if (error.message && error.message.includes('out of stock')) {
        throw new Error(`Cannot convert to booking: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Delete an enquiry
   * 
   * @param id - Enquiry ID
   * @returns Promise<void>
   */
  static async deleteEnquiry(id: string): Promise<void> {
    return handleApiCall(() =>
      apiClient.delete<ApiResponse<void>>(`/enquiries/${id}`)
    );
  }

  /**
   * Assign an enquiry to a user
   * 
   * @param id - Enquiry ID
   * @param assignmentData - Assignment data
   * @returns Promise<Enquiry>
   */
  static async assignEnquiry(id: string, assignmentData: AssignEnquiryRequest): Promise<Enquiry> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Enquiry>>(`/enquiries/${id}/assign`, assignmentData)
    );
  }

  /**
   * Unassign an enquiry
   * 
   * @param id - Enquiry ID
   * @returns Promise<Enquiry>
   */
  static async unassignEnquiry(id: string): Promise<Enquiry> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Enquiry>>(`/enquiries/${id}/unassign`)
    );
  }

  /**
   * Update enquiry status
   * 
   * @param id - Enquiry ID
   * @param status - New status
   * @param notes - Optional status change notes
   * @returns Promise<Enquiry>
   */
  static async updateStatus(id: string, status: EnquiryStatus, notes?: string): Promise<Enquiry> {
    return handleApiCall(() =>
      apiClient.patch<ApiResponse<Enquiry>>(`/enquiries/${id}/status`, { status, notes })
    );
  }

  /**
   * Update enquiry category
   * 
   * @param id - Enquiry ID
   * @param category - New category
   * @param remarks - Optional remarks for category change
   * @returns Promise<Enquiry>
   */
  static async updateCategory(id: string, category: EnquiryCategory, remarks?: string): Promise<Enquiry> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<Enquiry>>(`/enquiries/${id}`, { 
        category,
        ...(remarks && { caRemarks: remarks })
      })
    );
  }

  /**
   * Add notes to an enquiry
   * 
   * @param id - Enquiry ID
   * @param notes - Notes to add
   * @returns Promise<Enquiry>
   */
  static async addNotes(id: string, notes: string): Promise<Enquiry> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Enquiry>>(`/enquiries/${id}/notes`, { notes })
    );
  }

  /**
   * Get enquiry statistics
   * 
   * @param filters - Optional filters for statistics
   * @returns Promise<EnquiryStats>
   */
  static async getStats(filters?: EnquiryFilters): Promise<EnquiryStats> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<EnquiryStats>>('/enquiries/stats', { params: filters })
    );
  }

  /**
   * Search enquiries
   * 
   * @param query - Search query
   * @param filters - Optional additional filters
   * @returns Promise<Enquiry[]>
   */
  static async searchEnquiries(query: string, filters?: EnquiryFilters): Promise<Enquiry[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Enquiry[]>>('/enquiries/search', {
        params: { q: query, ...filters }
      })
    );
  }

  /**
   * Get enquiries assigned to current user
   * 
   * @param params - Query parameters
   * @returns Promise<PaginatedResponse<Enquiry>>
   */
  static async getMyEnquiries(params?: EnquiryListParams): Promise<Enquiry[]> {
    const response = await handleApiCall(() =>
      apiClient.get<any>('/enquiries/my', { params })
    );
    return response.enquiries || response.data || [];
  }

  /**
   * Get available vehicle models by brand
   * 
   * @returns Promise<{ modelsByBrand: { [brand: string]: string[] } }>
   */
  static async getModels(): Promise<{ modelsByBrand: { [brand: string]: string[] } }> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<{ modelsByBrand: { [brand: string]: string[] } }>>('/enquiries/models')
    );
  }

  /**
   * Get available variants (filterable by model)
   * 
   * @param model - Optional model filter
   * @returns Promise<string[]>
   */
  static async getVariants(model?: string): Promise<string[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<string[]>>('/enquiries/variants', {
        params: model ? { model } : {}
      })
    );
  }

  /**
   * Get available colors
   * 
   * @returns Promise<string[]>
   */
  static async getColors(): Promise<string[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<string[]>>('/enquiries/colors')
    );
  }

  /**
   * Get enquiry source options
   * 
   * @returns Promise<string[]>
   */
  static async getSources(): Promise<string[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<string[]>>('/enquiries/sources')
    );
  }

  /**
   * Bulk update enquiries
   * 
   * @param ids - Array of enquiry IDs
   * @param updates - Updates to apply
   * @returns Promise<Enquiry[]>
   */
  static async bulkUpdate(ids: string[], updates: UpdateEnquiryRequest): Promise<Enquiry[]> {
    return handleApiCall(() =>
      apiClient.patch<ApiResponse<Enquiry[]>>('/enquiries/bulk', { ids, updates })
    );
  }

  /**
   * Export enquiries to CSV
   * 
   * @param filters - Optional filters for export
   * @returns Promise<Blob>
   */
  static async exportToCSV(filters?: EnquiryFilters): Promise<Blob> {
    return handleApiCall(() =>
      apiClient.get('/enquiries/export/csv', {
        params: filters,
        responseType: 'blob'
      })
    );
  }
}

export default EnquiriesAPI;
