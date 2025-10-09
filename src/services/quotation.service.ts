/**
 * Quotation Service
 * Handles all quotation-related API operations
 */

import { apiRequest, buildQueryString } from './api.config';
import {
  CreateQuotationRequest,
  UpdateQuotationRequest,
  Quotation,
  QuotationStatus,
  PaginatedQuotationsResponse,
} from './types';

/**
 * Get all quotations
 */
export async function getQuotations(
  page: number = 1,
  limit: number = 100
): Promise<{ quotations: Quotation[]; pagination: any }> {
  const params = {
    page,
    limit,
  };
  
  const queryString = buildQueryString(params);
  const response = await apiRequest<PaginatedQuotationsResponse['data']>(
    `/quotations${queryString}`
  );
  
  return response;
}

/**
 * Get single quotation by ID
 */
export async function getQuotationById(id: string): Promise<Quotation> {
  const response = await apiRequest<{ quotation: Quotation }>(`/quotations/${id}`);
  return response.quotation;
}

/**
 * Create a new quotation
 */
export async function createQuotation(
  data: CreateQuotationRequest
): Promise<Quotation> {
  const response = await apiRequest<{ quotation: Quotation }>('/quotations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return response.quotation;
}

/**
 * Update a quotation
 */
export async function updateQuotation(
  id: string,
  data: UpdateQuotationRequest
): Promise<Quotation> {
  const response = await apiRequest<{ quotation: Quotation }>(`/quotations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  return response.quotation;
}

/**
 * Update quotation status
 */
export async function updateQuotationStatus(
  id: string,
  status: QuotationStatus
): Promise<Quotation> {
  return updateQuotation(id, { status });
}

/**
 * Get quotations by status
 */
export async function getQuotationsByStatus(
  status: QuotationStatus
): Promise<Quotation[]> {
  const response = await getQuotations(1, 1000);
  const quotations = response.quotations || [];
  return quotations.filter(q => q.status === status);
}

/**
 * Get quotations stats
 */
export async function getQuotationsStats(): Promise<{
  total: number;
  pending: number;
  sent: number;
  accepted: number;
  rejected: number;
  totalValue: number;
}> {
  const response = await getQuotations(1, 1000);
  const quotations = response.quotations || [];
  
  return {
    total: quotations.length,
    pending: quotations.filter(q => q.status === QuotationStatus.PENDING).length,
    sent: quotations.filter(q => q.status === QuotationStatus.SENT).length,
    accepted: quotations.filter(q => q.status === QuotationStatus.ACCEPTED).length,
    rejected: quotations.filter(q => q.status === QuotationStatus.REJECTED).length,
    totalValue: quotations.reduce((sum, q) => sum + q.amount, 0),
  };
}

