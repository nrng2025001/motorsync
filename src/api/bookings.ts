import { apiClient, handleApiCall, ApiResponse, PaginatedResponse } from './client';

/**
 * Bookings API endpoints
 * 
 * This file contains all booking-related API calls:
 * - CRUD operations for bookings
 * - Status management
 * - Assignment operations
 * - Mobile app advisor endpoints
 * - Bulk import functionality
 */

/**
 * Booking status types
 */
export type BookingStatus = 
  | 'PENDING' 
  | 'ASSIGNED' 
  | 'CONFIRMED' 
  | 'DELIVERED' 
  | 'CANCELLED';

/**
 * Booking source types
 */
export type BookingSource = 'MANUAL' | 'BULK_IMPORT' | 'API' | 'MOBILE';

/**
 * Timeline category types for advisor bookings
 */
export type TimelineCategory = 'today' | 'delivery_today' | 'pending_update' | 'overdue';

/**
 * Stock availability types
 */
export type StockAvailability = 'VNA' | 'VEHICLE_AVAILABLE';

/**
 * Booking interface
 */
export interface Booking {
  id: string;
  optyId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  variant: string;
  vcCode: string;
  color: string;
  fuelType: string;
  transmission: string;
  bookingDate: string;
  division: string;
  empName: string;
  employeeLogin: string;
  financeRequired: boolean;
  financerName?: string;
  fileLoginDate: string;
  approvalDate?: string;
  stockAvailability: string;
  status: BookingStatus;
  expectedDeliveryDate?: string;
  backOrderStatus?: boolean;
  rtoDate?: string;
  
  // Legacy remarks field (read-only)
  remarks?: string;
  
  // Role-specific remarks fields
  advisorRemarks?: string;
  teamLeadRemarks?: string;
  salesManagerRemarks?: string;
  generalManagerRemarks?: string;
  adminRemarks?: string;
  
  zone: string;
  region: string;
  dealerCode: string;
  dealerName: string;
  dealerType: string;
  source: BookingSource;
  assignedToId?: string;
  assignedToName?: string;
  advisorId?: string;
  createdAt: string;
  updatedAt: string;
  enquiryId?: string;
  quotationId?: string;
}

/**
 * Create booking request interface
 */
export interface CreateBookingRequest {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  variant: string;
  vcCode: string;
  color: string;
  fuelType: string;
  transmission: string;
  bookingDate: string;
  division: string;
  empName: string;
  employeeLogin: string;
  financeRequired: boolean;
  financerName?: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  zone: string;
  region: string;
  dealerCode: string;
  dealerName: string;
  enquiryId?: string;
  quotationId?: string;
}

/**
 * Update booking request interface
 */
export interface UpdateBookingRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  variant?: string;
  vcCode?: string;
  color?: string;
  fuelType?: string;
  transmission?: string;
  bookingDate?: string;
  division?: string;
  empName?: string;
  employeeLogin?: string;
  financeRequired?: boolean;
  financerName?: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  zone?: string;
  region?: string;
  dealerCode?: string;
  dealerName?: string;
}

/**
 * Booking filters interface
 */
export interface BookingFilters {
  status?: BookingStatus[];
  source?: BookingSource[];
  dealerType?: string[];
  zone?: string[];
  region?: string[];
  fuelType?: string[];
  transmission?: string[];
  financeRequired?: boolean;
  assignedTo?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * Booking list parameters interface
 */
export interface BookingListParams extends BookingFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'bookingDate' | 'customerName';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Assignment request interface
 */
export interface AssignBookingRequest {
  assignedToId: string;
  notes?: string;
}

/**
 * Advisor booking update request interface
 */
export interface UpdateBookingRequest {
  status?: BookingStatus;
  expectedDeliveryDate?: string; // ISO DateTime
  financeRequired?: boolean;
  financerName?: string;
  fileLoginDate?: string; // ISO DateTime
  approvalDate?: string; // ISO DateTime
  stockAvailability?: StockAvailability;
  backOrderStatus?: boolean;
  rtoDate?: string; // ISO DateTime
  advisorRemarks?: string;
}

/**
 * Status update request interface
 */
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  notes?: string;
}

/**
 * Add remarks request interface
 */
export interface AddRemarksRequest {
  remarks: string;
}

/**
 * Update booking fields request interface (Advisor-editable fields)
 */
export interface UpdateBookingFieldsRequest {
  status?: BookingStatus;
  financeRequired?: boolean;
  financerName?: string;
  fileLoginDate?: string;
  approvalDate?: string;
  stockAvailability?: 'VNA' | 'VEHICLE_AVAILABLE';
  expectedDeliveryDate?: string;
  backOrderStatus?: boolean;
  rtoDate?: string;
  advisorRemarks?: string;
}

/**
 * Booking statistics interface
 */
export interface BookingStats {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  confirmed: number;
  delivered: number;
  cancelled: number;
  noShow: number;
  waitlisted: number;
  rescheduled: number;
  backOrder: number;
  approved: number;
  rejected: number;
  conversionRate: number;
  avgProcessingTime: number; // in hours
}

/**
 * Bulk import interfaces
 */
export interface ImportUploadResponse {
  importId: string;
  message: string;
  fileName: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface ImportPreviewResponse {
  totalRows: number;
  validRows: number;
  errorRows: number;
  preview: any[];
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface ImportStatus {
  id: string;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalRows: number;
  processedRows: number;
  errorRows: number;
  createdAt: string;
  completedAt?: string;
  errors?: ImportError[];
}

/**
 * Bookings API class
 * Contains all booking-related API methods
 */
export class BookingsAPI {
  /**
   * Get list of bookings with optional filtering and pagination
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<Booking>>
   * 
   * Example usage:
   * ```typescript
   * const bookings = await BookingsAPI.getBookings({
   *   status: ['PENDING', 'ASSIGNED'],
   *   dealerType: ['TATA', 'MARUTI'],
   *   page: 1,
   *   limit: 20,
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  static async getBookings(params?: BookingListParams): Promise<Booking[]> {
    const response = await handleApiCall(() =>
      apiClient.get<any>('/bookings', { params })
    ) as any;
    return response.bookings || response.data || [];
  }

  /**
   * Get a specific booking by ID
   * 
   * @param id - Booking ID
   * @returns Promise<Booking>
   */
  static async getBooking(id: string): Promise<Booking> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`)
    );
  }


  /**
   * Update booking (advisor-editable fields only)
   * 
   * @param id - Booking ID
   * @param data - Update data
   * @returns Promise<Booking>
   */
  static async updateBooking(id: string, data: UpdateBookingRequest): Promise<Booking> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/update-status`, data)
    );
  }

  /**
   * Create a new booking
   * 
   * @param bookingData - Booking creation data
   * @returns Promise<Booking>
   * 
   * Example usage:
   * ```typescript
   * const newBooking = await BookingsAPI.createBooking({
   *   customerName: 'John Doe',
   *   customerPhone: '+919876543210',
   *   customerEmail: 'john@example.com',
   *   variant: 'Harrier XZ Plus',
   *   vcCode: 'HARRIER_XZ_PLUS',
   *   color: 'White',
   *   fuelType: 'PETROL',
   *   transmission: 'AUTOMATIC',
   *   bookingDate: '2024-01-15',
   *   division: 'Passenger Vehicles',
   *   empName: 'Sales Advisor',
   *   employeeLogin: 'advisor001',
   *   financeRequired: true,
   *   zone: 'North',
   *   region: 'North-1',
   *   dealerCode: 'TATA001',
   *   dealerName: 'Tata Motors North'
   * });
   * ```
   */
  static async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Booking>>('/bookings', bookingData)
    );
  }


  /**
   * Delete a booking (Admin only)
   * 
   * @param id - Booking ID
   * @returns Promise<void>
   */
  static async deleteBooking(id: string): Promise<void> {
    return handleApiCall(() =>
      apiClient.delete<ApiResponse<void>>(`/bookings/${id}`)
    );
  }

  /**
   * Assign a booking to an advisor (Manager+)
   * 
   * @param id - Booking ID
   * @param assignmentData - Assignment data
   * @returns Promise<Booking>
   */
  static async assignBooking(id: string, assignmentData: AssignBookingRequest): Promise<Booking> {
    return handleApiCall(() =>
      apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/assign`, assignmentData)
    );
  }

  /**
   * Get booking audit history (Manager+)
   * 
   * @param id - Booking ID
   * @returns Promise<any[]>
   */
  static async getBookingAudit(id: string): Promise<any[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<any[]>>(`/bookings/${id}/audit`)
    );
  }

  /**
   * Get advisor's assigned bookings (Mobile app)
   * 
   * @param params - Query parameters
   * @returns Promise<PaginatedResponse<Booking>>
   */
  static async getMyBookings(params?: BookingListParams): Promise<Booking[]> {
    const response = await handleApiCall(() =>
      apiClient.get<any>('/bookings/advisor/my-bookings', { params })
    ) as any;
    return response.bookings || response.data || [];
  }

  /**
   * Update booking status (Advisor - own bookings only)
   * 
   * @param id - Booking ID
   * @param statusData - Status update data
   * @returns Promise<Booking>
   */
  static async updateBookingStatus(id: string, statusData: UpdateBookingStatusRequest): Promise<Booking> {
    return handleApiCall(() =>
      apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, statusData)
    );
  }

  /**
   * Add remarks to booking (Advisor - own bookings only)
   * 
   * @param id - Booking ID
   * @param remarksData - Remarks data
   * @returns Promise<Booking>
   */
  static async addRemarks(id: string, remarksData: AddRemarksRequest): Promise<Booking> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/remarks`, remarksData)
    );
  }

  /**
   * Update booking fields (Advisor-editable fields only)
   * Uses the new /update-status endpoint that supports multiple field updates
   * 
   * @param id - Booking ID
   * @param fieldsData - Fields to update
   * @returns Promise<Booking>
   */
  static async updateBookingFields(id: string, fieldsData: UpdateBookingFieldsRequest): Promise<any> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<any>>(`/bookings/${id}/update-status`, fieldsData)
    );
  }

  /**
   * Get booking statistics
   * 
   * @param filters - Optional filters for statistics
   * @returns Promise<BookingStats>
   */
  static async getStats(filters?: BookingFilters): Promise<BookingStats> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<BookingStats>>('/bookings/stats', { params: filters })
    );
  }

  /**
   * Search bookings
   * 
   * @param query - Search query
   * @param filters - Optional additional filters
   * @returns Promise<Booking[]>
   */
  static async searchBookings(query: string, filters?: BookingFilters): Promise<Booking[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Booking[]>>('/bookings/search', {
        params: { q: query, ...filters }
      })
    );
  }

  // Bulk Import Methods

  /**
   * Upload Excel/CSV file for bulk import (Admin/Manager)
   * 
   * @param file - File to upload
   * @returns Promise<ImportUploadResponse>
   */
  static async uploadImportFile(file: File): Promise<ImportUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return handleApiCall(() =>
      apiClient.post<ApiResponse<ImportUploadResponse>>('/bookings/import/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  }

  /**
   * Preview import data (Admin/Manager)
   * 
   * @param file - File to preview
   * @returns Promise<ImportPreviewResponse>
   */
  static async previewImportFile(file: File): Promise<ImportPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return handleApiCall(() =>
      apiClient.post<ApiResponse<ImportPreviewResponse>>('/bookings/import/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  }

  /**
   * Get import history (Admin/Manager)
   * 
   * @returns Promise<ImportStatus[]>
   */
  static async getImports(): Promise<ImportStatus[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<ImportStatus[]>>('/bookings/imports')
    );
  }

  /**
   * Get specific import details (Admin/Manager)
   * 
   * @param id - Import ID
   * @returns Promise<ImportStatus>
   */
  static async getImportDetails(id: string): Promise<ImportStatus> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<ImportStatus>>(`/bookings/imports/${id}`)
    );
  }

  /**
   * Download import errors CSV (Admin/Manager)
   * 
   * @param id - Import ID
   * @returns Promise<Blob>
   */
  static async downloadImportErrors(id: string): Promise<Blob> {
    return handleApiCall(() =>
      apiClient.get(`/bookings/imports/${id}/errors`, {
        responseType: 'blob'
      })
    );
  }
}

export default BookingsAPI;
