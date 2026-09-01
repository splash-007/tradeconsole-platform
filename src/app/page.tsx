import { redirect } from 'next/navigation';

export default function RootPage() {
  // In development (AUTH_MODE=disabled), go directly to trading dashboard.
  // In production (AUTH_MODE=api), middleware handles the redirect to /secure-login.
  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || 'disabled';
  if (authMode === 'disabled') {
    redirect('/trading-dashboard');
  }
  redirect('/secure-login');
}