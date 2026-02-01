// 🚀 Toggle this for Production vs Development
const DEV_URL = "http://localhost:3000";
const PROD_URL = "https://your-production-backend.com"; // ⬅️ Replace with your live backend URL

const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

export const API_ENDPOINTS = {
  // 1. User (Customer) API - /api/users
  USERS: {
    SEND_OTP: "/api/users/send-otp",
    VERIFY_OTP: "/api/users/verify-otp",
    SIGNUP: "/api/users/signup",
    LOGIN: "/api/users/login",
    REFRESH: "/api/users/refresh",
    PROFILE: "/api/users/profile",
    ORDERS: "/api/users/orders",
  },
  // 2. Store API - /api/stores
  STORES: {
    LIST: "/api/stores",
    MENU: (storeId: number | string) => `/api/stores/${storeId}/menu`,
    SEND_OTP: "/api/stores/send-otp",
    VERIFY_OTP: "/api/stores/verify-otp",
    SIGNUP: "/api/stores/signup",
    LOGIN: "/api/stores/login",
    PROFILE: "/api/stores/profile",
    ORDERS: "/api/stores/orders",
  },
  // 3. Order API - /api/orders
  ORDERS: {
    CREATE: "/api/orders",
    DETAILS: (orderId: number | string) => `/api/orders/${orderId}`,
    STATUS: (orderId: number | string) => `/api/orders/${orderId}/status`,
    VERIFY: (orderId: number | string) => `/api/orders/${orderId}/verify`,
    COMPLETE: (orderId: number | string) => `/api/orders/${orderId}/complete`,
    CANCEL: (orderId: number | string) => `/api/orders/${orderId}/cancel`,
  },
  // 4. Menu Management - /api/menu
  MENU_MGMT: {
    CREATE: "/api/menu",
    UPDATE: (itemId: number | string) => `/api/menu/${itemId}`,
    DELETE: (itemId: number | string) => `/api/menu/${itemId}`,
  },
} as const;

/**
 * Helper function to build full API URL
 * @param endpoint - API endpoint path (e.g., '/api/auth/login')
 * @returns Full URL (e.g., 'http://localhost:3000/api/auth/login')
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${BASE_URL}/${cleanEndpoint}`;
}
