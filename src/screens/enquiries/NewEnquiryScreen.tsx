/**
 * New Enquiry Screen
 * Create new enquiry with backend-compatible validation
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { DatePickerISO } from '../../components/DatePickerISO';
import * as EnquiryService from '../../services/enquiry.service';
import { CreateEnquiryRequest, EnquiryCategory, EnquirySource } from '../../services/types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { enquiryAPI } from '../../api/enquiries';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/roleUtils';
import { formatDateForAPI } from '../../services/api.config';
import { formatEnquirySource } from '../../utils/formatting';

type NavigationProp = StackNavigationProp<MainStackParamList>;

// Hardcoded models and variants as fallback
const HARDCODED_MODELS = [
  'Tata Nexon',
  'Tata Harrier',
  'Tata Safari',
  'Tata Altroz',
  'Tata Tiago',
  'Tata Tigor',
  'Tata Punch',
  'Tata Curvv',
  'Tata Curvv EV',
  'Tata Nexon EV',
  'Tata Tigor EV',
  'Tata Tiago EV'
];

const HARDCODED_VARIANTS: { [key: string]: string[] } = {
  'Tata Nexon': [
    'XE',
    'XM',
    'XZ',
    'XZ+',
    'XZ+ Diesel',
    'XZ+ Diesel MT',
    'XZ+ Diesel AMT',
    'XZ+ Petrol MT',
    'XZ+ Petrol AMT'
  ],
  'Tata Harrier': [
    'XE',
    'XM',
    'XZ',
    'XZ+',
    'XZ+ Diesel MT',
    'XZ+ Diesel AT',
    'XZ+ Petrol MT',
    'XZ+ Petrol AT'
  ],
  'Tata Safari': [
    'XE',
    'XM',
    'XZ',
    'XZ+',
    'XZ+ Diesel MT',
    'XZ+ Diesel AT',
    'XZ+ Petrol MT',
    'XZ+ Petrol AT'
  ],
  'Tata Altroz': [
    'XE',
    'XM',
    'XZ',
    'XZ+',
    'XZ+ Diesel MT',
    'XZ+ Petrol MT',
    'XZ+ Petrol AMT'
  ],
  'Tata Tiago': [
    'XE',
    'XM',
    'XZ',
    'XZ+',
    'XZ+ Diesel MT',
    'XZ+ Petrol MT',
    'XZ+ Petrol AMT'
  ],
  'Tata Tigor': [
    'XE',
    'XM',
    'XZ',
    'XZ+',
    'XZ+ Diesel MT',
    'XZ+ Petrol MT',
    'XZ+ Petrol AMT'
  ],
  'Tata Punch': [
    'Pure',
    'Adventure',
    'Accomplished',
    'Creative',
    'Creative AMT',
    'Adventure AMT',
    'Accomplished AMT'
  ],
  'Tata Curvv': [
    'Pure',
    'Adventure',
    'Accomplished',
    'Creative',
    'Creative AMT',
    'Adventure AMT',
    'Accomplished AMT'
  ],
  'Tata Curvv EV': [
    'Pure',
    'Adventure',
    'Accomplished',
    'Creative',
    'Creative AMT',
    'Adventure AMT',
    'Accomplished AMT'
  ],
  'Tata Nexon EV': [
    'XM',
    'XZ',
    'XZ+',
    'XZ+ LUX',
    'XZ+ LUX Dark',
    'XZ+ LUX Dark AMT'
  ],
  'Tata Tigor EV': [
    'XM',
    'XZ',
    'XZ+',
    'XZ+ LUX',
    'XZ+ LUX Dark'
  ],
  'Tata Tiago EV': [
    'XM',
    'XZ',
    'XZ+',
    'XZ+ LUX',
    'XZ+ LUX Dark'
  ]
};

const HARDCODED_COLORS = [
  'White',
  'Black',
  'Silver',
  'Grey',
  'Red',
  'Blue',
  'Green',
  'Orange',
  'Yellow',
  'Brown',
  'Purple',
  'Gold',
  'Champagne',
  'Pearl White',
  'Metallic Silver',
  'Metallic Grey',
  'Metallic Blue',
  'Metallic Red',
  'Metallic Green'
];

const DEFAULT_SOURCE_OPTIONS = Object.values(EnquirySource).map((value) => ({
  value,
  label: formatEnquirySource(value),
}));

export function NewEnquiryScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { state: authState } = useAuth();
  const userRole = getUserRole(authState.user);

  const todayISO = useMemo(() => formatDateForAPI(new Date()), []);
  const toDateOnly = useCallback((value?: string | null) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString().split('T')[0];
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    customerEmail: '',
    model: '',
    variant: '',
    color: '',
    source: EnquirySource.SHOWROOM_VISIT,
    location: '',
    expectedBookingDate: todayISO,
    nextFollowUpDate: todayISO,
    caRemarks: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [modelMenuVisible, setModelMenuVisible] = useState(false);
  const [variantMenuVisible, setVariantMenuVisible] = useState(false);
  const [colorMenuVisible, setColorMenuVisible] = useState(false);
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Data state
  const [models, setModels] = useState<string[]>([]);
  const [variants, setVariants] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [availableSources, setAvailableSources] = useState(DEFAULT_SOURCE_OPTIONS);
  const [loadingSources, setLoadingSources] = useState(false);
  const [manualVariant, setManualVariant] = useState('');
  const [useManualVariant, setUseManualVariant] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // Fetch models from backend with hardcoded fallback
  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      console.log('🔄 Fetching models from backend...');
      
      const response = await enquiryAPI.getModels();
      console.log('✅ Backend response:', response);
      
      // Extract models from the response structure
      const allModels: string[] = [];
      if (response?.modelsByBrand) {
        Object.values(response.modelsByBrand).forEach(brandModels => {
          allModels.push(...brandModels);
        });
      }
      
      if (allModels.length > 0) {
        console.log('✅ Using models from backend:', allModels.length);
        setModels(allModels);
      } else {
        console.log('⚠️ No models available from backend, using hardcoded fallback');
        setModels(HARDCODED_MODELS);
      }
    } catch (error) {
      console.error('❌ Error fetching models, using hardcoded fallback:', error);
      setModels(HARDCODED_MODELS);
    } finally {
      setLoadingModels(false);
    }
  };


  // Fetch variants for selected model with hardcoded fallback
  const fetchVariantsForModel = async (modelName: string) => {
    try {
      setLoadingVariants(true);
      console.log('🔄 Fetching variants for model:', modelName);
      
      // Fetch variants from backend
      const variantStrings = await enquiryAPI.getVariants(modelName);
      
      if (variantStrings && variantStrings.length > 0) {
        console.log('✅ Fetched variants from backend:', variantStrings.length);
        setVariants(variantStrings);
      } else {
        console.log('⚠️ No variants available from backend, using hardcoded fallback');
        const hardcodedVariants = HARDCODED_VARIANTS[modelName] || [];
        setVariants(hardcodedVariants);
      }
      
    } catch (error) {
      console.error('❌ Error fetching variants, using hardcoded fallback:', error);
      const hardcodedVariants = HARDCODED_VARIANTS[modelName] || [];
      setVariants(hardcodedVariants);
    } finally {
      setLoadingVariants(false);
    }
  };


  const fetchSources = async () => {
    try {
      setLoadingSources(true);
      const response = await enquiryAPI.getSources();
      if (Array.isArray(response) && response.length > 0) {
        const options = response.map((value) => ({
          value: value as EnquirySource,
          label: formatEnquirySource(value),
        }));
        setAvailableSources(options);
        setFormData((prev) => {
          if (options.find((option) => option.value === prev.source)) {
            return prev;
          }
          const fallback = options[0]?.value ?? prev.source;
          return { ...prev, source: fallback };
        });
        return;
      }
    } catch (error) {
      console.error('❌ Error fetching sources, using fallback options:', error);
    } finally {
      setLoadingSources(false);
    }
  };


  // Load models on component mount
  React.useEffect(() => {
    fetchModels();
    fetchSources();
  }, []);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName?.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerContact?.trim()) {
      newErrors.customerContact = 'Contact number is required';
    } else if (!/^\+?[1-9]\d{9,14}$/.test(formData.customerContact.replace(/\s/g, ''))) {
      newErrors.customerContact = 'Please enter a valid phone number with country code (e.g., +919876543210)';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!formData.model?.trim()) {
      newErrors.model = 'Vehicle model is required';
    }

    if (!formData.variant?.trim() && !useManualVariant) {
      newErrors.variant = 'Vehicle variant is required';
    }

    if (useManualVariant && !manualVariant.trim()) {
      newErrors.manualVariant = 'Please enter a variant name';
    }

    if (!formData.source) {
      newErrors.source = 'Source is required';
    }

    if (!formData.expectedBookingDate) {
      newErrors.expectedBookingDate = 'Expected booking date is required';
    } else {
      const selectedDate = new Date(formData.expectedBookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.expectedBookingDate = 'Expected booking date cannot be in the past';
      }
    }

    if (formData.nextFollowUpDate) {
      const selectedFollowUp = new Date(formData.nextFollowUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedFollowUp < today) {
        newErrors.nextFollowUpDate = 'Next follow-up date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API (remove empty optional fields)
      // Use manual variant if selected, otherwise use selected variant
      const finalVariant = useManualVariant ? manualVariant : formData.variant;
      const requestData: CreateEnquiryRequest = {
        customerName: formData.customerName!,
        customerContact: formData.customerContact!,
        variant: finalVariant || '',
        model: formData.model || '',
        source: formData.source,
        expectedBookingDate: toDateOnly(formData.expectedBookingDate) || toDateOnly(todayISO)!,
        category: EnquiryCategory.HOT, // Set default category to HOT
      };

      // Add optional fields if provided
      if (formData.customerEmail) requestData.customerEmail = formData.customerEmail;
      if (formData.color) requestData.color = formData.color;
      if (formData.location?.trim()) requestData.location = formData.location.trim();
      if (formData.nextFollowUpDate) requestData.nextFollowUpDate = toDateOnly(formData.nextFollowUpDate);
      if (formData.caRemarks) requestData.caRemarks = formData.caRemarks;

      const currentUserId =
        (authState.user as any)?.firebaseUid ||
        (authState.user as any)?.user?.firebaseUid ||
        authState.user?.firebaseUid ||
        authState.user?.id ||
        undefined;

      const hasDealershipContext = Boolean(authState.user?.dealership?.id || authState.user?.dealershipId);
      const dealerCode =
        (authState.user?.dealership as any)?.code ||
        (authState.user as any)?.dealershipCode ||
        undefined;
      const dealershipId = authState.user?.dealership?.id || authState.user?.dealershipId || undefined;

      if (dealerCode) {
        requestData.dealerCode = dealerCode;
      }
      if (dealershipId) {
        requestData.dealershipId = dealershipId;
      }

      if (userRole === 'CUSTOMER_ADVISOR' && currentUserId && hasDealershipContext) {
        requestData.assignedToUserId = currentUserId;
      }

      // Debug logging
      console.log('📤 [NewEnquiryScreen] Creating enquiry with data:', JSON.stringify(requestData, null, 2));
      console.log('📤 [NewEnquiryScreen] Manual variant:', useManualVariant);
      console.log('📤 [NewEnquiryScreen] Final variant:', finalVariant);

      const createdEnquiry = await EnquiryService.createEnquiry(requestData);
      console.log('✅ [NewEnquiryScreen] Enquiry created successfully:', createdEnquiry);

      Alert.alert(
        'Success',
        'Enquiry created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Small delay to ensure backend processing is complete
              setTimeout(() => {
                navigation.goBack();
              }, 500);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating enquiry:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create enquiry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };



  const renderModelMenu = () => (
    <Menu
      visible={modelMenuVisible}
      onDismiss={() => setModelMenuVisible(false)}
      anchor={
        <TextInput
          label="Select Model *"
          value={formData.model}
          editable={false}
          mode="outlined"
          right={
            loadingModels ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <TextInput.Icon icon="chevron-down" onPress={() => setModelMenuVisible(true)} />
            )
          }
          onPressIn={() => !loadingModels && setModelMenuVisible(true)}
          error={!!errors.model}
          style={styles.input}
          placeholder="Choose a vehicle model..."
        />
      }
    >
      {models.map((model, index) => (
        <Menu.Item
          key={index}
          onPress={() => {
            setFormData({ ...formData, model: model, variant: '', color: '' });
            setSelectedModel(model);
            setModelMenuVisible(false);
            if (errors.model) setErrors({ ...errors, model: '' });
            // Fetch variants for selected model
            fetchVariantsForModel(model);
          }}
          title={model}
        />
      ))}
      {models.length === 0 && !loadingModels && (
        <Menu.Item
          onPress={() => setModelMenuVisible(false)}
          title="No models available"
          disabled
        />
      )}
    </Menu>
  );

  const renderVariantMenu = () => (
    <Menu
      visible={variantMenuVisible}
      onDismiss={() => setVariantMenuVisible(false)}
      anchor={
        <TextInput
          label="Select Variant *"
          value={useManualVariant ? manualVariant : formData.variant}
          editable={false}
          mode="outlined"
          right={
            loadingVariants ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <TextInput.Icon icon="chevron-down" onPress={() => formData.model && setVariantMenuVisible(true)} />
            )
          }
          onPressIn={() => formData.model && !loadingVariants && setVariantMenuVisible(true)}
          error={!!errors.variant || !!errors.manualVariant}
          style={[styles.input, !formData.model && styles.disabledInput]}
          placeholder={formData.model ? "Choose a vehicle variant..." : "Select model first"}
          disabled={!formData.model}
        />
      }
    >
      {variants.map((variant, index) => (
        <Menu.Item
          key={index}
          onPress={() => {
            setFormData({ ...formData, variant: variant });
            setSelectedVariant(variant);
            setUseManualVariant(false);
            setManualVariant('');
            setVariantMenuVisible(false);
            if (errors.variant) setErrors({ ...errors, variant: '' });
          }}
          title={variant}
        />
      ))}
      <Menu.Item
        onPress={() => {
          setUseManualVariant(true);
          setVariantMenuVisible(false);
          if (errors.variant) setErrors({ ...errors, variant: '' });
        }}
        title="📝 Enter variant manually"
        style={{ backgroundColor: '#f0f0f0' }}
      />
      {variants.length === 0 && !loadingVariants && (
        <Menu.Item
          onPress={() => setVariantMenuVisible(false)}
          title="No variants available"
          disabled
        />
      )}
    </Menu>
  );

  const renderSourceMenu = () => (
    <Menu
      visible={sourceMenuVisible}
      onDismiss={() => setSourceMenuVisible(false)}
      anchor={
        <TextInput
          label="Source *"
          value={availableSources.find(option => option.value === formData.source)?.label || ''}
          editable={false}
          mode="outlined"
          right={
            loadingSources ? (
              <ActivityIndicator style={{ marginTop: 14, marginRight: 12 }} size="small" color="#666" />
            ) : (
              <TextInput.Icon
                icon="chevron-down"
                onPress={() => setSourceMenuVisible(true)}
              />
            )
          }
          onPressIn={() => setSourceMenuVisible(true)}
          error={!!errors.source}
          style={styles.input}
          placeholder="Select enquiry source"
        />
      }
    >
      {availableSources.map(option => (
        <Menu.Item
          key={option.value}
          onPress={() => {
            setFormData({ ...formData, source: option.value });
            setSourceMenuVisible(false);
            if (errors.source) setErrors({ ...errors, source: '' });
          }}
          title={option.label}
        />
      ))}
    </Menu>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Customer Information
            </Text>

            <TextInput
              label="Customer Name *"
              value={formData.customerName}
              onChangeText={(text) => {
                setFormData({ ...formData, customerName: text });
                if (errors.customerName) setErrors({ ...errors, customerName: '' });
              }}
              mode="outlined"
              error={!!errors.customerName}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />
            {errors.customerName && (
              <Text style={styles.errorText}>{errors.customerName}</Text>
            )}

            <TextInput
              label="Contact Number *"
              value={formData.customerContact}
              onChangeText={(text) => {
                setFormData({ ...formData, customerContact: text });
                if (errors.customerContact) setErrors({ ...errors, customerContact: '' });
              }}
              mode="outlined"
              keyboardType="phone-pad"
              placeholder="+919876543210"
              error={!!errors.customerContact}
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />
            {errors.customerContact && (
              <Text style={styles.errorText}>{errors.customerContact}</Text>
            )}

            <TextInput
              label="Email"
              value={formData.customerEmail}
              onChangeText={(text) => {
                setFormData({ ...formData, customerEmail: text });
                if (errors.customerEmail) setErrors({ ...errors, customerEmail: '' });
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.customerEmail}
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />
            {errors.customerEmail && (
              <Text style={styles.errorText}>{errors.customerEmail}</Text>
            )}

            <TextInput
              label="Location"
              value={formData.location}
              onChangeText={(text) => {
                setFormData({ ...formData, location: text });
                if (errors.location) setErrors({ ...errors, location: '' });
              }}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
            />
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Vehicle Information
            </Text>

            {renderModelMenu()}
            {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}

            {renderVariantMenu()}
            {errors.variant && <Text style={styles.errorText}>{errors.variant}</Text>}

            {useManualVariant && (
              <>
                <TextInput
                  label="Enter Variant Manually *"
                  value={manualVariant}
                  onChangeText={(text) => {
                    setManualVariant(text);
                    if (errors.manualVariant) setErrors({ ...errors, manualVariant: '' });
                  }}
                  mode="outlined"
                  placeholder="e.g., Tata Harrier XZ Plus Diesel AT"
                  style={styles.input}
                  left={<TextInput.Icon icon="pencil" />}
                  error={!!errors.manualVariant}
                />
                <Text style={[styles.helperText, { marginTop: -8, marginBottom: 8 }]}>
                  Enter the complete variant name as it should appear
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setUseManualVariant(false);
                    setManualVariant('');
                    if (errors.manualVariant) setErrors({ ...errors, manualVariant: '' });
                  }}
                  style={[styles.input, { marginTop: 8 }]}
                  icon="arrow-left"
                >
                  Back to dropdown selection
                </Button>
              </>
            )}
            {errors.manualVariant && <Text style={styles.errorText}>{errors.manualVariant}</Text>}

            <Menu
              visible={colorMenuVisible}
              onDismiss={() => setColorMenuVisible(false)}
              anchor={
                <TextInput
                  label="Color (Optional)"
                  value={formData.color}
                  mode="outlined"
                  placeholder="Select color"
                  style={styles.input}
                  left={<TextInput.Icon icon="palette" />}
                  right={
                    <TextInput.Icon 
                      icon="chevron-down" 
                      onPress={() => setColorMenuVisible(true)} 
                    />
                  }
                  editable={false}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setFormData({ ...formData, color: '' });
                  setColorMenuVisible(false);
                }}
                title="No Color"
              />
              {HARDCODED_COLORS.map((color, index) => (
                <Menu.Item
                  key={index}
                  onPress={() => {
                    setFormData({ ...formData, color: color });
                    setColorMenuVisible(false);
                  }}
                  title={color}
                />
              ))}
            </Menu>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Additional Details
            </Text>

            {renderSourceMenu()}
            {errors.source && <Text style={styles.errorText}>{errors.source}</Text>}

            <DatePickerISO
              label="Expected Booking Date *"
              value={formData.expectedBookingDate}
              onChange={(date) => {
                setFormData({ ...formData, expectedBookingDate: date });
                if (errors.expectedBookingDate) {
                  setErrors({ ...errors, expectedBookingDate: '' });
                }
              }}
              minimumDate={new Date()}
              error={errors.expectedBookingDate}
            />
            {errors.expectedBookingDate && <Text style={styles.errorText}>{errors.expectedBookingDate}</Text>}

            <DatePickerISO
              label="Next Follow-up Date"
              value={formData.nextFollowUpDate}
              onChange={(date) => {
                setFormData({ ...formData, nextFollowUpDate: date });
                if (errors.nextFollowUpDate) {
                  setErrors({ ...errors, nextFollowUpDate: '' });
                }
              }}
              minimumDate={new Date()}
              error={errors.nextFollowUpDate}
            />
            {errors.nextFollowUpDate && <Text style={styles.errorText}>{errors.nextFollowUpDate}</Text>}

            <TextInput
              label="Remarks (Optional)"
              value={formData.caRemarks}
              onChangeText={(text) => setFormData({ ...formData, caRemarks: text })}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Add any additional notes..."
              style={styles.input}
              left={<TextInput.Icon icon="text" />}
            />
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.helpText}>
          * Required fields
        </Text>
        <Text variant="bodySmall" style={styles.helpText}>
          Note: New enquiries will be automatically categorized as "HOT"
        </Text>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Creating...' : 'Create Enquiry'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
  helpText: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
