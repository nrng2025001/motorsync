/**
 * Enquiry Service
 * Handles all enquiry-related API operations using the new API structure
 */

import { enquiryAPI } from '../api/enquiries';
import {
  CreateEnquiryRequest,
  UpdateEnquiryRequest,
  Enquiry,
  EnquiryCategory,
  EnquiryStatus,
  PaginatedEnquiriesResponse,
  AutoBookingResponse,
  ApiResponse
} from './types';

/**
 * Create a new enquiry
 */
export async function createEnquiry(data: CreateEnquiryRequest): Promise<Enquiry> {
  console.log('📤 [EnquiryService.createEnquiry] Creating enquiry with data:', data);
  
  const response = await enquiryAPI.createEnquiry(data);
  
  console.log('📥 [EnquiryService.createEnquiry] Response received:', response);
  console.log('📥 [EnquiryService.createEnquiry] Created enquiry:', response.data);
  
  return response.data || response;
}

/**
 * Get all enquiries for the current advisor
 */
export async function getMyEnquiries(
  page: number = 1,
  limit: number = 100,
  category?: EnquiryCategory,
  options?: { dealershipId?: string; dealershipCode?: string }
): Promise<{ enquiries: Enquiry[]; pagination: any }> {
  const response = await enquiryAPI.getEnquiries({
    page,
    limit,
    category,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dealershipId: options?.dealershipId,
    dealershipCode: options?.dealershipCode,
  });
  
  // Handle different response structures
  const allEnquiries = (response.data as any)?.enquiries || [];
  
  // Filter enquiries by current user (this will be done in the calling component)
  const enquiries = allEnquiries;
  const pagination = (response.data as any)?.pagination || {
    page,
    limit,
    total: enquiries.length,
    totalPages: Math.ceil(enquiries.length / limit)
  };
  
  return {
    enquiries: enquiries as Enquiry[],
    pagination
  };
}

/**
 * Get enquiry by ID
 */
export async function getEnquiryById(id: string): Promise<Enquiry> {
  console.log('🔍 [EnquiryService.getEnquiryById] Fetching enquiry:', id);
  
  const response = await enquiryAPI.getEnquiryById(id);
  
  console.log('📊 [EnquiryService.getEnquiryById] Response received:', response);
  
  return response.data || response;
}

/**
 * Update enquiry
 */
export async function updateEnquiry(id: string, data: UpdateEnquiryRequest): Promise<Enquiry> {
  console.log('🔄 [EnquiryService.updateEnquiry] Updating enquiry:', id, data);
  
  const response = await enquiryAPI.updateEnquiry(id, data);
  
  console.log('✅ [EnquiryService.updateEnquiry] Response received:', response);
  
  return response.data || response;
}

/**
 * Convert enquiry to booking
 * Phase 2: Conversion should mark enquiry as BOOKED category (not CONVERTED status)
 * The backend doesn't accept CONVERTED as a status value
 */
export async function convertEnquiryToBooking(enquiryId: string): Promise<AutoBookingResponse> {
  console.log('🔄 [EnquiryService.convertEnquiryToBooking] Converting enquiry to booking:', enquiryId);
  
  // Phase 2: Mark enquiry as BOOKED category instead of changing status
  // This locks the enquiry and indicates it's been converted to a booking
  const response = await enquiryAPI.updateCategory(enquiryId, EnquiryCategory.BOOKED, 'Converted to booking');
  
  console.log('✅ [EnquiryService.convertEnquiryToBooking] Conversion completed:', response);
  
  // Return response with enquiry data
  return {
    success: true,
    message: 'Enquiry converted to booking successfully',
    enquiry: response.data || response,
    booking: null // Would be populated by actual conversion endpoint if available
  };
}

/**
 * Delete enquiry
 */
export async function deleteEnquiry(id: string): Promise<void> {
  console.log('🗑️ [EnquiryService.deleteEnquiry] Deleting enquiry:', id);
  
  await enquiryAPI.deleteEnquiry(id);
  
  console.log('✅ [EnquiryService.deleteEnquiry] Enquiry deleted successfully');
}

/**
 * Get enquiry statistics
 */
export async function getEnquiryStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}> {
  console.log('📊 [EnquiryService.getEnquiryStats] Fetching enquiry statistics');
  
  const response = await enquiryAPI.getEnquiryStats();
  
  console.log('📊 [EnquiryService.getEnquiryStats] Response received:', response);
  
  return response.data || response;
}

/**
 * Get vehicle models
 */
export async function getModels(): Promise<{ modelsByBrand: { [brand: string]: string[] } }> {
  console.log('🚗 [EnquiryService.getModels] Fetching vehicle models');
  
  const response = await enquiryAPI.getModels();
  
  console.log('🚗 [EnquiryService.getModels] Response received:', response);
  
  return response;
}

/**
 * Get vehicle variants
 */
export async function getVariants(model?: string): Promise<string[]> {
  console.log('🔧 [EnquiryService.getVariants] Fetching variants for model:', model);
  
  const response = await enquiryAPI.getVariants(model);
  
  console.log('🔧 [EnquiryService.getVariants] Response received:', response);
  
  return response;
}

/**
 * Get available colors
 */
export async function getColors(): Promise<string[]> {
  console.log('🎨 [EnquiryService.getColors] Fetching available colors');
  
  const response = await enquiryAPI.getColors();
  
  console.log('🎨 [EnquiryService.getColors] Response received:', response);
  
  return response;
}

/**
 * Get enquiry sources
 */
export async function getSources(): Promise<string[]> {
  console.log('📋 [EnquiryService.getSources] Fetching enquiry sources');
  
  const response = await enquiryAPI.getSources();
  
  console.log('📋 [EnquiryService.getSources] Response received:', response);
  
  return response;
}