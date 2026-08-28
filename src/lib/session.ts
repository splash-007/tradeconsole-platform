// Session management — CryptoVault
// SECURITY: In production, session is validated server-side via HTTP-only cookie.
// Frontend only reads the session for UX routing — never for authorization.

import type { StaffSession, RoleId } from './rbac';
import { ROLE_DEFAULT_ROUTES } from './rbac';

const SESSION_KEY = 'cv_session';

// Store session (mock only — production uses HTTP-only cookie)
export function setSession(session: StaffSession): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

// Read session from storage
export function getSession(): StaffSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StaffSession;
  } catch {
    return null;
  }
}

// Clear session on logout
export function clearSession(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

// Get redirect URL for a role
export function getRoleRedirect(role: RoleId): string {
  return ROLE_DEFAULT_ROUTES[role] || '/sign-up-login-screen';
}

// Mock session builder for development
export function buildMockSession(role: RoleId, overrides?: Partial<StaffSession>): StaffSession {
  const base: StaffSession = {
    id: `mock-${role}-001`,
    email: `${role.replace('_', '.')}@cryonfx.app`,
    firstName: overrides?.firstName || role.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
    lastName: overrides?.lastName || 'User',
    role,
    permissions: getMockPermissions(role),
    status: 'active',
    presenceStatus: 'online',
    ...overrides,
  };
  return base;
}

function getMockPermissions(role: RoleId): string[] {
  const permMap: Partial<Record<RoleId, string[]>> = {
    super_admin: ['*'],
    admin: ['admin.*'],
    broker: ['assigned_customers.view', 'tasks.*', 'calls.*', 'messages.*', 'notes.*'],
    ftd_broker: ['assigned_customers.view', 'ftd.*', 'calls.*', 'messages.*'],
    retention_broker: ['assigned_customers.view', 'retention.*', 'calls.*', 'messages.*'],
    compliance_broker: ['compliance_cases.view', 'kyc.*', 'documents.view'],
    affiliate: ['affiliate_stats.view', 'campaigns.view', 'commissions.view'],
    finance: ['finance.*', 'transactions.*', 'deposits.*', 'withdrawals.*'],
    vp_sales: ['sales_overview.*', 'teams.view', 'performance.*', 'revenue.view'],
    compliance_manager: ['compliance.*', 'verification.*', 'documents.*'],
    broker_manager: ['broker_team.*', 'customers.view', 'assignments.*'],
    shift_manager: ['shift.*', 'staff_online.view', 'workload.*'],
  };
  return permMap[role] || [`${role}.*`];
}
