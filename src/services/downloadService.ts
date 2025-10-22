/**
 * Download Service for handling file downloads and sharing
 * Handles Excel/JSON exports and file sharing functionality
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { bookingAPI } from '../api/bookings';
import { enquiryAPI } from '../api/enquiries';

export class DownloadService {
  /**
   * Download bookings with filters
   */
  static async downloadBookings(filters: any = {}) {
    try {
      console.log('📥 Starting bookings download with filters:', filters);
      
      const blob = await bookingAPI.downloadBookings(filters);
      
      // Convert blob to base64
      const base64 = await this.blobToBase64(blob);
      
      // Create file path
      const fileName = `bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      console.log('💾 Writing file to:', fileUri);
      
      // Write file
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('✅ File written successfully');
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        console.log('📤 Sharing file...');
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Share Bookings Export',
        });
        console.log('✅ File shared successfully');
      } else {
        console.log('⚠️ Sharing not available on this device');
      }
      
      return { success: true, fileUri };
    } catch (error) {
      console.error('❌ Download bookings error:', error);
      throw error;
    }
  }

  /**
   * Download enquiries with filters
   */
  static async downloadEnquiries(filters: any = {}) {
    try {
      console.log('📥 Starting enquiries download with filters:', filters);
      
      const blob = await enquiryAPI.downloadEnquiries(filters);
      
      // Convert blob to base64
      const base64 = await this.blobToBase64(blob);
      
      // Create file path
      const fileName = `enquiries_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      console.log('💾 Writing file to:', fileUri);
      
      // Write file
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('✅ File written successfully');
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        console.log('📤 Sharing file...');
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Share Enquiries Export',
        });
        console.log('✅ File shared successfully');
      } else {
        console.log('⚠️ Sharing not available on this device');
      }
      
      return { success: true, fileUri };
    } catch (error) {
      console.error('❌ Download enquiries error:', error);
      throw error;
    }
  }

  /**
   * Convert blob to base64 string
   */
  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get file info for downloaded files
   */
  static async getFileInfo(fileUri: string) {
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      return info;
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Delete downloaded file
   */
  static async deleteFile(fileUri: string) {
    try {
      await FileSystem.deleteAsync(fileUri);
      console.log('🗑️ File deleted:', fileUri);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * List all downloaded files
   */
  static async listDownloadedFiles() {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
      return files.filter(file => 
        file.includes('bookings_export_') || 
        file.includes('enquiries_export_')
      );
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}

export default DownloadService;
