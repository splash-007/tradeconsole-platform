/**
 * Withdrawal Service — Frontend abstraction for customer withdrawal flows.
 * Frontend must NEVER directly debit balances.
 * Backend is authoritative for all validation and approval.
 *
 * Future APIs:
 *   GET  /api/v1/me/withdrawals
 *   POST /api/v1/me/withdrawals
 *   GET  /api/v1/me/withdrawals/:id
 *   GET  /api/v1/me/withdrawal-destinations
 *   POST /api/v1/me/withdrawal-destinations
 */

export type WithdrawalDestinationType = 'bank_account' | 'crypto_address' | 'saved_destination';

export type WithdrawalStatus =
  | 'draft' |'submitted' |'pending_review' |'approved' |'processing' |'completed' |'rejected' |'cancelled' |'failed';

/**
 * Frontend validation states — backend remains authoritative.
 * These are UI hints only; backend must re-validate all rules.
 */
export type WithdrawalValidationIssue =
  | 'insufficient_balance' |'below_minimum' |'above_maximum' |'kyc_required' |'account_restricted' |'destination_unverified' |'cooldown_active' |'security_verification_required' |'daily_limit_exceeded' |'period_limit_exceeded';

export interface WithdrawalDestination {
  id: string;
  type: WithdrawalDestinationType;
  label: string;
  details: string; // masked bank account or crypto address
  currency: string;
  verified: boolean;
}

export interface WithdrawalRequest {
  currency: string;
  amount: number;
  destinationId: string;
  securityCode?: string; // 2FA or OTP
  note?: string;
}

export interface WithdrawalResult {
  success: boolean;
  withdrawalId?: string;
  status?: WithdrawalStatus;
  message: string;
  estimatedProcessingTime?: string;
  errors?: Record<string, string>;
  validationIssues?: WithdrawalValidationIssue[];
}

export interface WithdrawalRecord {
  id: string;
  currency: string;
  amount: number;
  fee: number;
  netAmount: number;
  destination: string;
  destinationType: WithdrawalDestinationType;
  status: WithdrawalStatus;
  reference: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const withdrawalService = {
  /**
   * Get saved withdrawal destinations for the current customer.
   * Future: GET /api/v1/me/withdrawal-destinations
   */
  async getDestinations(): Promise<WithdrawalDestination[]> {
    return Promise.resolve([]);
  },

  /**
   * Add a new withdrawal destination.
   * Future: POST /api/v1/me/withdrawal-destinations
   */
  async addDestination(destination: Omit<WithdrawalDestination, 'id' | 'verified'>): Promise<{ success: boolean; destinationId?: string; message: string }> {
    console.log('[withdrawalService] addDestination (mock):', destination);
    return Promise.resolve({ success: true, destinationId: `dest-${Date.now()}`, message: 'Destination submitted for verification.' });
  },

  /**
   * Submit a withdrawal request.
   * Future: POST /api/v1/me/withdrawals
   * Backend validates all rules — frontend validation is UI-only.
   */
  async submitWithdrawal(request: WithdrawalRequest): Promise<WithdrawalResult> {
    console.log('[withdrawalService] submitWithdrawal (mock):', request);
    return Promise.resolve({
      success: true,
      withdrawalId: `wdl-${Date.now()}`,
      status: 'submitted',
      message: 'Withdrawal request submitted. Pending review.',
      estimatedProcessingTime: 'Backend-configured',
    });
  },

  /**
   * Get withdrawal history for the current customer.
   * Future: GET /api/v1/me/withdrawals
   */
  async getWithdrawalHistory(params?: { limit?: number; offset?: number }): Promise<WithdrawalRecord[]> {
    console.log('[withdrawalService] getWithdrawalHistory (mock):', params);
    return Promise.resolve([]);
  },

  /**
   * Get a specific withdrawal record.
   * Future: GET /api/v1/me/withdrawals/:id
   */
  async getWithdrawal(withdrawalId: string): Promise<WithdrawalRecord | null> {
    console.log('[withdrawalService] getWithdrawal (mock):', withdrawalId);
    return Promise.resolve(null);
  },
};
