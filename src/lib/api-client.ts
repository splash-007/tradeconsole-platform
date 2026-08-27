// BACKEND INTEGRATION: Replace base URL with NEXT_PUBLIC_API_BASE_URL for production
// SECURITY: Never use NEXT_PUBLIC_ prefix for secrets (JWT_SECRET, DB passwords, API private keys)
// All sensitive keys must remain server-side only (no NEXT_PUBLIC_ prefix)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.core-domain.com';
const DATA_MODE = process.env.NEXT_PUBLIC_DATA_MODE || 'mock';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Security architecture notes:
 * - credentials: 'include' enables HTTP-only cookie auth (set by backend)
 * - Never store auth tokens in localStorage — use HTTP-only cookies
 * - Backend must set: Secure, HttpOnly, SameSite=Strict/Lax on session cookies
 * - CSRF protection: backend should validate CSRF tokens for state-changing requests
 * - All requests go through this client — browser never connects directly to PostgreSQL
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private handleErrorStatus(status: number): string {
    if (status === 429) return 'Too many requests. Please wait a moment before trying again.';
    if (status === 401) return 'Your session has expired. Please sign in again.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status >= 500) return 'A server error occurred. Please try again later.';
    return 'An unexpected error occurred. Please try again.';
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    if (DATA_MODE === 'mock') {
      return { data: null, error: 'mock mode', status: 200 };
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return { data: null, error: this.handleErrorStatus(res.status), status: res.status };
      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch {
      return { data: null, error: 'Network error. Please check your connection.', status: 0 };
    }
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    if (DATA_MODE === 'mock') {
      return { data: null, error: 'mock mode', status: 200 };
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { data: null, error: this.handleErrorStatus(res.status), status: res.status };
      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch {
      return { data: null, error: 'Network error. Please check your connection.', status: 0 };
    }
  }

  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    if (DATA_MODE === 'mock') {
      return { data: null, error: 'mock mode', status: 200 };
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { data: null, error: this.handleErrorStatus(res.status), status: res.status };
      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch {
      return { data: null, error: 'Network error. Please check your connection.', status: 0 };
    }
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    if (DATA_MODE === 'mock') {
      return { data: null, error: 'mock mode', status: 200 };
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return { data: null, error: this.handleErrorStatus(res.status), status: res.status };
      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch {
      return { data: null, error: 'Network error. Please check your connection.', status: 0 };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { DATA_MODE };