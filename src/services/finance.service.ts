// BACKEND INTEGRATION: GET/POST /api/v1/finance/*

export type DepositMethod = 'bank_transfer' | 'credit_card' | 'crypto' | 'wire';
export type WithdrawMethod = 'bank_transfer' | 'crypto' | 'wire';
export type FinanceStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface DepositRequest {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  method: DepositMethod;
  status: FinanceStatus;
  reference: string;
  submittedAt: string;
  estimatedArrival: string;
  confirmedAt: string | null;
  notes: string;
}

export interface WithdrawalRequest {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  method: WithdrawMethod;
  destination: string;
  status: FinanceStatus;
  reference: string;
  submittedAt: string;
  estimatedArrival: string;
  processedAt: string | null;
  fee: number;
  notes: string;
}

export interface FinanceBalance {
  available: number;
  reserved: number;
  total: number;
  currency: string;
}

const MOCK_DEPOSITS: DepositRequest[] = [
  { id: 'dep-001', customerId: 'cust-001', amount: 10000, currency: 'USD', method: 'bank_transfer', status: 'completed', reference: 'DEP-2026-001', submittedAt: '2026-08-20 09:00', estimatedArrival: '2026-08-22', confirmedAt: '2026-08-22 14:30', notes: '' },
  { id: 'dep-002', customerId: 'cust-001', amount: 5000, currency: 'USD', method: 'credit_card', status: 'processing', reference: 'DEP-2026-002', submittedAt: '2026-08-27 10:00', estimatedArrival: '2026-08-27', confirmedAt: null, notes: '' },
];

const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  { id: 'wth-001', customerId: 'cust-001', amount: 2000, currency: 'USD', method: 'bank_transfer', destination: 'IBAN: GB29 NWBK 6016 1331 9268 19', status: 'completed', reference: 'WTH-2026-001', submittedAt: '2026-08-25 11:00', estimatedArrival: '2026-08-27', processedAt: '2026-08-27 09:00', fee: 15, notes: '' },
  { id: 'wth-002', customerId: 'cust-001', amount: 500, currency: 'USD', method: 'crypto', destination: '0x742d35Cc6634C0532925a3b8D4C9C2', status: 'pending', reference: 'WTH-2026-002', submittedAt: '2026-08-27 13:00', estimatedArrival: '2026-08-27', processedAt: null, fee: 5, notes: '' },
];

export const financeService = {
  async getBalance(customerId: string): Promise<FinanceBalance> {
    // BACKEND INTEGRATION: GET /api/v1/finance/:customerId/balance
    return { available: 24850, reserved: 5000, total: 29850, currency: 'USD' };
  },

  async getDeposits(customerId: string): Promise<DepositRequest[]> {
    // BACKEND INTEGRATION: GET /api/v1/finance/:customerId/deposits
    return MOCK_DEPOSITS.filter(d => d.customerId === customerId);
  },

  async getWithdrawals(customerId: string): Promise<WithdrawalRequest[]> {
    // BACKEND INTEGRATION: GET /api/v1/finance/:customerId/withdrawals
    return MOCK_WITHDRAWALS.filter(w => w.customerId === customerId);
  },

  async submitDeposit(customerId: string, data: {
    amount: number;
    currency: string;
    method: DepositMethod;
  }): Promise<{ success: boolean; deposit?: DepositRequest; error?: string }> {
    // BACKEND INTEGRATION: POST /api/v1/finance/:customerId/deposits
    const deposit: DepositRequest = {
      id: `dep-${Date.now()}`,
      customerId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      status: 'pending',
      reference: `DEP-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      confirmedAt: null,
      notes: '',
    };
    return { success: true, deposit };
  },

  async submitWithdrawal(customerId: string, data: {
    amount: number;
    currency: string;
    method: WithdrawMethod;
    destination: string;
  }): Promise<{ success: boolean; withdrawal?: WithdrawalRequest; error?: string }> {
    // BACKEND INTEGRATION: POST /api/v1/finance/:customerId/withdrawals
    const withdrawal: WithdrawalRequest = {
      id: `wth-${Date.now()}`,
      customerId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      destination: data.destination,
      status: 'pending',
      reference: `WTH-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      processedAt: null,
      fee: data.method === 'bank_transfer' ? 15 : 5,
      notes: '',
    };
    return { success: true, withdrawal };
  },

  async cancelWithdrawal(withdrawalId: string): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: DELETE /api/v1/finance/withdrawals/:id
    return { success: true };
  },
};
