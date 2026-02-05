// 🚀 Toggle this for Production vs Development
const DEV_URL = "http://localhost:3000";
const PROD_URL = "https://canteen-management-backend-5qxg.onrender.com"; // ⬅️ Replace with your live backend URL

const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

console.log("🛠️ API Environment:", __DEV__ ? "DEVELOPMENT" : "PRODUCTION");
console.log("🔗 API Base URL:", BASE_URL);



export const API_ENDPOINTS = {
  // 1. Unified Auth API - /api/auth (NEW STRUCTURE)
  AUTH: {
    SEND_OTP: "/api/auth/send-otp",
    VERIFY_OTP: "/api/auth/verify-otp",
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    ME: "/api/auth/me",
  },
  // 2. User (Customer) Business Logic - /api/users
  USERS: {
    ORDERS: "/api/users/orders",
  },
  // 3. Store Business Logic - /api/stores
  STORES: {
    LIST: "/api/stores",
    MENU: (storeId: number | string) => `/api/stores/${storeId}/menu`,
    ORDERS: "/api/stores/orders",
    UPDATE_STATUS: "/api/stores/status",
  },
  // 4. Order API - /api/orders
  ORDERS: {
    CREATE: "/api/orders",
    DETAILS: (orderId: number | string) => `/api/orders/${orderId}`,
    CONFIRM: (orderId: number | string) => `/api/orders/${orderId}/confirm`,
    VERIFY: (orderId: number | string) => `/api/orders/${orderId}/verify`,
    PREPARE: (orderId: number | string) => `/api/orders/${orderId}/prepare`,
    READY: (orderId: number | string) => `/api/orders/${orderId}/ready`,
    COMPLETE: (orderId: number | string) => `/api/orders/${orderId}/complete`,
    CANCEL: (orderId: number | string) => `/api/orders/${orderId}/cancel`,
    WATCH: (orderId: number | string) => `/api/orders/${orderId}/watch`,
  },
  // 5. Menu Management - /api/menu
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

export const ORDER_WATCH_URL = (orderId: number | string) => getApiUrl(API_ENDPOINTS.ORDERS.WATCH(orderId));
export const STORE_WATCH_URL = () => getApiUrl(API_ENDPOINTS.STORES.ORDERS + "/watch");
