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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

/* Floating orb decoration */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #D4A800 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #B88E00 0%, transparent 70%)', filter: 'blur(50px)' }}
      />
    </div>
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

  const inputBase = 'w-full px-4 py-3 rounded-xl text-sm border-2 transition-all duration-150 focus:outline-none';
  const inputNormal = { backgroundColor: '#F8F9FC', borderColor: '#E8EBF2', color: '#0D0F14' };
  const inputFocus = 'focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(212,168,0,0.12)]';
  const inputError = { backgroundColor: '#FFF5F5', borderColor: '#FCA5A5', color: '#0D0F14' };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10 relative"
      style={{ background: 'linear-gradient(135deg, #F5F6FA 0%, #ECEEF4 50%, #F0EDD8 100%)' }}
    >
      <FloatingOrbs />

      <div className="w-full relative z-10" style={{ maxWidth: '460px' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #D4A800 0%, #B88E00 100%)',
              boxShadow: '0 8px 24px rgba(212,168,0,0.35), 0 2px 8px rgba(0,0,0,0.10)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
              <path d="M5 6h10M5 13h7" stroke="#000" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M14 13l7 7M21 13l-7 7" stroke="#000" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: '#0D0F14', letterSpacing: '-0.03em' }}>Trade Console</span>
          <span className="text-xs mt-1 font-medium" style={{ color: '#9CA3AF' }}>Professional Trading Platform</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1.5" style={{ color: '#0D0F14', letterSpacing: '-0.03em' }}>
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {tab === 'login' ? 'Sign in to access your trading dashboard' : 'Join thousands of traders on Trade Console'}
          </p>
        </div>

        {/* Tab switcher — puffed pill style */}
        <div
          className="flex p-1 mb-6 rounded-2xl"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setAuthError(''); setAuthSuccess(''); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={tab === t
                ? {
                    backgroundColor: '#fff',
                    color: '#0D0F14',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
                  }
                : { color: '#6B7280' }}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Card — modern glass */}
        <div
          className="rounded-3xl border p-8"
          style={{
            backgroundColor: 'rgba(255,255,255,0.90)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.80)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Success message */}
          {authSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 border" style={{ backgroundColor: '#F0FDF4', borderColor: '#86EFAC', color: '#166534' }}>
              <IconCheck />
              <p className="text-sm font-medium">{authSuccess}</p>
            </div>
          )}

          {/* Error message */}
          {authError && (
            <div className="p-3.5 rounded-xl mb-5 border" style={{ backgroundColor: '#FFF5F5', borderColor: '#FCA5A5' }}>
              <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{authError}</p>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#374151', letterSpacing: '0.02em' }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  {...loginForm.register('email', { required: 'Email is required' })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`${inputBase} ${inputFocus}`}
                  style={loginForm.formState.errors.email ? inputError : inputNormal}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: '#374151', letterSpacing: '0.02em' }}>PASSWORD</label>
                  <button type="button" className="text-xs font-semibold hover:underline transition-colors" style={{ color: '#C9A000' }}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...loginForm.register('password', { required: 'Password is required' })}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`${inputBase} ${inputFocus} pr-12`}
                    style={loginForm.formState.errors.password ? inputError : inputNormal}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-black/5"
                    style={{ color: '#9CA3AF' }}
                  >
                    <IconEye off={showPassword} />
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  {...loginForm.register('remember')}
                  className="w-4 h-4 rounded-md"
                  style={{ accentColor: '#D4A800' }}
                />
                <label htmlFor="remember" className="text-sm" style={{ color: '#6B7280' }}>
                  Remember me for 30 days
                </label>
              </div>

              {/* Puffed CTA button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{
                  background: isLoading ? '#D4A800' : 'linear-gradient(135deg, #D4A800 0%, #B88E00 100%)',
                  color: '#000',
                  boxShadow: '0 4px 16px rgba(212,168,0,0.40), 0 1px 4px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.25)',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(212,168,0,0.50), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(212,168,0,0.40), 0 1px 4px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
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
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#374151', letterSpacing: '0.02em' }}>FIRST NAME</label>
                  <input
                    {...registerForm.register('firstName', { required: 'Required' })}
                    placeholder="Alex"
                    autoComplete="given-name"
                    className={`${inputBase} ${inputFocus}`}
                    style={registerForm.formState.errors.firstName ? inputError : inputNormal}
                  />
                  {registerForm.formState.errors.firstName && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>Required</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#374151', letterSpacing: '0.02em' }}>LAST NAME</label>
                  <input
                    {...registerForm.register('lastName', { required: 'Required' })}
                    placeholder="Mercer"
                    autoComplete="family-name"
                    className={`${inputBase} ${inputFocus}`}
                    style={registerForm.formState.errors.lastName ? inputError : inputNormal}
                  />
                  {registerForm.formState.errors.lastName && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>Required</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#374151', letterSpacing: '0.02em' }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  {...registerForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`${inputBase} ${inputFocus}`}
                  style={registerForm.formState.errors.email ? inputError : inputNormal}
                />
                {registerForm.formState.errors.email && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{registerForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#374151', letterSpacing: '0.02em' }}>PHONE</label>
                <input
                  {...registerForm.register('phone')}
                  placeholder="+1 555 000 0000"
                  autoComplete="tel"
                  className={`${inputBase} ${inputFocus}`}
                  style={inputNormal}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#374151', letterSpacing: '0.02em' }}>COUNTRY</label>
                <select
                  {...registerForm.register('country', { required: 'Country is required' })}
                  className={`${inputBase} ${inputFocus}`}
                  style={registerForm.formState.errors.country ? inputError : inputNormal}
                >
                  <option value="">Select country…</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {registerForm.formState.errors.country && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>Required</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#374151', letterSpacing: '0.02em' }}>PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    className={`${inputBase} ${inputFocus} pr-12`}
                    style={registerForm.formState.errors.password ? inputError : inputNormal}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/5" style={{ color: '#9CA3AF' }}>
                    <IconEye off={showPassword} />
                  </button>
                </div>
                {registerForm.formState.errors.password && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{registerForm.formState.errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#374151', letterSpacing: '0.02em' }}>CONFIRM PASSWORD</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerForm.register('confirmPassword', { required: 'Please confirm your password' })}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className={`${inputBase} ${inputFocus} pr-12`}
                    style={registerForm.formState.errors.confirmPassword ? inputError : inputNormal}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/5" style={{ color: '#9CA3AF' }}>
                    <IconEye off={showConfirmPassword} />
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{registerForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  {...registerForm.register('terms', { required: true })}
                  className="w-4 h-4 rounded-md mt-0.5 shrink-0"
                  style={{ accentColor: '#D4A800' }}
                />
                <label htmlFor="terms" className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                  I agree to the <span className="font-semibold" style={{ color: '#C9A000' }}>Terms of Service</span> and <span className="font-semibold" style={{ color: '#C9A000' }}>Privacy Policy</span>
                </label>
              </div>
              {registerForm.formState.errors.terms && <p className="text-xs font-medium" style={{ color: '#DC2626' }}>You must accept the terms</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{
                  background: 'linear-gradient(135deg, #D4A800 0%, #B88E00 100%)',
                  color: '#000',
                  boxShadow: '0 4px 16px rgba(212,168,0,0.40), 0 1px 4px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.25)',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (!isLoading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(212,168,0,0.50), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25)'; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(212,168,0,0.40), 0 1px 4px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
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
          © {new Date().getFullYear()} Trade Console. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function AuthScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F6FA 0%, #ECEEF4 100%)' }} />}>
      <AuthScreenInner />
    </Suspense>
  );
}