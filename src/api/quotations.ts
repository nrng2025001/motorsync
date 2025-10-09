import { apiClient, handleApiCall, ApiResponse, PaginatedResponse } from './client';

/**
 * Quotations API endpoints
 * 
 * This file contains all quotation-related API calls:
 * - CRUD operations for quotations
 * - Status management
 * - Approval workflows
 * - PDF generation
 * - Email sending
 */

/**
 * Quotation status types
 */
export type QuotationStatus = 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED';

/**
 * Quotation item interface
 */
export interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

/**
 * Quotation interface
 */
export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleDetails: string;
  status: QuotationStatus;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdById: string;
  approvedBy?: string;
  approvedById?: string;
  approvedAt?: string;
  sentAt?: string;
  viewedAt?: string;
  notes?: string;
  terms?: string;
  enquiryId?: string;
}

/**
 * Create quotation request interface
 */
export interface CreateQuotationRequest {
  enquiryId: string;
  amount: number;
  pdfUrl?: string;
}

/**
 * Update quotation request interface
 */
export interface UpdateQuotationRequest {
  amount?: number;
  status?: QuotationStatus;
  pdfUrl?: string;
}

/**
 * Quotation filters interface
 */
export interface QuotationFilters {
  status?: QuotationStatus[];
  createdBy?: string[];
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  expiring?: boolean; // Show only quotations expiring soon
}

/**
 * Quotation list parameters interface
 */
export interface QuotationListParams extends QuotationFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'validUntil' | 'quotationNumber';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Send quotation request interface
 */
export interface SendQuotationRequest {
  recipientEmail?: string; // If different from customer email
  subject?: string;
  message?: string;
  attachPDF?: boolean;
}

/**
 * Quotation approval request interface
 */
export interface ApproveQuotationRequest {
  notes?: string;
}

/**
 * Quotation rejection request interface
 */
export interface RejectQuotationRequest {
  reason: string;
  notes?: string;
}

/**
 * Quotation statistics interface
 */
export interface QuotationStats {
  total: number;
  draft: number;
  sent: number;
  viewed: number;
  approved: number;
  rejected: number;
  expired: number;
  totalValue: number;
  approvedValue: number;
  conversionRate: number;
  avgQuotationValue: number;
}

/**
 * Quotation template interface
 */
export interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  items: Omit<QuotationItem, 'id' | 'total'>[];
  terms?: string;
  validityDays: number;
  isActive: boolean;
}

/**
 * Quotations API class
 * Contains all quotation-related API methods
 */
export class QuotationsAPI {
  /**
   * Get list of quotations with optional filtering and pagination
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise<PaginatedResponse<Quotation>>
   * 
   * Example usage:
   * ```typescript
   * const quotations = await QuotationsAPI.getQuotations({
   *   status: ['sent', 'viewed'],
   *   page: 1,
   *   limit: 20,
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  static async getQuotations(params?: QuotationListParams): Promise<Quotation[]> {
    const response = await handleApiCall(() =>
      apiClient.get<any>('/quotations', { params })
    );
    return response.quotations || response.data || [];
  }

  /**
   * Get a specific quotation by ID
   * 
   * @param id - Quotation ID
   * @returns Promise<Quotation>
   */
  static async getQuotation(id: string): Promise<Quotation> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Quotation>>(`/quotations/${id}`)
    );
  }

  /**
   * Create a new quotation
   * 
   * @param quotationData - Quotation creation data
   * @returns Promise<Quotation>
   * 
   * Example usage:
   * ```typescript
   * const newQuotation = await QuotationsAPI.createQuotation({
   *   customerName: 'John Doe',
   *   customerEmail: 'john@example.com',
   *   vehicleDetails: '2024 Toyota Camry',
   *   items: [
   *     {
   *       description: '2024 Toyota Camry LE',
   *       quantity: 1,
   *       unitPrice: 30000
   *     }
   *   ],
   *   validUntil: '2024-02-15T23:59:59Z'
   * });
   * ```
   */
  static async createQuotation(quotationData: CreateQuotationRequest): Promise<Quotation> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Quotation>>('/quotations', quotationData)
    );
  }

  /**
   * Update an existing quotation
   * 
   * @param id - Quotation ID
   * @param quotationData - Quotation update data
   * @returns Promise<Quotation>
   */
  static async updateQuotation(id: string, quotationData: UpdateQuotationRequest): Promise<Quotation> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<Quotation>>(`/quotations/${id}`, quotationData)
    );
  }

  /**
   * Delete a quotation
   * 
   * @param id - Quotation ID
   * @returns Promise<void>
   */
  static async deleteQuotation(id: string): Promise<void> {
    return handleApiCall(() =>
      apiClient.delete<ApiResponse<void>>(`/quotations/${id}`)
    );
  }

  /**
   * Send a quotation to customer
   * 
   * @param id - Quotation ID
   * @param sendData - Send configuration
   * @returns Promise<Quotation>
   */
  static async sendQuotation(id: string, sendData?: SendQuotationRequest): Promise<Quotation> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/send`, sendData)
    );
  }

  /**
   * Approve a quotation
   * 
   * @param id - Quotation ID
   * @param approvalData - Approval data
   * @returns Promise<Quotation>
   */
  static async approveQuotation(id: string, approvalData?: ApproveQuotationRequest): Promise<Quotation> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/approve`, approvalData)
    );
  }

  /**
   * Reject a quotation
   * 
   * @param id - Quotation ID
   * @param rejectionData - Rejection data
   * @returns Promise<Quotation>
   */
  static async rejectQuotation(id: string, rejectionData: RejectQuotationRequest): Promise<Quotation> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/reject`, rejectionData)
    );
  }

  /**
   * Duplicate a quotation
   * 
   * @param id - Quotation ID to duplicate
   * @returns Promise<Quotation>
   */
  static async duplicateQuotation(id: string): Promise<Quotation> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/duplicate`)
    );
  }

  /**
   * Generate PDF for a quotation
   * 
   * @param id - Quotation ID
   * @returns Promise<Blob>
   */
  static async generatePDF(id: string): Promise<Blob> {
    return handleApiCall(() =>
      apiClient.get(`/quotations/${id}/pdf`, {
        responseType: 'blob'
      })
    );
  }

  /**
   * Get quotation statistics
   * 
   * @param filters - Optional filters for statistics
   * @returns Promise<QuotationStats>
   */
  static async getStats(filters?: QuotationFilters): Promise<QuotationStats> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<QuotationStats>>('/quotations/stats', { params: filters })
    );
  }

  /**
   * Search quotations
   * 
   * @param query - Search query
   * @param filters - Optional additional filters
   * @returns Promise<Quotation[]>
   */
  static async searchQuotations(query: string, filters?: QuotationFilters): Promise<Quotation[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Quotation[]>>('/quotations/search', {
        params: { q: query, ...filters }
      })
    );
  }

  /**
   * Get quotations created by current user
   * 
   * @param params - Query parameters
   * @returns Promise<PaginatedResponse<Quotation>>
   */
  static async getMyQuotations(params?: QuotationListParams): Promise<Quotation[]> {
    const response = await handleApiCall(() =>
      apiClient.get<any>('/quotations/my', { params })
    );
    return response.quotations || response.data || [];
  }

  /**
   * Get expiring quotations
   * 
   * @param days - Number of days to check (default: 7)
   * @returns Promise<Quotation[]>
   */
  static async getExpiringQuotations(days = 7): Promise<Quotation[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Quotation[]>>('/quotations/expiring', {
        params: { days }
      })
    );
  }

  /**
   * Get quotation templates
   * 
   * @returns Promise<QuotationTemplate[]>
   */
  static async getTemplates(): Promise<QuotationTemplate[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<QuotationTemplate[]>>('/quotations/templates')
    );
  }

  /**
   * Create quotation from template
   * 
   * @param templateId - Template ID
   * @param customerData - Customer data
   * @returns Promise<Quotation>
   */
  static async createFromTemplate(
    templateId: string,
    customerData: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      vehicleDetails: string;
    }
  ): Promise<Quotation> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Quotation>>(`/quotations/templates/${templateId}/create`, customerData)
    );
  }

  /**
   * Export quotations to CSV
   * 
   * @param filters - Optional filters for export
   * @returns Promise<Blob>
   */
  static async exportToCSV(filters?: QuotationFilters): Promise<Blob> {
    return handleApiCall(() =>
      apiClient.get('/quotations/export/csv', {
        params: filters,
        responseType: 'blob'
      })
    );
  }

  /**
   * Get quotation activity/history
   * 
   * @param id - Quotation ID
   * @returns Promise<any[]>
   */
  static async getActivity(id: string): Promise<any[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<any[]>>(`/quotations/${id}/activity`)
    );
  }
}

export default QuotationsAPI;
