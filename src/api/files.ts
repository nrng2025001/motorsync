import { apiClient, handleApiCall, ApiResponse } from './client';
import { PaginatedResponse } from '../services/types';

/**
 * Files API endpoints
 * 
 * This file contains all file-related API calls:
 * - File upload
 * - File download
 * - File management
 * - File metadata
 */

/**
 * File interface
 */
export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * File upload response interface
 */
export interface FileUploadResponse {
  file: File;
  message: string;
}

/**
 * File upload request interface
 */
export interface FileUploadRequest {
  file: File;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * File filters interface
 */
export interface FileFilters {
  category?: string[];
  mimeType?: string[];
  uploadedBy?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  minSize?: number;
  maxSize?: number;
}

/**
 * File list parameters interface
 */
export interface FileListParams extends FileFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'filename' | 'size';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * File statistics interface
 */
export interface FileStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  filesByCategory: Record<string, number>;
  filesByMimeType: Record<string, number>;
  recentUploads: File[];
}

/**
 * Files API class
 */
export class FilesAPI {
  /**
   * Get files list with filters and pagination
   */
  static async getFiles(params: FileListParams = {}): Promise<PaginatedResponse<File>> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<PaginatedResponse<File>>>('/files', { params })
    );
  }

  /**
   * Get file by ID
   */
  static async getFileById(id: string): Promise<File> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<File>>(`/files/${id}`)
    );
  }

  /**
   * Upload file
   */
  static async uploadFile(
    file: File,
    category?: string,
    tags?: string[],
    metadata?: Record<string, any>
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file as any);
    
    if (category) formData.append('category', category);
    if (tags) formData.append('tags', JSON.stringify(tags));
    if (metadata) formData.append('metadata', JSON.stringify(metadata));

    return handleApiCall(() =>
      apiClient.post<ApiResponse<FileUploadResponse>>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file uploads
      })
    );
  }

  /**
   * Download file
   */
  static async downloadFile(id: string): Promise<Blob> {
    return handleApiCall(() =>
      apiClient.get(`/files/${id}/download`, {
        responseType: 'blob',
      })
    );
  }

  /**
   * Get file download URL
   */
  static async getFileDownloadUrl(id: string): Promise<{ url: string }> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<{ url: string }>>(`/files/${id}/download-url`)
    );
  }

  /**
   * Delete file
   */
  static async deleteFile(id: string): Promise<void> {
    return handleApiCall(() =>
      apiClient.delete<ApiResponse<void>>(`/files/${id}`)
    );
  }

  /**
   * Update file metadata
   */
  static async updateFileMetadata(
    id: string,
    metadata: {
      category?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<File> {
    return handleApiCall(() =>
      apiClient.put<ApiResponse<File>>(`/files/${id}`, metadata)
    );
  }

  /**
   * Get file statistics
   */
  static async getFileStats(): Promise<FileStats> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<FileStats>>('/files/stats')
    );
  }

  /**
   * Search files
   */
  static async searchFiles(query: string, filters?: FileFilters): Promise<File[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<File[]>>('/files/search', {
        params: { q: query, ...filters }
      })
    );
  }

  /**
   * Get files by category
   */
  static async getFilesByCategory(category: string): Promise<File[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<File[]>>('/files/category', {
        params: { category }
      })
    );
  }

  /**
   * Get files by tags
   */
  static async getFilesByTags(tags: string[]): Promise<File[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<File[]>>('/files/tags', {
        params: { tags: tags.join(',') }
      })
    );
  }

  /**
   * Bulk delete files
   */
  static async bulkDeleteFiles(fileIds: string[]): Promise<{ deleted: number; failed: string[] }> {
    return handleApiCall(() =>
      apiClient.post<ApiResponse<{ deleted: number; failed: string[] }>>('/files/bulk-delete', {
        fileIds
      })
    );
  }

  /**
   * Get file categories
   */
  static async getFileCategories(): Promise<string[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<string[]>>('/files/categories')
    );
  }

  /**
   * Get file tags
   */
  static async getFileTags(): Promise<string[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<string[]>>('/files/tags')
    );
  }
}

export default FilesAPI;
