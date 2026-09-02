// DOCUMENTS SERVICE
// Frontend abstraction for customer document management.
//
// IMPORTANT DESIGN PRINCIPLES:
// - Documents must represent REAL documents owned by the current authenticated customer.
// - Frontend must NOT display generated fake passport/license records.
// - Document downloads must use authenticated short-lived signed URLs.
// - Document uploads must go through backend — no base64 content in frontend state.
// - All document access is implicitly scoped to the authenticated customer.
//
// Future API:
//   GET  /api/v1/me/documents
//   POST /api/v1/me/documents/upload-request
//   GET  /api/v1/me/documents/:id/download

export type DocumentStatus = 'uploaded' | 'under_review' | 'approved' | 'rejected';

export type DocumentType =
  | 'passport' |'national_id' |'drivers_license' |'proof_of_address' |'bank_statement' |'utility_bill' |'selfie' |'other';

export interface CustomerDocument {
  id: string;
  type: DocumentType;
  typeLabel: string;
  fileName: string;
  uploadedAt: string;
  status: DocumentStatus;
  verificationCaseId: string | null;
  rejectionReason: string | null;
}

export interface DocumentUploadRequest {
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface DocumentUploadResponse {
  uploadUrl: string;
  documentId: string;
  expiresAt: string;
}

export interface DocumentDownloadResponse {
  downloadUrl: string;
  expiresAt: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const documentsService = {
  /**
   * Get all documents for the current authenticated customer.
   * BACKEND INTEGRATION: GET /api/v1/me/documents
   *
   * Returns empty array when no documents exist.
   * Frontend must NOT substitute fake document records.
   */
  async getDocuments(): Promise<CustomerDocument[]> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with: const res = await apiClient.get('/api/v1/me/documents');
    // return res.data.documents;
    return [];
  },

  /**
   * Request a secure upload URL for a new document.
   * Upload flow:
   *   1. Validate file type and size (client-side pre-check)
   *   2. Request secure upload URL from backend
   *   3. Upload file directly to object storage using the signed URL
   *   4. Backend saves document metadata
   *   5. UI refreshes document list
   *
   * BACKEND INTEGRATION: POST /api/v1/me/documents/upload-request
   */
  async requestUploadUrl(payload: DocumentUploadRequest): Promise<DocumentUploadResponse> {
    // BACKEND INTEGRATION REQUIRED
    void payload;
    throw new Error('Backend integration required for document upload');
  },

  /**
   * Request a short-lived signed download URL for a specific document.
   * Documents must NOT use permanent public storage URLs.
   * BACKEND INTEGRATION: GET /api/v1/me/documents/:id/download
   */
  async getDownloadUrl(documentId: string): Promise<DocumentDownloadResponse> {
    // BACKEND INTEGRATION REQUIRED
    void documentId;
    throw new Error('Backend integration required for document download');
  },

  /**
   * Validate a file before requesting upload.
   * Returns null if valid, or an error message string if invalid.
   */
  validateFile(file: File): string | null {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload a JPG, PNG, WebP, or PDF.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'File size exceeds the 10MB limit.';
    }
    return null;
  },

  /**
   * Get a human-readable label for a document type.
   */
  getDocumentTypeLabel(type: DocumentType): string {
    const labels: Record<DocumentType, string> = {
      passport: 'Passport',
      national_id: 'National ID',
      drivers_license: "Driver\'s License",
      proof_of_address: 'Proof of Address',
      bank_statement: 'Bank Statement',
      utility_bill: 'Utility Bill',
      selfie: 'Selfie / Liveness',
      other: 'Other Document',
    };
    return labels[type] ?? type;
  },
};
