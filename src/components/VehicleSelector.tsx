/**
 * VehicleSelector Component
 * Dynamic vehicle, model, and variant selector that fetches from backend catalog
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Menu, Text, ActivityIndicator, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { VehicleVariant } from '../types/dealership';

interface VehicleSelectorProps {
  onModelSelect?: (model: string) => void;
  onVariantSelect?: (variant: VehicleVariant | null) => void;
  onBrandSelect?: (brand: string) => void;
  initialModel?: string;
  initialVariant?: string;
  showVariants?: boolean;
  showColors?: boolean;
  error?: string;
  disabled?: boolean;
}

export function VehicleSelector({
  onModelSelect,
  onVariantSelect,
  onBrandSelect,
  initialModel = '',
  initialVariant = '',
  showVariants = true,
  showColors = false,
  error,
  disabled = false,
}: VehicleSelectorProps) {
  const { state: authState } = useAuth();
  const { catalog, loading: catalogLoading, error: catalogError } = useCatalog();

  // State
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [models, setModels] = useState<Array<{ model: string; catalogId: string }>>([]);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VehicleVariant | null>(null);
  const [colors, setColors] = useState<Array<{ name: string; code: string }>>([]);
  const [selectedColor, setSelectedColor] = useState('');

  // Menu visibility
  const [brandMenuVisible, setBrandMenuVisible] = useState(false);
  const [modelMenuVisible, setModelMenuVisible] = useState(false);
  const [variantMenuVisible, setVariantMenuVisible] = useState(false);
  const [colorMenuVisible, setColorMenuVisible] = useState(false);

  // Load brands from catalog
  useEffect(() => {
    if (catalog && catalog.brands) {
      setBrands(catalog.brands.map(b => b.brand));
      setLoading(false);
    } else if (catalogError) {
      setLoading(false);
    }
  }, [catalog, catalogError]);

  // Initialize with initial model if provided
  useEffect(() => {
    if (initialModel && brands.length > 0) {
      // Try to find and select the brand/model
      loadInitialSelection();
    }
  }, [initialModel, brands]);

  // Extract brands from catalog data
  const extractBrands = () => {
    if (!catalog || !catalog.brands) return [];
    return catalog.brands.map(brand => brand.brand);
  };

  const loadInitialSelection = async () => {
    // This would require more complex logic to parse the initial model
    // and find the matching brand. For now, we'll just set the model name.
    setSelectedModel(initialModel);
  };

  const loadModels = (brand: string) => {
    if (!catalog) return;

    try {
      const brandData = catalog.brands.find(b => b.brand === brand);
      if (brandData) {
        const modelsData = brandData.models.map(model => ({
          model: model.model,
          catalogId: model.catalogId
        }));
        setModels(modelsData);
        // Reset downstream selections
        setSelectedModel('');
        setSelectedModelId('');
        setVariants([]);
        setSelectedVariant(null);
        setColors([]);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setModels([]);
    }
  };

  const loadVariants = (catalogId: string) => {
    if (!catalog) return;

    try {
      // Find the model with the given catalogId
      for (const brand of catalog.brands) {
        for (const model of brand.models) {
          if (model.catalogId === catalogId) {
            setVariants(model.variants.filter(v => v.isAvailable));
            setSelectedVariant(null);
            setColors([]);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load variants:', error);
      setVariants([]);
    }
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setBrandMenuVisible(false);
    loadModels(brand);
    if (onBrandSelect) {
      onBrandSelect(brand);
    }
  };

  const handleModelSelect = (model: string, catalogId: string) => {
    setSelectedModel(model);
    setSelectedModelId(catalogId);
    setModelMenuVisible(false);
    
    if (onModelSelect) {
      onModelSelect(model);
    }

    if (showVariants) {
      loadVariants(catalogId);
    }
  };

  const handleVariantSelect = (variant: VehicleVariant) => {
    setSelectedVariant(variant);
    setVariantMenuVisible(false);
    
    if (showColors && variant.colors && variant.colors.length > 0) {
      setColors(variant.colors.map(c => ({ name: c.name, code: c.code })));
    }
    
    if (onVariantSelect) {
      onVariantSelect(variant);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setColorMenuVisible(false);
  };

  if (catalogLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading vehicle catalog...</Text>
      </View>
    );
  }

  if (catalogError) {
    return (
      <View style={styles.container}>
        <HelperText type="error">
          Failed to load catalog: {catalogError}
        </HelperText>
      </View>
    );
  }

  if (!catalog || brands.length === 0) {
    return (
      <View style={styles.container}>
        <HelperText type="info">
          No vehicle catalog available for your dealership. Please contact administrator.
        </HelperText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Brand Selector */}
      <Menu
        visible={brandMenuVisible}
        onDismiss={() => setBrandMenuVisible(false)}
        anchor={
          <TextInput
            label="Brand *"
            value={selectedBrand}
            editable={false}
            mode="outlined"
            right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && setBrandMenuVisible(true)} />}
            onPressIn={() => !disabled && setBrandMenuVisible(true)}
            disabled={disabled}
            style={styles.input}
            left={<TextInput.Icon icon="car" />}
          />
        }
      >
        {brands.map((brand) => (
          <Menu.Item
            key={brand}
            onPress={() => handleBrandSelect(brand)}
            title={brand}
          />
        ))}
      </Menu>

      {/* Model Selector */}
      <Menu
        visible={modelMenuVisible}
        onDismiss={() => setModelMenuVisible(false)}
        anchor={
          <TextInput
            label="Model *"
            value={selectedModel}
            editable={false}
            mode="outlined"
            right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && models.length > 0 && setModelMenuVisible(true)} />}
            onPressIn={() => !disabled && models.length > 0 && setModelMenuVisible(true)}
            disabled={disabled || models.length === 0}
            error={!!error}
            style={styles.input}
            left={<TextInput.Icon icon="car-side" />}
          />
        }
      >
        {models.map((model) => (
          <Menu.Item
            key={model.catalogId}
            onPress={() => handleModelSelect(model.model, model.catalogId)}
            title={model.model}
          />
        ))}
      </Menu>
      {error && <HelperText type="error">{error}</HelperText>}

      {/* Variant Selector */}
      {showVariants && variants.length > 0 && (
        <>
          <Menu
            visible={variantMenuVisible}
            onDismiss={() => setVariantMenuVisible(false)}
            anchor={
              <TextInput
                label="Variant (Optional)"
                value={selectedVariant ? selectedVariant.name : ''}
                editable={false}
                mode="outlined"
                right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && setVariantMenuVisible(true)} />}
                onPressIn={() => !disabled && setVariantMenuVisible(true)}
                disabled={disabled}
                style={styles.input}
                left={<TextInput.Icon icon="car-cog" />}
              />
            }
          >
            {variants.map((variant, index) => (
              <Menu.Item
                key={index}
                onPress={() => handleVariantSelect(variant)}
                title={`${variant.name} - ₹${variant.onRoadPrice.toLocaleString()}`}
                titleStyle={styles.variantMenuItem}
              />
            ))}
          </Menu>

          {selectedVariant && (
            <View style={styles.variantDetails}>
              <Text style={styles.variantDetailText}>
                Fuel: {selectedVariant.fuelTypes.join(', ')} | 
                Transmission: {selectedVariant.transmissions.join(', ')}
              </Text>
              <Text style={styles.priceText}>
                On-Road Price: ₹{selectedVariant.onRoadPrice.toLocaleString()}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Color Selector */}
      {showColors && colors.length > 0 && (
        <Menu
          visible={colorMenuVisible}
          onDismiss={() => setColorMenuVisible(false)}
          anchor={
            <TextInput
              label="Color (Optional)"
              value={selectedColor}
              editable={false}
              mode="outlined"
              right={<TextInput.Icon icon="chevron-down" onPress={() => !disabled && setColorMenuVisible(true)} />}
              onPressIn={() => !disabled && setColorMenuVisible(true)}
              disabled={disabled}
              style={styles.input}
              left={<TextInput.Icon icon="palette" />}
            />
          }
        >
          {colors.map((color) => (
            <Menu.Item
              key={color.code}
              onPress={() => handleColorSelect(color.name)}
              title={color.name}
            />
          ))}
        </Menu>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    color: '#6B7280',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  variantMenuItem: {
    fontSize: 14,
  },
  variantDetails: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  variantDetailText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});


