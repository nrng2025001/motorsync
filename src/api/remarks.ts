import apiClient, { handleApiCall } from './client';
import { PendingRemarksSummary, RemarkHistoryEntry } from '../services/types';

class RemarksAPI {
  async getPendingSummary(params?: { dealershipId?: string; dealershipCode?: string; scope?: string }): Promise<PendingRemarksSummary> {
    return handleApiCall(() =>
      apiClient.get('/remarks/pending/summary', {
        params,
      })
    );
  }

  async addEnquiryRemark(enquiryId: string, remark: string): Promise<RemarkHistoryEntry> {
    return handleApiCall(() => apiClient.post(`/remarks/enquiry/${enquiryId}/remarks`, { remark }));
  }

  async addBookingRemark(bookingId: string, remark: string): Promise<RemarkHistoryEntry> {
    return handleApiCall(() => apiClient.post(`/remarks/booking/${bookingId}/remarks`, { remark }));
  }

  async cancelRemark(remarkId: string, reason: string): Promise<RemarkHistoryEntry> {
    return handleApiCall(() => apiClient.post(`/remarks/remarks/${remarkId}/cancel`, { reason }));
  }

  // Phase 2: Team Leader Remark Review
  async getPendingRemarksForReview(params?: { 
    dealershipId?: string; 
    dealershipCode?: string;
    scope?: string;
  }): Promise<{
    enquiries: Array<{
      id: string;
      customerName: string;
      model?: string;
      variant?: string;
      lastRemark: RemarkHistoryEntry;
      daysSinceLastUpdate: number;
      escalationLevel?: string;
    }>;
    bookings: Array<{
      id: string;
      customerName: string;
      variant?: string;
      lastRemark: RemarkHistoryEntry;
      daysSinceLastUpdate: number;
      escalationLevel?: string;
    }>;
  }> {
    return handleApiCall(() =>
      apiClient.get('/remarks/pending/review', { params })
    );
  }

  async markRemarkAsReviewed(remarkId: string): Promise<RemarkHistoryEntry> {
    return handleApiCall(() => apiClient.post(`/remarks/remarks/${remarkId}/review`));
  }

  async addReviewComment(remarkId: string, comment: string): Promise<RemarkHistoryEntry> {
    return handleApiCall(() => apiClient.post(`/remarks/remarks/${remarkId}/comment`, { comment }));
  }
}

export const remarksAPI = new RemarksAPI();
export default remarksAPI;

