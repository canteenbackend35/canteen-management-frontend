import { API_ENDPOINTS, getApiUrl } from "./api-config";

/**
 * API Client utility for making HTTP requests with Gold Standard Security (HttpOnly Cookies)
 */

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

let isRefreshing = false;

/**
 * Make an API request with automatic token refresh on 401 via Cookies
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns Promise with response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, requiresAuth = true } = options;

  const url = getApiUrl(endpoint);
  if(__DEV__) console.log(`📡 [${method}] Requesting: ${url}`);

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    // 🔥 Gold Standard: Send cookies with every request
    credentials: "include", 
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    config.body = JSON.stringify(body);
  }

  try {
    let response = await fetch(url, config);

    // 1. Handle 401 Unauthorized (Expired Session)
    if (response.status === 401 && requiresAuth && !isRefreshing) {
      console.log("Session expired or 401 received, attempting refresh via cookies...");
      isRefreshing = true;

      try {
        // Call backend refresh endpoint (browser sends refreshToken cookie automatically)
        const refreshResponse = await fetch(getApiUrl(API_ENDPOINTS.USERS.REFRESH), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (refreshResponse.ok) {
          console.log("Session refreshed successfully, retrying original request...");
          // Retry original request (browser now has the new accessToken cookie)
          response = await fetch(url, config);
        } else {
          console.error("Refresh failed, redirecting to login...");
          // You might want to trigger a global logout state here
          throw new Error("Session expired. Please login again.");
        }
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Handle non-JSON responses (like 404 HTML pages)
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { error: `Request failed with status ${response.status}` };
    }

    if (!response.ok) {
      throw new Error(data?.UImessage || data?.error || `Request failed with status ${response.status}`);
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

export { API_ENDPOINTS } from "./api-config";
