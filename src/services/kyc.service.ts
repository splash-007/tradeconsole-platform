// BACKEND INTEGRATION: GET/POST /api/v1/kyc/*

export type KYCStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type KYCStatus = 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'verified' | 'rejected';
export type DocumentType = 'passport' | 'national_id' | 'drivers_license';

export interface KYCStep {
  id: string;
  title: string;
  description: string;
  status: KYCStepStatus;
}

export interface KYCSubmission {
  customerId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  documentType: DocumentType;
  documentNumber: string;
  documentExpiry: string;
  documentFrontUploaded: boolean;
  documentBackUploaded: boolean;
  selfieUploaded: boolean;
  proofOfAddressUploaded: boolean;
  status: KYCStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

const MOCK_KYC: KYCSubmission = {
  customerId: 'cust-001',
  firstName: 'Alex',
  lastName: 'Morgan',
  dateOfBirth: '',
  nationality: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'United Kingdom',
  documentType: 'passport',
  documentNumber: '',
  documentExpiry: '',
  documentFrontUploaded: false,
  documentBackUploaded: false,
  selfieUploaded: false,
  proofOfAddressUploaded: false,
  status: 'not_started',
  submittedAt: null,
  reviewedAt: null,
  rejectionReason: null,
};

export const kycService = {
  async getKYCStatus(customerId: string): Promise<KYCSubmission> {
    // BACKEND INTEGRATION: GET /api/v1/kyc/:customerId
    return { ...MOCK_KYC, customerId };
  },

  async savePersonalInfo(customerId: string, data: Partial<KYCSubmission>): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: PATCH /api/v1/kyc/:customerId/personal
    return { success: true };
  },

  async uploadDocument(customerId: string, docType: string, file: File): Promise<{ success: boolean; url?: string }> {
    // BACKEND INTEGRATION: POST /api/v1/kyc/:customerId/documents
    return { success: true, url: `https://cdn.example.com/kyc/${customerId}/${docType}` };
  },

  async submitKYC(customerId: string): Promise<{ success: boolean; status: KYCStatus }> {
    // BACKEND INTEGRATION: POST /api/v1/kyc/:customerId/submit
    return { success: true, status: 'under_review' };
  },
};
