import { getApiUrl } from "./api-config";
import { supabase } from "./supabase";
/**
 * API Client utility for making HTTP requests
 *
 * Usage examples:
 *
 * // User login (sends OTP)
 * const loginResponse = await api.post(API_ENDPOINTS.USERS.LOGIN, { phone_no: "9876543210" }, false);
 *
 * // Validate OTP
 * const otpResult = await api.post(API_ENDPOINTS.USERS.VALIDATE_OTP, { phoneNo: "9876543210", otp: "123456" }, false);
 *
 * // User signup
 * const signupResponse = await api.post(API_ENDPOINTS.USERS.SIGNUP, { name: "John", phone_no: "9876543210", course: "B.Tech", college: "IIT" }, false);
 *
 * // Get all stores (public)
 * const stores = await api.get(API_ENDPOINTS.STORES.LIST, false);
 *
 * // Get store menu
 * const menu = await api.get(API_ENDPOINTS.MENU.GET_STORE_MENU(1), false);
 *
 * // Get user orders (requires auth)
 * const orders = await api.get(API_ENDPOINTS.USERS.ORDERS(123));
 *
 * // Create order (requires auth)
 * const newOrder = await api.post(API_ENDPOINTS.ORDERS.CREATE, { customer_id: 1, store_id: 1, items: [...] });
 */

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Make an API request
 * @param endpoint - API endpoint (e.g., API_ENDPOINTS.AUTH.VERIFY_OTP)
 * @param options - Request options
 * @returns Promise with response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, requiresAuth = true } = options;

  // Build full URL
  const url = getApiUrl(endpoint);

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add auth token if required
  if (requiresAuth) {
    const { data, error } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    console.log("Auth token:", token);
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  // Prepare request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for POST/PUT/PATCH requests
  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Parse response
    const data = await response.json();

    // Handle errors
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request failed [${method} ${url}]:`, error);
    throw error;
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(endpoint: string, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: "GET", requiresAuth }),

  post: <T = any>(endpoint: string, body?: any, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: "POST", body, requiresAuth }),

  put: <T = any>(endpoint: string, body?: any, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: "PUT", body, requiresAuth }),

  patch: <T = any>(endpoint: string, body?: any, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: "PATCH", body, requiresAuth }),

  delete: <T = any>(endpoint: string, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: "DELETE", requiresAuth }),
};

// Export API_ENDPOINTS for convenience
export { API_ENDPOINTS } from "./api-config";
