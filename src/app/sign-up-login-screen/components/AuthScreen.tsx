'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

import { authService, RegisterDTO } from '@/services/auth.service';
import { Suspense } from 'react';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const COUNTRIES = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain', 'Italy',
  'Australia', 'Canada', 'Singapore', 'UAE', 'India', 'Japan', 'South Korea',
  'Brazil', 'Mexico', 'Netherlands', 'Sweden', 'Switzerland', 'Other',
];

/* ── Custom SVG icons — hand-crafted look ── */
function IconEye({ off = false }: { off?: boolean }) {
  if (off) return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AuthScreenInner() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const searchParams = useSearchParams();

  const loginForm = useForm<LoginFormData>({ defaultValues: { email: '', password: '', remember: false } });
  const registerForm = useForm<RegisterFormData>({ defaultValues: { firstName: '', lastName: '', email: '', phone: '', country: '', password: '', confirmPassword: '', terms: false } });

  const attribution = {
    source_site: searchParams.get('source') || '',
    affiliate_id: searchParams.get('affiliate') || '',
    campaign_id: searchParams.get('campaign') || '',
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_term: searchParams.get('utm_term') || '',
    utm_content: searchParams.get('utm_content') || '',
    landing_page: '',
    referrer: '',
    click_id: searchParams.get('click_id') || '',
  };

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError('');
    const result = await authService.login({ email: data.email, password: data.password });
    setIsLoading(false);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
    const redirectTo = result.redirectTo || '/trading-dashboard';
    window.location.href = redirectTo;
  };

  const onRegister = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    setAuthError('');
    const dto: RegisterDTO = { ...data, ...attribution };
    const result = await authService.register(dto);
    setIsLoading(false);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
    setAuthSuccess('Account created! Please check your email to verify your account.');
    setTab('login');
  };

  /* ── shared input style ── */
  const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400/40';
  const inputStyle = {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    color: '#111827',
  };
  const inputErrStyle = {
    backgroundColor: '#FFF5F5',
    borderColor: '#FCA5A5',
    color: '#111827',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: '#F3F4F6' }}
    >
      <div className="w-full" style={{ maxWidth: '460px' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #F5C400 0%, #E6A800 100%)', boxShadow: '0 4px 14px rgba(245,196,0,0.35)' }}>
            {/* Custom brand mark — stylised FX monogram */}
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M5 6h10M5 13h7" stroke="#000" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M14 13l7 7M21 13l-7 7" stroke="#000" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: '#111827', letterSpacing: '-0.02em' }}>CryonFX</span>
          <span className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Institutional-Grade Trading</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {tab === 'login' ? 'Sign in to your account' : 'Join CryonFX today'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg p-1 mb-6" style={{ backgroundColor: '#E5E7EB' }}>
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setAuthError(''); setAuthSuccess(''); }}
              className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-150"
              style={tab === t
                ? { backgroundColor: '#fff', color: '#111827', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }
                : { color: '#6B7280' }}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-7"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          {/* Success message */}
          {authSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-5 border" style={{ backgroundColor: '#F0FDF4', borderColor: '#86EFAC', color: '#166534' }}>
              <IconCheck />
              <p className="text-sm">{authSuccess}</p>
            </div>
          )}

          {/* Error message */}
          {authError && (
            <div className="p-3 rounded-lg mb-5 border" style={{ backgroundColor: '#FFF5F5', borderColor: '#FCA5A5' }}>
              <p className="text-sm" style={{ color: '#DC2626' }}>{authError}</p>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Email Address</label>
                <input
                  type="email"
                  {...loginForm.register('email', { required: 'Email is required' })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputCls}
                  style={loginForm.formState.errors.email ? inputErrStyle : inputStyle}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#374151' }}>Password</label>
                  <button type="button" className="text-xs hover:underline" style={{ color: '#D97706' }}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...loginForm.register('password', { required: 'Password is required' })}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={inputCls + ' pr-10'}
                    style={loginForm.formState.errors.password ? inputErrStyle : inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#9CA3AF' }}
                  >
                    <IconEye off={showPassword} />
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  {...loginForm.register('remember')}
                  className="w-3.5 h-3.5 rounded"
                  style={{ accentColor: '#F5C400' }}
                />
                <label htmlFor="remember" className="text-xs" style={{ color: '#6B7280' }}>
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #F5C400 0%, #E6A800 100%)', color: '#000', boxShadow: '0 2px 8px rgba(245,196,0,0.30)' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: '#000' }} />
                ) : (
                  <>Sign In <IconArrow /></>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>First Name</label>
                  <input
                    {...registerForm.register('firstName', { required: 'Required' })}
                    placeholder="Alex"
                    autoComplete="given-name"
                    className={inputCls}
                    style={registerForm.formState.errors.firstName ? inputErrStyle : inputStyle}
                  />
                  {registerForm.formState.errors.firstName && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>Required</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Last Name</label>
                  <input
                    {...registerForm.register('lastName', { required: 'Required' })}
                    placeholder="Mercer"
                    autoComplete="family-name"
                    className={inputCls}
                    style={registerForm.formState.errors.lastName ? inputErrStyle : inputStyle}
                  />
                  {registerForm.formState.errors.lastName && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>Required</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Email Address</label>
                <input
                  type="email"
                  {...registerForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputCls}
                  style={registerForm.formState.errors.email ? inputErrStyle : inputStyle}
                />
                {registerForm.formState.errors.email && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{registerForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Phone</label>
                <input
                  {...registerForm.register('phone')}
                  placeholder="+1 555 000 0000"
                  autoComplete="tel"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Country</label>
                <select
                  {...registerForm.register('country', { required: 'Country is required' })}
                  className={inputCls}
                  style={registerForm.formState.errors.country ? inputErrStyle : inputStyle}
                >
                  <option value="">Select country…</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {registerForm.formState.errors.country && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>Required</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    className={inputCls + ' pr-10'}
                    style={registerForm.formState.errors.password ? inputErrStyle : inputStyle}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                    <IconEye off={showPassword} />
                  </button>
                </div>
                {registerForm.formState.errors.password && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{registerForm.formState.errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerForm.register('confirmPassword', { required: 'Please confirm your password' })}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className={inputCls + ' pr-10'}
                    style={registerForm.formState.errors.confirmPassword ? inputErrStyle : inputStyle}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                    <IconEye off={showConfirmPassword} />
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{registerForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  {...registerForm.register('terms', { required: true })}
                  className="w-3.5 h-3.5 rounded mt-0.5 shrink-0"
                  style={{ accentColor: '#F5C400' }}
                />
                <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                  I agree to the <span style={{ color: '#D97706' }}>Terms of Service</span> and <span style={{ color: '#D97706' }}>Privacy Policy</span>
                </label>
              </div>
              {registerForm.formState.errors.terms && <p className="text-xs" style={{ color: '#DC2626' }}>You must accept the terms</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #F5C400 0%, #E6A800 100%)', color: '#000', boxShadow: '0 2px 8px rgba(245,196,0,0.30)' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: '#000' }} />
                ) : (
                  <>Create Account <IconArrow /></>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: '#9CA3AF' }}>
          © {new Date().getFullYear()} CryonFX. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function AuthScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F3F4F6' }} />}>
      <AuthScreenInner />
    </Suspense>
  );
}