// CUSTOMER ACTIVITY SERVICE
// Frontend abstraction for customer-visible activity history.
//
// IMPORTANT DESIGN PRINCIPLES:
// - Customer Activity is SAFE USER-VISIBLE event history.
// - Audit Log is INTERNAL append-only compliance/security history — never shown to customers.
// - Activity must come from real backend events — never fabricated.
// - Frontend must NOT invent fake activity records.
// - Empty state: "No activity yet" when no backend data exists.
//
// Future API:
//   GET /api/v1/me/activity

export type CustomerActionEventType =
  | 'PROFILE_UPDATED' |'PASSWORD_CHANGED' |'SESSION_CREATED' |'SESSION_REVOKED' |'KYC_STARTED' |'KYC_SUBMITTED' |'KYC_ADDITIONAL_INFO_REQUIRED' |'KYC_VERIFIED' |'KYC_REJECTED' |'DEPOSIT_SUBMITTED' |'DEPOSIT_COMPLETED' |'DEPOSIT_REJECTED' |'WITHDRAWAL_SUBMITTED' |'WITHDRAWAL_APPROVED' |'WITHDRAWAL_COMPLETED' |'WITHDRAWAL_REJECTED' |'TRANSFER_SUBMITTED' |'TRANSFER_COMPLETED' |'SUPPORT_MESSAGE_RECEIVED' |'SUPPORT_TICKET_UPDATED' |'BOT_CREATED' |'BOT_ACTIVATED' |'BOT_PAUSED' |'BOT_STOPPED' |'BOT_COMPLETED' |'PREDICTION_POSITION_OPENED' |'PREDICTION_MARKET_RESOLVED' |'PROGRAM_ENROLLED' |'DIVIDEND_CLAIM_SUBMITTED' |'SECURITY_ALERT';

export type CustomerActionCategory =
  | 'account' |'security' |'trading' |'kyc' |'finance' |'support' |'programs' |'prediction' |'system';

export interface CustomerActionEvent {
  id: string;
  userId: string;
  type: CustomerActionEventType;
  category: CustomerActionCategory;
  /** Human-readable description safe to show the customer */
  description: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  metadata: Record<string, string | number | boolean> | null;
  createdAt: string;
}

export interface ActivityFilters {
  category?: CustomerActionCategory | 'all';
  page?: number;
  limit?: number;
}

export const customerActivityService = {
  /**
   * Get customer-visible activity history for the current authenticated customer.
   * BACKEND INTEGRATION: GET /api/v1/me/activity
   *
   * Returns empty array when no activity exists.
   * Frontend must NOT substitute fake activity records.
   *
   * NOTE: This is customer-visible activity only.
   * Internal audit logs are NEVER returned to customers.
   */
  async getActivity(filters?: ActivityFilters): Promise<CustomerActionEvent[]> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with:
    // const params = new URLSearchParams();
    // if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    // if (filters?.page) params.set('page', String(filters.page));
    // if (filters?.limit) params.set('limit', String(filters.limit));
    // const res = await apiClient.get(`/api/v1/me/activity?${params}`);
    // return res.data.events;
    void filters;
    return [];
  },

  /**
   * Get a human-readable label for an activity event type.
   */
  getEventLabel(type: CustomerActionEventType): string {
    const labels: Record<CustomerActionEventType, string> = {
      PROFILE_UPDATED: 'Profile Updated',
      PASSWORD_CHANGED: 'Password Changed',
      SESSION_CREATED: 'New Login',
      SESSION_REVOKED: 'Session Revoked',
      KYC_STARTED: 'Verification Started',
      KYC_SUBMITTED: 'Verification Submitted',
      KYC_ADDITIONAL_INFO_REQUIRED: 'Additional Info Required',
      KYC_VERIFIED: 'Identity Verified',
      KYC_REJECTED: 'Verification Rejected',
      DEPOSIT_SUBMITTED: 'Deposit Submitted',
      DEPOSIT_COMPLETED: 'Deposit Completed',
      DEPOSIT_REJECTED: 'Deposit Rejected',
      WITHDRAWAL_SUBMITTED: 'Withdrawal Submitted',
      WITHDRAWAL_APPROVED: 'Withdrawal Approved',
      WITHDRAWAL_COMPLETED: 'Withdrawal Completed',
      WITHDRAWAL_REJECTED: 'Withdrawal Rejected',
      TRANSFER_SUBMITTED: 'Transfer Submitted',
      TRANSFER_COMPLETED: 'Transfer Completed',
      SUPPORT_MESSAGE_RECEIVED: 'Support Reply Received',
      SUPPORT_TICKET_UPDATED: 'Support Ticket Updated',
      BOT_CREATED: 'Trading Bot Created',
      BOT_ACTIVATED: 'Trading Bot Activated',
      BOT_PAUSED: 'Trading Bot Paused',
      BOT_STOPPED: 'Trading Bot Stopped',
      BOT_COMPLETED: 'Trading Bot Completed',
      PREDICTION_POSITION_OPENED: 'Prediction Position Opened',
      PREDICTION_MARKET_RESOLVED: 'Prediction Market Resolved',
      PROGRAM_ENROLLED: 'Program Enrolled',
      DIVIDEND_CLAIM_SUBMITTED: 'Dividend Claim Submitted',
      SECURITY_ALERT: 'Security Alert',
    };
    return labels[type] ?? type;
  },
};
