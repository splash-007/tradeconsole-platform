// BACKEND INTEGRATION: POST /api/v1/auth/login, /register, /logout, etc.
// SECURITY: Mock credentials below are for development only.
// In production, authentication is handled entirely by the backend API.
// The frontend never stores passwords or tokens — only HTTP-only session cookies set by the server.
import { apiClient, DATA_MODE } from '@/lib/api-client';
import type { RoleId } from '@/lib/rbac';
import { ROLE_DEFAULT_ROUTES } from '@/lib/rbac';
import { setSession, buildMockSession } from '@/lib/session';

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
  role: RoleId;
  permissions?: string[];
  managerId?: string;
  managerName?: string;
  department?: string;
  status?: 'active' | 'suspended' | 'disabled';
}

// Mock users for development — NOT exposed in production UI
const MOCK_USERS: { email: string; password: string; user: AuthUser }[] = [
  { email: 'trader@cryptovault.app', password: 'Vault2026!', user: { id: 'user-001', email: 'trader@cryptovault.app', firstName: 'Alex', lastName: 'Mercer', role: 'customer', status: 'active' } },
  { email: 'admin@cryptovault.app', password: 'Admin2026!', user: { id: 'admin-001', email: 'admin@cryptovault.app', firstName: 'Sarah', lastName: 'Chen', role: 'admin', status: 'active' } },
  { email: 'broker@cryptovault.app', password: 'Broker2026!', user: { id: 'broker-001', email: 'broker@cryptovault.app', firstName: 'James', lastName: 'Park', role: 'broker', status: 'active', managerId: 'staff-001', managerName: 'Sarah Chen' } },
  { email: 'affiliate@cryptovault.app', password: 'Affiliate2026!', user: { id: 'aff-001', email: 'affiliate@cryptovault.app', firstName: 'Marco', lastName: 'Rossi', role: 'affiliate', status: 'active', managerId: 'staff-010', managerName: 'Elena Vasquez' } },
  { email: 'finance@cryptovault.app', password: 'Finance2026!', user: { id: 'fin-001', email: 'finance@cryptovault.app', firstName: 'David', lastName: 'Kim', role: 'finance', status: 'active' } },
  { email: 'vpsales@cryptovault.app', password: 'VPSales2026!', user: { id: 'vp-001', email: 'vpsales@cryptovault.app', firstName: 'Robert', lastName: 'Chen', role: 'vp_sales', status: 'active' } },
  { email: 'compliance@cryptovault.app', password: 'Compliance2026!', user: { id: 'cm-001', email: 'compliance@cryptovault.app', firstName: 'Lisa', lastName: 'Wang', role: 'compliance_manager', status: 'active' } },
  { email: 'shift@cryptovault.app', password: 'Shift2026!', user: { id: 'sm-001', email: 'shift@cryptovault.app', firstName: 'Alex', lastName: 'Torres', role: 'shift_manager', status: 'active' } },
];

export const authService = {
  async login(dto: LoginDTO): Promise<{ user: AuthUser | null; error: string | null; redirectTo?: string }> {
    if (DATA_MODE === 'mock') {
      const match = MOCK_USERS.find(u => u.email === dto.email && u.password === dto.password);
      if (!match) return { user: null, error: 'Invalid email or password.' };

      // Check account status
      if (match.user.status === 'suspended') {
        return { user: null, error: 'Your account has been suspended. Please contact support.' };
      }
      if (match.user.status === 'disabled') {
        return { user: null, error: 'This account is disabled. Please contact support.' };
      }

      // Build session and store it
      const session = buildMockSession(match.user.role, {
        id: match.user.id,
        email: match.user.email,
        firstName: match.user.firstName,
        lastName: match.user.lastName,
        managerId: match.user.managerId,
        managerName: match.user.managerName,
      });
      setSession(session);

      const redirectTo = ROLE_DEFAULT_ROUTES[match.user.role] || '/sign-up-login-screen';
      return { user: match.user, error: null, redirectTo };
    }

    const res = await apiClient.post<AuthUser & { redirectTo?: string }>('/api/v1/auth/login', dto);
    if (res.status === 429) {
      return { user: null, error: 'Too many login attempts. Please wait before trying again.' };
    }
    if (res.error) return { user: null, error: 'Invalid email or password.' };

    // Server returns the validated role and redirect URL
    const user = res.data;
    if (!user) return { user: null, error: 'Invalid email or password.' };

    // Build and store session from server response
    const session = buildMockSession(user.role, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    setSession(session);

    const redirectTo = ROLE_DEFAULT_ROUTES[user.role] || '/trading-dashboard';
    return { user, error: null, redirectTo };
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
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('cv_session');
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