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
}

export const remarksAPI = new RemarksAPI();
export default remarksAPI;

