// BACKEND INTEGRATION: POST /api/v1/auth/login, /register, /logout, etc.
// SECURITY: Mock credentials below are for development only.
// In production, authentication is handled entirely by the backend API.
// The frontend never stores passwords or tokens — only HTTP-only session cookies set by the server.
import { apiClient, DATA_MODE } from '@/lib/api-client';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  source_site?: string;
  affiliate_id?: string;
  campaign_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_page?: string;
  referrer?: string;
  click_id?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authService = {
  async login(dto: LoginDTO): Promise<{ user: AuthUser | null; error: string | null }> {
    if (DATA_MODE === 'mock') {
      // Development-only mock authentication
      // These credentials are NOT exposed in the production UI
      const mockUsers = [
        { email: 'trader@cryptovault.app', password: 'Vault2026!', user: { id: 'user-001', email: 'trader@cryptovault.app', firstName: 'Alex', lastName: 'Mercer', role: 'customer' } },
        { email: 'admin@cryptovault.app', password: 'Admin2026!', user: { id: 'admin-001', email: 'admin@cryptovault.app', firstName: 'Sarah', lastName: 'Chen', role: 'admin' } },
      ];
      const match = mockUsers.find(u => u.email === dto.email && u.password === dto.password);
      if (match) return { user: match.user, error: null };
      return { user: null, error: 'Invalid email or password.' };
    }
    const res = await apiClient.post<AuthUser>('/api/v1/auth/login', dto);
    if (res.status === 429) {
      return { user: null, error: 'Too many login attempts. Please wait before trying again.' };
    }
    // Use generic error message to avoid email enumeration
    if (res.error) return { user: null, error: 'Invalid email or password.' };
    return { user: res.data, error: null };
  },

  async register(dto: RegisterDTO): Promise<{ success: boolean; error: string | null }> {
    if (DATA_MODE === 'mock') {
      return { success: true, error: null };
    }
    const res = await apiClient.post('/api/v1/auth/register', dto);
    if (res.status === 429) {
      return { success: false, error: 'Too many registration attempts. Please wait before trying again.' };
    }
    return { success: !res.error, error: res.error };
  },

  async logout(): Promise<void> {
    if (DATA_MODE === 'mock') return;
    await apiClient.post('/api/v1/auth/logout', {});
    // Backend should invalidate the HTTP-only session cookie
  },

  async forgotPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (DATA_MODE === 'mock') return { success: true, error: null };
    const res = await apiClient.post('/api/v1/auth/forgot-password', { email });
    if (res.status === 429) {
      return { success: false, error: 'Too many requests. Please wait before trying again.' };
    }
    // Always return success to prevent email enumeration
    return { success: true, error: null };
  },
};