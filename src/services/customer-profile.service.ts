/**
 * Customer Profile Service
 * Typed frontend abstraction for customer profile data.
 *
 * Future APIs:
 *   GET /api/v1/me/profile
 *   PUT /api/v1/me/profile
 *   PUT /api/v1/me/profile/personal
 *   PUT /api/v1/me/profile/address
 *   PUT /api/v1/me/profile/employment
 *   PUT /api/v1/me/profile/preferences
 */

export type EmploymentStatus =
  | 'employed' |'self_employed' |'retired' |'unemployed' |'student' |'other';

export type AccountStatus = 'active' | 'suspended' | 'restricted' | 'closed' | 'pending';
export type VerificationStatus = 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'verified' | 'rejected';

/**
 * Canonical customer profile model.
 * All fields map to backend-authoritative data.
 * Frontend must never derive balances or eligibility from this model alone.
 */
export interface CustomerProfile {
  // Identity
  userId: string;
  accountId: string;

  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;

  // Demographics
  dateOfBirth: string; // ISO date
  nationality: string;
  country: string;

  // Address
  address: string;
  city: string;
  postalCode: string;

  // Employment (used as one signal in backend eligibility rules)
  occupation: string;
  employerName: string;
  employmentStatus: EmploymentStatus;
  annualIncomeRange: string;

  // Preferences
  preferredCurrency: string;
  language: string;
  timezone: string;

  // Account state (read-only from backend)
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  accountType: string;
  memberSince: string; // ISO date

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Partial update payloads — each maps to a specific backend endpoint.
 * Keeps update scope narrow and auditable.
 */
export interface UpdatePersonalInformationPayload {
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountryCode: string;
  dateOfBirth: string;
  nationality: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface UpdateEmploymentPayload {
  employmentStatus: EmploymentStatus;
  occupation: string;
  employerName: string;
  annualIncomeRange: string;
}

export interface UpdatePreferencesPayload {
  preferredCurrency: string;
  language: string;
  timezone: string;
}

export interface ProfileUpdateResult {
  success: boolean;
  message: string;
  updatedAt?: string;
  errors?: Record<string, string>;
}

// ─── Mock profile (replace with API call) ────────────────────────────────────

const MOCK_PROFILE: CustomerProfile = {
  userId: 'usr-placeholder',
  accountId: 'TC-2026-001847',
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@email.com',
  phone: '7700900000',
  phoneCountryCode: '+44',
  dateOfBirth: '1985-06-15',
  nationality: 'British',
  country: 'United Kingdom',
  address: '12 Canary Wharf',
  city: 'London',
  postalCode: 'E14 5AB',
  occupation: 'Financial Analyst',
  employerName: 'Morgan Capital Ltd',
  employmentStatus: 'employed',
  annualIncomeRange: '75000-100000',
  preferredCurrency: 'USD',
  language: 'en',
  timezone: 'UTC+0:00 (London)',
  accountStatus: 'active',
  verificationStatus: 'not_started',
  accountType: 'Individual',
  memberSince: '2024-08-01',
  createdAt: '2024-08-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const customerProfileService = {
  /**
   * Fetch the current authenticated customer's profile.
   * Future: GET /api/v1/me/profile
   */
  async getProfile(): Promise<CustomerProfile> {
    return Promise.resolve({ ...MOCK_PROFILE });
  },

  /**
   * Refresh profile from backend (invalidates local cache).
   * Future: GET /api/v1/me/profile (with cache-busting header)
   */
  async refreshProfile(): Promise<CustomerProfile> {
    return Promise.resolve({ ...MOCK_PROFILE, updatedAt: new Date().toISOString() });
  },

  /**
   * Update personal information fields.
   * Future: PUT /api/v1/me/profile/personal
   */
  async updatePersonalInformation(payload: UpdatePersonalInformationPayload): Promise<ProfileUpdateResult> {
    console.log('[customerProfileService] updatePersonalInformation (mock):', payload);
    return Promise.resolve({ success: true, message: 'Personal information update request submitted.', updatedAt: new Date().toISOString() });
  },

  /**
   * Update employment information.
   * Future: PUT /api/v1/me/profile/employment
   * Note: Employment status is one eligibility signal — backend determines program eligibility.
   */
  async updateEmployment(payload: UpdateEmploymentPayload): Promise<ProfileUpdateResult> {
    console.log('[customerProfileService] updateEmployment (mock):', payload);
    return Promise.resolve({ success: true, message: 'Employment information update request submitted.', updatedAt: new Date().toISOString() });
  },

  /**
   * Update customer preferences.
   * Future: PUT /api/v1/me/profile/preferences
   */
  async updatePreferences(payload: UpdatePreferencesPayload): Promise<ProfileUpdateResult> {
    console.log('[customerProfileService] updatePreferences (mock):', payload);
    return Promise.resolve({ success: true, message: 'Preferences updated.', updatedAt: new Date().toISOString() });
  },

  /**
   * Full profile update (use specific methods where possible).
   * Future: PUT /api/v1/me/profile
   */
  async updateProfile(payload: Partial<CustomerProfile>): Promise<ProfileUpdateResult> {
    console.log('[customerProfileService] updateProfile (mock):', payload);
    return Promise.resolve({ success: true, message: 'Profile update request submitted.', updatedAt: new Date().toISOString() });
  },
};
