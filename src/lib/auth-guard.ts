/**
 * Trade Console — Centralized Auth Guard Hook
 *
 * AUTH MODE:
 *   NEXT_PUBLIC_AUTH_MODE=disabled  → All guards are bypassed (DEVELOPMENT ONLY)
 *   NEXT_PUBLIC_AUTH_MODE=api       → Full session enforcement (PRODUCTION)
 *
 * ⚠️  WARNING: disabled mode is DEVELOPMENT ONLY.
 *     Do NOT use with real customer, financial, or PII data.
 *
 * SECURITY: This is a CLIENT-SIDE UX guard only.
 * Real security enforcement is in:
 *   1. src/middleware.ts (server-side)
 *   2. Backend API (validates every request independently)
 */

'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/session';
import type { StaffSession, RoleId } from '@/lib/rbac';


export type AuthGuardStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'forbidden' | 'suspended';

interface UseAuthGuardOptions {
  requiredRoles?: RoleId[];
  anyAuthenticated?: boolean;
  loginPath?: string;
}

interface AuthGuardResult {
  status: AuthGuardStatus;
  session: StaffSession | null;
  logout: () => Promise<void>;
}

// Development role for rendering role-specific UI when auth is disabled
// Set NEXT_PUBLIC_DEV_ROLE to any valid role to test that workspace
const DEV_ROLE = (process.env.NEXT_PUBLIC_DEV_ROLE || 'customer') as RoleId;

const DEV_SESSION: StaffSession = {
  id: 'dev-session',
  role: DEV_ROLE,
  email: 'dev@tradeconsole.local',
  firstName: 'Developer',
  lastName: 'Mode',
  permissions: ['*'],
  status: 'active',
};

export function setSessionCookieMarker(role: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 8;
  document.cookie = `cv_session_present=1; path=/; max-age=${maxAge}; SameSite=Strict`;
  document.cookie = `cv_session_role=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function clearSessionCookies(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'cv_session_present=; path=/; max-age=0; SameSite=Strict';
  document.cookie = 'cv_session_role=; path=/; max-age=0; SameSite=Strict';
  document.cookie = 'cv_session_token=; path=/; max-age=0; SameSite=Strict';
}

export async function performLogout(router: ReturnType<typeof useRouter>): Promise<void> {
  clearSession();
  clearSessionCookies();

  if (typeof localStorage !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cv-') || key.startsWith('cv_') || key === 'queryCache' || key === 'adminCache' || key === 'customerCache')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  try {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // Fail silently — local cleanup already done
  }

  router.replace('/secure-login');
}

export function useAuthGuard(options: UseAuthGuardOptions = {}): AuthGuardResult {
  const {
    requiredRoles,
    anyAuthenticated = false,
    loginPath = '/secure-login',
  } = options;

  const router = useRouter();
  const [status, setStatus] = useState<AuthGuardStatus>('loading');
  const [session, setSession] = useState<StaffSession | null>(null);

  const logout = useCallback(async () => {
    await performLogout(router);
  }, [router]);

  useEffect(() => {
    // ── DEVELOPMENT MODE: bypass all auth checks ──────────────────────────────
    const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || 'disabled';
    if (authMode === 'disabled') {
      setSession(DEV_SESSION);
      setStatus('authenticated');
      return;
    }

    // ── PRODUCTION MODE: full session validation ──────────────────────────────
    try {
      const sess = getSession();

      if (!sess) {
        setStatus('unauthenticated');
        const currentPath = window.location.pathname;
        const loginUrl = currentPath !== loginPath
          ? `${loginPath}?next=${encodeURIComponent(currentPath)}`
          : loginPath;
        router.replace(loginUrl);
        return;
      }

      if (sess.status === 'suspended' || sess.status === 'disabled') {
        setStatus('suspended');
        clearSession();
        clearSessionCookies();
        router.replace(`${loginPath}?reason=suspended`);
        return;
      }

      if (!anyAuthenticated && requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(sess.role)) {
          setStatus('forbidden');
          router.replace('/403');
          return;
        }
      }

      setSession(sess);
      setStatus('authenticated');
      setSessionCookieMarker(sess.role);

    } catch {
      setStatus('unauthenticated');
      clearSession();
      clearSessionCookies();
      router.replace(loginPath);
    }
  }, [router, loginPath, anyAuthenticated, requiredRoles]);

  return { status, session, logout };
}

export function useAdminAuthGuard(): AuthGuardResult {
  return useAuthGuard({ requiredRoles: ['admin', 'super_admin'] });
}

export function useCustomerAuthGuard(): AuthGuardResult {
  return useAuthGuard({ requiredRoles: ['customer'] });
}

export function useStaffAuthGuard(allowedRoles?: RoleId[]): AuthGuardResult {
  return useAuthGuard({
    requiredRoles: allowedRoles,
    anyAuthenticated: !allowedRoles,
  });
}
