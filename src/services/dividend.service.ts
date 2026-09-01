// DIVIDEND SERVICE
// Frontend abstraction for dividend/benefit program functionality.
// All eligibility, amounts, and authorization are backend-controlled.
// The frontend MUST NOT calculate or credit balances directly.
//
// Future API:
//   GET  /api/v1/dividends/eligibility
//   GET  /api/v1/dividends/programs
//   GET  /api/v1/dividends/claims
//   POST /api/v1/dividends/claims
//   GET  /api/v1/dividends/claims/:id

export type DividendEligibilityStatus =
  | 'not_evaluated' |'under_review' |'eligible' |'not_eligible' |'claim_available' |'claim_submitted' |'processing' |'paid' |'rejected';

export type DividendClaimStatus =
  | 'available' |'submitted' |'under_review' |'approved' |'processing' |'paid' |'rejected' |'expired';

export type EmploymentStatus =
  | 'employed' |'self_employed' |'retired' |'unemployed' |'other';

export interface DividendProgram {
  id: string;
  name: string;
  description: string;
  eligibilityStatus: DividendEligibilityStatus;
  period: string;
  eligibleAmount: number | null; // null = not yet determined by backend
  currency: string;
  availableFrom: string | null;
  claimDeadline: string | null;
  status: DividendClaimStatus;
}

export interface DividendEligibility {
  accountId: string;
  overallStatus: DividendEligibilityStatus;
  employmentStatus: EmploymentStatus | null;
  lastEvaluatedAt: string | null;
  nextReviewAt: string | null;
  totalPaid: number;
  lastPaymentAt: string | null;
  lastPaymentAmount: number | null;
  programs: DividendProgram[];
}

export interface DividendClaim {
  id: string;
  programId: string;
  programName: string;
  period: string;
  amount: number | null;
  currency: string;
  status: DividendClaimStatus;
  submittedAt: string;
  processedAt: string | null;
  reference: string;
  notes: string | null;
}

export interface DividendClaimRequest {
  programId: string;
  declarationAccepted: boolean;
  destinationAccountId: string;
}

export interface DividendClaimResult {
  success: boolean;
  claimId?: string;
  message?: string;
  error?: string;
}

// Mock data — represents what the backend will return
// The frontend never computes eligibility or amounts
const MOCK_ELIGIBILITY: DividendEligibility = {
  accountId: 'cust-001',
  overallStatus: 'not_evaluated',
  employmentStatus: null,
  lastEvaluatedAt: null,
  nextReviewAt: null,
  totalPaid: 0,
  lastPaymentAt: null,
  lastPaymentAmount: null,
  programs: [],
};

const MOCK_CLAIMS: DividendClaim[] = [];

export const dividendService = {
  /**
   * Get dividend eligibility for the current user.
   * BACKEND INTEGRATION: GET /api/v1/dividends/eligibility
   */
  async getEligibility(accountId: string): Promise<DividendEligibility> {
    // BACKEND INTEGRATION: Replace with API call
    // const res = await fetch('/api/v1/dividends/eligibility');
    // return res.json();
    return { ...MOCK_ELIGIBILITY, accountId };
  },

  /**
   * Get available dividend programs.
   * BACKEND INTEGRATION: GET /api/v1/dividends/programs
   */
  async getPrograms(): Promise<DividendProgram[]> {
    // BACKEND INTEGRATION: Replace with API call
    return [];
  },

  /**
   * Get claim history for the current user.
   * BACKEND INTEGRATION: GET /api/v1/dividends/claims
   */
  async getClaims(accountId: string): Promise<DividendClaim[]> {
    // BACKEND INTEGRATION: Replace with API call
    return [...MOCK_CLAIMS];
  },

  /**
   * Submit a dividend claim.
   * BACKEND INTEGRATION: POST /api/v1/dividends/claims
   * Backend will validate eligibility, amount, and authorization.
   * Frontend MUST NOT compute or credit any amount.
   */
  async submitClaim(request: DividendClaimRequest): Promise<DividendClaimResult> {
    // BACKEND INTEGRATION: Replace with API call
    // const res = await fetch('/api/v1/dividends/claims', {
    //   method: 'POST',
    //   body: JSON.stringify(request),
    // });
    // return res.json();
    return {
      success: false,
      error: 'Dividend claim submission requires backend authorization. This feature is not yet active.',
    };
  },

  /**
   * Get a specific claim by ID.
   * BACKEND INTEGRATION: GET /api/v1/dividends/claims/:id
   */
  async getClaim(claimId: string): Promise<DividendClaim | null> {
    // BACKEND INTEGRATION: Replace with API call
    return null;
  },
};
