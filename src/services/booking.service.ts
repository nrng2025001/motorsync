/**
 * Booking Service
 * Handles all booking-related API operations for advisors
 */

import { apiRequest, buildQueryString } from './api.config';
import {
  UpdateBookingRequest,
  Booking,
  BookingStatus,
  TimelineCategory,
  PaginatedBookingsResponse,
} from './types';

/**
 * Get advisor's assigned bookings
 */
export async function getMyBookings(
  timeline?: TimelineCategory,
  status?: BookingStatus
): Promise<{ bookings: Booking[]; pagination: any; timeline?: string }> {
  // Import the API class dynamically to avoid circular dependencies
  const { BookingsAPI } = await import('../api/bookings');
  
  const bookings = await BookingsAPI.getMyBookings({
    page: 1,
    limit: 1000,
    timeline,
    status,
  });
  
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
  timeline: TimelineCategory
): Promise<{ bookings: Booking[]; pagination: any }> {
  return getMyBookings(timeline);
}

/**
 * Get bookings for today
 */
export async function getTodayBookings(): Promise<Booking[]> {
  const response = await getBookingsByTimeline('today');
  return response.bookings || [];
}

/**
 * Get bookings with delivery today
 */
export async function getDeliveryTodayBookings(): Promise<Booking[]> {
  const response = await getBookingsByTimeline('delivery_today');
  return response.bookings || [];
}

/**
 * Get bookings pending update (>24h old, still PENDING/ASSIGNED)
 */
export async function getPendingUpdateBookings(): Promise<Booking[]> {
  const response = await getBookingsByTimeline('pending_update');
  return response.bookings || [];
}

/**
 * Get overdue bookings (past delivery date, not delivered/cancelled)
 */
export async function getOverdueBookings(): Promise<Booking[]> {
  const response = await getBookingsByTimeline('overdue');
  return response.bookings || [];
}

/**
 * Get single booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  const response = await apiRequest<{ booking: Booking }>(`/bookings/${id}`);
  return response.booking;
}

/**
 * Update booking (advisor-editable fields only)
 */
export async function updateBooking(
  id: string,
  data: UpdateBookingRequest
): Promise<Booking> {
  const response = await apiRequest<{ booking: Booking }>(
    `/bookings/${id}/update-status`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  
  return response.booking;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  return updateBooking(id, { status });
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

