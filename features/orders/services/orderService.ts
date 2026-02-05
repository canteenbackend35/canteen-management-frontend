import { api, API_ENDPOINTS } from "@/lib/api-client";
import { Order } from "@/types";

/**
 * Service to handle all Order related API calls.
 * Separating API logic from Hooks for better maintainability and testing.
 */
export const orderService = {
  /**
   * Fetch orders based on role
   */
  async getOrders(role: 'customer' | 'store') {
    const endpoint = role === 'customer' 
      ? API_ENDPOINTS.USERS.ORDERS 
      : API_ENDPOINTS.STORES.ORDERS;
    return api.get<{ success: boolean; orders: Order[] }>(endpoint);
  },

  /**
   * Fetch specific order details
   */
  async getOrderDetails(orderId: number | string) {
    return api.get<{ success: boolean; order: Order }>(API_ENDPOINTS.ORDERS.DETAILS(orderId));
  },

  /**
   * Create a new order
   */
  async createOrder(orderData: any) {
    return api.post(API_ENDPOINTS.ORDERS.CREATE, orderData, true);
  },

  /**
   * Update order status
   */
  async updateStatus(orderId: number, status: string, otp?: string) {
    const statusUpper = status.toUpperCase();
    console.log(status)
    // Support both state-based and action-based strings
    if (statusUpper === 'CONFIRM' || statusUpper === 'CONFIRMED') {
      return api.patch(API_ENDPOINTS.ORDERS.CONFIRM(orderId), {});
    }
    
    if (statusUpper === 'PREPARE' || statusUpper === 'PREPARING') {
      return api.patch(API_ENDPOINTS.ORDERS.PREPARE(orderId), {});
    }
    
    if (statusUpper === 'READY') {
      return api.patch(API_ENDPOINTS.ORDERS.READY(orderId), {});
    }
    
    if (statusUpper === 'VERIFY' || statusUpper === 'DELIVERED') {
      return api.post(API_ENDPOINTS.ORDERS.VERIFY(orderId), { order_otp: otp });
    }
    
    if (statusUpper === 'COMPLETE' || statusUpper === 'COMPLETED') {
      return api.patch(API_ENDPOINTS.ORDERS.COMPLETE(orderId), {});
    }
    
    if (statusUpper === 'CANCEL' || statusUpper === 'CANCELLED') {
      return api.patch(API_ENDPOINTS.ORDERS.CANCEL(orderId), {});
    }

    throw new Error(`Unsupported status update: ${status}`);
  }
};
