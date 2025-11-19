/**
 * Service Layer Types
 * TypeScript interfaces for API requests and responses
 */

// ========== COMMON TYPES ==========

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========== ENQUIRY TYPES ==========

export enum EnquirySource {
  WALK_IN = 'WALK_IN',
  PHONE_CALL = 'PHONE_CALL',
  WEBSITE = 'WEBSITE',
  DIGITAL = 'DIGITAL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  REFERRAL = 'REFERRAL',
  ADVERTISEMENT = 'ADVERTISEMENT',
  EMAIL = 'EMAIL',
  SHOWROOM_VISIT = 'SHOWROOM_VISIT',
  EVENT = 'EVENT',
  BTL_ACTIVITY = 'BTL_ACTIVITY',
  WHATSAPP = 'WHATSAPP',
  OUTBOUND_CALL = 'OUTBOUND_CALL',
  OTHER = 'OTHER'
}

export enum EnquiryCategory {
  HOT = 'HOT',
  LOST = 'LOST',
  BOOKED = 'BOOKED'
}

export enum EnquiryStatus {
  OPEN = 'OPEN',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  CONVERTED = 'CONVERTED',
  CLOSED = 'CLOSED'
}

export interface CreateEnquiryRequest {
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  model: string;
  variant: string;
  color?: string;
  source?: EnquirySource;
  location?: string;
  expectedBookingDate: string;
  nextFollowUpDate?: string;
  caRemarks?: string;
  category?: EnquiryCategory;
  assignedToUserId?: string;
  dealerCode?: string;
  dealershipId?: string;
}

export interface UpdateEnquiryRequest {
  customerName?: string;
  customerContact?: string;
  customerEmail?: string;
  model?: string;
  variant?: string;
  color?: string;
  source?: EnquirySource;
  location?: string;
  expectedBookingDate?: string;
  nextFollowUpDate?: string;
  status?: EnquiryStatus;
  category?: EnquiryCategory;
  caRemarks?: string;
  assignedToUserId?: string;
}

export interface EnquiryFilters {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
  category?: EnquiryCategory;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dealershipId?: string;
  dealershipCode?: string;
  scope?: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  model: string;
  variant?: string;
  color?: string;
  source?: EnquirySource;
  status: EnquiryStatus;
  category: EnquiryCategory;
  expectedBookingDate?: string;
  nextFollowUpDate?: string;
  location?: string;
  caRemarks?: string;
  dealerCode?: string;
  createdByUserId: string;
  assignedToUserId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    firebaseUid: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    firebaseUid: string;
    name: string;
    email: string;
  };
  bookings?: any[];
  quotations?: any[];
  _count?: {
    bookings: number;
    quotations: number;
  };
  remarkHistory?: RemarkHistoryEntry[];
}

export interface AutoBookingResponse {
  enquiry: Enquiry;
  booking?: any;
  stockValidation?: {
    variant: string;
    inStock: boolean;
    stockLocations?: {
      zawlStock?: number;
      rasStock?: number;
      regionalStock?: number;
    };
  };
}

export interface RemarkHistoryEntry {
  id: string;
  remark: string;
  remarkType: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: {
      id?: string;
      name: string;
    };
  };
  cancelled?: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface PendingRemarksSummary {
  enquiriesPendingCount: number;
  bookingsPendingCount: number;
  enquiryIds: string[];
  bookingIds: string[];
}

export interface TodayBookingPlanEnquiry {
  id: string;
  customerName: string;
  model?: string;
  variant?: string;
  expectedBookingDate?: string;
  nextFollowUpDate?: string;
  location?: string;
}

export interface TodayBookingPlanBooking {
  id: string;
  customerName: string;
  variant?: string;
  expectedDeliveryDate?: string;
  stockAvailability?: StockAvailability | string;
  chassisNumber?: string;
  allocationOrderNumber?: string;
}

export interface TodayBookingPlan {
  enquiries: {
    total: number;
    items: TodayBookingPlanEnquiry[];
  };
  bookings: {
    total: number;
    items: TodayBookingPlanBooking[];
  };
}

// ========== BOOKING TYPES ==========

export enum BookingStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
  IN_PROGRESS = 'IN_PROGRESS',
  NO_SHOW = 'NO_SHOW',
  WAITLISTED = 'WAITLISTED',
  RESCHEDULED = 'RESCHEDULED',
  BACK_ORDER = 'BACK_ORDER',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum StockAvailability {
  VNA = 'VNA',
  VEHICLE_AVAILABLE = 'VEHICLE_AVAILABLE'
}

export type TimelineCategory = 'today' | 'delivery_today' | 'pending_update' | 'overdue';

export interface UpdateBookingRequest {
  status?: BookingStatus;
  expectedDeliveryDate?: string; // YYYY-MM-DD format
  financeRequired?: boolean;
  financerName?: string;
  stockAvailability?: StockAvailability;
  advisorRemarks?: string;
  chassisNumber?: string;
  allocationOrderNumber?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: BookingStatus;
  variant: string;
  vcCode?: string;
  color?: string;
  fuelType?: string;
  transmission?: string;
  advisorId?: string;
  advisor?: {
    firebaseUid: string;
    name: string;
    email: string;
  };
  bookingDate: string;
  expectedDeliveryDate?: string;
  financeRequired: boolean;
  financerName?: string;
  fileLoginDate?: string;
  approvalDate?: string;
  stockAvailability?: StockAvailability;
  rtoDate?: string;
  advisorRemarks?: string;
  teamLeadRemarks?: string;
  salesManagerRemarks?: string;
  generalManagerRemarks?: string;
  adminRemarks?: string;
  dealerCode?: string;
  zone?: string;
  region?: string;
  chassisNumber?: string;
  allocationOrderNumber?: string;
  createdAt: string;
  updatedAt: string;
  source?: string;
}

// ========== QUOTATION TYPES ==========

export enum QuotationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
  VIEWED = 'VIEWED',
  APPROVED = 'APPROVED',
  EXPIRED = 'EXPIRED'
}

export interface CreateQuotationRequest {
  enquiryId: string;
  amount: number;
  pdfUrl?: string;
}

export interface UpdateQuotationRequest {
  amount?: number;
  status?: QuotationStatus;
  pdfUrl?: string;
}

export interface Quotation {
  id: string;
  enquiryId: string;
  amount: number;
  status: QuotationStatus;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  enquiry?: Enquiry;
}

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Booking filters interface
export interface BookingFilters {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  timeline?: TimelineCategory;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dealershipId?: string;
  dealershipCode?: string;
  scope?: string;
}

export interface BulkImportResponse {
  success: boolean;
  message: string;
  data: {
    importId: string;
    totalRecords: number;
    processedRecords: number;
    successfulRecords: number;
    failedRecords: number;
    errors: Array<{
      row: number;
      field: string;
      message: string;
    }>;
  };
}

export interface ImportProgress {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export interface PaginatedEnquiriesResponse {
  success: boolean;
  message: string;
  data: {
    enquiries: Enquiry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginatedBookingsResponse {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
    timeline?: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginatedQuotationsResponse {
  success: boolean;
  message: string;
  data: {
    quotations: Quotation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

