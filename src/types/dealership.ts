/**
 * Dealership Types
 * Type definitions for multi-dealership support
 */

export type DealershipType = 
  | 'TATA' 
  | 'UNIVERSAL' 
  | 'MAHINDRA' 
  | 'HYUNDAI' 
  | 'MARUTI' 
  | 'OTHER';

export interface Dealership {
  id: string;
  name: string;
  code: string;
  type: DealershipType;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  panNumber?: string;
  brands: string[];
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees?: number;
    bookings?: number;
    enquiries?: number;
  };
}

export interface ColorOption {
  name: string;
  code: string;
  additionalCost: number;
  isAvailable: boolean;
}

export interface VehicleVariant {
  name: string;
  vcCode: string;
  fuelTypes: string[];
  transmissions: string[];
  colors: ColorOption[];
  exShowroomPrice: number;
  rtoCharges: number;
  insurance: number;
  accessories: number;
  onRoadPrice: number;
  isAvailable: boolean;
}

export interface VehicleCatalog {
  id: string;
  dealershipId: string;
  brand: string;
  model: string;
  isActive: boolean;
  variants: VehicleVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealershipRequest {
  name: string;
  code: string;
  type: DealershipType;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  panNumber?: string;
  brands: string[];
}

export interface UpdateDealershipRequest {
  name?: string;
  type?: DealershipType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  panNumber?: string;
  brands?: string[];
}

export interface DealershipListResponse {
  success: boolean;
  data: {
    dealerships: Dealership[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DealershipResponse {
  success: boolean;
  data: {
    dealership: Dealership;
  };
}

export interface CatalogResponse {
  success: boolean;
  data: {
    catalog: VehicleCatalog[];
  };
}

export interface CompleteCatalogResponse {
  success: boolean;
  data: {
    brands: Array<{
      brand: string;
      models: Array<{
        model: string;
        catalogId: string;
        variants: VehicleVariant[];
      }>;
    }>;
  };
}



