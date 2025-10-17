/**
 * Stock/Vehicle Types
 * Data types for vehicle stock management
 */

/**
 * Fuel type enum
 */
export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  CNG = 'CNG',
  ELECTRIC = 'ELECTRIC',
}

/**
 * Transmission type enum
 */
export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

/**
 * Vehicle/Stock interface from backend
 */
export interface Vehicle {
  id: string;
  variant: string;
  modelYear?: string;
  color: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  vinNumber?: string;
  totalStock: number;
  availableStock: number;
  allocatedStock?: number;
  dealerCode?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create vehicle request interface
 */
export interface CreateVehicleRequest {
  variant: string;
  modelYear?: string;
  color: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  vinNumber?: string;
  totalStock: number;
  availableStock: number;
  allocatedStock?: number;
  dealerCode?: string;
  location?: string;
}

/**
 * Update vehicle request interface
 */
export interface UpdateVehicleRequest {
  variant?: string;
  modelYear?: string;
  color?: string;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  vinNumber?: string;
  totalStock?: number;
  availableStock?: number;
  allocatedStock?: number;
  dealerCode?: string;
  location?: string;
  isActive?: boolean;
}

/**
 * Stock statistics interface
 */
export interface StockStats {
  totalVehicles: number;
  inStock: number;
  outOfStock: number;
  stockByLocation?: Array<{
    location: string;
    total: number;
  }>;
  topModels?: Array<{
    variant: string;
    totalStock: number;
  }>;
}

/**
 * Stock filters interface
 */
export interface StockFilters {
  page?: number;
  limit?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK';
  search?: string;
  dealerCode?: string;
}

/**
 * Paginated vehicle response
 */
export interface PaginatedVehicles {
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

