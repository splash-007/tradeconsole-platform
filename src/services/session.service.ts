// SESSION SERVICE
// Frontend abstraction for customer session management.
//
// IMPORTANT DESIGN PRINCIPLES:
// - Sessions must come from REAL authenticated session data via backend API.
// - Frontend must NOT decide whether a session is valid.
// - Backend controls: creation, expiry, revocation, token invalidation.
// - Frontend only displays server state and requests actions.
// - Current session must be clearly identified and protected from accidental revocation.
//
// Future API:
//   GET    /api/v1/me/sessions
//   DELETE /api/v1/me/sessions/:id        (revoke specific session)
//   DELETE /api/v1/me/sessions/others     (revoke all other sessions)

export interface CustomerSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  approximateLocation: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
  revokedAt: string | null;
}

export interface LoginHistoryEntry {
  id: string;
  date: string;
  device: string;
  browser: string;
  ipAddress: string;
  approximateLocation: string;
  status: 'successful' | 'failed';
}

export interface SessionsState {
  sessions: CustomerSession[];
  loginHistory: LoginHistoryEntry[];
  loading: boolean;
  error: string | null;
}

export interface RevokeSessionResult {
  success: boolean;
  error?: string;
}

export const sessionService = {
  /**
   * Get all active sessions for the current authenticated customer.
   * BACKEND INTEGRATION: GET /api/v1/me/sessions
   *
   * Returns empty array when no backend data is available.
   * Frontend must NOT substitute fake session records.
   */
  async getSessions(): Promise<CustomerSession[]> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with: const res = await apiClient.get('/api/v1/me/sessions');
    // return res.data.sessions;
    return [];
  },

  /**
   * Get login history for the current authenticated customer.
   * BACKEND INTEGRATION: GET /api/v1/me/sessions/history
   *
   * Returns empty array when no backend data is available.
   * Frontend must NOT substitute fake login history records.
   * Only customer-appropriate information should be revealed for failed logins.
   */
  async getLoginHistory(): Promise<LoginHistoryEntry[]> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with: const res = await apiClient.get('/api/v1/me/sessions/history');
    // return res.data.history;
    return [];
  },

  /**
   * Revoke a specific session.
   * Current session must require explicit confirmation before revocation.
   * BACKEND INTEGRATION: DELETE /api/v1/me/sessions/:id
   */
  async revokeSession(sessionId: string): Promise<RevokeSessionResult> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with: await apiClient.delete(`/api/v1/me/sessions/${sessionId}`);
    return { success: false, error: 'Backend integration required' };
  },

  /**
   * Revoke all sessions except the current one.
   * BACKEND INTEGRATION: DELETE /api/v1/me/sessions/others
   */
  async revokeOtherSessions(): Promise<RevokeSessionResult> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with: await apiClient.delete('/api/v1/me/sessions/others');
    return { success: false, error: 'Backend integration required' };
  },
};
