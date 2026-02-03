import { api, API_ENDPOINTS } from "@/lib/api-client";

/**
 * Service to handle all Auth related API calls.
 * Implements the Unified Auth System logic.
 */
export const authService = {
  /**
   * Send OTP to a phone number
   */
  async login(phoneNo: string, role: string) {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, { phoneNo, role }, false);
  },

  /**
   * Verify the 6-digit OTP code
   */
  async verifyOtp(phoneNo: string, otp: string, reqId: string, role: string) {
    return api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      phoneNo,
      otp,
      reqId,
      role
    }, false);
  },

  /**
   * Sign up a new user or store
   */
  async signup(data: any) {
    return api.post(API_ENDPOINTS.AUTH.SIGNUP, data, false);
  },

  /**
   * Resend OTP code
   */
  async resendOtp(phoneNo: string) {
    return api.post(API_ENDPOINTS.AUTH.SEND_OTP, { phoneNo }, false);
  },

  /**
   * Get current user/store profile
   */
  async getProfile() {
    return api.get(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * Refresh session (Optional: usually handled by client interceptor)
   */
  async refresh() {
    return api.post(API_ENDPOINTS.AUTH.REFRESH, {}, false);
  }
};
