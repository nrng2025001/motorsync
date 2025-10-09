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
  SHOWROOM = 'SHOWROOM',
  WEBSITE = 'WEBSITE',
  PHONE = 'PHONE',
  REFERRAL = 'REFERRAL',
  WALK_IN = 'WALK_IN'
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
  variant?: string;
  color?: string;
  source: EnquirySource;
  expectedBookingDate?: string;
  caRemarks?: string;
  dealerCode?: string;
}

export interface UpdateEnquiryRequest {
  customerName?: string;
  customerContact?: string;
  customerEmail?: string;
  model?: string;
  variant?: string;
  color?: string;
  status?: EnquiryStatus;
  category?: EnquiryCategory;
  caRemarks?: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  model: string;
  variant?: string;
  color?: string;
  source: EnquirySource;
  status: EnquiryStatus;
  category: EnquiryCategory;
  expectedBookingDate?: string;
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
  bookings?: any[];
  quotations?: any[];
  _count?: {
    bookings: number;
    quotations: number;
  };
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

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: BookingStatus;
  variant: string;
  color?: string;
  fuelType?: string;
  transmission?: string;
  bookingDate: string;
  expectedDeliveryDate?: string;
  financeRequired: boolean;
  financerName?: string;
  fileLoginDate?: string;
  approvalDate?: string;
  stockAvailability?: StockAvailability;
  backOrderStatus: boolean;
  rtoDate?: string;
  advisorRemarks?: string;
  dealerCode?: string;
  zone?: string;
  region?: string;
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
  data?: T;
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

