/**
 * API Configuration
 *
 * To switch between localhost and production:
 * - For localhost: Set BASE_URL to 'http://localhost:PORT' or 'http://YOUR_IP:PORT'
 * - For production: Set BASE_URL to your deployed backend URL
 *
 * Note: For Android emulator, use 'http://10.0.2.2:PORT' instead of 'localhost'
 *       For iOS simulator, use 'http://localhost:PORT'
 *       For physical devices, use your computer's local IP address
 */

// Change this to switch between development and production
const IS_DEVELOPMENT = true;

// Development URL (localhost)
const DEV_BASE_URL = "http://10.187.228.224:3000"; // Change port as needed

// Production URL (deployed backend)
const PROD_BASE_URL = "https://your-backend-domain.com"; // Replace with your deployed URL

/**
 * Base URL for API requests
 */
export const BASE_URL = IS_DEVELOPMENT ? DEV_BASE_URL : PROD_BASE_URL;

/**
 * API endpoints - Based on backend OpenAPI spec
 */
export const API_ENDPOINTS = {
  // User endpoints
  USERS: {
    SIGNUP: "/users/signup",
    LOGIN: "/users/login",
    ORDERS: "/users/orders",
  },
  // Store endpoints
  STORES: {
    SIGNUP: "/stores/signup",
    LOGIN: "/stores/login",
    LIST: "/stores",
    ORDERS: (storeId: number | string) => `/stores/${storeId}/orders`,
  },
  // Menu Item endpoints
  MENU: {
    GET_STORE_MENU: (storeId: number | string) => `/stores/${storeId}/menu`,
    CREATE_ITEM: (storeId: number | string) => `/item/${storeId}`,
    UPDATE_ITEM: (itemId: number | string) => `/item/${itemId}`,
    DELETE_ITEM: (itemId: number | string) => `/item/${itemId}`,
  },
  // Order endpoints
  ORDERS: {
    CREATE: "/orders",
    DETAILS: (orderId: number | string) => `/orders/${orderId}`,
    STATUS: (orderId: number | string) => `/orders/${orderId}/status`,
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

/**
 * Helper function to check if we're in development mode
 */
export function isDevelopment(): boolean {
  return IS_DEVELOPMENT;
}
