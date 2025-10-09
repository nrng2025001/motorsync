/**
 * Enquiry Service
 * Handles all enquiry-related API operations
 */

import { apiRequest, buildQueryString } from './api.config';
import {
  CreateEnquiryRequest,
  UpdateEnquiryRequest,
  Enquiry,
  EnquiryCategory,
  PaginatedEnquiriesResponse,
  AutoBookingResponse,
  ApiResponse
} from './types';

/**
 * Create a new enquiry
 */
export async function createEnquiry(data: CreateEnquiryRequest): Promise<Enquiry> {
  const response = await apiRequest<{ enquiry: Enquiry }>('/enquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.enquiry;
}

/**
 * Get all enquiries for the current advisor
 */
export async function getMyEnquiries(
  page: number = 1,
  limit: number = 100,
  category?: EnquiryCategory
): Promise<{ enquiries: Enquiry[]; pagination: any }> {
  // Import the API class dynamically to avoid circular dependencies
  const { EnquiriesAPI } = await import('../api/enquiries');
  
  const enquiries = await EnquiriesAPI.getEnquiries({
    page,
    limit,
    category,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  return {
    enquiries: enquiries as Enquiry[],
    pagination: {
      page,
      limit,
      total: enquiries.length,
      totalPages: Math.ceil(enquiries.length / limit),
    }
  };
}

/**
 * Get enquiries by category (HOT, LOST, BOOKED)
 */
export async function getEnquiriesByCategory(
  category: EnquiryCategory
): Promise<{ enquiries: Enquiry[]; pagination: any }> {
  return getMyEnquiries(1, 1000, category);
}

/**
 * Get single enquiry by ID
 */
export async function getEnquiryById(id: string): Promise<Enquiry> {
  const response = await apiRequest<{ enquiry: Enquiry }>(`/enquiries/${id}`);
  return response.enquiry;
}

/**
 * Update an enquiry
 */
export async function updateEnquiry(
  id: string,
  data: UpdateEnquiryRequest
): Promise<Enquiry> {
  const response = await apiRequest<{ enquiry: Enquiry }>(`/enquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  return response.enquiry;
}

/**
 * Convert enquiry to booking (set category to BOOKED)
 * Handles stock validation and auto-booking creation
 */
export async function convertEnquiryToBooking(
  id: string
): Promise<AutoBookingResponse> {
  try {
    const response = await apiRequest<AutoBookingResponse>(`/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ category: EnquiryCategory.BOOKED }),
    });
    
    return response;
  } catch (error: any) {
    // Handle stock validation errors
    if (error.message?.includes('out of stock')) {
      throw new Error(`Cannot convert to booking: Vehicle is out of stock. ${error.message}`);
    }
    throw error;
  }
}

/**
 * Update enquiry category
 */
export async function updateEnquiryCategory(
  id: string,
  category: EnquiryCategory
): Promise<Enquiry> {
  return updateEnquiry(id, { category });
}

/**
 * Delete an enquiry
 */
export async function deleteEnquiry(id: string): Promise<void> {
  await apiRequest<void>(`/enquiries/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get enquiries stats (count by category)
 */
export async function getEnquiriesStats(): Promise<{
  hot: number;
  lost: number;
  booked: number;
  total: number;
}> {
  const allEnquiries = await getMyEnquiries(1, 1000);
  const enquiries = allEnquiries.enquiries || [];
  
  return {
    hot: enquiries.filter(e => e.category === EnquiryCategory.HOT).length,
    lost: enquiries.filter(e => e.category === EnquiryCategory.LOST).length,
    booked: enquiries.filter(e => e.category === EnquiryCategory.BOOKED).length,
    total: enquiries.length,
  };
}

