// SECURITY SERVICE
// Frontend abstraction for customer security events and actions.
//
// IMPORTANT DESIGN PRINCIPLES:
// - Security events must come from real backend data.
// - Frontend must NOT generate fake security alerts.
// - Password change must be confirmed by backend before notification is created.
// - 2FA state must come from backend, not local state.
//
// Future API:
//   GET  /api/v1/me/security/status
//   POST /api/v1/me/security/password
//   POST /api/v1/me/security/2fa/enable
//   POST /api/v1/me/security/2fa/disable
//   POST /api/v1/me/security/2fa/verify

export interface SecurityStatus {
  twoFactorEnabled: boolean;
  twoFactorMethod: '2fa_app' | 'sms' | null;
  lastPasswordChangedAt: string | null;
  loginNotificationsEnabled: boolean;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChangeResult {
  success: boolean;
  error?: string;
}

export interface TwoFactorSetupResult {
  success: boolean;
  qrCodeUrl?: string;
  backupCodes?: string[];
  error?: string;
}

export const securityService = {
  /**
   * Get current security status for the authenticated customer.
   * BACKEND INTEGRATION: GET /api/v1/me/security/status
   */
  async getSecurityStatus(): Promise<SecurityStatus> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with: const res = await apiClient.get('/api/v1/me/security/status');
    // return res.data;
    return {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      lastPasswordChangedAt: null,
      loginNotificationsEnabled: true,
    };
  },

  /**
   * Change customer password.
   * Backend must confirm success before any notification is created.
   * BACKEND INTEGRATION: POST /api/v1/me/security/password
   *
   * On success: triggers PASSWORD_CHANGED customer activity event.
   * On success: backend creates security notification for the customer.
   */
  async changePassword(payload: PasswordChangePayload): Promise<PasswordChangeResult> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with:
    // const res = await apiClient.post('/api/v1/me/security/password', payload);
    // return { success: true };
    return { success: false, error: 'Backend integration required' };
  },

  /**
   * Initiate 2FA setup.
   * BACKEND INTEGRATION: POST /api/v1/me/security/2fa/enable
   */
  async initiate2FASetup(): Promise<TwoFactorSetupResult> {
    // BACKEND INTEGRATION REQUIRED
    return { success: false, error: 'Backend integration required' };
  },

  /**
   * Verify and confirm 2FA setup.
   * BACKEND INTEGRATION: POST /api/v1/me/security/2fa/verify
   */
  async verify2FA(code: string): Promise<{ success: boolean; error?: string }> {
    void code;
    // BACKEND INTEGRATION REQUIRED
    return { success: false, error: 'Backend integration required' };
  },

  /**
   * Disable 2FA.
   * BACKEND INTEGRATION: POST /api/v1/me/security/2fa/disable
   */
  async disable2FA(code: string): Promise<{ success: boolean; error?: string }> {
    void code;
    // BACKEND INTEGRATION REQUIRED
    return { success: false, error: 'Backend integration required' };
  },
};
