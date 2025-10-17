/**
 * Type exports
 * Central export point for all application types
 */

// Export from dealership (primary definitions)
export * from './dealership';

// Export from stock
export * from './stock';

// Export from catalog, excluding duplicates
export type {
  VehicleModel,
  VehicleBrand,
  CatalogData,
  BrandsResponse,
  ModelsResponse,
  VariantsResponse,
  VehicleSelection,
  CreateCatalogEntryRequest,
} from './catalog';

