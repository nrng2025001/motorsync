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
  totalEmployees: number;
  activeEnquiries: number;
  pendingQuotations: number;
  totalBookings: number;
  stockCount: number;
  revenue: number;
  enquiryStats: {
    total: number;
    byCategory: { HOT: number; LOST: number; BOOKED: number };
    byStatus: { OPEN: number; CLOSED: number };
  };
  quotationStats: {
    total: number;
    byStatus: { PENDING: number; APPROVED: number; REJECTED: number };
  };
}

export interface BookingPlanTodaySummary {
  enquiries: any[];
  bookings: any[];
  totalEnquiries?: number;
  totalBookings?: number;
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

  static async getTodayBookingPlan(params?: { dealershipId?: string; dealershipCode?: string }): Promise<BookingPlanTodaySummary> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<BookingPlanTodaySummary>>('/dashboard/booking-plan/today', {
        params,
      })
    );
  }

  // Phase 2: Team Leader Dashboard
  static async getTeamLeaderDashboard(): Promise<{
    teamSize: number;
    totalHotInquiryCount: number;
    pendingCAOnUpdate: number;
    pendingEnquiriesToUpdate: number;
    todaysBookingPlan: number;
  }> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<{
        teamSize: number;
        totalHotInquiryCount: number;
        pendingCAOnUpdate: number;
        pendingEnquiriesToUpdate: number;
        todaysBookingPlan: number;
      }>>('/dashboard/team-leader')
    );
  }

  // Phase 2: Bookings Funnel Math
  static async getBookingsFunnel(): Promise<{
    carryForward: number;
    newThisMonth: number;
    delivered: number;
    lost: number;
    actualLive: number;
  }> {
    return handleApiCall(() =>
      apiClient.get<ApiResponse<{
        carryForward: number;
        newThisMonth: number;
        delivered: number;
        lost: number;
        actualLive: number;
      }>>('/dashboard/bookings/funnel')
    );
  }
}

export const dashboardAPI = DashboardAPI;
export default DashboardAPI;


