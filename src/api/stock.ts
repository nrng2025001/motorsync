import { apiClient, handleApiCall, ApiResponse, PaginatedResponse } from './client';

/**
 * Stock API endpoints
 * 
 * This file contains all stock-related API calls:
 * - CRUD operations for stock
 * - Inventory management
 * - Stock tracking
 */

/**
 * Stock interface
 */
export interface Stock {
  id: string;
  vehicleId: string;
  variant: string;
  vcCode: string;
  color: string;
  fuelType: string;
  transmission: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  location: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'MAINTENANCE';
  price: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create stock request interface
 */
export interface CreateStockRequest {
  vehicleId: string;
  variant: string;
  vcCode: string;
  color: string;
  fuelType: string;
  transmission: string;
  quantity: number;
  location: string;
  price: number;
  discount?: number;
}

/**
 * Update stock request interface
 */
export interface UpdateStockRequest {
  quantity?: number;
  location?: string;
  status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'MAINTENANCE';
  price?: number;
  discount?: number;
}

/**
 * Stock filters interface
 */
export interface StockFilters {
  status?: string[];
  variant?: string[];
  color?: string[];
  fuelType?: string[];
  transmission?: string[];
  location?: string[];
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
}

/**
 * Stock list parameters interface
 */
export interface StockListParams extends StockFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Stock statistics interface
 */
export interface StockStats {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  soldVehicles: number;
  maintenanceVehicles: number;
  totalValue: number;
  averagePrice: number;
}

/**
 * Stock API class
 */
export class StockAPI {
  /**
   * Get stock list with filters and pagination
   */
  static async getStock(params: StockListParams = {}): Promise<PaginatedResponse<Stock>> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<PaginatedResponse<Stock>>>('/stock', { params })
    );
  }

  /**
   * Get stock by ID
   */
  static async getStockById(id: string): Promise<Stock> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Stock>>(`/stock/${id}`)
    );
  }

  /**
   * Create new stock entry
   */
  static async createStock(stockData: CreateStockRequest): Promise<Stock> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Stock>>('/stock', stockData)
    );
  }

  /**
   * Update stock entry
   */
  static async updateStock(id: string, stockData: UpdateStockRequest): Promise<Stock> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<Stock>>(`/stock/${id}`, stockData)
    );
  }

  /**
   * Delete stock entry
   */
  static async deleteStock(id: string): Promise<void> {
    return handleApiCall(() =>
      apiClient.delete<ApiResponse<void>>(`/stock/${id}`)
    );
  }

  /**
   * Get stock statistics
   */
  static async getStockStats(): Promise<StockStats> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<StockStats>>('/stock/stats')
    );
  }

  /**
   * Reserve stock
   */
  static async reserveStock(id: string, quantity: number): Promise<Stock> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Stock>>(`/stock/${id}/reserve`, { quantity })
    );
  }

  /**
   * Release stock reservation
   */
  static async releaseStock(id: string, quantity: number): Promise<Stock> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Stock>>(`/stock/${id}/release`, { quantity })
    );
  }

  /**
   * Mark stock as sold
   */
  static async markAsSold(id: string, quantity: number): Promise<Stock> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<Stock>>(`/stock/${id}/sold`, { quantity })
    );
  }

  /**
   * Get stock by variant
   */
  static async getStockByVariant(variant: string): Promise<Stock[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Stock[]>>('/stock/variant', { params: { variant } })
    );
  }

  /**
   * Get stock by color
   */
  static async getStockByColor(color: string): Promise<Stock[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Stock[]>>('/stock/color', { params: { color } })
    );
  }

  /**
   * Search stock
   */
  static async searchStock(query: string): Promise<Stock[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Stock[]>>('/stock/search', { params: { q: query } })
    );
  }
}

export default StockAPI;
