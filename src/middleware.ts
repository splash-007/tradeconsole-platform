/**
 * CryonFX — Next.js Middleware: Deny-by-Default Route Protection
 *
 * SECURITY MODEL:
 * - All routes are PRIVATE by default
 * - Only explicitly listed PUBLIC routes are accessible without authentication
 * - Session is read from the cv_session_token cookie (set by backend as HTTP-only)
 * - In mock/dev mode, session presence is checked via a non-HTTP-only marker cookie
 * - Role-based route authorization is enforced here as a first layer
 * - Backend API must ALSO independently validate every request (defense in depth)
 *
 * FAIL CLOSED: Any error in session validation → DENY ACCESS
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Public routes (no authentication required) ───────────────────────────────
const PUBLIC_ROUTES = [
  '/secure-login',
  '/sign-up-login-screen',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/privacy',
  '/terms',
  '/risk-disclosure',
];

// ─── Static/system paths that bypass middleware ────────────────────────────────
const BYPASS_PREFIXES = [
  '/_next/',
  '/api/',
  '/favicon.ico',
  '/assets/',
  '/public/',
];

// ─── Admin-only route prefixes ─────────────────────────────────────────────────
const ADMIN_ROUTE_PREFIXES = [
  '/admin',
  '/admin-dashboard',
];

// ─── Staff route prefixes (non-admin staff workspaces) ────────────────────────
const STAFF_ROUTE_PREFIXES = [
  '/agent',
  '/broker',
  '/ftd-broker',
  '/retention-broker',
  '/compliance-broker',
  '/affiliate',
  '/operator',
  '/affiliate-manager',
  '/new-affiliate-manager',
  '/broker-manager',
  '/desk-manager',
  '/shift-manager',
  '/desk-broker',
  '/marketer-manager',
  '/compliance-manager',
  '/team-leader',
  '/office',
  '/vp-sales',
  '/finance-workspace',
  '/conversion-manager',
  '/retention-manager',
  '/staff',
  '/finance',
];

// ─── Customer route prefixes ───────────────────────────────────────────────────
const CUSTOMER_ROUTE_PREFIXES = [
  '/trading-dashboard',
  '/trade-trading-workspace',
  '/markets',
  '/portfolio',
  '/messages',
  '/settings',
  '/kyc',
  '/transactions',
];

// ─── Admin roles ───────────────────────────────────────────────────────────────
const ADMIN_ROLES = ['super_admin', 'admin'];

// ─── Customer role ─────────────────────────────────────────────────────────────
const CUSTOMER_ROLES = ['customer'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );
}

function isBypassPath(pathname: string): boolean {
  return BYPASS_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTE_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?')
  );
}

function isStaffRoute(pathname: string): boolean {
  return STAFF_ROUTE_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?')
  );
}

function isCustomerRoute(pathname: string): boolean {
  return CUSTOMER_ROUTE_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?')
  );
}

/**
 * Read session from request cookies.
 * In production: backend sets an HTTP-only 'cv_session_token' cookie. * In mock/dev: we use a non-HTTP-only'cv_session_present' marker cookie
 * that is set by the client after successful mock login, plus the sessionStorage
 * session (which middleware cannot read — so we rely on the marker cookie).
 *
 * Returns: { authenticated: boolean, role: string | null }
 */
function readSessionFromCookies(request: NextRequest): { authenticated: boolean; role: string | null } {
  try {
    // Production: HTTP-only session token set by backend
    const sessionToken = request.cookies.get('cv_session_token');
    if (sessionToken?.value) {
      // In production, the backend would validate this token.
      // Here we trust its presence as the authentication signal.
      // Role is read from a separate non-sensitive role cookie set by the server.
      const roleCookie = request.cookies.get('cv_session_role');
      return {
        authenticated: true,
        role: roleCookie?.value || null,
      };
    }

    // Mock/dev fallback: client sets cv_session_present after mock login
    const mockPresent = request.cookies.get('cv_session_present');
    if (mockPresent?.value === '1') {
      const roleCookie = request.cookies.get('cv_session_role');
      return {
        authenticated: true,
        role: roleCookie?.value || null,
      };
    }

    return { authenticated: false, role: null };
  } catch {
    // FAIL CLOSED: any error → deny
    return { authenticated: false, role: null };
  }
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL('/secure-login', request.url);
  // Preserve the intended destination for post-login redirect
  const pathname = request.nextUrl.pathname;
  if (pathname !== '/' && pathname !== '/secure-login') {
    loginUrl.searchParams.set('next', pathname);
  }
  const response = NextResponse.redirect(loginUrl);
  // Ensure no private content is cached
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

function build403Response(request: NextRequest): NextResponse {
  const forbiddenUrl = new URL('/403', request.url);
  const response = NextResponse.redirect(forbiddenUrl);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow static/system paths
  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  // 2. Root → redirect to login (handled by page.tsx but belt-and-suspenders)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/secure-login', request.url));
  }

  // 3. Public routes — allow without authentication
  if (isPublicRoute(pathname)) {
    // If already authenticated and hitting login page, let client-side handle redirect
    // (avoids middleware loop; client AuthScreen handles post-login routing)
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // 4. All other routes require authentication — DENY BY DEFAULT
  const { authenticated, role } = readSessionFromCookies(request);

  if (!authenticated) {
    return buildLoginRedirect(request);
  }

  // 5. Role-based authorization for admin routes
  if (isAdminRoute(pathname)) {
    if (!role || !ADMIN_ROLES.includes(role)) {
      // Authenticated but not admin → 403
      return build403Response(request);
    }
  }

  // 6. Customer routes — deny staff from accessing customer workspace
  if (isCustomerRoute(pathname)) {
    if (role && !CUSTOMER_ROLES.includes(role) && !ADMIN_ROLES.includes(role)) {
      // Staff trying to access customer workspace → redirect to their workspace
      return build403Response(request);
    }
  }

  // 7. Staff routes — deny customers from accessing staff workspaces
  if (isStaffRoute(pathname)) {
    if (role && CUSTOMER_ROLES.includes(role)) {
      return build403Response(request);
    }
  }

  // 8. Deny dangerous query parameters that attempt to escalate privileges
  const url = request.nextUrl;
  const dangerousParams = ['admin', 'role', 'authenticated', 'skipAuth', 'isAdmin', 'userType', 'bypass'];
  for (const param of dangerousParams) {
    if (url.searchParams.has(param)) {
      // Strip the dangerous parameter and redirect cleanly
      url.searchParams.delete(param);
      return NextResponse.redirect(url);
    }
  }

  // 9. Allow — add security headers to all private responses
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
  ],
};
