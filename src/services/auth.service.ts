// BACKEND INTEGRATION: POST /api/v1/auth/login, /register, /logout, etc.
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
      // Mock authentication
      if (dto.email === 'trader@cryptovault.app' && dto.password === 'Vault2026!') {
        return {
          user: { id: 'user-001', email: dto.email, firstName: 'Alex', lastName: 'Mercer', role: 'customer' },
          error: null,
        };
      }
      if (dto.email === 'admin@cryptovault.app' && dto.password === 'Admin2026!') {
        return {
          user: { id: 'admin-001', email: dto.email, firstName: 'Sarah', lastName: 'Chen', role: 'admin' },
          error: null,
        };
      }
      return { user: null, error: 'Invalid credentials — use the demo accounts below to sign in' };
    }
    const res = await apiClient.post<AuthUser>('/api/v1/auth/login', dto);
    return { user: res.data, error: res.error };
  },

  async register(dto: RegisterDTO): Promise<{ success: boolean; error: string | null }> {
    if (DATA_MODE === 'mock') {
      return { success: true, error: null };
    }
    const res = await apiClient.post('/api/v1/auth/register', dto);
    return { success: !res.error, error: res.error };
  },

  async logout(): Promise<void> {
    if (DATA_MODE === 'mock') return;
    await apiClient.post('/api/v1/auth/logout', {});
  },

  async forgotPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (DATA_MODE === 'mock') return { success: true, error: null };
    const res = await apiClient.post('/api/v1/auth/forgot-password', { email });
    return { success: !res.error, error: res.error };
  },
};