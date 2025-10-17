/**
 * Booking Service
 * Handles all booking-related API operations for advisors
 */

import { apiClient, handleApiCall, ApiResponse } from '../api/client';
import {
  UpdateBookingRequest,
  Booking,
  BookingStatus,
  TimelineCategory,
  PaginatedBookingsResponse,
} from './types';
import { bookingAPI } from '../api/bookings';

/**
 * Get bookings based on user role
 * - CUSTOMER_ADVISOR: Gets only their assigned bookings
 * - Other roles (TEAM_LEAD, SALES_MANAGER, GENERAL_MANAGER): Gets all bookings
 */
export async function getMyBookings(
  timeline?: TimelineCategory,
  status?: BookingStatus,
  userRole?: string
): Promise<{ bookings: Booking[]; pagination: any; timeline?: string }> {
  let bookings: any[];
  
  if (userRole === 'CUSTOMER_ADVISOR') {
    // Customer advisors see only their own bookings
    const response = await bookingAPI.getMyBookings({
      page: 1,
      limit: 1000,
      status: status,
    });
    
    // Extract bookings from response - handle different API response structures
    const responseData = response.data as any;
    if (responseData && responseData.data && responseData.data.bookings) {
      bookings = responseData.data.bookings || [];
    } else if (responseData && typeof responseData === 'object' && 'bookings' in responseData) {
      bookings = responseData.bookings || [];
    } else if (Array.isArray(responseData)) {
      bookings = responseData;
    } else {
      bookings = [];
    }
  } else {
    // Managers see all bookings
    const response = await bookingAPI.getBookings({
      page: 1,
      limit: 1000,
      status: status,
    });
    
    // Extract bookings from response - handle different API response structures
    const responseData = response.data as any;
    if (responseData && responseData.data && responseData.data.bookings) {
      bookings = responseData.data.bookings || [];
    } else if (responseData && typeof responseData === 'object' && 'bookings' in responseData) {
      bookings = responseData.bookings || [];
    } else if (Array.isArray(responseData)) {
      bookings = responseData;
    } else {
      bookings = [];
    }
  }
  
  // Ensure bookings is a valid array
  if (!Array.isArray(bookings)) {
    bookings = [];
  }
  
  return {
    bookings: bookings as Booking[],
    pagination: {
      page: 1,
      limit: 1000,
      total: bookings.length,
      totalPages: 1,
    },
    timeline
  };
}

/**
 * Get bookings by timeline category
 */
export async function getBookingsByTimeline(
  timeline: TimelineCategory,
  userRole?: string
): Promise<{ bookings: Booking[]; pagination: any }> {
  return getMyBookings(timeline, undefined, userRole);
}

/**
 * Get bookings for today
 */
export async function getTodayBookings(userRole?: string): Promise<Booking[]> {
  const response = await getBookingsByTimeline('today', userRole);
  return response.bookings || [];
}

/**
 * Get bookings with delivery today
 */
export async function getDeliveryTodayBookings(userRole?: string): Promise<Booking[]> {
  const response = await getBookingsByTimeline('delivery_today', userRole);
  return response.bookings || [];
}

/**
 * Get bookings pending update (>24h old, still PENDING/ASSIGNED)
 */
export async function getPendingUpdateBookings(userRole?: string): Promise<Booking[]> {
  const response = await getBookingsByTimeline('pending_update', userRole);
  return response.bookings || [];
}

/**
 * Get overdue bookings (past delivery date, not delivered/cancelled)
 */
export async function getOverdueBookings(userRole?: string): Promise<Booking[]> {
  const response = await getBookingsByTimeline('overdue', userRole);
  return response.bookings || [];
}

/**
 * Get single booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  const response = await bookingAPI.getBookingById(id);
  return response.data;
}

/**
 * Update booking (advisor-editable fields only)
 */
export async function updateBooking(
  id: string,
  data: UpdateBookingRequest
): Promise<Booking> {
  const response = await bookingAPI.updateBookingStatus(id, data);
  return response.data;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  return updateBooking(id, { status: status as any });
}

/**
 * Add advisor remarks to booking
 */
export async function addBookingRemarks(
  id: string,
  advisorRemarks: string
): Promise<Booking> {
  return updateBooking(id, { advisorRemarks });
}

/**
 * Get bookings stats (count by status and timeline)
 */
export async function getBookingsStats(): Promise<{
  total: number;
  today: number;
  deliveryToday: number;
  pendingUpdate: number;
  overdue: number;
  byStatus: {
    pending: number;
    assigned: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
  };
}> {
  const [allBookings, today, deliveryToday, pendingUpdate, overdue] = await Promise.all([
    getMyBookings(),
    getTodayBookings(),
    getDeliveryTodayBookings(),
    getPendingUpdateBookings(),
    getOverdueBookings(),
  ]);
  
  const bookings = allBookings.bookings || [];
  
  return {
    total: bookings.length,
    today: today.length,
    deliveryToday: deliveryToday.length,
    pendingUpdate: pendingUpdate.length,
    overdue: overdue.length,
    byStatus: {
      pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
      assigned: bookings.filter(b => b.status === BookingStatus.ASSIGNED).length,
      confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      delivered: bookings.filter(b => b.status === BookingStatus.DELIVERED).length,
      cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
    },
  };
}

