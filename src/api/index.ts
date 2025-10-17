/**
 * API Index
 * 
 * Central export point for all API modules
 * This file exports all API classes and types for easy importing
 */

// Export the main API client and utilities
export { default as apiClient, debounce, healthCheck } from './client';
export type { ApiResponse, PaginatedResponse, ApiError } from './client';

// Export Authentication API
export { default as AuthAPI } from './auth';
export type {
  FirebaseSyncRequest,
  FirebaseSyncResponse,
  CreateUserRequest,
  UpdateUserRoleRequest,
  UserManagementResponse,
} from './auth';

// Export Enquiries API
export { default as EnquiriesAPI, enquiryAPI } from './enquiries';
export type {
  Enquiry,
  EnquiryStatus,
  EnquirySource,
  EnquiryCategory,
  CreateEnquiryRequest,
  UpdateEnquiryRequest,
} from '../services/types';

// Export Bookings API
export { default as BookingsAPI, bookingAPI } from './bookings';
export type {
  Booking,
  BookingStatus,
  UpdateBookingRequest,
  StockAvailability,
  TimelineCategory,
} from '../services/types';

// Export Quotations API
export { default as QuotationsAPI } from './quotations';
export type {
  Quotation,
  QuotationItem,
  QuotationStatus,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationFilters,
  QuotationListParams,
  SendQuotationRequest,
  ApproveQuotationRequest,
  RejectQuotationRequest,
  QuotationStats,
  QuotationTemplate,
} from './quotations';

// Export Stock API
export { default as StockAPI } from './stock';
export type {
  Stock,
  CreateStockRequest,
  UpdateStockRequest,
  StockFilters,
  StockListParams,
  StockStats,
} from './stock';

// Export Catalog API
export { CatalogAPI } from './catalog';

// Export Files API
export { default as FilesAPI } from './files';
export type {
  File,
  FileUploadResponse,
  FileUploadRequest,
  FileFilters,
  FileListParams,
  FileStats,
} from './files';

/**
 * API Configuration
 * 
 * Environment-specific API configuration
 * You can modify these based on your deployment environment
 */
export const API_CONFIG = {
  // Base URLs for different environments
  DEVELOPMENT: 'https://automotive-backend-frqe.onrender.com/api',
  STAGING: 'https://automotive-backend-frqe.onrender.com/api',
  PRODUCTION: 'https://automotive-backend-frqe.onrender.com/api',
  
  // Timeout configurations
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  UPLOAD_TIMEOUT: 30000,  // 30 seconds for file uploads
  
  // Retry configurations
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Cache configurations
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * API Endpoints
 * 
 * Centralized endpoint definitions
 * Useful for documentation and testing
 */
export const API_ENDPOINTS = {
  // Health & Info endpoints
  HEALTH: '/health',
  VERSION: '/version',
  
  // Authentication & User Management
  AUTH: {
    SYNC: '/auth/sync',
    PROFILE: '/auth/profile',
    USERS: '/auth/users',
    USER_ROLE: '/auth/users/:uid/role',
    USER_DEACTIVATE: '/auth/users/:uid/deactivate',
    USER_ACTIVATE: '/auth/users/:uid/activate',
  },
  
  // Enhanced Enquiries
  ENQUIRIES: {
    LIST: '/enquiries',
    CREATE: '/enquiries',
    DETAIL: '/enquiries/:id',
    UPDATE: '/enquiries/:id',
    DELETE: '/enquiries/:id',
    MODELS: '/enquiries/models',
    VARIANTS: '/enquiries/variants',
    COLORS: '/enquiries/colors',
    SOURCES: '/enquiries/sources',
  },
  
  // Enhanced Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAIL: '/bookings/:id',
    UPDATE: '/bookings/:id',
    DELETE: '/bookings/:id',
    ASSIGN: '/bookings/:id/assign',
    AUDIT: '/bookings/:id/audit',
    ADVISOR_MY: '/bookings/advisor/my-bookings',
    STATUS_UPDATE: '/bookings/:id/status',
    REMARKS: '/bookings/:id/remarks',
  },
  
  // Bulk Import
  IMPORT: {
    UPLOAD: '/bookings/import/upload',
    PREVIEW: '/bookings/import/preview',
    IMPORTS: '/bookings/imports',
    IMPORT_DETAIL: '/bookings/imports/:id',
    IMPORT_ERRORS: '/bookings/imports/:id/errors',
  },
  
  // Quotations
  QUOTATIONS: {
    LIST: '/quotations',
    CREATE: '/quotations',
    DETAIL: '/quotations/:id',
    UPDATE: '/quotations/:id',
    DELETE: '/quotations/:id',
  },
  
  // Stock Management
  STOCK: {
    LIST: '/stock',
    CREATE: '/stock',
    DETAIL: '/stock/:id',
    UPDATE: '/stock/:id',
    DELETE: '/stock/:id',
  },
  
  // File Management
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: '/files/:id/download',
    DELETE: '/files/:id',
    LIST: '/files',
  },
} as const;

/**
 * HTTP Status Codes
 * 
 * Common HTTP status codes for reference
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error Messages
 * 
 * Standardized error messages for consistent user experience
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'Access denied. You don\'t have permission for this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * API Utility Functions
 */

/**
 * Build endpoint URL with parameters
 * 
 * @param endpoint - Endpoint template with :param placeholders
 * @param params - Parameters to replace in the template
 * @returns Formatted endpoint URL
 * 
 * Example:
 * ```typescript
 * const url = buildEndpoint('/enquiries/:id/notes', { id: '123' });
 * // Returns: '/enquiries/123/notes'
 * ```
 */
export function buildEndpoint(endpoint: string, params: Record<string, string | number> = {}): string {
  let url = endpoint;
  
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  
  return url;
}

/**
 * Check if error is a network error
 * 
 * @param error - Error object
 * @returns True if network error
 */
export function isNetworkError(error: any): boolean {
  return !error.response && error.request;
}

/**
 * Check if error is a timeout error
 * 
 * @param error - Error object
 * @returns True if timeout error
 */
export function isTimeoutError(error: any): boolean {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
}

/**
 * Get error status code
 * 
 * @param error - Error object
 * @returns HTTP status code or null
 */
export function getErrorStatus(error: any): number | null {
  return error.response?.status || null;
}

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
