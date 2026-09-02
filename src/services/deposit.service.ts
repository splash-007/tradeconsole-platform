/**
 * Deposit Service — Frontend abstraction for customer deposit flows.
 * Frontend must NEVER directly credit balances.
 *
 * Future APIs:
 *   GET  /api/v1/me/deposits
 *   POST /api/v1/me/deposits
 *   GET  /api/v1/me/deposits/:id
 *   GET  /api/v1/deposits/methods
 */

export type DepositMethod = 'bank_transfer' | 'card' | 'crypto' | 'other';

export type DepositStatus =
  | 'draft' |'submitted' |'pending' |'processing' |'completed' |'failed' |'cancelled' |'rejected';

export interface DepositMethodConfig {
  id: string;
  type: DepositMethod;
  label: string;
  description: string;
  minimumAmount: number | null;   // null = backend-configured
  maximumAmount: number | null;
  feeDescription: string | null;  // null = backend-configured
  processingTime: string | null;
  currencies: string[];
  enabled: boolean;
}

export interface DepositRequest {
  methodId: string;
  currency: string;
  amount: number;
  reference?: string;
}

export interface DepositResult {
  success: boolean;
  depositId?: string;
  status?: DepositStatus;
  instructions?: string;
  message: string;
  errors?: Record<string, string>;
}

export interface DepositRecord {
  id: string;
  method: DepositMethod;
  currency: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: DepositStatus;
  reference: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const depositService = {
  /**
   * Get available deposit methods for the current customer.
   * Future: GET /api/v1/deposits/methods
   * Only methods configured and enabled by backend should be shown.
   */
  async getDepositMethods(): Promise<DepositMethodConfig[]> {
    // Returns empty until backend provides real configuration
    return Promise.resolve([]);
  },

  /**
   * Submit a deposit request.
   * Future: POST /api/v1/me/deposits
   * Backend validates, creates ledger entry, and returns instructions.
   */
  async submitDeposit(request: DepositRequest): Promise<DepositResult> {
    console.log('[depositService] submitDeposit (mock):', request);
    return Promise.resolve({
      success: true,
      depositId: `dep-${Date.now()}`,
      status: 'submitted',
      message: 'Deposit request submitted. Awaiting processing.',
    });
  },

  /**
   * Get deposit history for the current customer.
   * Future: GET /api/v1/me/deposits
   */
  async getDepositHistory(params?: { limit?: number; offset?: number }): Promise<DepositRecord[]> {
    console.log('[depositService] getDepositHistory (mock):', params);
    return Promise.resolve([]);
  },

  /**
   * Get a specific deposit record.
   * Future: GET /api/v1/me/deposits/:id
   */
  async getDeposit(depositId: string): Promise<DepositRecord | null> {
    console.log('[depositService] getDeposit (mock):', depositId);
    return Promise.resolve(null);
  },
};
