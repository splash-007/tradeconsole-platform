// apps/web/src/middleware.ts
// Middleware for the apps/web Next.js workspace.
// Full implementation — mirrors root src/middleware.ts.
// When source files are physically migrated to apps/web/src/, this file
// will be the canonical middleware location.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

const BYPASS_PREFIXES = [
  '/_next/',
  '/api/',
  '/favicon.ico',
  '/assets/',
  '/public/',
];

const ADMIN_ROUTE_PREFIXES = ['/admin', '/admin-dashboard'];

const STAFF_ROUTE_PREFIXES = [
  '/agent', '/broker', '/ftd-broker', '/retention-broker', '/compliance-broker',
  '/affiliate', '/operator', '/affiliate-manager', '/new-affiliate-manager',
  '/broker-manager', '/desk-manager', '/shift-manager', '/desk-broker',
  '/marketer-manager', '/compliance-manager', '/team-leader', '/office',
  '/vp-sales', '/finance-workspace', '/conversion-manager', '/retention-manager',
  '/staff', '/finance',
];

const CUSTOMER_ROUTE_PREFIXES = [
  '/trading-dashboard', '/trade-trading-workspace', '/markets', '/portfolio',
  '/messages', '/settings', '/kyc', '/transactions',
];

const ADMIN_ROLES = ['super_admin', 'admin'];
const CUSTOMER_ROLES = ['customer'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
}
function isBypassPath(pathname: string): boolean {
  return BYPASS_PREFIXES.some(p => pathname.startsWith(p));
}
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTE_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));
}
function isStaffRoute(pathname: string): boolean {
  return STAFF_ROUTE_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));
}
function isCustomerRoute(pathname: string): boolean {
  return CUSTOMER_ROUTE_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));
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

  if (isBypassPath(pathname)) return NextResponse.next();
  if (pathname === '/') return NextResponse.redirect(new URL('/secure-login', request.url));

  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const { authenticated, role } = readSessionFromCookies(request);
  if (!authenticated) return buildLoginRedirect(request);

  if (isAdminRoute(pathname)) {
    if (!role || !ADMIN_ROLES.includes(role)) return build403Response(request);
  }
  if (isCustomerRoute(pathname)) {
    if (role && !CUSTOMER_ROLES.includes(role) && !ADMIN_ROLES.includes(role)) return build403Response(request);
  }
  if (isStaffRoute(pathname)) {
    if (role && CUSTOMER_ROLES.includes(role)) return build403Response(request);
  }

  const url = request.nextUrl;
  const dangerousParams = ['admin', 'role', 'authenticated', 'skipAuth', 'isAdmin', 'userType', 'bypass'];
  for (const param of dangerousParams) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
