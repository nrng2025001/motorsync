/**
 * Catalog Context
 * Provides vehicle catalog data and helper methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CatalogAPI } from '../api';
import { DealershipAPI } from '../api/dealerships';
import { useAuth } from './AuthContext';
import {
  CatalogData,
  VehicleBrand,
  VehicleModel,
  VehicleVariant,
  VehicleSelection,
} from '../types/catalog';

interface CatalogContextType {
  catalog: CatalogData | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  
  // Helper methods
  getBrandByName: (brandName: string) => VehicleBrand | undefined;
  getModelByName: (brandName: string, modelName: string) => VehicleModel | undefined;
  getVariantByCode: (brandName: string, modelName: string, vcCode: string) => VehicleVariant | undefined;
  getAvailableBrands: () => string[];
  getAvailableModels: (brandName: string) => string[];
  getAvailableVariants: (brandName: string, modelName: string) => VehicleVariant[];
  getAvailableColors: (brandName: string, modelName: string, vcCode: string) => any[];
  
  // Search methods
  searchVehicles: (query: string) => VehicleSelection[];
  findVehicleByVcCode: (vcCode: string) => VehicleSelection | null;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

interface CatalogProviderProps {
  children: ReactNode;
}

export const CatalogProvider: React.FC<CatalogProviderProps> = ({ children }) => {
  const { state: authState } = useAuth();
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load catalog data
   */
  const loadCatalog = async () => {
    console.log('🔍 CatalogContext: loadCatalog called');
    console.log('🔍 User object:', authState.user);
    console.log('🔍 User dealership:', authState.user?.dealership);
    console.log('🔍 User dealershipId:', authState.user?.dealershipId);
    
    // Use dealershipId if available, otherwise use dealership.id
    const dealershipId = authState.user?.dealershipId || authState.user?.dealership?.id;
    
    if (!dealershipId) {
      setLoading(false);
      setError('No dealership assigned to user. Please contact your administrator to assign a dealership to your account.');
      console.log('❌ No dealership found in user object');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading catalog for dealership:', dealershipId);
      
      // Use DealershipAPI which has the correct response handling
      const response = await DealershipAPI.getCompleteCatalog(dealershipId);
      console.log('✅ Catalog API response:', response);
      
      // Extract catalog data from response
      // Backend returns: CatalogData directly
      const rawCatalog = response;
      console.log('✅ Raw catalog extracted:', rawCatalog);
      
      // Transform to our expected format: { brands: [ { brand: "TATA", models: [...] } ] }
      const transformedCatalog: CatalogData = {
        brands: Object.entries(rawCatalog).map(([brandName, models]: [string, any]) => ({
          brand: brandName,
          models: (Array.isArray(models) ? models : []).map((model: any) => ({
            model: model.model,
            catalogId: model.id,
            variants: (model.variants || []).map((variant: any) => ({
              name: variant.name,
              vcCode: variant.vcCode,
              fuelTypes: variant.fuelTypes || [],
              transmissions: variant.transmissions || [],
              colors: variant.colors || [],
              exShowroomPrice: variant.exShowroomPrice || 0,
              rtoCharges: variant.rtoCharges || 0,
              insurance: variant.insurance || 0,
              accessories: variant.accessories || 0,
              onRoadPrice: variant.onRoadPrice || 0,
              isAvailable: variant.isAvailable !== false,
            })),
          })),
        })),
      };
      
      console.log('✅ Transformed catalog:', JSON.stringify(transformedCatalog, null, 2));
      
      setCatalog(transformedCatalog);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load catalog';
      console.error('❌ Failed to load catalog:', errorMessage);
      
      // Provide more specific error messages
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError('Authentication failed. Please log in again.');
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        setError('Dealership not found. Please contact your administrator.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('Access denied. You do not have permission to view this catalog.');
      } else {
        setError(`Failed to load vehicle catalog: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reload catalog data
   */
  const reload = async () => {
    await loadCatalog();
  };

  // Load catalog when dealership changes
  useEffect(() => {
    loadCatalog();
  }, [authState.user?.dealership?.id, authState.user?.dealershipId]);

  // Helper method: Get brand by name
  const getBrandByName = (brandName: string): VehicleBrand | undefined => {
    if (!catalog) return undefined;
    return catalog.brands.find(b => b.brand === brandName);
  };

  // Helper method: Get model by name
  const getModelByName = (brandName: string, modelName: string): VehicleModel | undefined => {
    const brand = getBrandByName(brandName);
    if (!brand) return undefined;
    return brand.models.find(m => m.model === modelName);
  };

  // Helper method: Get variant by code
  const getVariantByCode = (
    brandName: string, 
    modelName: string, 
    vcCode: string
  ): VehicleVariant | undefined => {
    const model = getModelByName(brandName, modelName);
    if (!model) return undefined;
    return model.variants.find(v => v.vcCode === vcCode);
  };

  // Helper method: Get available brands
  const getAvailableBrands = (): string[] => {
    if (!catalog) return [];
    return catalog.brands.map(b => b.brand);
  };

  // Helper method: Get available models for a brand
  const getAvailableModels = (brandName: string): string[] => {
    const brand = getBrandByName(brandName);
    if (!brand) return [];
    return brand.models.map(m => m.model);
  };

  // Helper method: Get available variants for a model
  const getAvailableVariants = (brandName: string, modelName: string): VehicleVariant[] => {
    const model = getModelByName(brandName, modelName);
    if (!model) return [];
    return model.variants.filter(v => v.isAvailable);
  };

  // Helper method: Get available colors for a variant
  const getAvailableColors = (brandName: string, modelName: string, vcCode: string) => {
    const variant = getVariantByCode(brandName, modelName, vcCode);
    if (!variant) return [];
    return variant.colors.filter(c => c.isAvailable);
  };

  // Search vehicles by query
  const searchVehicles = (query: string): VehicleSelection[] => {
    if (!catalog || !query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results: VehicleSelection[] = [];

    catalog.brands.forEach(brand => {
      brand.models.forEach(model => {
        model.variants.forEach(variant => {
          if (variant.isAvailable) {
            // Search in variant name, brand, model
            const searchText = `${brand.brand} ${model.model} ${variant.name}`.toLowerCase();
            
            if (searchText.includes(searchTerm)) {
              // Add all available colors for this variant
              variant.colors.forEach(color => {
                if (color.isAvailable) {
                  results.push({
                    brand: brand.brand,
                    model: model.model,
                    variant,
                    color,
                    totalPrice: variant.onRoadPrice + color.additionalCost,
                  });
                }
              });
            }
          }
        });
      });
    });

    return results;
  };

  // Find vehicle by VC code
  const findVehicleByVcCode = (vcCode: string): VehicleSelection | null => {
    if (!catalog) return null;

    for (const brand of catalog.brands) {
      for (const model of brand.models) {
        for (const variant of model.variants) {
          if (variant.vcCode === vcCode && variant.isAvailable) {
            // Return first available color
            const availableColor = variant.colors.find(c => c.isAvailable);
            if (availableColor) {
              return {
                brand: brand.brand,
                model: model.model,
                variant,
                color: availableColor,
                totalPrice: variant.onRoadPrice + availableColor.additionalCost,
              };
            }
          }
        }
      }
    }

    return null;
  };

  const contextValue: CatalogContextType = {
    catalog,
    loading,
    error,
    reload,
    getBrandByName,
    getModelByName,
    getVariantByCode,
    getAvailableBrands,
    getAvailableModels,
    getAvailableVariants,
    getAvailableColors,
    searchVehicles,
    findVehicleByVcCode,
  };

  return (
    <CatalogContext.Provider value={contextValue}>
      {children}
    </CatalogContext.Provider>
  );
};

/**
 * Hook to use catalog context
 */
export const useCatalog = (): CatalogContextType => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
