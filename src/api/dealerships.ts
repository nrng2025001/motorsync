/**
 * Dealership API Module
 * Handles all dealership-related API calls
 */

import { apiClient, handleApiCall, ApiResponse } from './client';
import {
  Dealership,
  DealershipType,
  CreateDealershipRequest,
  UpdateDealershipRequest,
  DealershipListResponse,
  DealershipResponse,
  CatalogResponse,
  CompleteCatalogResponse,
  VehicleVariant,
} from '../types/dealership';

/**
 * Dealership API endpoints
 */
export const DealershipAPI = {
  /**
   * Get all dealerships
   */
  async getAllDealerships(params?: {
    page?: number;
    limit?: number;
    type?: DealershipType;
    search?: string;
    isActive?: boolean;
    includeCount?: boolean;
  }): Promise<DealershipListResponse> {
    const response = await handleApiCall(() =>
      apiClient.get<ApiResponse<{ dealerships: Dealership[]; pagination: any }>>('/dealerships', { params })
    );
    
    // Production backend returns: { success: true, message: "...", data: { dealerships: [...], pagination: {...} } }
    // handleApiCall extracts the data field, so response = { dealerships: [...], pagination: {...} }
    return {
      success: true,
      data: {
        dealerships: response.dealerships || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
      }
    };
  },

  /**
   * Get single dealership by ID
   */
  async getDealership(id: string): Promise<DealershipResponse> {
    const response = await apiClient.get(`/dealerships/${id}`);
    return response.data;
  },

  /**
   * Create new dealership (Admin only)
   */
  async createDealership(data: CreateDealershipRequest): Promise<DealershipResponse> {
    const response = await apiClient.post('/dealerships', data);
    return response.data;
  },

  /**
   * Update dealership
   */
  async updateDealership(id: string, data: UpdateDealershipRequest): Promise<DealershipResponse> {
    const response = await apiClient.patch(`/dealerships/${id}`, data);
    return response.data;
  },

  /**
   * Activate dealership (Admin only)
   */
  async activateDealership(id: string): Promise<DealershipResponse> {
    const response = await apiClient.post(`/dealerships/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate dealership (Admin only)
   */
  async deactivateDealership(id: string): Promise<DealershipResponse> {
    const response = await apiClient.post(`/dealerships/${id}/deactivate`);
    return response.data;
  },

  /**
   * Complete dealership onboarding (Admin only)
   */
  async completeOnboarding(id: string): Promise<DealershipResponse> {
    const response = await apiClient.post(`/dealerships/${id}/complete-onboarding`);
    return response.data;
  },

  /**
   * Get dealership catalog
   */
  async getCatalog(dealershipId: string): Promise<CatalogResponse> {
    const response = await apiClient.get(`/dealerships/${dealershipId}/catalog`);
    return response.data;
  },

  /**
   * Get complete catalog (structured by brand/model)
   */
  async getCompleteCatalog(dealershipId: string): Promise<CompleteCatalogResponse> {
    const response = await apiClient.get(`/dealerships/${dealershipId}/catalog/complete`);
    return response.data;
  },

  /**
   * Add vehicle to catalog
   */
  async addVehicleToCatalog(
    dealershipId: string,
    data: {
      brand: string;
      model: string;
      variants: Array<{
        name: string;
        vcCode: string;
        fuelTypes: string[];
        transmissions: string[];
        colors: Array<{
          name: string;
          code: string;
          additionalCost: number;
          isAvailable: boolean;
        }>;
        exShowroomPrice: number;
        rtoCharges: number;
        insurance: number;
        accessories: number;
        onRoadPrice: number;
        isAvailable: boolean;
      }>;
    }
  ): Promise<{ success: boolean; data: { catalog: any } }> {
    const response = await apiClient.post(`/dealerships/${dealershipId}/catalog`, data);
    return response.data;
  },

  /**
   * Get available brands
   */
  async getBrands(dealershipId: string): Promise<{ success: boolean; data: { brands: string[] } }> {
    const response = await apiClient.get(`/dealerships/${dealershipId}/catalog/brands`);
    return response.data;
  },

  /**
   * Get models by brand
   */
  async getModelsByBrand(
    dealershipId: string,
    brand: string
  ): Promise<{ success: boolean; data: { models: Array<{ model: string; catalogId: string; isActive: boolean }> } }> {
    const response = await apiClient.get(`/dealerships/${dealershipId}/catalog/models?brand=${brand}`);
    return response.data;
  },

  /**
   * Get model variants
   */
  async getModelVariants(
    dealershipId: string,
    catalogId: string
  ): Promise<{ success: boolean; data: { brand: string; model: string; variants: VehicleVariant[] } }> {
    const response = await apiClient.get(`/dealerships/${dealershipId}/catalog/${catalogId}/variants`);
    return response.data;
  },

  /**
   * Update catalog entry
   */
  async updateCatalog(
    dealershipId: string,
    catalogId: string,
    data: {
      isActive?: boolean;
      variants?: VehicleVariant[];
    }
  ): Promise<{ success: boolean; data: { catalog: any } }> {
    const response = await apiClient.patch(`/dealerships/${dealershipId}/catalog/${catalogId}`, data);
    return response.data;
  },

  /**
   * Delete catalog entry
   */
  async deleteCatalog(dealershipId: string, catalogId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/dealerships/${dealershipId}/catalog/${catalogId}`);
    return response.data;
  },
};



