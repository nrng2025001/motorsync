import { apiClient, handleApiCall, ApiResponse } from './client';

export interface Activity {
  id: string;
  type: 'enquiry' | 'booking' | 'vehicle' | 'user';
  action?: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface DashboardStats {
  totalEnquiries: number;
  totalBookings: number;
  totalVehicles: number;
  totalEmployees: number;
  pendingEnquiries: number;
  pendingBookings: number;
  lowStockVehicles: number;
}

class DashboardAPI {
  static async getDashboardStats(): Promise<DashboardStats> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    );
  }

  static async getRecentActivities(params?: {
    limit?: number;
    type?: 'enquiry' | 'booking' | 'vehicle' | 'user';
  }): Promise<Activity[]> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<Activity[]>>('/dashboard/recent-activities', {
        params,
      })
    );
  }

  static async getSalesPerformance(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalSales: number;
    totalBookings: number;
    conversionRate: number;
    byPeriod: Array<{ period: string; sales: number; bookings: number }>;
  }> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<any>>('/dashboard/sales-performance', {
        params,
      })
    );
  }
}

export const dashboardAPI = DashboardAPI;
export default DashboardAPI;


