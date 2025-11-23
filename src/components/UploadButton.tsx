/**
 * Upload Button Component
 * Handles Excel/CSV file upload for bulk data import
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { enquiryAPI } from '../api/enquiries';

interface UploadButtonProps {
  type: 'enquiries';
  onUploadStart?: () => void;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: any) => void;
  style?: any;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  type,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  style,
}) => {
  const [uploading, setUploading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importId, setImportId] = useState<string | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file type
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name?.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !validExtensions.includes(`.${fileExtension}`)) {
        Alert.alert(
          'Invalid File Type',
          'Please select an Excel (.xlsx, .xls) or CSV (.csv) file.',
          [{ text: 'OK' }]
        );
        return;
      }

      await handleUpload(file);
    } catch (error: any) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      onUploadError?.(error);
    }
  };

  const handleUpload = async (file: any) => {
    try {
      setUploading(true);
      onUploadStart?.();

      // Create file object for FormData (React Native format)
      const fileObject = {
        uri: file.uri,
        name: file.name || 'upload.xlsx',
        type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      // Upload file
      const response = await enquiryAPI.uploadBulkEnquiries(fileObject);
      
      if (response.data?.importId) {
        setImportId(response.data.importId);
        setShowProgress(true);
        checkImportProgress(response.data.importId);
      } else {
        Alert.alert(
          'Upload Successful',
          `File uploaded successfully. ${response.data?.validRows || 0} rows processed.`,
          [{ text: 'OK' }]
        );
        onUploadComplete?.(response.data);
        setUploading(false);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || error.message || `Failed to upload ${type}. Please check the file format and try again.`
      );
      onUploadError?.(error);
      setUploading(false);
    }
  };

  const checkImportProgress = async (id: string) => {
    try {
      const maxAttempts = 60; // 5 minutes max (5 second intervals)
      let attempts = 0;

      const interval = setInterval(async () => {
        attempts++;
        
        try {
          const progressResponse = await enquiryAPI.getImportProgress(id);
          const progressData = progressResponse.data;

          if (progressData) {
            const progressPercent = progressData.totalRows > 0
              ? Math.round((progressData.processedRows / progressData.totalRows) * 100)
              : 0;
            
            setProgress(progressPercent);

            if (progressData.status === 'completed') {
              clearInterval(interval);
              setShowProgress(false);
              setUploading(false);
              
              Alert.alert(
                'Import Completed',
                `Successfully imported ${progressData.successfulRows} enquiries. ${progressData.failedRows} failed.`,
                [{ text: 'OK', onPress: () => {
                  onUploadComplete?.(progressData);
                }}]
              );
            } else if (progressData.status === 'failed') {
              clearInterval(interval);
              setShowProgress(false);
              setUploading(false);
              
              Alert.alert(
                'Import Failed',
                'The import process failed. Please check the file format and try again.',
                [{ text: 'OK' }]
              );
              onUploadError?.(new Error('Import failed'));
            }
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setShowProgress(false);
            setUploading(false);
            Alert.alert(
              'Import Timeout',
              'The import is taking longer than expected. Please check the import history for status.',
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error('Error checking progress:', error);
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setShowProgress(false);
            setUploading(false);
          }
        }
      }, 5000); // Check every 5 seconds

    } catch (error: any) {
      console.error('Error setting up progress check:', error);
      setShowProgress(false);
      setUploading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.uploadButton, style, uploading && styles.uploadButtonDisabled]}
        onPress={pickDocument}
        disabled={uploading}
        activeOpacity={0.7}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        )}
        <Text style={styles.buttonText}>
          {uploading ? 'Uploading...' : `Upload ${type}`}
        </Text>
      </TouchableOpacity>

      {/* Progress Modal */}
      <Modal
        visible={showProgress}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!uploading) {
            setShowProgress(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Uploading {type}...</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Please wait while we process your file...
            </Text>
            {!uploading && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProgress(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UploadButton;

