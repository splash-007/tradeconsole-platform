/**
 * Transfer Service — Frontend abstraction for customer transfer flows.
 * Transfer is distinct from Withdrawal — backend determines allowed destination types.
 * Frontend must NEVER directly modify balances.
 *
 * Future APIs:
 *   GET  /api/v1/me/transfers
 *   POST /api/v1/me/transfers
 *   GET  /api/v1/me/transfers/:id
 */

export type TransferType =
  | 'internal_account'   // Between customer's own sub-accounts
  | 'wallet_to_wallet'   // Between wallets within the platform
  | 'customer_transfer'; // To another customer (where explicitly supported)

export type TransferStatus =
  | 'draft' |'submitted' |'pending_review' |'processing' |'completed' |'failed' |'cancelled' |'rejected';

export interface TransferRequest {
  type: TransferType;
  currency: string;
  amount: number;
  sourceAccountId?: string;
  destinationAccountId?: string;
  destinationReference?: string; // For customer-to-customer transfers
  note?: string;
}

export interface TransferResult {
  success: boolean;
  transferId?: string;
  status?: TransferStatus;
  message: string;
  errors?: Record<string, string>;
}

export interface TransferRecord {
  id: string;
  type: TransferType;
  currency: string;
  amount: number;
  fee: number;
  netAmount: number;
  source: string;
  destination: string;
  status: TransferStatus;
  reference: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const transferService = {
  /**
   * Submit a transfer request.
   * Future: POST /api/v1/me/transfers
   * Backend determines allowed transfer types and validates all rules.
   */
  async submitTransfer(request: TransferRequest): Promise<TransferResult> {
    console.log('[transferService] submitTransfer (mock):', request);
    return Promise.resolve({
      success: true,
      transferId: `txf-${Date.now()}`,
      status: 'submitted',
      message: 'Transfer request submitted.',
    });
  },

  /**
   * Get transfer history for the current customer.
   * Future: GET /api/v1/me/transfers
   */
  async getTransferHistory(params?: { limit?: number; offset?: number }): Promise<TransferRecord[]> {
    console.log('[transferService] getTransferHistory (mock):', params);
    return Promise.resolve([]);
  },

  /**
   * Get a specific transfer record.
   * Future: GET /api/v1/me/transfers/:id
   */
  async getTransfer(transferId: string): Promise<TransferRecord | null> {
    console.log('[transferService] getTransfer (mock):', transferId);
    return Promise.resolve(null);
  },
};
