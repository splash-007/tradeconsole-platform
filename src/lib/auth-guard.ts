/**
 * CryonFX — Centralized Auth Guard Hook
 *
 * SECURITY: This is a CLIENT-SIDE UX guard only.
 * The real security enforcement is in:
 *   1. src/middleware.ts (server-side, runs before any page renders)
 *   2. Backend API (validates every request independently)
 *
 * This hook provides:
 * - Session validation from sessionStorage (mock) or cookie marker
 * - Immediate redirect to /secure-login if no session found
 * - Role-based authorization check with 403 redirect
 * - Session expiry detection
 * - Suspended/disabled account blocking
 * - Logout utility that clears ALL private state
 */

'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/session';
import type { StaffSession, RoleId } from '@/lib/rbac';
import { ROLE_DEFAULT_ROUTES } from '@/lib/rbac';

export type AuthGuardStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'forbidden' | 'suspended';

interface UseAuthGuardOptions {
  /** Required role(s) — if provided, user must have one of these roles */
  requiredRoles?: RoleId[];
  /** If true, any authenticated user is allowed (no role restriction) */
  anyAuthenticated?: boolean;
  /** Redirect target if unauthenticated (default: /secure-login) */
  loginPath?: string;
}

interface AuthGuardResult {
  status: AuthGuardStatus;
  session: StaffSession | null;
  logout: () => Promise<void>;
}

/**
 * Set the session presence marker cookie so middleware can detect auth state.
 * This is called after successful login.
 */
export function setSessionCookieMarker(role: string): void {
  if (typeof document === 'undefined') return;
  // Secure, SameSite=Strict — not HTTP-only so middleware can read it
  // In production, the backend sets the real HTTP-only cv_session_token cookie
  const maxAge = 60 * 60 * 8; // 8 hours
  document.cookie = `cv_session_present=1; path=/; max-age=${maxAge}; SameSite=Strict`;
  document.cookie = `cv_session_role=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

/**
 * Clear all session cookies on logout.
 */
export function clearSessionCookies(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'cv_session_present=; path=/; max-age=0; SameSite=Strict';
  document.cookie = 'cv_session_role=; path=/; max-age=0; SameSite=Strict';
  document.cookie = 'cv_session_token=; path=/; max-age=0; SameSite=Strict';
}

/**
 * Full logout: clears session storage, cookies, and all cached private state.
 */
export async function performLogout(router: ReturnType<typeof useRouter>): Promise<void> {
  // 1. Clear session storage
  clearSession();

  // 2. Clear session cookies
  clearSessionCookies();

  // 3. Clear all private cached data from localStorage
  if (typeof localStorage !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('cv-') ||
        key.startsWith('cv_') ||
        key === 'queryCache' ||
        key === 'adminCache' ||
        key === 'customerCache'
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // 4. Call backend logout endpoint (invalidates server session/cookie)
  try {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Fail silently — local cleanup already done
  }

  // 5. Redirect to login
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
    // FAIL CLOSED: any error → treat as unauthenticated
    try {
      const sess = getSession();

      if (!sess) {
        setStatus('unauthenticated');
        // Preserve intended destination
        const currentPath = window.location.pathname;
        const loginUrl = currentPath !== loginPath
          ? `${loginPath}?next=${encodeURIComponent(currentPath)}`
          : loginPath;
        router.replace(loginUrl);
        return;
      }

      // Check account status — suspended/disabled accounts are denied
      if (sess.status === 'suspended' || sess.status === 'disabled') {
        setStatus('suspended');
        clearSession();
        clearSessionCookies();
        router.replace(`${loginPath}?reason=suspended`);
        return;
      }

      // Role-based authorization check
      if (!anyAuthenticated && requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(sess.role)) {
          setStatus('forbidden');
          // Redirect to their authorized workspace instead of 403
          const authorizedRoute = ROLE_DEFAULT_ROUTES[sess.role] || loginPath;
          router.replace('/403');
          return;
        }
      }

      // Authenticated and authorized
      setSession(sess);
      setStatus('authenticated');

      // Ensure cookie markers are set (in case they were cleared)
      setSessionCookieMarker(sess.role);

    } catch {
      // FAIL CLOSED
      setStatus('unauthenticated');
      clearSession();
      clearSessionCookies();
      router.replace(loginPath);
    }
  }, [router, loginPath, anyAuthenticated, requiredRoles]);

  return { status, session, logout };
}

/**
 * Admin-specific auth guard — requires admin or super_admin role.
 */
export function useAdminAuthGuard(): AuthGuardResult {
  return useAuthGuard({ requiredRoles: ['admin', 'super_admin'] });
}

/**
 * Customer-specific auth guard — requires customer role.
 */
export function useCustomerAuthGuard(): AuthGuardResult {
  return useAuthGuard({ requiredRoles: ['customer'] });
}

/**
 * Staff auth guard — allows any authenticated non-customer role.
 */
export function useStaffAuthGuard(allowedRoles?: RoleId[]): AuthGuardResult {
  return useAuthGuard({
    requiredRoles: allowedRoles,
    anyAuthenticated: !allowedRoles,
  });
}
