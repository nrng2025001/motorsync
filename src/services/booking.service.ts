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
  userRole?: string,
  currentUserId?: string,
  options?: { dealershipId?: string; dealershipCode?: string; scope?: string }
): Promise<{ bookings: Booking[]; pagination: any; timeline?: string }> {
  let bookings: any[];
  
  if (userRole === 'CUSTOMER_ADVISOR') {
    // Customer advisors see only their own bookings
    const response = await bookingAPI.getMyBookings({
      page: 1,
      limit: 1000,
      status: status,
      timeline: timeline, // Pass timeline filter to API
      dealershipId: options?.dealershipId,
      dealershipCode: options?.dealershipCode,
      scope: options?.scope,
    });
    
    // Extract bookings from response - handle different API response structures
    const responseData = response.data as any;
    
    // Debug logging to understand response structure
    if (__DEV__) {
      console.log('📦 Raw API Response:', JSON.stringify(response).substring(0, 500));
      console.log('📦 Response Data:', JSON.stringify(responseData).substring(0, 500));
      console.log('📦 Response Data Keys:', responseData ? Object.keys(responseData) : 'null');
      if (responseData?.data) {
        console.log('📦 Response Data.data Keys:', Object.keys(responseData.data));
      }
    }
    
    // Try multiple response structures
    if (responseData?.data?.bookings && Array.isArray(responseData.data.bookings)) {
      bookings = responseData.data.bookings;
      if (__DEV__) console.log('✅ Found bookings in response.data.data.bookings:', bookings.length);
    } else if (responseData?.data?.data?.bookings && Array.isArray(responseData.data.data.bookings)) {
      bookings = responseData.data.data.bookings;
      if (__DEV__) console.log('✅ Found bookings in response.data.data.data.bookings:', bookings.length);
    } else if (responseData?.bookings && Array.isArray(responseData.bookings)) {
      bookings = responseData.bookings;
      if (__DEV__) console.log('✅ Found bookings in response.data.bookings:', bookings.length);
    } else if (Array.isArray(responseData)) {
      bookings = responseData;
      if (__DEV__) console.log('✅ Response data is array:', bookings.length);
    } else if (Array.isArray(responseData?.data)) {
      bookings = responseData.data;
      if (__DEV__) console.log('✅ Found bookings in response.data (array):', bookings.length);
    } else {
      bookings = [];
      if (__DEV__) {
        console.warn('⚠️ No bookings found in response. Response structure:', {
          hasData: !!responseData,
          hasDataData: !!responseData?.data,
          isArray: Array.isArray(responseData),
          keys: responseData ? Object.keys(responseData) : 'null'
        });
      }
    }
    
    // Client-side filtering: Ensure customer advisors only see their assigned bookings
    if (currentUserId) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 FILTERING BOOKINGS FOR USER:', currentUserId);
      console.log('📊 Total bookings received:', bookings.length);
      
      // Log sample advisorIds from bookings to debug ID mismatch
      if (bookings.length > 0) {
        const sampleAdvisorIds = bookings.slice(0, 5).map((b: any) => ({
          bookingId: b.id,
          advisorId: b.advisorId,
          advisorIdType: typeof b.advisorId,
          matches: b.advisorId === currentUserId
        }));
        console.log('📋 Sample advisorIds from bookings:', sampleAdvisorIds);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const beforeFilter = bookings.length;
      
      bookings = bookings.filter((booking: any) => {
        // Explicitly check if booking has an advisorId
        const hasAdvisorId = booking.advisorId && (typeof booking.advisorId === 'string' ? booking.advisorId.trim() !== '' : !!booking.advisorId);
        
        // CRITICAL: Only match on advisorId - this is the primary assignment field
        // Try both string comparison and convert to string if needed
        const advisorIdStr = String(booking.advisorId || '').trim();
        const currentUserIdStr = String(currentUserId || '').trim();
        const isAssignedToCurrentUser = advisorIdStr === currentUserIdStr;
        
        // Only show bookings that:
        // 1. Have an advisorId AND
        // 2. Are assigned to the current user
        const shouldShow = hasAdvisorId && isAssignedToCurrentUser;
        
        if (__DEV__ && hasAdvisorId && !isAssignedToCurrentUser) {
          console.log(`🔍 Booking ${booking.id} filtered out: advisorId "${advisorIdStr}" !== currentUserId "${currentUserIdStr}"`);
        }
        
        return shouldShow;
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Before filter:', beforeFilter);
      console.log('📊 After filter:', bookings.length);
      console.log('📊 Removed:', beforeFilter - bookings.length);
      if (bookings.length === 0 && beforeFilter > 0) {
        console.warn('⚠️ WARNING: All bookings were filtered out!');
        console.warn('⚠️ This suggests an ID mismatch between booking.advisorId and currentUserId');
        console.warn('⚠️ Check if advisorId uses Firebase UID, backend user ID, or employee ID');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (bookings.length === beforeFilter && beforeFilter > 4) {
        console.log('⚠️ WARNING: All bookings have same advisorId as current user!');
        console.log('⚠️ This likely indicates a backend data issue.');
        console.log('⚠️ Please check the database to ensure advisorId is correct for each booking.');
      }
    } else {
      console.log('⚠️ No currentUserId provided - skipping filter');
    }
  } else {
    // Managers see all bookings
    const response = await bookingAPI.getBookings({
      page: 1,
      limit: 1000,
      status: status,
      dealershipId: options?.dealershipId,
      dealershipCode: options?.dealershipCode,
      scope: options?.scope,
    });
    
    // Extract bookings from response - handle different API response structures
    const responseData = response.data as any;
    
    // Debug logging to understand response structure
    if (__DEV__) {
      console.log('📦 Raw API Response (Manager):', JSON.stringify(response).substring(0, 500));
      console.log('📦 Response Data (Manager):', JSON.stringify(responseData).substring(0, 500));
      console.log('📦 Response Data Keys (Manager):', responseData ? Object.keys(responseData) : 'null');
      if (responseData?.data) {
        console.log('📦 Response Data.data Keys (Manager):', Object.keys(responseData.data));
      }
    }
    
    // Try multiple response structures
    if (responseData?.data?.bookings && Array.isArray(responseData.data.bookings)) {
      bookings = responseData.data.bookings;
      if (__DEV__) console.log('✅ Found bookings in response.data.data.bookings (Manager):', bookings.length);
    } else if (responseData?.data?.data?.bookings && Array.isArray(responseData.data.data.bookings)) {
      bookings = responseData.data.data.bookings;
      if (__DEV__) console.log('✅ Found bookings in response.data.data.data.bookings (Manager):', bookings.length);
    } else if (responseData?.bookings && Array.isArray(responseData.bookings)) {
      bookings = responseData.bookings;
      if (__DEV__) console.log('✅ Found bookings in response.data.bookings (Manager):', bookings.length);
    } else if (Array.isArray(responseData)) {
      bookings = responseData;
      if (__DEV__) console.log('✅ Response data is array (Manager):', bookings.length);
    } else if (Array.isArray(responseData?.data)) {
      bookings = responseData.data;
      if (__DEV__) console.log('✅ Found bookings in response.data (array) (Manager):', bookings.length);
    } else {
      bookings = [];
      if (__DEV__) {
        console.warn('⚠️ No bookings found in response (Manager). Response structure:', {
          hasData: !!responseData,
          hasDataData: !!responseData?.data,
          isArray: Array.isArray(responseData),
          keys: responseData ? Object.keys(responseData) : 'null'
        });
      }
    }
  }
  
  // Ensure bookings is a valid array
  if (!Array.isArray(bookings)) {
    bookings = [];
  }
  
  // Additional safety filter: For customer advisors, ensure we NEVER show bookings without advisorId
  if (userRole === 'CUSTOMER_ADVISOR') {
    const beforeAdvisorCheck = bookings.length;
    bookings = bookings.filter((booking: any) => {
      const hasAdvisorId = booking.advisorId && typeof booking.advisorId === 'string' && booking.advisorId.trim() !== '';
      if (!hasAdvisorId) {
        console.log('🚫 Removed booking without advisorId:', booking.id);
      }
      return hasAdvisorId;
    });
    
    if (bookings.length !== beforeAdvisorCheck) {
      console.log('🚫 Removed bookings without advisorId:', beforeAdvisorCheck - bookings.length);
    }
  }
  
  // Remove duplicates based on booking ID (applies to all roles)
  const uniqueBookings = Array.from(
    new Map(bookings.map((booking: any) => [booking.id, booking])).values()
  );
  
  if (uniqueBookings.length !== bookings.length) {
    console.log('⚠️ Removed duplicate bookings:', bookings.length - uniqueBookings.length);
    console.log('📊 After deduplication:', uniqueBookings.length);
  }
  
  return {
    bookings: uniqueBookings as Booking[],
    pagination: {
      page: 1,
      limit: 1000,
      total: uniqueBookings.length,
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
  userRole?: string,
  currentUserId?: string,
  options?: { dealershipId?: string; dealershipCode?: string; scope?: string }
): Promise<{ bookings: Booking[]; pagination: any }> {
  return getMyBookings(timeline, undefined, userRole, currentUserId, options);
}

/**
 * Get bookings for today
 */
export async function getTodayBookings(
  userRole?: string,
  options?: { dealershipId?: string; dealershipCode?: string; scope?: string }
): Promise<Booking[]> {
  const response = await getBookingsByTimeline('today', userRole, undefined, options);
  return response.bookings || [];
}

/**
 * Get bookings with delivery today
 */
export async function getDeliveryTodayBookings(
  userRole?: string,
  options?: { dealershipId?: string; dealershipCode?: string; scope?: string }
): Promise<Booking[]> {
  const response = await getBookingsByTimeline('delivery_today', userRole, undefined, options);
  return response.bookings || [];
}

/**
 * Get bookings pending update (>24h old, still PENDING/ASSIGNED)
 */
export async function getPendingUpdateBookings(
  userRole?: string,
  options?: { dealershipId?: string; dealershipCode?: string; scope?: string }
): Promise<Booking[]> {
  const response = await getBookingsByTimeline('pending_update', userRole, undefined, options);
  return response.bookings || [];
}

/**
 * Get overdue bookings (past delivery date, not delivered/cancelled)
 */
export async function getOverdueBookings(
  userRole?: string,
  options?: { dealershipId?: string; dealershipCode?: string; scope?: string }
): Promise<Booking[]> {
  const response = await getBookingsByTimeline('overdue', userRole, undefined, options);
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
export async function getBookingsStats(
  userRole?: string,
  currentUserId?: string,
  options?: { dealershipId?: string; dealershipCode?: string; scope?: string }
): Promise<{
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
    getMyBookings(undefined, undefined, userRole, currentUserId, options),
    getTodayBookings(userRole, options),
    getDeliveryTodayBookings(userRole, options),
    getPendingUpdateBookings(userRole, options),
    getOverdueBookings(userRole, options),
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

