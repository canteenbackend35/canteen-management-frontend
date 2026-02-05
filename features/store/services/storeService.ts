import { api, API_ENDPOINTS } from "@/lib/api-client";

/**
 * Service to handle all Store related API calls.
 */
export const storeService = {
  /**
   * Get list of all stores
   */
  async getStores() {
    return api.get<any[]>(API_ENDPOINTS.STORES.LIST, false);
  },

  /**
   * Update store operational status (OPEN/CLOSED)
   */
  async updateStatus(status: 'open' | 'closed') {
    return api.patch(API_ENDPOINTS.STORES.UPDATE_STATUS, { status });
  }
};
