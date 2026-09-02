/**
 * Programs Service — Frontend abstraction for customer benefit programs.
 * All financial values are backend-authoritative.
 * Frontend must NEVER directly modify balances.
 *
 * Future APIs:
 *   GET  /api/v1/programs/deposit-bonus
 *   POST /api/v1/programs/deposit-bonus/activate
 */

export type ProgramStatus = 'available' | 'activated' | 'used' | 'expired' | 'not_eligible';

export interface DepositBonusProgram {
  id: string;
  name: string;
  bonusPercentage: number | null; // null = backend-configured, not hardcoded
  minimumDeposit: number;
  maximumBonus: number | null;
  eligibleDepositTypes: string[];
  validFrom: string;
  validUntil: string | null;
  status: ProgramStatus;
  terms: string;
  description: string;
}

export interface ReferralProgram {
  id: string;
  referralCode: string;
  referralLink: string;
  rewardDescription: string; // backend-configured, not hardcoded
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReward: number;
  paidReward: number;
  programTerms: string;
  status: ProgramStatus;
}

export interface ReferralEntry {
  id: string;
  maskedName: string;
  joinedAt: string;
  qualified: boolean;
  status: 'pending' | 'qualified' | 'rewarded' | 'expired';
  reward: number | null;
  paidAt: string | null;
}

export interface LendingProgram {
  id: string;
  name: string;
  asset: string;
  assetSymbol: string;
  apyDisplay: string | null; // null until backend provides real rate
  term: string;
  minimumAmount: number;
  maximumAmount: number | null;
  availableLiquidity: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'available' | 'paused' | 'closed';
  description: string;
}

export interface LendingPosition {
  id: string;
  asset: string;
  assetSymbol: string;
  amount: number;
  program: string;
  rateDisplay: string | null;
  startDate: string;
  maturityDate: string | null;
  accruedAmount: number;
  status: 'pending' | 'active' | 'maturing' | 'completed' | 'cancelled' | 'defaulted';
}

// ─── Mock data (service abstraction — replace with API calls) ─────────────────

const MOCK_DEPOSIT_BONUS: DepositBonusProgram = {
  id: 'prog-deposit-001',
  name: 'Promotional Deposit Bonus',
  bonusPercentage: null, // Backend-configured — do not hardcode
  minimumDeposit: 500,
  maximumBonus: null,
  eligibleDepositTypes: ['bank_transfer', 'crypto'],
  validFrom: '2026-09-01',
  validUntil: null,
  status: 'available',
  terms: 'Subject to program terms and conditions. Bonus credited after qualifying deposit is confirmed. Minimum holding period applies. Program availability subject to jurisdiction.',
  description: 'Receive additional account credit on qualifying promotional deposits. Program terms and bonus percentage are configured by the platform.',
};

const MOCK_REFERRAL_PROGRAM: ReferralProgram = {
  id: 'prog-referral-001',
  referralCode: 'TC-ALEX-2026',
  referralLink: 'https://tradeconsole.com/ref/TC-ALEX-2026',
  rewardDescription: 'Reward percentage configured by platform program settings.',
  totalReferrals: 3,
  qualifiedReferrals: 2,
  pendingReward: 0,
  paidReward: 0,
  programTerms: 'Referral rewards are subject to program terms. Referred clients must complete KYC and meet minimum activity requirements. Reward amounts are backend-configured.',
  status: 'available',
};

const MOCK_REFERRAL_HISTORY: ReferralEntry[] = [
  { id: 'ref-001', maskedName: 'J*** S***', joinedAt: '2026-08-15', qualified: true, status: 'qualified', reward: null, paidAt: null },
  { id: 'ref-002', maskedName: 'M*** T***', joinedAt: '2026-08-22', qualified: true, status: 'qualified', reward: null, paidAt: null },
  { id: 'ref-003', maskedName: 'R*** K***', joinedAt: '2026-09-01', qualified: false, status: 'pending', reward: null, paidAt: null },
];

const MOCK_LENDING_PROGRAMS: LendingProgram[] = [
  {
    id: 'lend-prog-001',
    name: 'BTC Flexible Lending',
    asset: 'Bitcoin',
    assetSymbol: 'BTC',
    apyDisplay: null, // Rate provided by backend/provider
    term: 'Flexible',
    minimumAmount: 0.001,
    maximumAmount: null,
    availableLiquidity: 45.2,
    riskLevel: 'medium',
    status: 'available',
    description: 'Allocate Bitcoin to an approved lending pool. Rate and terms are subject to market conditions and program availability.',
  },
  {
    id: 'lend-prog-002',
    name: 'USDC Lending',
    asset: 'USD Coin',
    assetSymbol: 'USDC',
    apyDisplay: null,
    term: '30 days',
    minimumAmount: 100,
    maximumAmount: 50000,
    availableLiquidity: 125000,
    riskLevel: 'low',
    status: 'available',
    description: 'Allocate USDC stablecoin to an approved lending program. Subject to program terms and risk disclosure.',
  },
];

const MOCK_LENDING_POSITIONS: LendingPosition[] = [];

// ─── Service ──────────────────────────────────────────────────────────────────

export const programsService = {
  async getDepositBonus(): Promise<DepositBonusProgram> {
    // Future: GET /api/v1/programs/deposit-bonus
    return Promise.resolve(MOCK_DEPOSIT_BONUS);
  },

  async activateDepositBonus(): Promise<{ success: boolean; message: string }> {
    // Future: POST /api/v1/programs/deposit-bonus/activate
    return Promise.resolve({ success: true, message: 'Deposit bonus activation request submitted.' });
  },

  async getReferralProgram(): Promise<ReferralProgram> {
    // Future: GET /api/v1/referrals/me
    return Promise.resolve(MOCK_REFERRAL_PROGRAM);
  },

  async getReferralHistory(): Promise<ReferralEntry[]> {
    // Future: GET /api/v1/referrals
    return Promise.resolve(MOCK_REFERRAL_HISTORY);
  },

  async sendReferralInvite(email: string): Promise<{ success: boolean }> {
    // Future: POST /api/v1/referrals/invite
    console.log('[programsService] sendReferralInvite (mock):', email);
    return Promise.resolve({ success: true });
  },

  async getLendingPrograms(): Promise<LendingProgram[]> {
    // Future: GET /api/v1/lending/programs
    return Promise.resolve(MOCK_LENDING_PROGRAMS);
  },

  async getLendingPositions(): Promise<LendingPosition[]> {
    // Future: GET /api/v1/lending/positions
    return Promise.resolve(MOCK_LENDING_POSITIONS);
  },

  async openLendingPosition(programId: string, amount: number): Promise<{ success: boolean; positionId?: string }> {
    // Future: POST /api/v1/lending/positions
    console.log('[programsService] openLendingPosition (mock):', programId, amount);
    return Promise.resolve({ success: true, positionId: `pos-${Date.now()}` });
  },

  async closeLendingPosition(positionId: string): Promise<{ success: boolean }> {
    // Future: POST /api/v1/lending/positions/:id/close
    console.log('[programsService] closeLendingPosition (mock):', positionId);
    return Promise.resolve({ success: true });
  },
};
