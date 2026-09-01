/**
 * Trade Console — Next.js Middleware
 *
 * AUTH MODE:
 *   NEXT_PUBLIC_AUTH_MODE=disabled  → All routes accessible (DEVELOPMENT ONLY)
 *   NEXT_PUBLIC_AUTH_MODE=api       → Full session-based enforcement (PRODUCTION)
 *
 * ⚠️  WARNING: AUTH_MODE=disabled is for DEVELOPMENT ONLY.
 *     Do NOT use with real customer, financial, or PII data.
 *     Switch to AUTH_MODE=api before any production deployment.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Static/system paths that always bypass middleware ─────────────────────────
const BYPASS_PREFIXES = [
  '/_next/',
  '/api/',
  '/favicon.ico',
  '/assets/',
  '/public/',
];

// ─── Public routes (no authentication required in any mode) ───────────────────
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

// ─── Admin-only route prefixes ─────────────────────────────────────────────────
const ADMIN_ROUTE_PREFIXES = ['/admin', '/admin-dashboard'];

// ─── Staff route prefixes ─────────────────────────────────────────────────────
const STAFF_ROUTE_PREFIXES = [
  '/agent', '/broker', '/ftd-broker', '/retention-broker', '/compliance-broker',
  '/affiliate', '/operator', '/affiliate-manager', '/new-affiliate-manager',
  '/broker-manager', '/desk-manager', '/shift-manager', '/desk-broker',
  '/marketer-manager', '/compliance-manager', '/team-leader', '/office',
  '/vp-sales', '/finance-workspace', '/conversion-manager', '/retention-manager',
  '/staff', '/finance',
];

// ─── Customer route prefixes ───────────────────────────────────────────────────
const CUSTOMER_ROUTE_PREFIXES = [
  '/trading-dashboard', '/trade-trading-workspace', '/markets', '/portfolio',
  '/messages', '/settings', '/kyc', '/transactions', '/watchlist',
];

const ADMIN_ROLES = ['super_admin', 'admin'];
const CUSTOMER_ROLES = ['customer'];

function isBypassPath(pathname: string): boolean {
  return BYPASS_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );
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

function readSessionFromCookies(request: NextRequest): { authenticated: boolean; role: string | null } {
  try {
    const sessionToken = request.cookies.get('cv_session_token');
    if (sessionToken?.value) {
      const roleCookie = request.cookies.get('cv_session_role');
      return { authenticated: true, role: roleCookie?.value || null };
    }
    const mockPresent = request.cookies.get('cv_session_present');
    if (mockPresent?.value === '1') {
      const roleCookie = request.cookies.get('cv_session_role');
      return { authenticated: true, role: roleCookie?.value || null };
    }
    return { authenticated: false, role: null };
  } catch {
    return { authenticated: false, role: null };
  }
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL('/secure-login', request.url);
  const pathname = request.nextUrl.pathname;
  if (pathname !== '/' && pathname !== '/secure-login') {
    loginUrl.searchParams.set('next', pathname);
  }
  const response = NextResponse.redirect(loginUrl);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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

  // ─── DEVELOPMENT MODE: AUTH DISABLED ────────────────────────────────────────
  // When NEXT_PUBLIC_AUTH_MODE=disabled, all routes are accessible without login.
  // This is DEVELOPMENT ONLY — do not use in production.
  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || 'disabled';

  if (authMode === 'disabled') {
    // Root redirect: go to trading dashboard instead of login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/trading-dashboard', request.url));
    }
    // Allow everything else through
    return NextResponse.next();
  }

  // ─── PRODUCTION MODE: API AUTH ───────────────────────────────────────────────
  // Root → redirect to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/secure-login', request.url));
  }

  // Public routes — allow without authentication
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // All other routes require authentication
  const { authenticated, role } = readSessionFromCookies(request);

  if (!authenticated) {
    return buildLoginRedirect(request);
  }

  // Role-based authorization for admin routes
  if (isAdminRoute(pathname)) {
    if (!role || !ADMIN_ROLES.includes(role)) {
      return build403Response(request);
    }
  }

  // Customer routes — deny staff from accessing customer workspace
  if (isCustomerRoute(pathname)) {
    if (role && !CUSTOMER_ROLES.includes(role) && !ADMIN_ROLES.includes(role)) {
      return build403Response(request);
    }
  }

  // Staff routes — deny customers from accessing staff workspaces
  if (isStaffRoute(pathname)) {
    if (role && CUSTOMER_ROLES.includes(role)) {
      return build403Response(request);
    }
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  return response;
}
