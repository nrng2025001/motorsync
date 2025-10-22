/**
 * Download Button Component
 * Handles bulk download with format selection and filters
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { DownloadService } from '../services/downloadService';

interface DownloadButtonProps {
  type: 'bookings' | 'enquiries';
  onDownloadStart?: () => void;
  onDownloadComplete?: (result: any) => void;
  style?: any;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  type,
  onDownloadStart,
  onDownloadComplete,
  style,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    format: 'excel',
    startDate: '',
    endDate: '',
    status: '',
    category: '',
    search: '',
  });

  const handleDownload = async () => {
    setLoading(true);
    onDownloadStart?.();

    try {
      const result = type === 'bookings' 
        ? await DownloadService.downloadBookings(filters)
        : await DownloadService.downloadEnquiries(filters);

      onDownloadComplete?.(result);
      setShowModal(false);
      
      Alert.alert(
        'Success',
        `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Error',
        `Failed to download ${type}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      format: 'excel',
      startDate: '',
      endDate: '',
      status: '',
      category: '',
      search: '',
    });
  };

  const getStatusOptions = () => {
    if (type === 'bookings') {
      return [
        { label: 'All Statuses', value: '' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Confirmed', value: 'CONFIRMED' },
        { label: 'Delivered', value: 'DELIVERED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ];
    } else {
      return [
        { label: 'All Statuses', value: '' },
        { label: 'New', value: 'NEW' },
        { label: 'Follow Up', value: 'FOLLOW_UP' },
        { label: 'Converted', value: 'CONVERTED' },
        { label: 'Lost', value: 'LOST' },
      ];
    }
  };

  const getCategoryOptions = () => {
    if (type === 'enquiries') {
      return [
        { label: 'All Categories', value: '' },
        { label: 'HOT', value: 'HOT' },
        { label: 'WARM', value: 'WARM' },
        { label: 'COLD', value: 'COLD' },
      ];
    }
    return [];
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.downloadButton, style]}
        onPress={() => setShowModal(true)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Download {type}</Text>
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Download {type}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Format</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.format}
                  onValueChange={(value) => setFilters({...filters, format: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Excel (.xlsx)" value="excel" />
                  <Picker.Item label="JSON (.json)" value="json" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={filters.startDate}
                onChangeText={(text) => setFilters({...filters, startDate: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>End Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={filters.endDate}
                onChangeText={(text) => setFilters({...filters, endDate: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status (Optional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.status}
                  onValueChange={(value) => setFilters({...filters, status: value})}
                  style={styles.picker}
                >
                  {getStatusOptions().map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {type === 'enquiries' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category (Optional)</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filters.category}
                    onValueChange={(value) => setFilters({...filters, category: value})}
                    style={styles.picker}
                  >
                    {getCategoryOptions().map((option) => (
                      <Picker.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Search (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Search term..."
                value={filters.search}
                onChangeText={(text) => setFilters({...filters, search: text})}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.downloadButton, styles.modalButton]}
                onPress={handleDownload}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Download</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: '#007AFF',
  },
});

export default DownloadButton;
