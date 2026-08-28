'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
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
    // Use server-determined redirect URL based on validated role
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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(245,196,0,0.06) 0%, transparent 60%), #070707',
      }}
    >
      <div className="w-full" style={{ maxWidth: '460px' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <AppLogo size={40} />
          <span className="mt-2 text-base font-bold tracking-tight" style={{ color: 'var(--primary)' }}>CryptoVault</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {tab === 'login' ? 'Sign in to your account' : 'Join CryptoVault today'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-7"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {/* Success message */}
          {authSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-5 border" style={{ backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'var(--positive)', color: 'var(--positive)' }}>
              <CheckCircle size={15} />
              <p className="text-sm">{authSuccess}</p>
            </div>
          )}

          {/* Error message */}
          {authError && (
            <div className="p-3 rounded-lg mb-5 border" style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'var(--negative)' }}>
              <p className="text-sm" style={{ color: 'var(--negative)' }}>{authError}</p>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Email Address</label>
                <input
                  type="email"
                  {...loginForm.register('email', { required: 'Email is required' })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-3 py-2.5 rounded-lg text-sm border transition-colors focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: loginForm.formState.errors.email ? 'var(--negative)' : 'rgba(255,255,255,0.12)',
                    color: 'var(--foreground)',
                  }}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Password</label>
                  <button type="button" className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...loginForm.register('password', { required: 'Password is required' })}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border transition-colors focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: loginForm.formState.errors.password ? 'var(--negative)' : 'rgba(255,255,255,0.12)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  {...loginForm.register('remember')}
                  className="w-3.5 h-3.5 rounded accent-primary"
                />
                <label htmlFor="remember" className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: 'var(--primary)', color: '#000' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: '#000' }} />
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>First Name</label>
                  <input
                    {...registerForm.register('firstName', { required: 'Required' })}
                    placeholder="Alex"
                    autoComplete="given-name"
                    className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: registerForm.formState.errors.firstName ? 'var(--negative)' : 'rgba(255,255,255,0.12)', color: 'var(--foreground)' }}
                  />
                  {registerForm.formState.errors.firstName && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>Required</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Last Name</label>
                  <input
                    {...registerForm.register('lastName', { required: 'Required' })}
                    placeholder="Mercer"
                    autoComplete="family-name"
                    className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: registerForm.formState.errors.lastName ? 'var(--negative)' : 'rgba(255,255,255,0.12)', color: 'var(--foreground)' }}
                  />
                  {registerForm.formState.errors.lastName && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>Required</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Email Address</label>
                <input
                  type="email"
                  {...registerForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: registerForm.formState.errors.email ? 'var(--negative)' : 'rgba(255,255,255,0.12)', color: 'var(--foreground)' }}
                />
                {registerForm.formState.errors.email && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{registerForm.formState.errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Phone Number</label>
                  <input
                    {...registerForm.register('phone', { required: 'Required' })}
                    placeholder="+44 7700 900000"
                    autoComplete="tel"
                    className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: registerForm.formState.errors.phone ? 'var(--negative)' : 'rgba(255,255,255,0.12)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Country</label>
                  <select
                    {...registerForm.register('country', { required: 'Required' })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: registerForm.formState.errors.country ? 'var(--negative)' : 'rgba(255,255,255,0.12)', color: 'var(--foreground)' }}
                  >
                    <option value="">Select...</option>
                    {COUNTRIES.map(c => <option key={`country-${c}`} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerForm.register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: registerForm.formState.errors.password ? 'var(--negative)' : 'rgba(255,255,255,0.12)', color: 'var(--foreground)' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{registerForm.formState.errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerForm.register('confirmPassword', { required: 'Required' })}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: registerForm.formState.errors.confirmPassword ? 'var(--negative)' : 'rgba(255,255,255,0.12)', color: 'var(--foreground)' }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--negative)' }}>{registerForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" {...registerForm.register('terms', { required: true })} className="mt-0.5 w-3.5 h-3.5 accent-primary" />
                <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  I agree to the{' '}
                  <button type="button" className="underline" style={{ color: 'var(--primary)' }}>Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="underline" style={{ color: 'var(--primary)' }}>Privacy Policy</button>
                </label>
              </div>
              {registerForm.formState.errors.terms && <p className="text-xs" style={{ color: 'var(--negative)' }}>You must accept the terms</p>}

              {attribution.source_site && (
                <p className="text-xs p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--muted-foreground)' }}>
                  Referred by: {attribution.source_site}{attribution.affiliate_id && ` · Affiliate: ${attribution.affiliate_id}`}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: 'var(--primary)', color: '#000' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: '#000' }} />
                ) : (
                  <>Create Account <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Toggle between sign in / create account */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
          {tab === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setTab('register'); setAuthError(''); setAuthSuccess(''); }}
                className="font-semibold hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setTab('login'); setAuthError(''); setAuthSuccess(''); }}
                className="font-semibold hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function AuthScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#070707' }} />}>
      <AuthScreenInner />
    </Suspense>
  );
}