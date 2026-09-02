/**
 * Funds Service — Frontend abstraction for customer balance and funds data.
 * Frontend must NEVER directly modify authoritative balances.
 *
 * Future APIs:
 *   GET /api/v1/me/funds/balance
 *   GET /api/v1/me/funds/history
 */

export type FundsCurrency = string; // ISO currency code or crypto symbol

export interface CustomerBalance {
  totalBalance: number;
  availableBalance: number;
  reservedBalance: number;
  pendingBalance: number;
  currency: FundsCurrency;
  lastUpdated: string; // ISO timestamp
}

export type FundsHistoryType = 'deposit' | 'withdrawal' | 'transfer';

export type FundsHistoryStatus =
  | 'draft' |'submitted' |'pending' |'pending_review' |'processing' |'completed' |'failed' |'cancelled' |'rejected' |'approved';

export interface FundsHistoryEntry {
  id: string;
  type: FundsHistoryType;
  asset: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: FundsHistoryStatus;
  reference: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BALANCE: CustomerBalance = {
  totalBalance: 0,
  availableBalance: 0,
  reservedBalance: 0,
  pendingBalance: 0,
  currency: 'USD',
  lastUpdated: new Date().toISOString(),
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const fundsService = {
  /**
   * Get current customer balance.
   * Future: GET /api/v1/me/funds/balance
   * IMPORTANT: Balance is backend-authoritative. Frontend must never compute or modify it.
   */
  async getBalance(): Promise<CustomerBalance> {
    return Promise.resolve({ ...MOCK_BALANCE, lastUpdated: new Date().toISOString() });
  },

  /**
   * Get combined funds history (deposits, withdrawals, transfers).
   * Future: GET /api/v1/me/funds/history
   */
  async getHistory(params?: { type?: FundsHistoryType; limit?: number; offset?: number }): Promise<FundsHistoryEntry[]> {
    console.log('[fundsService] getHistory (mock):', params);
    return Promise.resolve([]);
  },
};
