import { api, API_ENDPOINTS } from "@/lib/api-client";

/**
 * Service to handle all Menu related API calls.
 */
export const menuService = {
  /**
   * Get menu for a specific store
   */
  async getStoreMenu(storeId: string) {
    return api.get<any[]>(API_ENDPOINTS.STORES.MENU(storeId), false);
  },

  /**
   * Create a new menu item (Store Owner only)
   */
  async createItem(itemData: any) {
    return api.post(API_ENDPOINTS.MENU_MGMT.CREATE, itemData);
  },

  /**
   * Update a menu item
   */
  async updateItem(itemId: number | string, itemData: any) {
    return api.put(API_ENDPOINTS.MENU_MGMT.UPDATE(itemId), itemData);
  },

  /**
   * Delete a menu item
   */
  async deleteItem(itemId: number | string) {
    return api.delete(API_ENDPOINTS.MENU_MGMT.DELETE(itemId));
  }
};
