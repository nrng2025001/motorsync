import { apiClient, handleApiCall, ApiResponse } from './client';
import { EnquiriesAPI } from './enquiries';

/**
 * Model interface based on backend API
 */
export interface Model {
  id: string;
  brand: string;
  modelName: string;
  segment: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vehicles: Vehicle[];
}

export interface Vehicle {
  id: string;
  variant: string;
  color: string;
  totalStock: number;
}

export interface ModelListParams {
  brand?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

class ModelsAPI {
  /**
   * Get all models with optional filtering
   */
  static async getModels(params?: ModelListParams): Promise<{ models: Model[]; pagination: any }> {
    console.log('🔍 [ModelsAPI.getModels] Called with params:', params);
    
    // Use the enquiries API to get models
    const response = await EnquiriesAPI.getModels();
    
    console.log('🔍 [ModelsAPI.getModels] Response:', response);
    console.log('🔍 [ModelsAPI.getModels] Response type:', typeof response);
    console.log('🔍 [ModelsAPI.getModels] Response keys:', Object.keys(response || {}));
    
    // Convert the modelsByBrand structure to our Model[] structure
    const models: Model[] = [];
    let idCounter = 1;
    
    // Check if modelsByBrand exists and has data
    if (response.modelsByBrand && typeof response.modelsByBrand === 'object') {
      Object.entries(response.modelsByBrand).forEach(([brand, modelNames]) => {
        if (Array.isArray(modelNames)) {
          modelNames.forEach(modelName => {
            models.push({
              id: `model-${idCounter++}`,
              brand: brand,
              modelName: modelName,
              segment: 'Unknown', // Not provided by enquiries API
              description: `${brand} ${modelName}`,
              basePrice: 0, // Not provided by enquiries API
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              vehicles: [] // Will be populated when variants are fetched
            });
          });
        }
      });
    }
    
    console.log('🔍 [ModelsAPI.getModels] Converted models:', models.length);
    console.log('🔍 [ModelsAPI.getModels] modelsByBrand data:', response.modelsByBrand);
    
    return {
      models: models,
      pagination: { page: 1, limit: models.length, total: models.length, totalPages: 1 }
    };
  }

  /**
   * Get model by ID
   */
  static async getModelById(id: string): Promise<Model> {
    // Get all models and find the one with the matching ID
    const response = await this.getModels();
    const model = response.models.find(m => m.id === id);
    
    if (!model) {
      throw new Error(`Model with ID ${id} not found`);
    }
    
    return model;
  }

  /**
   * Get all available variants from all models
   */
  static async getAllVariants(): Promise<Vehicle[]> {
    // Use the enquiries API to get variants
    const variants = await EnquiriesAPI.getVariants();
    
    // Convert string variants to Vehicle objects
    return variants.map((variant, index) => ({
      id: `variant-${index}`,
      variant: variant,
      color: 'Not specified',
      totalStock: 0
    }));
  }

  /**
   * Get variants for a specific brand
   */
  static async getVariantsByBrand(brand: string): Promise<Vehicle[]> {
    // Use the enquiries API to get variants filtered by brand
    const variants = await EnquiriesAPI.getVariants();
    
    // Filter variants by brand (assuming variant names contain brand)
    const brandVariants = variants.filter(variant => 
      variant.toLowerCase().includes(brand.toLowerCase())
    );
    
    // Convert string variants to Vehicle objects
    return brandVariants.map((variant, index) => ({
      id: `variant-${index}`,
      variant: variant,
      color: 'Not specified',
      totalStock: 0
    }));
  }

  /**
   * Get unique brands
   */
  static async getBrands(): Promise<string[]> {
    // Use the enquiries API to get models and extract brands
    const response = await this.getModels({ isActive: true });
    const brands = new Set<string>();
    
    response.models.forEach(model => {
      brands.add(model.brand);
    });
    
    return Array.from(brands);
  }
}

export const modelsAPI = ModelsAPI;
export default ModelsAPI;
