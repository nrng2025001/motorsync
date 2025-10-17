/**
 * Vehicle Catalog Types
 * Type definitions for dealership vehicle catalog data
 */

/**
 * Color option interface
 */
export interface ColorOption {
  name: string;              // "Flame Red"
  code: string;              // "FR"
  additionalCost: number;    // 0 or 5000
  isAvailable: boolean;
}

/**
 * Vehicle variant interface
 */
export interface VehicleVariant {
  name: string;              // "XZ+ Lux Petrol AT"
  vcCode: string;            // "NXN-XZ-LUX-P-AT"
  fuelTypes: string[];       // ["Petrol", "Diesel", "Electric"]
  transmissions: string[];   // ["Manual", "Automatic"]
  colors: ColorOption[];
  exShowroomPrice: number;   // 1149000
  rtoCharges: number;        // 85000
  insurance: number;         // 45000
  accessories: number;       // 15000
  onRoadPrice: number;       // 1294000
  isAvailable: boolean;
}

/**
 * Vehicle model interface
 */
export interface VehicleModel {
  model: string;             // "Nexon"
  catalogId: string;         // "catalog-id-123"
  variants: VehicleVariant[];
}

/**
 * Vehicle brand interface
 */
export interface VehicleBrand {
  brand: string;             // "TATA"
  models: VehicleModel[];
}

/**
 * Complete catalog data structure
 */
export interface CatalogData {
  brands: VehicleBrand[];
}

/**
 * API response wrapper for catalog data
 */
export interface CatalogResponse {
  success: boolean;
  data: CatalogData;
  error?: string;
}

/**
 * Brands response interface
 */
export interface BrandsResponse {
  success: boolean;
  data: {
    brands: string[];
  };
  error?: string;
}

/**
 * Models response interface
 */
export interface ModelsResponse {
  success: boolean;
  data: {
    models: VehicleModel[];
  };
  error?: string;
}

/**
 * Variants response interface
 */
export interface VariantsResponse {
  success: boolean;
  data: {
    brand: string;
    model: string;
    variants: VehicleVariant[];
  };
  error?: string;
}

/**
 * Vehicle selection result
 */
export interface VehicleSelection {
  brand: string;
  model: string;
  variant: VehicleVariant;
  color: ColorOption;
  totalPrice: number;
}

/**
 * Create catalog entry request
 */
export interface CreateCatalogEntryRequest {
  brand: string;
  model: string;
  variant: string;
  vcCode: string;
  fuelType: string;
  transmission: string;
  exShowroomPrice: number;
  rtoCharges: number;
  insurance: number;
  accessories: number;
  onRoadPrice: number;
  colors: Array<{
    name: string;
    code: string;
    additionalCost: number;
    isAvailable: boolean;
  }>;
  isAvailable: boolean;
}
