/**
 * Catalog API Service
 * Handles all vehicle catalog-related API calls
 */

import { apiClient, handleApiCall, ApiResponse } from './client';
import {
  CatalogData,
  CatalogResponse,
  BrandsResponse,
  ModelsResponse,
  VariantsResponse,
  VehicleModel,
  VehicleVariant,
  CreateCatalogEntryRequest,
} from '../types/catalog';

/**
 * Catalog API class
 * Contains all catalog-related API methods
 */
export class CatalogAPI {
  /**
   * Get complete catalog (structured by brand → model → variants)
   * This is the MAIN method to use for most scenarios
   * 
   * @param dealershipId - Dealership ID
   * @returns Promise<CatalogData>
   */
  static async getCompleteCatalog(dealershipId: string): Promise<CatalogData> {
    const response: any = await handleApiCall(() =>
      apiClient.get<any>(`/dealerships/${dealershipId}/catalog/complete`)
    );
    
    if (!response?.success) {
      throw new Error(response?.error || 'Failed to fetch complete catalog');
    }
    
    return response?.data || response;
  }

  /**
   * Get raw catalog entries
   * 
   * @param dealershipId - Dealership ID
   * @returns Promise<any[]>
   */
  static async getCatalog(dealershipId: string): Promise<any[]> {
    const response: any = await handleApiCall(() =>
      apiClient.get<ApiResponse<any[]>>(`/dealerships/${dealershipId}/catalog`)
    );
    
    return response?.data || response || [];
  }

  /**
   * Get available brands only
   * 
   * @param dealershipId - Dealership ID
   * @returns Promise<string[]>
   */
  static async getBrands(dealershipId: string): Promise<string[]> {
    const response: any = await handleApiCall(() =>
      apiClient.get<any>(`/dealerships/${dealershipId}/catalog/brands`)
    );
    
    if (!response?.success) {
      throw new Error(response?.error || 'Failed to fetch brands');
    }
    
    return response?.data?.brands || response?.brands || [];
  }

  /**
   * Get models for a specific brand
   * 
   * @param dealershipId - Dealership ID
   * @param brand - Brand name
   * @returns Promise<VehicleModel[]>
   */
  static async getModelsByBrand(dealershipId: string, brand: string): Promise<VehicleModel[]> {
    const response: any = await handleApiCall(() =>
      apiClient.get<any>(`/dealerships/${dealershipId}/catalog/models`, {
        params: { brand }
      })
    );
    
    if (!response?.success) {
      throw new Error(response?.error || 'Failed to fetch models');
    }
    
    return response?.data?.models || response?.models || [];
  }

  /**
   * Get variants for a specific model
   * 
   * @param dealershipId - Dealership ID
   * @param catalogId - Model catalog ID
   * @returns Promise<{brand: string, model: string, variants: VehicleVariant[]}>
   */
  static async getModelVariants(
    dealershipId: string, 
    catalogId: string
  ): Promise<{brand: string, model: string, variants: VehicleVariant[]}> {
    const response: any = await handleApiCall(() =>
      apiClient.get<any>(`/dealerships/${dealershipId}/catalog/${catalogId}/variants`)
    );
    
    if (!response?.success) {
      throw new Error(response?.error || 'Failed to fetch variants');
    }
    
    return response?.data || response;
  }

  /**
   * Add vehicle to catalog (Admin, GM, SM only)
   * 
   * @param dealershipId - Dealership ID
   * @param catalogData - Vehicle catalog data
   * @returns Promise<any>
   */
  static async createCatalogEntry(
    dealershipId: string, 
    catalogData: CreateCatalogEntryRequest
  ): Promise<any> {
    const response: any = await handleApiCall(() =>
      apiClient.post<ApiResponse<any>>(`/dealerships/${dealershipId}/catalog`, catalogData)
    );
    
    return response.data;
  }

  /**
   * Search catalog by query
   * 
   * @param dealershipId - Dealership ID
   * @param query - Search query
   * @returns Promise<CatalogData>
   */
  static async searchCatalog(dealershipId: string, query: string): Promise<CatalogData> {
    const response: any = await handleApiCall(() =>
      apiClient.get<any>(`/dealerships/${dealershipId}/catalog/complete`, {
        params: { search: query }
      })
    );
    
    if (!response?.success) {
      throw new Error(response?.error || 'Failed to search catalog');
    }
    
    return response?.data || response;
  }

  /**
   * Get catalog statistics
   * 
   * @param dealershipId - Dealership ID
   * @returns Promise<any>
   */
  static async getCatalogStats(dealershipId: string): Promise<any> {
    const response: any = await handleApiCall(() =>
      apiClient.get<ApiResponse<any>>(`/dealerships/${dealershipId}/catalog/stats`)
    );
    
    return response.data;
  }
}

export default CatalogAPI;
